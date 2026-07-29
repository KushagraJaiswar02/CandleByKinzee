import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Product } from '@/lib/models/Product.js';
import { CATEGORIES } from '@/lib/constants.js';
import { getAdminFromRequest } from '@/lib/auth.js';
import { invalidateProductCache } from '@/lib/redis.js';

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

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findOne({ _id: id, isActive: true });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = productSchema.partial().parse(body);

    const product = await Product.findByIdAndUpdate(id, { ...parsed, lastModifiedBy: admin.sub }, { new: true });
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Invalidate product catalog cache strongly
    await invalidateProductCache();

    return NextResponse.json({ product });

  } catch (err) {
    return handleApiError(err);
  }
}
