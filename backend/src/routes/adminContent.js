import { Router } from 'express';
import { z } from 'zod';
import { Banner } from '../models/Banner.js';
import { Discount } from '../models/Discount.js';
import { requireAdmin } from '../middleware/auth.js';
import { promoLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sanitizePublicContent } from '../utils/sanitizePublicContent.js';
import { validateDiscount } from '../services/pricingService.js';

export const adminContentRouter = Router();

adminContentRouter.get('/banners', asyncHandler(async (_req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
  res.json({
    banners: banners.map((banner) => ({
      id: banner._id,
      title: sanitizePublicContent(banner.title),
      body: sanitizePublicContent(banner.body),
      ctaLabel: sanitizePublicContent(banner.ctaLabel),
      ctaHref: banner.ctaHref
    }))
  });
}));

adminContentRouter.post('/promo/validate', promoLimiter, asyncHandler(async (req, res) => {
  const body = z.object({ code: z.string(), subtotal: z.number().int().nonnegative(), phone: z.string().optional() }).parse(req.body);
  const discount = await validateDiscount(body.code, body.subtotal);
  res.json({ code: discount.code, percentage: discount.percentage });
}));

adminContentRouter.post('/admin/banners', requireAdmin, asyncHandler(async (req, res) => {
  const body = z.object({
    title: z.string().min(2),
    body: z.string().min(2),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    isActive: z.boolean().default(true)
  }).parse(req.body);
  const banner = await Banner.create({ ...body, lastModifiedBy: req.admin._id });
  res.status(201).json({ banner });
}));

adminContentRouter.get('/admin/discounts', requireAdmin, asyncHandler(async (_req, res) => {
  const discounts = await Discount.find().sort({ createdAt: -1 });
  res.json({ discounts });
}));

adminContentRouter.post('/admin/discounts', requireAdmin, asyncHandler(async (req, res) => {
  const body = z.object({
    code: z.string().min(3),
    percentage: z.number().int().min(1).max(90),
    minimumOrderValue: z.number().int().nonnegative().default(0),
    expiresAt: z.string().datetime().optional(),
    usageCap: z.number().int().positive().optional(),
    isActive: z.boolean().default(true)
  }).parse(req.body);
  const discount = await Discount.create({
    ...body,
    code: body.code.toUpperCase(),
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    lastModifiedBy: req.admin._id
  });
  res.status(201).json({ discount });
}));
