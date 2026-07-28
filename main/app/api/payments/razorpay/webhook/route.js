import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { Order } from '@/lib/models/Order.js';
import { verifyWebhookSignature } from '@/lib/services/paymentService.js';

export async function POST(request) {
  try {
    await connectDB();
    const signature = request.headers.get('x-razorpay-signature');
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    if (event.event === 'payment_link.paid') {
      const paymentLinkId = event.payload?.payment_link?.entity?.id;
      if (paymentLinkId) {
        await Order.findOneAndUpdate(
          { 'razorpay.balancePaymentLinkId': paymentLinkId, 'paymentPlan.balanceStatus': 'pending' },
          { 'paymentPlan.balanceStatus': 'paid_online' }
        );
      }
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
