import crypto from 'crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Order } from '../models/Order.js';
import { cancelOrder, confirmAdvancePayment, trackOrder } from '../services/orderService.js';

function customer(phone = '9876543210') {
  return { name: 'Kinzee Customer', phone, email: 'buyer@example.com', address: 'A real street address', pincode: '560001' };
}

describe('order security rules', () => {
  afterEach(() => vi.restoreAllMocks());

  it('requires order number and matching phone for tracking', async () => {
    const selectedOrder = { orderNumber: 'ABC234TEST', customer: customer() };
    const select = vi.fn().mockResolvedValue(selectedOrder);
    vi.spyOn(Order, 'findOne')
      .mockReturnValueOnce({ select: vi.fn().mockResolvedValue(null) })
      .mockReturnValueOnce({ select });

    await expect(trackOrder('ABC234TEST', '0000000000')).rejects.toThrow('Order not found');
    const tracked = await trackOrder('ABC234TEST', '9876543210');
    expect(tracked.orderNumber).toBe('ABC234TEST');
  });

  it('rejects cancellation once order is in progress', async () => {
    const order = {
      orderNumber: 'ABC234TEST',
      source: 'catalog',
      items: [{ name: 'Heart candle', qty: 1, priceAtOrder: 500 }],
      customer: customer(),
      deliveryMethod: 'personal',
      paymentPlan: { total: 500, advanceAmount: 250, balanceAmount: 250 },
      status: 'in_progress'
    };
    vi.spyOn(Order, 'findOne').mockResolvedValue(order);

    await expect(cancelOrder(order.orderNumber, '9876543210')).rejects.toThrow('Order cannot be cancelled after work has started');
  });

  it('verifies Razorpay signature before marking advance paid', async () => {
    const order = {
      orderNumber: 'SIG234TEST',
      source: 'catalog',
      items: [{ name: 'Daisy candle', qty: 1, priceAtOrder: 400 }],
      customer: customer(),
      deliveryMethod: 'post',
      paymentPlan: { total: 400, advanceAmount: 200, balanceAmount: 200 },
      razorpay: { advanceOrderId: 'order_test' },
      status: 'placed',
      save: vi.fn()
    };
    vi.spyOn(Order, 'findOne').mockResolvedValue(order);
    const signature = crypto.createHmac('sha256', 'dev_secret').update('order_test|pay_test').digest('hex');

    const confirmed = await confirmAdvancePayment({
      orderNumber: order.orderNumber,
      razorpay_order_id: 'order_test',
      razorpay_payment_id: 'pay_test',
      razorpay_signature: signature
    });

    expect(confirmed.paymentPlan.advanceStatus).toBe('paid');
    expect(confirmed.status).toBe('confirmed');
    expect(order.save).toHaveBeenCalled();
  });
});
