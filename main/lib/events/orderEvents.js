export const ORDER_EVENTS = Object.freeze({
  ORDER_CREATED: 'ORDER_CREATED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_CANCELLED: 'ORDER_CANCELLED'
});

export function orderCreatedPayload(order) {
  return { order, timestamp: new Date() };
}

export function paymentVerifiedPayload(order) {
  return { order, timestamp: new Date() };
}

export function statusChangedPayload(order, previousStatus) {
  return { order, previousStatus, timestamp: new Date() };
}

export function orderCancelledPayload(order) {
  return { order, timestamp: new Date() };
}
