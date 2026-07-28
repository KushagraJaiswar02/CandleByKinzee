import { Router } from 'express';
import { z } from 'zod';
import { QuoteRequest } from '../models/QuoteRequest.js';
import { anonymousCreateLimiter } from '../middleware/rateLimiters.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { acceptQuoteAndCreateOrder } from '../services/orderService.js';

export const quotesRouter = Router();

quotesRouter.post('/', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = z.object({
    customer: z.object({
      name: z.string().min(2),
      phone: z.string().min(8).max(15),
      email: z.string().email().optional().or(z.literal(''))
    }),
    description: z.string().min(10),
    referenceImages: z.array(z.string().url().or(z.string().startsWith('data:image/'))).default([])
  }).parse(req.body);
  const quoteRequest = await QuoteRequest.create(body);
  res.status(201).json({ quoteRequest });
}));

quotesRouter.post('/:id/accept', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = z.object({
    customer: z.object({
      name: z.string().min(2),
      phone: z.string().min(8).max(15),
      email: z.string().email().optional().or(z.literal('')),
      address: z.string().min(8),
      pincode: z.string().min(4).max(10)
    }),
    deliveryMethod: z.enum(['post', 'personal'])
  }).parse(req.body);
  const { order, razorpayOrder } = await acceptQuoteAndCreateOrder({ quoteId: req.params.id, ...body });
  res.status(201).json({ orderNumber: order.orderNumber, amountDueNow: order.paymentPlan.advanceAmount, razorpayOrder });
}));

quotesRouter.get('/admin/all', requireAdmin, asyncHandler(async (_req, res) => {
  const quoteRequests = await QuoteRequest.find().sort({ createdAt: -1 }).limit(200);
  res.json({ quoteRequests });
}));

quotesRouter.patch('/admin/:id/quote', requireAdmin, asyncHandler(async (req, res) => {
  const body = z.object({ quotedPrice: z.number().int().positive() }).parse(req.body);
  const quoteRequest = await QuoteRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'quoted', quotedPrice: body.quotedPrice, quotedBy: req.admin._id },
    { new: true }
  );
  if (!quoteRequest) return res.status(404).json({ message: 'Quote request not found' });
  res.json({ quoteRequest });
}));
