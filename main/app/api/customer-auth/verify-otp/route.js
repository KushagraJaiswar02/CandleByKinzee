import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '@/lib/config.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';
import { Order } from '@/lib/models/Order.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
import { createAuthCookie } from '@/lib/auth.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { phone, otp } = z.object({ 
      phone: z.string().min(8).max(15), 
      otp: z.string().min(6).max(6) 
    }).parse(body);

    if (otp !== '123456') {
      return NextResponse.json({ message: 'Invalid OTP code. Please enter 123456.' }, { status: 400 });
    }

    let customer = await Customer.findOne({ phone: phone.trim() });
    
    if (!customer) {
      const prevOrder = await Order.findOne({ 'customer.phone': phone.trim() }).sort({ createdAt: -1 });
      const prevQuote = await QuoteRequest.findOne({ 'customer.phone': phone.trim() }).sort({ createdAt: -1 });

      const name = prevOrder?.customer?.name || prevQuote?.customer?.name || '';
      const email = prevOrder?.customer?.email || prevQuote?.customer?.email || '';

      customer = await Customer.create({ 
        phone: phone.trim(), 
        name, 
        email 
      });
    }

    const token = jwt.sign(
      { sub: String(customer._id), phone: customer.phone, role: 'customer' }, 
      env.jwtSecret || 'dev-only-change-me', 
      { expiresIn: '30d' }
    );
    
    const cookieString = createAuthCookie(token, 'customer');

    const response = NextResponse.json({ success: true, customer });
    response.headers.set('Set-Cookie', cookieString);
    return response;

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
