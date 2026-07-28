import { NextResponse } from 'next/server';
import { getCustomerFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';
import { Order } from '@/lib/models/Order.js';
import { QuoteRequest } from '@/lib/models/QuoteRequest.js';

export async function GET(request) {
  try {
    await connectDB();
    const customerSession = getCustomerFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const customer = await Customer.findById(customerSession.sub);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    const orders = await Order.find({ 'customer.email': customer.email }).sort({ createdAt: -1 });
    const quotes = await QuoteRequest.find({ 'customer.email': customer.email }).sort({ createdAt: -1 });

    return NextResponse.json({
      customer,
      orders,
      quotes
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
