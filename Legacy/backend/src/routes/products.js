import { Router } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CATEGORIES } from '../constants.js';

export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  images: z.array(z.string().url()).default([]),
  basePrice: z.number().int().nonnegative(),
  category: z.enum(CATEGORIES),
  customizable: z.boolean().default(true),
  customOptions: z
    .array(z.object({ label: z.string().min(1), choices: z.array(z.string().min(1)), surcharges: z.record(z.number()).optional() }))
    .default([]),
  isActive: z.boolean().default(true)
});

productsRouter.get('/', asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  const products = await Product.find(query).sort({ category: 1, name: 1 });
  res.json({ products });
}));

productsRouter.get('/categories', (_req, res) => res.json({ categories: CATEGORIES }));

productsRouter.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
}));

productsRouter.post('/', requireAdmin, asyncHandler(async (req, res) => {
  const body = productSchema.parse(req.body);
  const product = await Product.create({ ...body, lastModifiedBy: req.admin._id });
  res.status(201).json({ product });
}));

productsRouter.put('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const body = productSchema.partial().parse(req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, { ...body, lastModifiedBy: req.admin._id }, { new: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ product });
}));
