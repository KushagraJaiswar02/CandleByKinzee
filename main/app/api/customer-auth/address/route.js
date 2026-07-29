import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCustomerFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';

export async function POST(request) {
  try {
    await connectDB();
    const customerSession = getCustomerFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const addressData = z.object({
      label: z.string().min(1),
      fullName: z.string().min(2),
      phone: z.string().min(8),
      street: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zip: z.string().min(6)
    }).parse(body);

    const customer = await Customer.findById(customerSession.sub);
    if (!customer) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    customer.savedAddresses.push(addressData);
    await customer.save();

    return NextResponse.json({ success: true, customer });

  } catch (err) {
    return handleApiError(err);
  }
}
