import { handleApiError } from '@/lib/errorHandler';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb.js';
import { Banner } from '@/lib/models/Banner.js';
import { getAdminFromRequest } from '@/lib/auth.js';

export async function POST(request) {
  try {
    await connectDB();
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = z.object({
      title: z.string().min(2),
      body: z.string().min(2),
      ctaLabel: z.string().optional(),
      ctaHref: z.string().optional(),
      isActive: z.boolean().default(true)
    }).parse(body);

    const banner = await Banner.create({ ...parsed, lastModifiedBy: admin.sub });
    return NextResponse.json({ banner }, { status: 201 });

  } catch (err) {
    return handleApiError(err);
  }
}
