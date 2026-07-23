import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

let razorpayClient;

function getClient() {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId || 'rzp_test_dev',
      key_secret: env.razorpayKeySecret || 'dev_secret'
    });
  }
  return razorpayClient;
}

export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret || 'dev_secret')
    .update(payload)
    .digest('hex');
  const actual = Buffer.from(razorpay_signature || '', 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, actual);
}

export function verifyWebhookSignature(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', env.razorpayWebhookSecret || 'dev_webhook_secret')
    .update(rawBody)
    .digest('hex');
  const actual = Buffer.from(signature || '', 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(expectedBuffer, actual);
}

export async function createAdvancePaymentOrder(order) {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return { id: `dev_order_${order.orderNumber}`, amount: order.paymentPlan.advanceAmount * 100, currency: 'INR' };
  }
  return getClient().orders.create({
    amount: order.paymentPlan.advanceAmount * 100,
    currency: 'INR',
    receipt: order.orderNumber,
    notes: { orderId: String(order._id), phase: 'advance' }
  });
}

export async function createBalancePaymentLink(order) {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return { id: `dev_link_${order.orderNumber}`, short_url: `https://example.com/pay/${order.orderNumber}` };
  }
  return getClient().paymentLink.create({
    amount: order.paymentPlan.balanceAmount * 100,
    currency: 'INR',
    description: `Balance payment for ${order.orderNumber}`,
    customer: {
      name: order.customer.name,
      email: order.customer.email,
      contact: order.customer.phone
    },
    notify: { sms: true, email: Boolean(order.customer.email) },
    notes: { orderId: String(order._id), phase: 'balance' }
  });
}

export async function refundAdvancePayment(order) {
  if (order.razorpay?.refundId) return { id: order.razorpay.refundId, duplicate: true };
  if (!order.razorpay?.advancePaymentId) throw new AppError('No advance payment to refund', 422);
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return { id: `dev_refund_${order.orderNumber}` };
  return getClient().payments.refund(order.razorpay.advancePaymentId, {
    amount: order.paymentPlan.advanceAmount * 100,
    notes: { orderId: String(order._id) }
  });
}
