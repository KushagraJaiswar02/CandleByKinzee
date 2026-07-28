import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { acceptQuoteAndCreateOrder } from '@/lib/services/orderService.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    const parsed = z.object({
      customer: z.object({
        name: z.string().min(2),
        phone: z.string().min(8).max(15),
        email: z.string().email().optional().or(z.literal('')),
        address: z.string().min(8),
        pincode: z.string().min(4).max(10)
      }),
      deliveryMethod: z.enum(['post', 'personal'])
    }).parse(body);

    const { order, razorpayOrder } = await acceptQuoteAndCreateOrder({ quoteId: id, ...parsed });

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
