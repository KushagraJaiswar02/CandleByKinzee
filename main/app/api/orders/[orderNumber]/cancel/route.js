import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Order } from '@/lib/models/Order.js';
import { CancellationTicket } from '@/lib/models/CancellationTicket.js';
import { queueCancellationEmail } from '@/lib/mailQueue.js';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { orderNumber } = await params;
    const body = await request.json();
    const parsed = z.object({ 
      phone: z.string(), 
      reason: z.string().max(500).optional() 
    }).parse(body);

    const cleanIdentifier = String(parsed.phone).trim().toLowerCase();
    const order = await Order.findOne({
      orderNumber,
      $or: [
        { 'customer.phone': parsed.phone },
        { 'customer.email': cleanIdentifier }
      ]
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found matching these credentials.' }, { status: 404 });
    }

    if (order.status === 'cancelled') {
      return NextResponse.json({ message: 'Order is already cancelled.' }, { status: 400 });
    }

    // Check for existing pending cancellation ticket
    const existingTicket = await CancellationTicket.findOne({ orderNumber, status: 'pending' });
    if (existingTicket) {
      return NextResponse.json({ message: 'A cancellation request is already pending review.' }, { status: 409 });
    }

    // Generate Cancellation Ticket
    const ticket = await CancellationTicket.create({
      orderNumber,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      reason: parsed.reason || 'Customer requested cancellation',
      status: 'pending'
    });

    // Push mail job to Redis queue for admin
    await queueCancellationEmail(orderNumber, ticket.reason, order.customer.name);

    order.status = 'cancellation_requested';
    await order.save();

    return NextResponse.json({ 
      message: 'Cancellation request submitted. The studio has been notified and will review your request.',
      ticketId: ticket._id,
      status: 'pending'
    }, { status: 201 });

  } catch (err) {
    return handleApiError(err);
  }
}
