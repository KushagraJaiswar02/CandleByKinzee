import { Router } from 'express';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyWebhookSignature } from '../services/paymentService.js';
import { AppError } from '../utils/errors.js';

export const paymentsRouter = Router();

paymentsRouter.post('/razorpay/webhook', asyncHandler(async (req, res) => {
  const signature = req.get('x-razorpay-signature');
  const rawBody = req.body.toString('utf8');
  if (!verifyWebhookSignature(rawBody, signature)) throw new AppError('Invalid webhook signature', 400);

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

  res.json({ ok: true });
}));
