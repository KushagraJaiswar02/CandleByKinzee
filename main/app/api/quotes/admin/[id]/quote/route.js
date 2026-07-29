import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
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
    const parsed = z.object({ quotedPrice: z.number().int().positive() }).parse(body);

    const quoteRequest = await QuoteRequest.findByIdAndUpdate(
      id,
      { status: 'quoted', quotedPrice: parsed.quotedPrice, quotedBy: admin.sub },
      { new: true }
    );
    if (!quoteRequest) {
      return NextResponse.json({ message: 'Quote request not found' }, { status: 404 });
    }

    try {
      const { sendQuoteProposedEmail } = await import('@/lib/services/notificationService.js');
      await sendQuoteProposedEmail(quoteRequest);
    } catch (mailErr) {
      console.error('Mail notification failed:', mailErr);
    }

    return NextResponse.json({ quoteRequest });
  } catch (err) {
    return handleApiError(err);
  }
}
