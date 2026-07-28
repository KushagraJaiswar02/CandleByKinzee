import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Admin } from '@/lib/models/Admin.js';
import { signToken, createAuthCookie } from '@/lib/auth.js';
import { rateLimit } from '@/lib/rateLimit.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(8)
    }).parse(body);

    // Rate Limit admin login attempts by IP (max 10 attempts per 15 minutes)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `admin_login:${ip}`;
    const rateResult = await rateLimit(rateLimitKey, 10, 900);
    if (!rateResult.success) {
      return NextResponse.json({ message: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      return NextResponse.json({ message: 'Account locked. Try again later.' }, { status: 423 });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      admin.failedLoginAttempts += 1;
      if (admin.failedLoginAttempts >= 5) {
        admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await admin.save();
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = undefined;
    await admin.save();

    const token = signToken({ sub: String(admin._id), role: admin.role }, '8h');
    const cookieString = createAuthCookie(token, 'admin');

    const response = NextResponse.json({
      admin: { email: admin.email, role: admin.role }
    });

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
