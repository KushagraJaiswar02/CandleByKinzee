import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = z.object({
      customer: z.object({
        name: z.string().min(2),
        phone: z.string().min(8).max(15),
        email: z.string().email().optional().or(z.literal(''))
      }),
      description: z.string().min(10),
      referenceImages: z.array(z.string().url().or(z.string().startsWith('data:image/'))).default([])
    }).parse(body);

    const quoteRequest = await QuoteRequest.create(parsed);
    return NextResponse.json({ quoteRequest }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
