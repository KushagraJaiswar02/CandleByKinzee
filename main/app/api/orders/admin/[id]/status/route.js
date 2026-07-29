import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { updateOrderStatus, maybeCreateBalanceLink } from '@/lib/services/orderService.js';
import { getAdminFromRequest } from '@/lib/auth.js';
import { ORDER_STATUSES } from '@/lib/constants.js';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = z.object({ 
      status: z.enum(ORDER_STATUSES), 
      note: z.string().optional() 
    }).parse(body);

    const order = await updateOrderStatus(id, parsed.status, parsed.note);
    const balancePaymentLink = await maybeCreateBalanceLink(order);

    return NextResponse.json({ order, balancePaymentLink });

  } catch (err) {
    return handleApiError(err);
  }
}
