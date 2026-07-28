import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS } from '../events/orderEvents.js';
import { 
  sendOrderEmail, 
  sendOrderPaymentReceivedEmail, 
  sendOrderStatusChangedEmail, 
  sendOrderCancelledEmail 
} from '../services/notificationService.js';

export function registerEmailSubscriber() {
  eventBus.subscribe(ORDER_EVENTS.ORDER_CREATED, async ({ order }) => {
    try {
      await sendOrderEmail(order);
    } catch (err) {
      console.error('[EmailSubscriber] ORDER_CREATED failed:', err);
    }
  });

  eventBus.subscribe(ORDER_EVENTS.PAYMENT_RECEIVED, async ({ order }) => {
    try {
      await sendOrderPaymentReceivedEmail(order);
    } catch (err) {
      console.error('[EmailSubscriber] PAYMENT_RECEIVED failed:', err);
    }
  });

  eventBus.subscribe(ORDER_EVENTS.STATUS_CHANGED, async ({ order, previousStatus }) => {
    try {
      await sendOrderStatusChangedEmail(order, previousStatus);
    } catch (err) {
      console.error('[EmailSubscriber] STATUS_CHANGED failed:', err);
    }
  });

  eventBus.subscribe(ORDER_EVENTS.CANCELLED, async ({ order }) => {
    try {
      await sendOrderCancelledEmail(order);
    } catch (err) {
      console.error('[EmailSubscriber] CANCELLED failed:', err);
    }
  });
}
