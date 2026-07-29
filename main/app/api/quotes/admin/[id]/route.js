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

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, quotedPrice, commentText } = body;

    const updateFields = {};
    if (status) updateFields.status = status;
    if (quotedPrice !== undefined && quotedPrice !== null) updateFields.quotedPrice = Number(quotedPrice);
    updateFields.quotedBy = admin.sub;

    const quoteRequest = await QuoteRequest.findById(id);
    if (!quoteRequest) {
      return NextResponse.json({ message: 'Quote request not found' }, { status: 404 });
    }

    if (status) quoteRequest.status = status;
    if (quotedPrice !== undefined && quotedPrice !== null && quotedPrice !== '') {
      quoteRequest.quotedPrice = Number(quotedPrice);
    }

    if (commentText && commentText.trim()) {
      quoteRequest.comments.push({
        sender: 'admin',
        senderName: 'Kinzee Studio Admin',
        text: commentText.trim(),
        timestamp: new Date()
      });
    }

    await quoteRequest.save();

    // Trigger notification if quoted
    if (status === 'quoted') {
      try {
        const { sendQuoteProposedEmail } = await import('@/lib/services/notificationService.js');
        await sendQuoteProposedEmail(quoteRequest);
      } catch (mailErr) {
        console.error('Mail notification failed:', mailErr);
      }
    }

    return NextResponse.json({ quoteRequest });
  } catch (err) {
    console.error('[AdminQuoteRequest PATCH Error]:', err);
    return NextResponse.json({ message: 'Failed to update quote request' }, { status: 500 });
  }
}
