/**
 * Memory Manager
 * Handles resource pooling, automatic cleanup, and memory leak detection
 */

export interface Resource {
  id: string;
  type: string;
  data: any;
  lastUsed: number;
  refCount: number;
}

export interface MemoryStats {
  totalResources: number;
  activeResources: number;
  pooledResources: number;
  memoryUsage: number;
  leakCount: number;
}

/**
 * Memory Manager
 */
export class MemoryManager {
  private resources: Map<string, Resource> = new Map();
  private pools: Map<string, any[]> = new Map();
  private leakDetector: LeakDetector;
  private cleanupInterval?: number;
  private maxIdleTime: number = 60000; // 60 seconds
  private maxPoolSize: number = 100;

  constructor() {
    this.leakDetector = new LeakDetector();
    this.startCleanupInterval();
  }

  /**
   * Register resource
   */
  registerResource(id: string, type: string, data: any): void {
    const resource: Resource = {
      id,
      type,
      data,
      lastUsed: Date.now(),
      refCount: 1,
    };
    
    this.resources.set(id, resource);
    this.leakDetector.trackResource(id, type);
  }

  /**
   * Get resource
   */
  getResource(id: string): any | null {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastUsed = Date.now();
      resource.refCount++;
      return resource.data;
    }
    return null;
  }

  /**
   * Release resource
   */
  releaseResource(id: string): void {
    const resource = this.resources.get(id);
    if (resource) {
      resource.refCount--;
      if (resource.refCount <= 0) {
        // Move to pool if applicable
        this.poolResource(resource);
      }
    }
  }

  /**
   * Pool resource
   */
  private poolResource(resource: Resource): void {
    const pool = this.pools.get(resource.type) || [];
    
    if (pool.length < this.maxPoolSize) {
      pool.push(resource.data);
      this.pools.set(resource.type, pool);
    }
    
    this.resources.delete(resource.id);
    this.leakDetector.untrackResource(resource.id);
  }

  /**
   * Get pooled resource
   */
  getPooledResource(type: string): any | null {
    const pool = this.pools.get(type);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return null;
  }

  /**
   * Return resource to pool
   */
  returnToPool(type: string, data: any): void {
    const pool = this.pools.get(type) || [];
    
    if (pool.length < this.maxPoolSize) {
      pool.push(data);
      this.pools.set(type, pool);
    }
  }

  /**
   * Cleanup unused resources
   */
  cleanup(): void {
    const now = Date.now();
    const toRemove: string[] = [];
    
    for (const [id, resource] of this.resources) {
      if (resource.refCount === 0 && now - resource.lastUsed > this.maxIdleTime) {
        toRemove.push(id);
      }
    }
    
    for (const id of toRemove) {
      const resource = this.resources.get(id);
      if (resource) {
        this.poolResource(resource);
      }
    }
    
    // Cleanup old pooled resources
    for (const [type, pool] of this.pools) {
      if (pool.length > this.maxPoolSize) {
        pool.splice(0, pool.length - this.maxPoolSize);
      }
    }
  }

  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    if (typeof window !== "undefined") {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanup();
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Stop cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    let activeResources = 0;
    let pooledResources = 0;
    
    for (const resource of this.resources.values()) {
      if (resource.refCount > 0) {
        activeResources++;
      }
    }
    
    for (const pool of this.pools.values()) {
      pooledResources += pool.length;
    }
    
    return {
      totalResources: this.resources.size + pooledResources,
      activeResources,
      pooledResources,
      memoryUsage: this.estimateMemoryUsage(),
      leakCount: this.leakDetector.getLeakCount(),
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Simplified memory estimation
    let size = 0;
    
    for (const resource of this.resources.values()) {
      size += this.estimateObjectSize(resource.data);
    }
    
    for (const pool of this.pools.values()) {
      for (const item of pool) {
        size += this.estimateObjectSize(item);
      }
    }
    
    return size;
  }

  /**
   * Estimate object size
   */
  private estimateObjectSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 0;
    }
    
    if (typeof obj === "string") {
      return obj.length * 2; // 2 bytes per character
    }
    
    if (typeof obj === "number") {
      return 8; // 8 bytes for number
    }
    
    if (typeof obj === "boolean") {
      return 4; // 4 bytes for boolean
    }
    
    if (Array.isArray(obj)) {
      let size = 0;
      for (const item of obj) {
        size += this.estimateObjectSize(item);
      }
      return size;
    }
    
    if (typeof obj === "object") {
      let size = 0;
      for (const key in obj) {
        size += key.length * 2; // Key size
        size += this.estimateObjectSize(obj[key]);
      }
      return size;
    }
    
    return 0;
  }

  /**
   * Clear all resources
   */
  clear(): void {
    this.resources.clear();
    this.pools.clear();
    this.leakDetector.reset();
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.stopCleanupInterval();
    this.clear();
  }
}

/**
 * Leak Detector
 */
class LeakDetector {
  private trackedResources: Map<string, { type: string; timestamp: number }> = new Map();
  private leakThreshold: number = 300000; // 5 minutes

  /**
   * Track resource
   */
  trackResource(id: string, type: string): void {
    this.trackedResources.set(id, {
      type,
      timestamp: Date.now(),
    });
  }

  /**
   * Untrack resource
   */
  untrackResource(id: string): void {
    this.trackedResources.delete(id);
  }

  /**
   * Get leak count
   */
  getLeakCount(): number {
    const now = Date.now();
    let leaks = 0;
    
    for (const resource of this.trackedResources.values()) {
      if (now - resource.timestamp > this.leakThreshold) {
        leaks++;
      }
    }
    
    return leaks;
  }

  /**
   * Get leaked resources
   */
  getLeakedResources(): Array<{ id: string; type: string; age: number }> {
    const now = Date.now();
    const leaks: Array<{ id: string; type: string; age: number }> = [];
    
    for (const [id, resource] of this.trackedResources) {
      const age = now - resource.timestamp;
      if (age > this.leakThreshold) {
        leaks.push({
          id,
          type: resource.type,
          age,
        });
      }
    }
    
    return leaks;
  }

  /**
   * Reset
   */
  reset(): void {
    this.trackedResources.clear();
  }
}

