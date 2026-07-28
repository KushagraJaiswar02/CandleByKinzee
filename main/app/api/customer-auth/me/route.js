import { NextResponse } from 'next/server';
import { getCustomerFromRequest } from '@/lib/auth.js';
import { connectDB } from '@/lib/mongodb.js';
import { Customer } from '@/lib/models/Customer.js';

export async function GET(request) {
  try {
    await connectDB();
    const customerSession = getCustomerFromRequest(request);
    if (!customerSession) {
      return NextResponse.json({ customer: null });
    }

    const customer = await Customer.findById(customerSession.sub);
    return NextResponse.json({ customer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ customer: null });
  }
}
