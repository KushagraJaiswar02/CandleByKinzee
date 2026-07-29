import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';
import { Customer } from '@/lib/models/Customer.js';
import { getAdminFromRequest, getCustomerFromRequest } from '@/lib/auth.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { text } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ message: 'Comment text is required' }, { status: 400 });
    }

    const quote = await QuoteRequest.findById(id);
    if (!quote) {
      return NextResponse.json({ message: 'Quote request not found' }, { status: 404 });
    }

    // 1. Check if caller is Admin
    const adminSession = getAdminFromRequest(request);
    let sender = '';
    let senderName = '';

    if (adminSession) {
      sender = 'admin';
      senderName = 'Kinzee Studio';
    } else {
      // Customer comments require an authenticated customer session. Contact
      // details are public identifiers, not authentication credentials.
      const customerSession = getCustomerFromRequest(request);
      let isVerifiedCustomer = false;

      if (customerSession) {
        const customer = await Customer.findById(customerSession.sub);
        if (customer && (customer.email === quote.customer.email || customer.phone === quote.customer.phone)) {
          isVerifiedCustomer = true;
          senderName = customer.name || quote.customer.name;
        }
      }

      if (isVerifiedCustomer) {
        sender = 'customer';
      }
    }

    if (!sender) {
      return NextResponse.json({ message: 'Unauthorized comment access' }, { status: 401 });
    }

    // Append the comment to the quote request
    quote.comments.push({
      sender,
      senderName,
      text: text.trim(),
      timestamp: new Date()
    });

    await quote.save();

    return NextResponse.json({ comments: quote.comments }, { status: 201 });

  } catch (err) {
    console.error('[QuoteComments API] Error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
