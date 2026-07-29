import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { CancellationTicket } from '@/lib/models/CancellationTicket.js';
import { cancelOrder } from '@/lib/services/orderService.js';
import { Order } from '@/lib/models/Order.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await request.json(); // 'approve' or 'reject'

    const ticket = await CancellationTicket.findById(id);
    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    if (ticket.status !== 'pending') {
      return NextResponse.json({ message: 'Ticket has already been resolved.' }, { status: 400 });
    }

    const order = await Order.findOne({ orderNumber: ticket.orderNumber });
    if (!order) return NextResponse.json({ message: 'Matching order not found' }, { status: 404 });

    const previousStatus = order.statusHistory?.length >= 2
      ? order.statusHistory[order.statusHistory.length - 2].status
      : 'order_confirmed';

    if (action === 'approve') {
      // Cancel order in database
      await cancelOrder(ticket.orderNumber, order.customer.phone, ticket.reason);
      ticket.status = 'approved';
    } else {
      order.status = previousStatus;
      await order.save();
      ticket.status = 'rejected';
    }

    ticket.resolvedAt = new Date();
    await ticket.save();

    // Send email to customer
    if (order.customer.email) {
      const { queueCancellationResultEmail } = await import('@/lib/mailQueue.js');
      await queueCancellationResultEmail(
        ticket.orderNumber,
        order.customer.email,
        order.customer.name,
        action === 'approve'
      );
    }

    return NextResponse.json({ ticket });

  } catch (err) {
    console.error('[AdminTickets Resolve Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
