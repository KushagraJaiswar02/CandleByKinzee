import { registerWhatsAppSubscriber } from './whatsAppSubscriber.js';
import { registerEmailSubscriber } from './emailSubscriber.js';

export function initSubscribers() {
  registerWhatsAppSubscriber();
  registerEmailSubscriber();
  console.log('[Subscribers] Notification channels registered.');
}
