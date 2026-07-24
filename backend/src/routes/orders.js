import { Router } from 'express';
import { z } from 'zod';
import { anonymousCreateLimiter } from '../middleware/rateLimiters.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  cancelOrder,
  confirmAdvancePayment,
  createCatalogOrder,
  maybeCreateBalanceLink,
  trackOrder,
  updateOrderStatus
} from '../services/orderService.js';
import { Order } from '../models/Order.js';
import { ORDER_STATUSES } from '../constants.js';

export const ordersRouter = Router();

const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8).max(15),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(8),
  pincode: z.string().min(4).max(10)
});

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
    selectedOptions: z.record(z.string()).default({})
  })).min(1),
  customer: customerSchema,
  deliveryMethod: z.enum(['post', 'personal']),
  discountCode: z.string().optional()
});

ordersRouter.post('/', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = createOrderSchema.parse(req.body);
  const { order, razorpayOrder } = await createCatalogOrder(body);
  res.status(201).json({
    orderNumber: order.orderNumber,
    amountDueNow: order.paymentPlan.advanceAmount,
    razorpayOrder
  });
}));

ordersRouter.post('/verify-advance', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = z.object({
    orderNumber: z.string().min(6),
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string()
  }).parse(req.body);
  const order = await confirmAdvancePayment(body);
  res.json({ orderNumber: order.orderNumber, status: order.status, advanceStatus: order.paymentPlan.advanceStatus });
}));

ordersRouter.post('/track', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = z.object({ orderNumber: z.string(), phone: z.string() }).parse(req.body);
  const order = await trackOrder(body.orderNumber, body.phone);
  res.json({ order });
}));

ordersRouter.post('/:orderNumber/cancel', anonymousCreateLimiter, asyncHandler(async (req, res) => {
  const body = z.object({ phone: z.string(), reason: z.string().max(500).optional() }).parse(req.body);
  const order = await cancelOrder(req.params.orderNumber, body.phone, body.reason || 'Customer requested cancellation');
  res.json({ orderNumber: order.orderNumber, status: order.status, refundStatus: order.cancellation.refundStatus });
}));

ordersRouter.get('/admin/all', requireAdmin, asyncHandler(async (req, res) => {
  const query = req.query.status ? { status: req.query.status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200);
  res.json({ orders });
}));

// GET /api/orders/admin/:id — admin: single order detail
ordersRouter.get('/admin/:id', requireAdmin, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
}));

// PATCH /api/orders/admin/:id/status — admin: update order status
ordersRouter.patch('/admin/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const body = z.object({ status: z.enum(ORDER_STATUSES), note: z.string().optional() }).parse(req.body);
  const order = await updateOrderStatus(req.params.id, body.status, body.note);
  const balancePaymentLink = await maybeCreateBalanceLink(order);
  res.json({ order, balancePaymentLink });
}));

ordersRouter.patch('/admin/:id/balance-cod', requireAdmin, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.paymentPlan.balanceStatus = 'paid_cod';
  await order.save();
  res.json({ order });
}));
