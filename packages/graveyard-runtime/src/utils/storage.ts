/**
 * Storage utilities for ActionScript SharedObject and LocalStorage
 */

export interface SharedObject {
  data: Record<string, any>;
  flush(minDiskSpace?: number): boolean;
  clear(): void;
  close(): void;
}

/**
 * SharedObject manager (ActionScript SharedObject equivalent)
 */
export class SharedObjectManager {
  private static objects: Map<string, SharedObject> = new Map();
  private static storagePrefix = "graveyard_sharedobject_";

  /**
   * Get or create SharedObject
   */
  static getLocal(name: string, localPath?: string, secure?: boolean): SharedObject {
    const key = this.getStorageKey(name, localPath);
    
    if (this.objects.has(key)) {
      return this.objects.get(key)!;
    }

    // Load from localStorage
    const stored = localStorage.getItem(key);
    let data: Record<string, any> = {};
    
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse SharedObject data:", error);
      }
    }

    const sharedObject: SharedObject = {
      data,
      flush: (minDiskSpace?: number) => {
        try {
          const json = JSON.stringify(sharedObject.data);
          localStorage.setItem(key, json);
          return true;
        } catch (error) {
          console.error("Failed to flush SharedObject:", error);
          return false;
        }
      },
      clear: () => {
        sharedObject.data = {};
        localStorage.removeItem(key);
      },
      close: () => {
        // Flush before closing
        sharedObject.flush();
        this.objects.delete(key);
      },
    };

    this.objects.set(key, sharedObject);
    return sharedObject;
  }

  /**
   * Get storage key
   */
  private static getStorageKey(name: string, localPath?: string): string {
    const path = localPath || "/";
    return `${this.storagePrefix}${path}_${name}`;
  }

  /**
   * Clear all SharedObjects
   */
  static clearAll(): void {
    for (const [key, obj] of this.objects) {
      obj.close();
    }
    this.objects.clear();
    
    // Clear from localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.storagePrefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

/**
 * LocalStorage wrapper for ActionScript compatibility
 */
export class LocalStorageManager {
  private static prefix = "graveyard_";

  /**
   * Set value
   */
  static setItem(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      localStorage.setItem(`${this.prefix}${key}`, json);
    } catch (error) {
      console.error("Failed to set localStorage item:", error);
    }
  }

  /**
   * Get value
   */
  static getItem(key: string): any {
    try {
      const stored = localStorage.getItem(`${this.prefix}${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to get localStorage item:", error);
    }
    return null;
  }

  /**
   * Remove value
   */
  static removeItem(key: string): void {
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  /**
   * Clear all items
   */
  static clear(): void {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Get all keys
   */
  static getAllKeys(): string[] {
    const keys: string[] = [];
    const storageKeys = Object.keys(localStorage);
    
    for (const key of storageKeys) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    
    return keys;
  }
}

