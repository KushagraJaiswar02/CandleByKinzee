import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/lib/constants.js';

export async function GET() {
  try {
    return NextResponse.json({ categories: CATEGORIES });
  } catch (err) {
    console.error('[Categories GET Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
