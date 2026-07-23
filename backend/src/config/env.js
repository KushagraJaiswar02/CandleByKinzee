import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/candlewithkinzee',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  adminCookieName: process.env.ADMIN_COOKIE_NAME || 'ck_admin',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  postSupportsCod: process.env.POST_SUPPORTS_COD === 'true',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'orders@example.com',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'Candle by Kinzee',
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',
  isProduction: process.env.NODE_ENV === 'production'
};
