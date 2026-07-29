import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { validateDiscount } from '@/lib/services/pricingService.js';
import { rateLimit } from '@/lib/rateLimit.js';
import { handleApiError } from '@/lib/errorHandler';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = z.object({ 
      code: z.string(), 
      subtotal: z.number().int().nonnegative(), 
      phone: z.string().optional() 
    }).parse(body);

    // Rate limit promo code validation checks by IP (max 15 attempts per 15 minutes)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `promo_validate:${ip}`;
    const rateResult = await rateLimit(rateLimitKey, 15, 900);
    if (!rateResult.success) {
      return NextResponse.json({ message: 'Too many coupon check attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const discount = await validateDiscount(parsed.code, parsed.subtotal);
    return NextResponse.json({ code: discount.code, percentage: discount.percentage });

  } catch (err) {
    return handleApiError(err);
  }
}
