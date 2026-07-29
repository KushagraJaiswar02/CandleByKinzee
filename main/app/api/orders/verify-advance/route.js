import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { confirmAdvancePayment } from '@/lib/services/orderService.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = z.object({
      orderNumber: z.string().min(6),
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string()
    }).parse(body);

    const order = await confirmAdvancePayment(parsed);

    return NextResponse.json({ 
      orderNumber: order.orderNumber, 
      status: order.status, 
      advanceStatus: order.paymentPlan.advanceStatus 
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.issues?.[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: err.status || 500 });
  }
}
