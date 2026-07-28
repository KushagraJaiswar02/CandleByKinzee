import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const quoteRequests = await QuoteRequest.find().sort({ createdAt: -1 }).limit(200);
    return NextResponse.json({ quoteRequests });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
