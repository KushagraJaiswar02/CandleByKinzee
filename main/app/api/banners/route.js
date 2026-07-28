import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb.js';
import { Banner } from '@/lib/models/Banner.js';
import { sanitizePublicContent } from '@/lib/utils/sanitizePublicContent.js';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    const sanitized = banners.map((banner) => ({
      id: banner._id,
      title: sanitizePublicContent(banner.title),
      body: sanitizePublicContent(banner.body),
      ctaLabel: sanitizePublicContent(banner.ctaLabel),
      ctaHref: banner.ctaHref
    }));
    return NextResponse.json({ banners: sanitized });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
