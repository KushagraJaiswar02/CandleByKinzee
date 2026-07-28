import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { cancelOrder } from '@/lib/services/orderService.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { orderNumber } = params;
    const body = await request.json();
    const parsed = z.object({ 
      phone: z.string(), 
      reason: z.string().max(500).optional() 
    }).parse(body);

    const order = await cancelOrder(orderNumber, parsed.phone, parsed.reason || 'Customer requested cancellation');

    return NextResponse.json({ 
      orderNumber: order.orderNumber, 
      status: order.status, 
      refundStatus: order.cancellation.refundStatus 
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: err.status || 500 });
  }
}
