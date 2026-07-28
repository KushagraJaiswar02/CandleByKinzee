import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS } from '../events/orderEvents.js';
import { whatsAppService } from '../services/whatsAppService.js';

export function registerWhatsAppSubscriber() {
  eventBus.subscribe(ORDER_EVENTS.ORDER_CREATED, async ({ order }) => {
    await whatsAppService.notifyAdminOrderCreated(order);
  });

  eventBus.subscribe(ORDER_EVENTS.PAYMENT_VERIFIED, async ({ order }) => {
    await whatsAppService.notifyAdminPaymentReceived(order);
    await whatsAppService.notifyCustomerPaymentConfirmed(order);
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_STATUS_CHANGED, async ({ order, previousStatus }) => {
    await whatsAppService.notifyCustomerStatusChanged(order, previousStatus);
  });

  eventBus.subscribe(ORDER_EVENTS.ORDER_CANCELLED, async ({ order }) => {
    await whatsAppService.notifyCustomerCancelled(order);
  });
}
