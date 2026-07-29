import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Product } from '@/lib/models/Product.js';
import { CATEGORIES } from '@/lib/constants.js';
import { getAdminFromRequest } from '@/lib/auth.js';
import redisClient, { invalidateProductCache } from '@/lib/redis.js';

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

export async function GET(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const cacheKey = category ? `products:category:${category}` : 'products:all';
    
    // Check Cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return NextResponse.json({ products: JSON.parse(cached), fromCache: true });
      }
    } catch (cacheErr) {
      console.error('[Redis Product GET Cache Error]', cacheErr);
    }

    const query = { isActive: true };
    if (category) query.category = category;

    const products = await Product.find(query).sort({ category: 1, name: 1 });

    // Store in Cache (TTL 2 Hours = 7200 seconds)
    try {
      await redisClient.set(cacheKey, JSON.stringify(products), 'EX', 7200);
    } catch (cacheErr) {
      console.error('[Redis Product SET Cache Error]', cacheErr);
    }

    return NextResponse.json({ products });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productSchema.parse(body);
    const product = await Product.create({ ...parsed, lastModifiedBy: admin.sub });
    
    // Invalidate product catalog cache
    await invalidateProductCache();

    return NextResponse.json({ product }, { status: 201 });

  } catch (err) {
    return handleApiError(err);
  }
}
