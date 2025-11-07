// Простой in-memory event broadcaster для SSE
type EventListener = (data: unknown) => void;

class EventBroadcaster {
  private listeners: Set<EventListener> = new Set();

  subscribe(listener: EventListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  broadcast(data: unknown) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[EventBroadcaster] Error in listener:', error);
      }
    });
  }

  getListenerCount() {
    return this.listeners.size;
  }
}

export const eventBroadcaster = new EventBroadcaster();

