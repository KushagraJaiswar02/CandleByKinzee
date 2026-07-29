import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS } from '../events/orderEvents.js';
import { 
  sendOrderEmail, 
  sendOrderPaymentReceivedEmail, 
  sendOrderStatusChangedEmail, 
  sendOrderCancelledEmail 
} from '../services/notificationService.js';

export function registerEmailSubscriber() {
  // Only send order confirmation email AFTER payment is verified
  eventBus.subscribe(ORDER_EVENTS.PAYMENT_VERIFIED, async ({ order }) => {
    try {
      await sendOrderEmail(order);
    } catch (err) {
      console.error('[EmailSubscriber] PAYMENT_VERIFIED failed:', err);
    }
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_STATUS_CHANGED, async ({ order, previousStatus }) => {
    try {
      await sendOrderStatusChangedEmail(order, previousStatus);
    } catch (err) {
      console.error('[EmailSubscriber] ORDER_STATUS_CHANGED failed:', err);
    }
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_CANCELLED, async ({ order }) => {
    try {
      await sendOrderCancelledEmail(order);
    } catch (err) {
      console.error('[EmailSubscriber] ORDER_CANCELLED failed:', err);
    }
  });
}
