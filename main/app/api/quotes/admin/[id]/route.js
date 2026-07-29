import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const quoteRequest = await QuoteRequest.findById(id);
    if (!quoteRequest) {
      return NextResponse.json({ message: 'Quote request not found' }, { status: 404 });
    }

    return NextResponse.json({ quoteRequest });

  } catch (err) {
    console.error('[AdminQuoteRequest GET Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
