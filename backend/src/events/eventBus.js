/**
 * EventBus — In-process domain event broker
 *
 * Business logic emits typed domain events.
 * Notification channels (WhatsApp, email, analytics) subscribe independently.
 *
 * Design principles:
 *  - Publishers (services) have zero knowledge of subscribers (notification channels).
 *  - Subscribers never crash the request cycle — errors are caught and logged.
 *  - Adding a new notification channel = create a subscriber + register it. Zero
 *    changes to any service.
 */

import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    // Room for growth — higher ceiling for active subscribers
    this.setMaxListeners(50);
  }

  /**
   * Publish a domain event.
   * @param {string} eventName - One of ORDER_EVENTS constants
   * @param {object} payload   - Typed, immutable event payload
   */
  publish(eventName, payload) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[EventBus] ▶ ${eventName}`);
    }
    this.emit(eventName, payload);
  }

  /**
   * Subscribe to a domain event.
   * Errors inside the handler are caught so they never affect the caller.
   *
   * @param {string}   eventName
   * @param {Function} handler   - async (payload) => void
   */
  subscribe(eventName, handler) {
    this.on(eventName, async (payload) => {
      try {
        await handler(payload);
      } catch (err) {
        console.error(`[EventBus] ✖ Subscriber error on "${eventName}":`, err.message);
      }
    });
  }
}

export const eventBus = new EventBus();
