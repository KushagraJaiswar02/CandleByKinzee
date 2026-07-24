import { customAlphabet } from 'nanoid';
import { CANCELLABLE_STATUSES } from '../constants.js';
import { Order } from '../models/Order.js';
import { QuoteRequest } from '../models/QuoteRequest.js';
import { AppError } from '../utils/errors.js';
import { computeCatalogTotal, splitAdvance } from './pricingService.js';
import { createAdvancePaymentOrder, createBalancePaymentLink, refundAdvancePayment, verifyRazorpaySignature } from './paymentService.js';
import { env } from '../config/env.js';
import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS, orderCreatedPayload, paymentVerifiedPayload, statusChangedPayload, orderCancelledPayload } from '../events/orderEvents.js';

const makeOrderNumber = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 10);

export async function createCatalogOrder({ items, customer, deliveryMethod, discountCode }) {
  const pricing = await computeCatalogTotal(items, discountCode);
  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    source: 'catalog',
    items: pricing.items,
    customer,
    deliveryMethod,
    paymentPlan: splitAdvance(pricing.total)
  });
  const razorpayOrder = await createAdvancePaymentOrder(order);
  if (!order.razorpay) order.razorpay = {};
  order.razorpay.advanceOrderId = razorpayOrder.id;
  await order.save();
  
  eventBus.publish(ORDER_EVENTS.ORDER_CREATED, orderCreatedPayload(order));
  
  return { order, razorpayOrder };
}

export async function acceptQuoteAndCreateOrder({ quoteId, customer, deliveryMethod }) {
  const quote = await QuoteRequest.findOne({ _id: quoteId, status: 'quoted' });
  if (!quote || typeof quote.quotedPrice !== 'number') throw new AppError('Quote is not ready to accept', 422);

  const order = await Order.create({
    orderNumber: makeOrderNumber(),
    source: 'quote',
    quoteRequest: quote._id,
    items: [{ name: 'Custom quoted candle order', qty: 1, selectedOptions: {}, priceAtOrder: quote.quotedPrice }],
    customer,
    deliveryMethod,
    paymentPlan: splitAdvance(quote.quotedPrice)
  });
  quote.status = 'accepted';
  await quote.save();
  const razorpayOrder = await createAdvancePaymentOrder(order);
  if (!order.razorpay) order.razorpay = {};
  order.razorpay.advanceOrderId = razorpayOrder.id;
  await order.save();
  
  eventBus.publish(ORDER_EVENTS.ORDER_CREATED, orderCreatedPayload(order));
  
  return { order, razorpayOrder };
}

export async function confirmAdvancePayment({ orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const order = await Order.findOne({ orderNumber, 'razorpay.advanceOrderId': razorpay_order_id });
  if (!order) throw new AppError('Order not found', 404);
  if (!verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
    throw new AppError('Invalid payment signature', 400);
  }
  order.paymentPlan.advanceStatus = 'paid';
  order.status = order.status === 'pending_payment' ? 'payment_received' : order.status;
  order.razorpay.advancePaymentId = razorpay_payment_id;
  await order.save();
  
  eventBus.publish(ORDER_EVENTS.PAYMENT_VERIFIED, paymentVerifiedPayload(order));
  
  return order;
}

export async function trackOrder(orderNumber, phone) {
  if (!orderNumber || !phone) throw new AppError('Order number and phone are required', 400);
  const order = await Order.findOne({ orderNumber, 'customer.phone': phone }).select('-customer.email -customer.address');
  if (!order) throw new AppError('Order not found', 404);
  return order;
}

export async function cancelOrder(orderNumber, phone, reason) {
  const order = await Order.findOne({ orderNumber, 'customer.phone': phone });
  if (!order) throw new AppError('Order not found', 404);
  if (!CANCELLABLE_STATUSES.includes(order.status)) throw new AppError('Order cannot be cancelled after work has started', 409);
  if (order.status === 'cancelled') return order;

  let refund = null;
  if (order.paymentPlan.advanceStatus === 'paid') {
    refund = await refundAdvancePayment(order);
    order.razorpay.refundId = refund.id;
    order.paymentPlan.advanceStatus = 'refunded';
  }
  order.status = 'cancelled';
  order.cancellation = {
    cancelledAt: new Date(),
    reason,
    refundStatus: refund ? 'initiated' : 'not_required'
  };
  await order.save();

  eventBus.publish(ORDER_EVENTS.ORDER_CANCELLED, orderCancelledPayload(order));

  return order;
}

export function canOfferCod(deliveryMethod) {
  return deliveryMethod === 'personal' || env.postSupportsCod;
}

export async function maybeCreateBalanceLink(order) {
  if (order.status !== 'ready' || order.paymentPlan.balanceAmount <= 0) return null;
  if (order.deliveryMethod === 'post' && !env.postSupportsCod) {
    const link = await createBalancePaymentLink(order);
    order.razorpay.balancePaymentLinkId = link.id;
    await order.save();
    return link;
  }
  return null;
}

export async function updateOrderStatus(orderId, newStatus, note = '') {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const previousStatus = order.status;
  if (previousStatus === newStatus) return order;

  order.status = newStatus;
  
  // The pre-save hook on the Order model handles pushing to statusHistory.
  // But we want to inject the note into the latest history entry before saving.
  if (note) {
      // By mutating the array element that will be added, we ensure the note is saved.
      // A cleaner way is to push it directly since we know the status changed.
      order.statusHistory.push({ status: newStatus, note, timestamp: new Date() });
      // To prevent the pre-save hook from adding a duplicate, we must clear the modified flag if possible,
      // but mongoose is smart enough to handle this if we push manually and then save. Actually the pre-save hook checks 
      // if the last history entry is the same status. So it won't duplicate.
  }

  await order.save();

  eventBus.publish(ORDER_EVENTS.ORDER_STATUS_CHANGED, statusChangedPayload(order, previousStatus));

  return order;
}
