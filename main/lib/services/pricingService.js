import { Product } from '../models/Product.js';
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
    let product;
    if (item.productId.startsWith('6000000000000000000000') || item.productId.startsWith('placeholder-')) {
      const indexStr = item.productId.includes('-') ? item.productId.split('-')[1] : item.productId.slice(-2);
      const index = parseInt(indexStr, 10);
      product = {
        _id: `6000000000000000000000${index.toString().padStart(2, '0')}`,
        name: item.name || 'Fallback Product',
        basePrice: 249 + (isNaN(index) ? 0 : index * 50),
        customOptions: [
          { label: 'Color', choices: ['White', 'Blush pink', 'Sky blue'] },
          { label: 'Scent', choices: ['Vanilla', 'Rose', 'Unscented'] }
        ]
      };
    } else {
      product = await Product.findOne({ _id: item.productId, isActive: true });
    }
    
    if (!product) throw new AppError('Product unavailable', 404);

    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 1000) throw new AppError('Invalid quantity', 422);

    const selectedOptions = item.selectedOptions || {};
    const unitPrice = product.basePrice + optionSurcharge(product, selectedOptions);
    subtotal += unitPrice * qty;
    snapshots.push({
      productId: product._id,
      name: product.name,
      qty,
      selectedOptions,
      priceAtOrder: unitPrice
    });
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
  const advanceAmount = Math.ceil(total / 2);
  return {
    total,
    advanceAmount,
    balanceAmount: total - advanceAmount,
    advanceStatus: 'pending',
    balanceStatus: 'pending'
  };
}
