import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone } = z.object({ phone: z.string().min(8).max(15) }).parse(body);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to WhatsApp/SMS (Simulated)', 
      otp: '123456' 
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
