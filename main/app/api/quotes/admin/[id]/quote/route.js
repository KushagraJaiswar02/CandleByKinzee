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

    const { id } = params;
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

    return NextResponse.json({ quoteRequest });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
