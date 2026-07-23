import mongoose from 'mongoose';
import { ORDER_STATUSES } from '../constants.js';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    source: { type: String, enum: ['catalog', 'quote'], required: true },
    quoteRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest' },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        selectedOptions: { type: Map, of: String, default: {} },
        priceAtOrder: { type: Number, required: true, min: 0 }
      }
    ],
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, trim: true, lowercase: true },
      address: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true }
    },
    deliveryMethod: { type: String, enum: ['post', 'personal'], required: true },
    paymentPlan: {
      total: { type: Number, required: true, min: 0 },
      advanceAmount: { type: Number, required: true, min: 0 },
      balanceAmount: { type: Number, required: true, min: 0 },
      advanceStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
      balanceStatus: { type: String, enum: ['pending', 'paid_online', 'paid_cod'], default: 'pending' }
    },
    razorpay: {
      advanceOrderId: String,
      advancePaymentId: String,
      balancePaymentLinkId: String,
      refundId: String
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed', index: true },
    cancellation: {
      cancelledAt: Date,
      reason: String,
      refundStatus: String
    }
  },
  { timestamps: true }
);

orderSchema.index({ orderNumber: 1, 'customer.phone': 1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
