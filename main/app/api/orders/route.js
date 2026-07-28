import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { createCatalogOrder } from '@/lib/services/orderService.js';

const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8).max(15),
  email: z.string().email().optional().or(z.literal('')),
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

    const { order, razorpayOrder } = await createCatalogOrder(parsed);

    return NextResponse.json({
      orderNumber: order.orderNumber,
      amountDueNow: order.paymentPlan.advanceAmount,
      razorpayOrder
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: err.status || 500 });
  }
}
