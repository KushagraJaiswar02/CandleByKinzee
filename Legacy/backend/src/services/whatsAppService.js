/**
 * WhatsApp Service — Provider-Agnostic Abstraction Layer
 *
 * Architecture:
 *
 *   whatsAppService (business message methods)
 *      └── WhatsAppProvider (delivery mechanism — swappable)
 *            ├── ConsoleProvider          [development — pretty-prints to stdout]
 *            └── WhatsAppCloudProvider    [production — Meta WhatsApp Cloud API]
 *
 * To add a new provider (Twilio, Interakt, Wati, etc.):
 *   1. Create a class extending WhatsAppProvider
 *   2. Implement: async send(to, message): Promise<{success, messageId?}>
 *   3. Add detection logic inside createProvider()
 *   No other file changes required.
 */

import { env } from '../config/env.js';
import { ORDER_STATUS_LABELS } from '../constants.js';

// ─── Abstract Provider Base ──────────────────────────────────────────────────

class WhatsAppProvider {
  get name() {
    return this.constructor.name;
  }

  /**
   * Send a WhatsApp text message.
   *
   * @param {string} to      - Recipient phone number, digits only, with country
   *                           code. E.g. "919876543210" (no + prefix).
   * @param {string} message - Plain text body (max ~4096 chars).
   * @returns {Promise<{ success: boolean, messageId?: string }>}
   */
  async send(to, message) {
    throw new Error(`${this.name}.send() is not implemented`);
  }
}

// ─── Console Provider (Development / Fallback) ────────────────────────────────

class ConsoleProvider extends WhatsAppProvider {
  async send(to, message) {
    const border = '─'.repeat(64);
    const lines = message.split('\n').map(l => `  ${l}`).join('\n');
    console.log([
      ``,
      `┌─ [WhatsApp MOCK] ${new Date().toISOString()}`,
      `│  To: +${to}`,
      `├${border}`,
      lines,
      `└${border}`,
      ``
    ].join('\n'));
    return { success: true, messageId: `mock_${Date.now()}` };
  }
}

// ─── WhatsApp Cloud API Provider (Meta, production) ──────────────────────────

class WhatsAppCloudProvider extends WhatsAppProvider {
  constructor({ phoneNumberId, accessToken }) {
    super();
    this.url         = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    this.accessToken = accessToken;
  }

  async send(to, message) {
    const res = await fetch(this.url, {
      method:  'POST',
      headers: {
        Authorization:  `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to:   String(to).replace(/^\+/, ''),
        type: 'text',
        text: { preview_url: false, body: message }
      })
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`WhatsApp Cloud API ${res.status}: ${detail}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  }
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

function createProvider() {
  if (env.whatsappCloudPhoneNumberId && env.whatsappCloudAccessToken) {
    console.log('[WhatsApp] Provider: WhatsApp Cloud API (Meta)');
    return new WhatsAppCloudProvider({
      phoneNumberId: env.whatsappCloudPhoneNumberId,
      accessToken:   env.whatsappCloudAccessToken
    });
  }

  console.log(
    '[WhatsApp] Provider: Console (mock). ' +
    'Set WHATSAPP_CLOUD_PHONE_NUMBER_ID + WHATSAPP_CLOUD_ACCESS_TOKEN to enable real delivery.'
  );
  return new ConsoleProvider();
}

const provider = createProvider();

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function formatItems(order) {
  return order.items
    .map(i => `  • ${i.name} ×${i.qty}   ₹${(i.priceAtOrder * i.qty).toLocaleString('en-IN')}`)
    .join('\n');
}

function trackingPageUrl() {
  return `${env.clientOrigin || 'https://candlebykinzee.com'}/tracking`;
}

async function safeSend(to, message) {
  if (!to) {
    console.warn('[WhatsApp] Skipped — no recipient phone number');
    return;
  }
  return provider.send(String(to), message);
}

// ─── Business Message Methods ─────────────────────────────────────────────────

export const whatsAppService = {
  /**
   * Admin alert: new order created, advance payment pending.
   */
  async notifyAdminOrderCreated(order) {
    return safeSend(env.adminWhatsappNumber, [
      `🕯️ *New Order — Candle by Kinzee*`,
      ``,
      `Order: *#${order.orderNumber}*`,
      `Customer: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      ``,
      `Items:`,
      formatItems(order),
      ``,
      `Order total:  ₹${order.paymentPlan.total.toLocaleString('en-IN')}`,
      `Advance due:  ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')} (awaiting payment)`,
      ``,
      `Delivery: ${order.deliveryMethod === 'post' ? '📦 India Post' : '🏠 Personal Pickup'}`,
      `Address: ${order.customer.address}`,
      ``,
      `Open dashboard to manage this order.`
    ].join('\n'));
  },

  /**
   * Admin alert: advance payment verified and received.
   */
  async notifyAdminPaymentReceived(order) {
    return safeSend(env.adminWhatsappNumber, [
      `✅ *Advance Payment Confirmed*`,
      ``,
      `Order: *#${order.orderNumber}*`,
      `Customer: ${order.customer.name} · ${order.customer.phone}`,
      `Amount paid: ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')}`,
      `Balance due: ₹${order.paymentPlan.balanceAmount.toLocaleString('en-IN')}`,
      order.razorpay?.advancePaymentId
        ? `Razorpay ID: ${order.razorpay.advancePaymentId}`
        : '',
      ``,
      `Please confirm the order in your dashboard to begin handcrafting.`
    ].filter(Boolean).join('\n'));
  },

  /**
   * Customer confirmation: payment verified, order is live.
   */
  async notifyCustomerPaymentConfirmed(order) {
    return safeSend(order.customer.phone, [
      `Hi ${order.customer.name}! 🕯️`,
      ``,
      `Your *Candle by Kinzee* order is confirmed!`,
      `Order number: *#${order.orderNumber}*`,
      ``,
      `What you ordered:`,
      formatItems(order),
      ``,
      `Advance paid:     ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')}`,
      `Balance at delivery: ₹${order.paymentPlan.balanceAmount.toLocaleString('en-IN')}`,
      ``,
      `Track your order: ${trackingPageUrl()}`,
      `(Order number + phone number)`,
      ``,
      `Feel free to reply here with any questions!`,
      `— Kinzee Studio 💛`
    ].join('\n'));
  },

  /**
   * Customer update: admin moved the order to a new status.
   * @param {object} order
   * @param {string} previousStatus
   */
  async notifyCustomerStatusChanged(order, previousStatus) {
    const label = ORDER_STATUS_LABELS[order.status] || order.status;

    const context = {
      order_confirmed:    `We've confirmed your order — our artisans are getting ready! ✨`,
      handcrafting:       `Your candles are now being handcrafted with care in our Indore studio. 🎨`,
      packaging:          `Handcrafting is done! We're carefully packaging your candles. 📦`,
      ready_for_dispatch: `Your order is packed and ready to go — dispatch coming soon! 🌟`,
      dispatched:         `Your order is on its way! Tracking details will follow. 🚚`,
      delivered:          `Delivered! 🎉 We hope you love your candles. Share a photo — we'd love to see them in your home! 💛`
    };

    const detail = context[order.status] || `Your order has been updated.`;

    return safeSend(order.customer.phone, [
      `Hi ${order.customer.name}! 🕯️`,
      ``,
      `*Update on Order #${order.orderNumber}*`,
      ``,
      `Status: *${label}*`,
      ``,
      detail,
      ``,
      `Track live: ${trackingPageUrl()}`,
      `— Kinzee Studio 💛`
    ].join('\n'));
  },

  /**
   * Customer notification: order cancelled.
   */
  async notifyCustomerCancelled(order) {
    const refundLine = order.cancellation?.refundStatus === 'initiated'
      ? `Refund of ₹${order.paymentPlan.advanceAmount.toLocaleString('en-IN')} initiated — allow 5–7 business days.`
      : `No payment was collected, so no refund is required.`;

    return safeSend(order.customer.phone, [
      `Hi ${order.customer.name},`,
      ``,
      `Your Candle by Kinzee order *#${order.orderNumber}* has been cancelled.`,
      ``,
      refundLine,
      ``,
      `If this was unexpected or you have questions, please reply here and we'll help right away.`,
      `— Kinzee Studio`
    ].join('\n'));
  }
};
