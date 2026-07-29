import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import redis from '@/lib/redis.js';
import { Customer } from '@/lib/models/Customer.js';
import { Order } from '@/lib/models/Order.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
import { createAuthCookie, signToken } from '@/lib/auth.js';
import { rateLimit } from '@/lib/rateLimit.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, otp } = z.object({ 
      email: z.string().email(), 
      otp: z.string().min(6).max(6) 
    }).parse(body);

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Rate limit verification attempts (max 10 attempts per 5 minutes per email)
    const rateLimitKey = `otp_verify:${normalizedEmail}`;
    const rateResult = await rateLimit(rateLimitKey, 10, 300);
    if (!rateResult.success) {
      return NextResponse.json({ 
        message: 'Too many failed verification attempts. Please try again in 5 minutes.' 
      }, { status: 429 });
    }

    // 2. Fetch code details from Redis
    const redisKey = `otp:${normalizedEmail}`;
    const sessionData = await redis.get(redisKey);
    if (!sessionData) {
      return NextResponse.json({ message: 'Verification code expired or not requested. Please request a new one.' }, { status: 400 });
    }

    const { code, attempts } = JSON.parse(sessionData);

    // 3. Increment attempts
    const updatedAttempts = attempts + 1;
    if (updatedAttempts >= 5) {
      await redis.del(redisKey);
      return NextResponse.json({ message: 'Too many incorrect attempts. This code has been invalidated.' }, { status: 400 });
    }

    // Save updated attempts count
    await redis.set(redisKey, JSON.stringify({ code, attempts: updatedAttempts }), 'EX', 300);

    // 4. Match verification code
    if (otp !== code) {
      return NextResponse.json({ message: `Incorrect verification code. Attempts remaining: ${5 - updatedAttempts}` }, { status: 400 });
    }

    // 5. Successful match: delete OTP key from Redis
    await redis.del(redisKey);

    // 6. Find customer or build new account
    let customer = await Customer.findOne({ email: normalizedEmail });
    
    if (!customer) {
      // Link history: Search previous guest orders/quotes to link history and grab info
      const prevOrder = await Order.findOne({ 'customer.email': normalizedEmail }).sort({ createdAt: -1 });
      const prevQuote = await QuoteRequest.findOne({ 'customer.email': normalizedEmail }).sort({ createdAt: -1 });

      const name = prevOrder?.customer?.name || prevQuote?.customer?.name || '';
      const phone = prevOrder?.customer?.phone || prevQuote?.customer?.phone || '';

      customer = await Customer.create({ 
        email: normalizedEmail, 
        name,
        phone
      });
    }

    // 7. Set session cookie
    const token = signToken(
      { sub: String(customer._id), email: customer.email, role: 'customer' }, 
      '30d'
    );
    
    const cookieString = createAuthCookie(token, 'customer');

    const response = NextResponse.json({ success: true, customer });
    response.headers.set('Set-Cookie', cookieString);
    return response;

  } catch (err) {
    return handleApiError(err);
  }
}
