import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { Order } from '@/lib/models/Order.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = params;
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
