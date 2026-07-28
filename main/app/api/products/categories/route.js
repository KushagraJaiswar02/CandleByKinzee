import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/constants.js';

export async function GET() {
  return NextResponse.json({ categories: CATEGORIES });
}
