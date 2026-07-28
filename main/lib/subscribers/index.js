import { registerWhatsAppSubscriber } from './whatsAppSubscriber.js';
import { registerEmailSubscriber } from './emailSubscriber.js';

let initialized = false;

export function initSubscribers() {
  if (initialized) return;
  registerWhatsAppSubscriber();
  registerEmailSubscriber();
  initialized = true;
  console.log('[Subscribers] Notification channels registered.');
}
