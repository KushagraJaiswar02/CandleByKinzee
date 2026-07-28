import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Discount } from '@/lib/models/Discount.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function GET(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const discounts = await Discount.find().sort({ createdAt: -1 });
    return NextResponse.json({ discounts });

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
    const parsed = z.object({
      code: z.string().min(3),
      percentage: z.number().int().min(1).max(90),
      minimumOrderValue: z.number().int().nonnegative().default(0),
      expiresAt: z.string().datetime().optional(),
      usageCap: z.number().int().positive().optional(),
      isActive: z.boolean().default(true)
    }).parse(body);

    const discount = await Discount.create({
      ...parsed,
      code: parsed.code.toUpperCase(),
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      lastModifiedBy: admin.sub
    });

    return NextResponse.json({ discount }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: err.errors[0]?.message || 'Validation failed' }, { status: 422 });
    }
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
