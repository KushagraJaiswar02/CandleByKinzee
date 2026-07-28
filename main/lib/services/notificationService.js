import { env } from '../config.js';

export function trackingMessage(order) {
  return `Thanks for your Candle by Kinzee order. Track it with order number ${order.orderNumber} and your phone number.`;
}

export function whatsappLink(order) {
  const text = encodeURIComponent(trackingMessage(order));
  return `https://wa.me/${env.whatsappNumber}?text=${text}`;
}

export async function sendOrderEmail(order) {
  if (!env.brevoApiKey || !order.customer.email) return { skipped: true };
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: env.brevoSenderEmail, name: env.brevoSenderName },
      to: [{ email: order.customer.email, name: order.customer.name }],
      subject: `Your Candle by Kinzee order ${order.orderNumber}`,
      textContent: trackingMessage(order)
    })
  });
  if (!response.ok) throw new Error('Brevo email send failed');
  return response.json();
}
