import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  publish(eventName, payload) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[EventBus] ▶ ${eventName}`);
    }
    this.emit(eventName, payload);
  }

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
