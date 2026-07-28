import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS } from '../events/orderEvents.js';
import { whatsAppService } from '../services/whatsAppService.js';

export function registerWhatsAppSubscriber() {
  eventBus.subscribe(ORDER_EVENTS.ORDER_CREATED, async ({ order }) => {
    // Notify admin that a new order is placed and waiting for payment
    await whatsAppService.notifyAdminOrderCreated(order);
  });

  eventBus.subscribe(ORDER_EVENTS.PAYMENT_VERIFIED, async ({ order }) => {
    // Both admin and customer get notified once advance is paid
    await whatsAppService.notifyAdminPaymentReceived(order);
    await whatsAppService.notifyCustomerPaymentConfirmed(order);
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_STATUS_CHANGED, async ({ order, previousStatus }) => {
    // Let the customer know their order is progressing
    await whatsAppService.notifyCustomerStatusChanged(order, previousStatus);
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_CANCELLED, async ({ order }) => {
    // Notify the customer of the cancellation
    await whatsAppService.notifyCustomerCancelled(order);
  });
}
