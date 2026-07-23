import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Admin } from '../models/Admin.js';
import { env } from '../config/env.js';
import { requireAdmin } from '../middleware/auth.js';
import { adminLoginLimiter } from '../middleware/rateLimiters.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';

export const authRouter = Router();

function setAdminCookie(res, admin) {
  const token = jwt.sign({ sub: String(admin._id), role: admin.role }, env.jwtSecret, { expiresIn: '8h' });
  res.cookie(env.adminCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProduction,
    maxAge: 8 * 60 * 60 * 1000
  });
}

authRouter.post('/login', adminLoginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string().min(8) }).parse(req.body);
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) throw new AppError('Invalid credentials', 401);
  if (admin.lockedUntil && admin.lockedUntil > new Date()) throw new AppError('Account locked. Try again later.', 423);

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();
    throw new AppError('Invalid credentials', 401);
  }

  admin.failedLoginAttempts = 0;
  admin.lockedUntil = undefined;
  await admin.save();
  setAdminCookie(res, admin);
  res.json({ admin: { email: admin.email, role: admin.role } });
}));

authRouter.post('/logout', requireAdmin, (req, res) => {
  res.clearCookie(env.adminCookieName);
  res.json({ ok: true });
});

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: { email: req.admin.email, role: req.admin.role } });
});
