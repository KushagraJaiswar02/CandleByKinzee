import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth.js';

export async function POST() {
  try {
    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', clearAuthCookie('admin'));
    return response;
  } catch (err) {
    console.error('[Admin Logout Error]:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
