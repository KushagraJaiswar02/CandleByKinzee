import jwt from 'jsonwebtoken';
import { env } from './config.js';

function getJwtSecret() {
  if (env.jwtSecret) return env.jwtSecret;
  if (env.isProduction) throw new Error('JWT_SECRET must be configured in production');
  return 'local-development-only-secret';
}

// ─── Token Creation ──────────────────────────────────────────────────────────
export function signToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

// ─── Token Verification ──────────────────────────────────────────────────────
export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

// ─── Get token from request cookies ─────────────────────────────────────────
export function getTokenFromRequest(request, cookieName) {
  const cookieHeader = request.headers.get('cookie') || '';
  const regex = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`);
  const match = cookieHeader.match(regex);
  return match ? match[1] : null;
}

// ─── Get current admin from request ─────────────────────────────────────────
export function getAdminFromRequest(request) {
  const token = getTokenFromRequest(request, 'ck_admin');
  if (!token) return null;
  const decoded = verifyToken(token);
  // Note: legacy auth payload format used `{ sub: String(admin._id), role: admin.role }`
  if (!decoded || !decoded.sub) return null;
  return decoded;
}

// ─── Get current customer from request ──────────────────────────────────────
export function getCustomerFromRequest(request) {
  const token = getTokenFromRequest(request, 'kinzee_customer_session');
  if (!token) return null;
  const decoded = verifyToken(token);
  // Note: customer auth payload format used `{ sub: String(customer._id), phone: customer.phone }`
  if (!decoded || !decoded.sub) return null;
  return decoded;
}

// ─── Set auth cookie in response ─────────────────────────────────────────────
export function createAuthCookie(token, role = 'admin') {
  const name = role === 'customer' ? 'kinzee_customer_session' : 'ck_admin';
  const maxAge = 30 * 24 * 60 * 60; // 30 days for both admin and customer session persistence
  return `${name}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${env.isProduction ? '; Secure' : ''}`;
}

// ─── Clear auth cookie ───────────────────────────────────────────────────────
export function clearAuthCookie(role = 'admin') {
  const name = role === 'customer' ? 'kinzee_customer_session' : 'ck_admin';
  return `${name}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
