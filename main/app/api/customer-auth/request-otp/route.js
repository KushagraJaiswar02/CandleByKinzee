import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb.js';
import redis from '@/lib/redis.js';
import { rateLimit } from '@/lib/rateLimit.js';
import { sendOtpEmail } from '@/lib/services/notificationService.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Apply rate limit on OTP requests per email (e.g. 5 requests per 10 minutes)
    const rateLimitKey = `otp_request:${normalizedEmail}`;
    const rateResult = await rateLimit(rateLimitKey, 5, 600);
    if (!rateResult.success) {
      return NextResponse.json({ 
        message: 'Too many requests. Please wait 10 minutes before requesting a new code.' 
      }, { status: 429 });
    }

    // 2. Generate secure 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();

    // 3. Store in Redis under otp:<email> as JSON string with attempts count (expire in 5 minutes)
    const redisKey = `otp:${normalizedEmail}`;
    await redis.set(redisKey, JSON.stringify({ code, attempts: 0 }), 'EX', 300);

    // 4. Send email via urBackend SDK
    await sendOtpEmail(normalizedEmail, code);

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email.' 
    });

  } catch (err) {
    return handleApiError(err);
  }
}
