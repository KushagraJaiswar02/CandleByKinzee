/**
 * Order Domain Events
 *
 * Single source of truth for all order-related event names and payload shapes.
 * Import ORDER_EVENTS everywhere — never use raw strings as event names.
 *
 * Each payload factory returns a plain, serialisable object. Keeping payloads
 * immutable and typed ensures subscribers always receive a consistent shape.
 */

// ─── Event Name Registry ────────────────────────────────────────────────────

export const ORDER_EVENTS = Object.freeze({
  /** New order created; status = pending_payment. Payment not yet verified. */
  ORDER_CREATED: 'ORDER_CREATED',

  /** Advance payment verified via Razorpay; status = payment_received. */
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',

  /** Admin moved the order to a new status (any transition except cancellation). */
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',

  /** Order cancelled — by customer or admin. Refund may be in progress. */
  ORDER_CANCELLED: 'ORDER_CANCELLED'
});

// ─── Payload Factories ──────────────────────────────────────────────────────

/**
 * @param {object} order - Mongoose Order document
 * @returns {{ order: object, timestamp: Date }}
 */
export function orderCreatedPayload(order) {
  return { order, timestamp: new Date() };
}

/**
 * @param {object} order
 * @returns {{ order: object, timestamp: Date }}
 */
export function paymentVerifiedPayload(order) {
  return { order, timestamp: new Date() };
}

/**
 * @param {object} order
 * @param {string} previousStatus - Status before the transition
 * @returns {{ order: object, previousStatus: string, timestamp: Date }}
 */
export function statusChangedPayload(order, previousStatus) {
  return { order, previousStatus, timestamp: new Date() };
}

/**
 * @param {object} order
 * @returns {{ order: object, timestamp: Date }}
 */
export function orderCancelledPayload(order) {
  return { order, timestamp: new Date() };
}
