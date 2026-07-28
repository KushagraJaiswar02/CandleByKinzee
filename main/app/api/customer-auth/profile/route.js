import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';

export async function PUT(request) {
  try {
    await connectDB();
    const customerSession = getCustomerFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = z.object({ 
      name: z.string().min(2), 
      phone: z.string().optional().or(z.literal(''))
    }).parse(body);

    const customer = await Customer.findById(customerSession.sub);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customer.name = name;
    if (phone !== undefined) {
      customer.phone = phone;
    }
    await customer.save();

    return NextResponse.json({ success: true, customer });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
