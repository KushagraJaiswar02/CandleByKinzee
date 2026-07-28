export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  postSupportsCod: process.env.POST_SUPPORTS_COD === 'true',
  brevoApiKey: process.env.BREVO_API_KEY || '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'orders@example.com',
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'Candle by Kinzee',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  adminWhatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  whatsappCloudPhoneNumberId: process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || '',
  whatsappCloudAccessToken: process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || '',
  isProduction: process.env.NODE_ENV === 'production'
};
