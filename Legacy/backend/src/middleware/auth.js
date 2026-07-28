import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Admin } from '../models/Admin.js';
import { AppError } from '../utils/errors.js';

export async function requireAdmin(req, _res, next) {
  try {
    const token = req.cookies?.[env.adminCookieName];
    if (!token) throw new AppError('Admin login required', 401);
    const payload = jwt.verify(token, env.jwtSecret);
    const admin = await Admin.findById(payload.sub).select('_id email role');
    if (!admin) throw new AppError('Admin login required', 401);
    req.admin = admin;
    next();
  } catch (error) {
    next(error.status ? error : new AppError('Admin login required', 401));
  }
}
