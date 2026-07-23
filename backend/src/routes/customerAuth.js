import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { Customer } from '../models/Customer.js';
import { Order } from '../models/Order.js';
import { QuoteRequest } from '../models/QuoteRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';

export const customerAuthRouter = Router();

// Middleware for customer verification
export async function requireCustomer(req, res, next) {
  try {
    const token = req.cookies.kinzee_customer_session;
    if (!token) throw new AppError('Unauthorized', 401);

    const decoded = jwt.verify(token, env.jwtSecret);
    const customer = await Customer.findById(decoded.sub);
    if (!customer) throw new AppError('Customer not found', 404);

    req.customer = customer;
    next();
  } catch (err) {
    next(new AppError('Unauthorized', 401));
  }
}

// 1. Request OTP (returns simulated OTP in response for easy testing)
customerAuthRouter.post('/request-otp', asyncHandler(async (req, res) => {
  const { phone } = z.object({ phone: z.string().min(8).max(15) }).parse(req.body);
  
  // Simulated OTP logic - always 123456 in dev/test environment
  res.json({ 
    success: true, 
    message: 'OTP sent to WhatsApp/SMS (Simulated)', 
    otp: '123456' 
  });
}));

// 2. Verify OTP
customerAuthRouter.post('/verify-otp', asyncHandler(async (req, res) => {
  const { phone, otp } = z.object({ 
    phone: z.string().min(8).max(15), 
    otp: z.string().min(6).max(6) 
  }).parse(req.body);

  if (otp !== '123456') {
    throw new AppError('Invalid OTP code. Please enter 123456.', 400);
  }

  // Find customer or build new account
  let customer = await Customer.findOne({ phone: phone.trim() });
  
  if (!customer) {
    // Relationship first: Search previous guest orders/quotes to link history and grab info
    const prevOrder = await Order.findOne({ 'customer.phone': phone.trim() }).sort({ createdAt: -1 });
    const prevQuote = await QuoteRequest.findOne({ 'customer.phone': phone.trim() }).sort({ createdAt: -1 });

    const name = prevOrder?.customer?.name || prevQuote?.customer?.name || '';
    const email = prevOrder?.customer?.email || prevQuote?.customer?.email || '';

    customer = await Customer.create({ 
      phone: phone.trim(), 
      name, 
      email 
    });
  }

  // Set session cookie
  const token = jwt.sign({ sub: String(customer._id), phone: customer.phone }, env.jwtSecret, { expiresIn: '30d' });
  res.cookie('kinzee_customer_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true, customer });
}));

// 3. Current User details
customerAuthRouter.get('/me', asyncHandler(async (req, res) => {
  const token = req.cookies.kinzee_customer_session;
  if (!token) return res.json({ customer: null });

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const customer = await Customer.findById(decoded.sub);
    res.json({ customer });
  } catch (err) {
    res.json({ customer: null });
  }
}));

// 4. Customer Dashboard Data (Orders & Custom Requests)
customerAuthRouter.get('/dashboard', requireCustomer, asyncHandler(async (req, res) => {
  const customer = req.customer;

  // Retrieve linked historical guest orders/quotes
  const orders = await Order.find({ 'customer.phone': customer.phone }).sort({ createdAt: -1 });
  const quotes = await QuoteRequest.find({ 'customer.phone': customer.phone }).sort({ createdAt: -1 });

  res.json({
    customer,
    orders,
    quotes
  });
}));

// 5. Update profile
customerAuthRouter.put('/profile', requireCustomer, asyncHandler(async (req, res) => {
  const { name, email } = z.object({ 
    name: z.string().min(2), 
    email: z.string().email().optional().or(z.literal('')) 
  }).parse(req.body);

  req.customer.name = name;
  req.customer.email = email || '';
  await req.customer.save();

  res.json({ success: true, customer: req.customer });
}));

// 6. Save address
customerAuthRouter.post('/address', requireCustomer, asyncHandler(async (req, res) => {
  const addressData = z.object({
    label: z.string().min(1),
    fullName: z.string().min(2),
    phone: z.string().min(8),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(6)
  }).parse(req.body);

  req.customer.savedAddresses.push(addressData);
  await req.customer.save();

  res.json({ success: true, customer: req.customer });
}));

// 7. Delete address
customerAuthRouter.delete('/address/:id', requireCustomer, asyncHandler(async (req, res) => {
  req.customer.savedAddresses = req.customer.savedAddresses.filter(
    (addr) => String(addr._id) !== req.params.id
  );
  await req.customer.save();

  res.json({ success: true, customer: req.customer });
}));

// 8. Logout
customerAuthRouter.post('/logout', (req, res) => {
  res.clearCookie('kinzee_customer_session');
  res.json({ ok: true });
});
