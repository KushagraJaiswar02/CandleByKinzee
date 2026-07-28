import { UrBackendClient } from '@urbackend/sdk';
import { env } from '../config.js';
import { ORDER_STATUS_LABELS } from '../constants.js';

let mailClient = null;
if (env.urbSecretKey && !env.urbSecretKey.includes('YOUR_SECRET_KEY')) {
  mailClient = new UrBackendClient({ apiKey: env.urbSecretKey });
}

export function trackingMessage(order) {
  return `Thanks for your Candle by Kinzee order. Track it with order number ${order.orderNumber} and your email address.`;
}

export function whatsappLink(order) {
  const text = encodeURIComponent(trackingMessage(order));
  return `https://wa.me/${env.whatsappNumber}?text=${text}`;
}

async function sendMail(to, subject, htmlContent) {
  if (!mailClient) {
    console.warn(`[Mail MOCK] Dev Mode: Sending email to ${to}`);
    console.warn(`Subject: ${subject}`);
    return { mock: true };
  }
  return mailClient.mail.send({ to, subject, html: htmlContent });
}

export async function sendOrderEmail(order) {
  if (!order.customer.email) return { skipped: true };

  const subject = `Order Confirmed — #${order.orderNumber} Candle by Kinzee`;
  const message = trackingMessage(order);
  const itemsList = order.items
    .map(i => `<li><strong>${i.name}</strong> &times; ${i.qty} — ₹${(i.priceAtOrder * i.qty).toLocaleString('en-IN')}</li>`)
    .join('');

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #111;">Thank you for your order, ${order.customer.name}!</h2>
      <p>We are excited to craft your candles. Here is your order confirmation details:</p>
      <div style="background: #fcfcfc; border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Awaiting advance payment</p>
      </div>
      <h3 style="border-bottom: 1px solid #eee; padding-bottom: 8px;">Items Ordered</h3>
      <ul style="padding-left: 20px;">
        ${itemsList}
      </ul>
      <div style="background: #f7f7f7; padding: 12px; border-radius: 4px; margin-top: 15px;">
        <p style="margin: 0;"><strong>Advance Amount (50%):</strong> ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')} (Paid)</p>
        <p style="margin: 5px 0 0 0;"><strong>Balance Amount:</strong> ₹${order.paymentPlan.balanceAmount.toLocaleString('en-IN')}</p>
      </div>
      <p style="margin-top: 20px;">${message}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Studio · Indore, Madhya Pradesh</p>
    </div>
  `;

  return sendMail(order.customer.email, subject, htmlContent);
}

export async function sendOrderPaymentReceivedEmail(order) {
  if (!order.customer.email) return { skipped: true };

  const subject = `Advance Payment Confirmed — #${order.orderNumber}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #2e7d32;">Payment Confirmed!</h2>
      <p>Hello ${order.customer.name},</p>
      <p>We have successfully verified your advance payment for order <strong>#${order.orderNumber}</strong>.</p>
      <div style="background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Amount Paid:</strong> ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')}</p>
        <p style="margin: 5px 0 0 0;"><strong>Remaining Balance:</strong> ₹${order.paymentPlan.balanceAmount.toLocaleString('en-IN')}</p>
      </div>
      <p>Our artisans have now begun handcrafting your premium soy candles in our Indore studio. We will update you as soon as they are ready for dispatch.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Studio · Indore, Madhya Pradesh</p>
    </div>
  `;

  return sendMail(order.customer.email, subject, htmlContent);
}

export async function sendOrderStatusChangedEmail(order, previousStatus) {
  if (!order.customer.email) return { skipped: true };

  const label = ORDER_STATUS_LABELS[order.status] || order.status;
  const subject = `Order #${order.orderNumber} Status Updated: ${label}`;

  const statusDescriptions = {
    order_confirmed:    `We've confirmed your order — our artisans are getting ready! ✨`,
    handcrafting:       `Your candles are now being handcrafted with care in our Indore studio. 🎨`,
    packaging:          `Handcrafting is complete! We're now carefully packaging your candles for dispatch. 📦`,
    ready_for_dispatch: `Your order is packed and ready to go — dispatch is coming soon! 🌟`,
    dispatched:         `Your order has been dispatched! Shipping details and tracking links are on the way. 🚚`,
    delivered:          `Delivered! 🎉 We hope your new candles bring warmth and comfort to your space. 💛`
  };

  const detail = statusDescriptions[order.status] || `Your order status has been updated to ${label}.`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #111;">Order Status Update</h2>
      <p>Hello ${order.customer.name},</p>
      <p>There is a new update on your order <strong>#${order.orderNumber}</strong>:</p>
      <div style="background: #f7f7f7; border-left: 4px solid #d4af37; padding: 15px; margin: 15px 0;">
        <h3 style="margin: 0; color: #111;">${label}</h3>
        <p style="margin: 5px 0 0 0; color: #555;">${detail}</p>
      </div>
      <p>You can track the progress of your order here: <a href="${env.clientOrigin}/track" style="color: #d4af37; text-decoration: underline;">Track Order Live</a></p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Studio · Indore, Madhya Pradesh</p>
    </div>
  `;

  return sendMail(order.customer.email, subject, htmlContent);
}

export async function sendOrderCancelledEmail(order) {
  if (!order.customer.email) return { skipped: true };

  const subject = `Order Cancelled — #${order.orderNumber}`;
  const refundLine = order.cancellation?.refundStatus === 'initiated'
    ? `An advance refund of <strong>₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')}</strong> has been initiated and will show in your account within 5–7 business days.`
    : `No advance payment was captured, so no refund is required.`;

  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #c62828;">Order Cancelled</h2>
      <p>Hello ${order.customer.name},</p>
      <p>Your Candle by Kinzee order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
      <div style="background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <p style="margin: 0;">${refundLine}</p>
      </div>
      <p>If you have any questions or did not intend to cancel your order, please reply to this email or reach out to us on WhatsApp.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888; text-align: center;">Candle by Kinzee Studio · Indore, Madhya Pradesh</p>
    </div>
  `;

  return sendMail(order.customer.email, subject, htmlContent);
}

export async function sendOtpEmail(email, code) {
  const subject = `Your Verification Code — Candle by Kinzee`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="text-align: center; color: #333;">Candle by Kinzee</h2>
      <p>Hello,</p>
      <p>Use the verification code below to complete your login or registration. This code is valid for 5 minutes:</p>
      <div style="background: #f7f7f7; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; padding: 15px; margin: 20px 0; border-radius: 4px; color: #111;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `;

  if (!mailClient) {
    console.warn(`\n┌──────────────────────────────────────────────┐`);
    console.warn(`│ [Mail MOCK] Dev OTP Code: ${code}            │`);
    console.warn(`│ Sent to: ${email}                            │`);
    console.warn(`└──────────────────────────────────────────────┘\n`);
    return { mock: true };
  }

  try {
    const result = await mailClient.mail.send({
      to: email,
      subject,
      html: htmlContent
    });
    return result;
  } catch (err) {
    console.error('Mail platform sendOtpEmail failed:', err);
    throw err;
  }
}
