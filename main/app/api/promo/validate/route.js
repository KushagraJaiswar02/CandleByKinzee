import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { validateDiscount } from '@/lib/services/pricingService.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = z.object({ 
      code: z.string(), 
      subtotal: z.number().int().nonnegative(), 
      phone: z.string().optional() 
    }).parse(body);

    const discount = await validateDiscount(parsed.code, parsed.subtotal);
    return NextResponse.json({ code: discount.code, percentage: discount.percentage });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: err.status || 500 });
  }
}
