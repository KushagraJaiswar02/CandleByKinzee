import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { createCatalogOrder } from '@/lib/services/orderService.js';
import { rateLimit } from '@/lib/rateLimit.js';

const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8).max(15),
  email: z.string().email(),
  address: z.string().min(8),
  pincode: z.string().min(4).max(10)
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
    selectedOptions: z.record(z.string()).default({})
  })).min(1),
  customer: customerSchema,
  deliveryMethod: z.enum(['post', 'personal']),
  discountCode: z.string().optional()
});

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = createOrderSchema.parse(body);

    // Rate limit order placement to prevent spam/denial of service (max 30 requests per 15 minutes)
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `order_create:${ip}`;
    const rateResult = await rateLimit(rateLimitKey, 30, 900);
    if (!rateResult.success) {
      return NextResponse.json({ message: 'Too many order attempts. Please try again in 15 minutes.' }, { status: 429 });
    }

    const { order, razorpayOrder } = await createCatalogOrder(parsed);

    return NextResponse.json({
      orderNumber: order.orderNumber,
      amountDueNow: order.paymentPlan.advanceAmount,
      razorpayOrder
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.issues?.[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: err.status || 500 });
  }
}
