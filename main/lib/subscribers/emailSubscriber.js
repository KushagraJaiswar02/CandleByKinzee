import { eventBus } from '../events/eventBus.js';
import { ORDER_EVENTS } from '../events/orderEvents.js';
import { sendOrderEmail } from '../services/notificationService.js';

export function registerEmailSubscriber() {
  eventBus.subscribe(ORDER_EVENTS.ORDER_CREATED, async ({ order }) => {
    await sendOrderEmail(order);
  });
}
