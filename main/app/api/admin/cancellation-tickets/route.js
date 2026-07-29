import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { CancellationTicket } from '@/lib/models/CancellationTicket.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const tickets = await CancellationTicket.find().sort({ createdAt: -1 });
    return NextResponse.json({ tickets });

  } catch (err) {
    console.error('[AdminTickets GET Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
