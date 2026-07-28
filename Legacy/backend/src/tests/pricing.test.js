import { afterEach, describe, expect, it, vi } from 'vitest';
import { Product } from '../models/Product.js';
import { Discount } from '../models/Discount.js';
import { computeCatalogTotal, splitAdvance } from '../services/pricingService.js';

describe('pricing service', () => {
  afterEach(() => vi.restoreAllMocks());

  it('computes totals from stored product prices and ignores client totals', async () => {
    const product = {
      _id: 'product_1',
      name: 'Rose candle',
      description: 'Made to order',
      basePrice: 500,
      category: 'Heart collection',
      customOptions: [{ label: 'Color', choices: ['White', 'Pink'], surcharges: { Pink: 50 } }]
    };
    vi.spyOn(Product, 'findOne').mockResolvedValue(product);

    const result = await computeCatalogTotal([
      { productId: product._id, qty: 2, selectedOptions: { Color: 'Pink' }, clientTotal: 1 }
    ]);

    expect(result.total).toBe(1100);
    expect(result.items[0].priceAtOrder).toBe(550);
  });

  it('enforces discount validity server-side', async () => {
    const product = {
      _id: 'product_2',
      name: 'Gift set',
      description: 'Made to order',
      basePrice: 1000,
      category: 'Gift box sets'
    };
    vi.spyOn(Product, 'findOne').mockResolvedValue(product);
    vi.spyOn(Discount, 'findOne').mockResolvedValue({ code: 'KINZEE10', percentage: 10, minimumOrderValue: 1000 });

    const result = await computeCatalogTotal([{ productId: product._id, qty: 1 }], 'KINZEE10');

    expect(result.discountAmount).toBe(100);
    expect(result.total).toBe(900);
  });

  it('splits the payable advance without losing rupees', () => {
    expect(splitAdvance(999)).toMatchObject({ advanceAmount: 500, balanceAmount: 499 });
  });
});
