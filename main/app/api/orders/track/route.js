import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { trackOrder } from '@/lib/services/orderService.js';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = z.object({ 
      orderNumber: z.string(), 
      phone: z.string() 
    }).parse(body);

    const order = await trackOrder(parsed.orderNumber, parsed.phone);
    return NextResponse.json({ order });

  } catch (err) {
    return handleApiError(err);
  }
}
