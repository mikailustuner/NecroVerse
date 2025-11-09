import { Point } from '@amiron/pal';
import { InputEvent } from './events';

/**
 * Object pool for InputEvent objects to reduce garbage collection pressure.
 * Reuses event objects instead of creating new ones for each input.
 */
export class EventPool {
  private pool: InputEvent[] = [];
  private readonly maxPoolSize: number = 50;
  
  /**
   * Acquire an event from the pool or create a new one
   */
  acquire(
    type: InputEvent['type'],
    position: Point,
    button?: number,
    key?: string
  ): InputEvent {
    let event = this.pool.pop();
    
    if (!event) {
      event = {
        type,
        position: { x: 0, y: 0 },
      };
    }
    
    // Update event properties
    event.type = type;
    event.position.x = position.x;
    event.position.y = position.y;
    event.button = button;
    event.key = key;
    
    return event;
  }
  
  /**
   * Release an event back to the pool for reuse
   */
  release(event: InputEvent): void {
    if (this.pool.length < this.maxPoolSize) {
      // Clear optional properties
      event.button = undefined;
      event.key = undefined;
      
      this.pool.push(event);
    }
  }
  
  /**
   * Pre-allocate events in the pool
   */
  preallocate(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.pool.length >= this.maxPoolSize) {
        break;
      }
      
      this.pool.push({
        type: 'click',
        position: { x: 0, y: 0 },
      });
    }
  }
  
  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }
  
  /**
   * Get current pool size
   */
  getPoolSize(): number {
    return this.pool.length;
  }
}

// Global event pool instance
export const globalEventPool = new EventPool();

// Pre-allocate some events on initialization
globalEventPool.preallocate(20);
