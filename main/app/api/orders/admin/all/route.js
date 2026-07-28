import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { Order } from '@/lib/models/Order.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const query = status ? { status } : {};

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200);
    return NextResponse.json({ orders });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
