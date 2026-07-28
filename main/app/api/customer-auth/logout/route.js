import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth.js';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set('Set-Cookie', clearAuthCookie('customer'));
  return response;
}
