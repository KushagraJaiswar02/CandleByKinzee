import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { QuoteRequest } from '../models/QuoteRequest.js';
import { Discount } from '../models/Discount.js';
import { AppError } from '../utils/errors.js';

export function optionSurcharge(product, selectedOptions = {}) {
  return (product.customOptions || []).reduce((sum, option) => {
    const choice = selectedOptions[option.label];
    if (!choice) return sum;
    if (!option.choices.includes(choice)) {
      throw new AppError(`Invalid ${option.label} option`, 422);
    }
    return sum + Number(option.surcharges?.get?.(choice) || option.surcharges?.[choice] || 0);
  }, 0);
}

export async function computeCatalogTotal(items, discountCode) {
  if (!Array.isArray(items) || items.length === 0) throw new AppError('Cart is empty', 422);

  const snapshots = [];
  let subtotal = 0;

  for (const item of items) {
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 1000) throw new AppError('Invalid quantity', 422);
    const selectedOptions = item.selectedOptions || {};

    let rawId = String(item.productId || '');
    if (rawId.startsWith('custom-quote-')) rawId = rawId.replace('custom-quote-', '');
    if (rawId.startsWith('quote-')) rawId = rawId.replace('quote-', '');

    // 1. Check Product catalog
    let product = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      product = await Product.findOne({ _id: rawId, isActive: true });
    }

    if (product) {
      const unitPrice = product.basePrice + optionSurcharge(product, selectedOptions);
      subtotal += unitPrice * qty;
      snapshots.push({
        productId: product._id,
        name: product.name,
        qty,
        selectedOptions,
        priceAtOrder: unitPrice
      });
      continue;
    }

    // 2. Check QuoteRequest for custom bespoke quotes
    let quote = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      quote = await QuoteRequest.findById(rawId);
    }

    if (quote && typeof quote.quotedPrice === 'number') {
      const unitPrice = quote.quotedPrice;
      subtotal += unitPrice * qty;
      snapshots.push({
        productId: quote._id,
        name: `Custom Order: ${quote.description.slice(0, 30)}...`,
        qty,
        selectedOptions: { Brief: quote.description.slice(0, 40), ...selectedOptions },
        priceAtOrder: unitPrice
      });
      continue;
    }

    // 3. Fallback for bespoke custom items with unitPrice/basePrice provided
    if (item.unitPrice || item.basePrice) {
      const unitPrice = Number(item.unitPrice || item.basePrice);
      subtotal += unitPrice * qty;
      snapshots.push({
        productId: item.productId,
        name: item.name || 'Custom Bespoke Candle',
        qty,
        selectedOptions,
        priceAtOrder: unitPrice
      });
      continue;
    }

    throw new AppError('Product unavailable', 404);
  }

  const discount = discountCode ? await validateDiscount(discountCode, subtotal) : null;
  const discountAmount = discount ? Math.floor((subtotal * discount.percentage) / 100) : 0;
  const total = subtotal - discountAmount;

  return { items: snapshots, subtotal, discount, discountAmount, total };
}

export async function validateDiscount(code, subtotal) {
  const discount = await Discount.findOne({ code: String(code).trim().toUpperCase(), isActive: true });
  if (!discount) throw new AppError('Invalid promo code', 404);
  if (discount.expiresAt && discount.expiresAt < new Date()) throw new AppError('Promo code expired', 422);
  if (subtotal < discount.minimumOrderValue) throw new AppError('Minimum order value not met', 422);
  if (discount.usageCap && discount.usedCount >= discount.usageCap) throw new AppError('Promo code usage limit reached', 422);
  return discount;
}

export function splitAdvance(total) {
  return {
    total,
    advanceAmount: total,
    balanceAmount: 0,
    advanceStatus: 'pending',
    balanceStatus: 'paid_online'
  };
}
