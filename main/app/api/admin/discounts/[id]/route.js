import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { Discount } from '@/lib/models/Discount.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const discount = await Discount.findByIdAndUpdate(id, body, { new: true });
    if (!discount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json({ discount });
  } catch (err) {
    console.error('[Discount PATCH Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    console.error('[Discount DELETE Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
