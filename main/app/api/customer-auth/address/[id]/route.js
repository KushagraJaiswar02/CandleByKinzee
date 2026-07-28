import { NextResponse } from 'next/server';
import { getCustomerFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const customerSession = getCustomerFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const customer = await Customer.findById(customerSession.sub);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customer.savedAddresses = customer.savedAddresses.filter(
      (addr) => String(addr._id) !== id
    );
    await customer.save();

    return NextResponse.json({ success: true, customer });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
