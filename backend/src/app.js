import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { quotesRouter } from './routes/quotes.js';
import { authRouter } from './routes/auth.js';
import { adminContentRouter } from './routes/adminContent.js';
import { paymentsRouter } from './routes/payments.js';
import { customerAuthRouter } from './routes/customerAuth.js';
import { initSubscribers } from './subscribers/index.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use('/api/payments', express.raw({ type: 'application/json' }), paymentsRouter);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  if (env.nodeEnv !== 'test') app.use(morgan('dev'));

  // Initialize event subscribers
  initSubscribers();

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/quotes', quotesRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/content', adminContentRouter);
  app.use('/api/customer-auth', customerAuthRouter);

  app.use((error, _req, res, _next) => {
    const status = error.status || (error.name === 'ZodError' ? 422 : 500);
    const message = status === 500 ? 'Internal server error' : error.message;
    if (status === 500) console.error(error);
    res.status(status).json({ message });
  });

  return app;
}
