/**
 * Render Cache Manager
 * Caches static shapes and tracks dirty rectangles for efficient rendering
 */

import { SWFShape } from "../renderers/canvas-renderer";

export interface CachedShape {
  shape: SWFShape;
  canvas: HTMLCanvasElement;
  bounds: { x: number; y: number; width: number; height: number };
  timestamp: number;
}

export interface DirtyRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Render Cache Manager
 */
export class RenderCacheManager {
  private shapeCache: Map<number, CachedShape> = new Map();
  private dirtyRects: DirtyRectangle[] = [];
  private maxCacheSize: number = 100;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  /**
   * Get cached shape or create new cache entry
   */
  getCachedShape(shapeId: number, shape: SWFShape, renderCallback: (shape: SWFShape, canvas: HTMLCanvasElement) => void): HTMLCanvasElement | null {
    // Check cache
    const cached = this.shapeCache.get(shapeId);
    if (cached) {
      this.cacheHits++;
      return cached.canvas;
    }

    this.cacheMisses++;

    // Calculate bounds
    const bounds = this.calculateBounds(shape);
    
    // Create canvas for caching
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(bounds.width);
    canvas.height = Math.ceil(bounds.height);
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return null;
    }

    // Translate context to shape bounds
    ctx.translate(-bounds.x, -bounds.y);
    
    // Render shape to cache
    renderCallback(shape, canvas);
    
    // Store in cache
    const cachedShape: CachedShape = {
      shape,
      canvas,
      bounds,
      timestamp: Date.now(),
    };
    
    this.shapeCache.set(shapeId, cachedShape);
    
    // Cleanup old cache entries if needed
    this.cleanupCache();
    
    return canvas;
  }

  /**
   * Calculate shape bounds
   */
  private calculateBounds(shape: SWFShape): { x: number; y: number; width: number; height: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const path of shape.paths) {
      minX = Math.min(minX, path.startX);
      maxX = Math.max(maxX, path.startX);
      minY = Math.min(minY, path.startY);
      maxY = Math.max(maxY, path.startY);

      for (const segment of path.segments) {
        minX = Math.min(minX, segment.x);
        maxX = Math.max(maxX, segment.x);
        minY = Math.min(minY, segment.y);
        maxY = Math.max(maxY, segment.y);
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Add dirty rectangle
   */
  addDirtyRect(x: number, y: number, width: number, height: number): void {
    this.dirtyRects.push({ x, y, width, height });
  }

  /**
   * Merge dirty rectangles
   */
  mergeDirtyRects(): DirtyRectangle[] {
    if (this.dirtyRects.length === 0) {
      return [];
    }

    // Simple merge: combine overlapping rectangles
    const merged: DirtyRectangle[] = [];
    
    for (const rect of this.dirtyRects) {
      let mergedInto = false;
      
      for (const mergedRect of merged) {
        if (this.rectsOverlap(rect, mergedRect)) {
          // Merge rectangles
          mergedRect.x = Math.min(mergedRect.x, rect.x);
          mergedRect.y = Math.min(mergedRect.y, rect.y);
          mergedRect.width = Math.max(mergedRect.x + mergedRect.width, rect.x + rect.width) - mergedRect.x;
          mergedRect.height = Math.max(mergedRect.y + mergedRect.height, rect.y + rect.height) - mergedRect.y;
          mergedInto = true;
          break;
        }
      }
      
      if (!mergedInto) {
        merged.push({ ...rect });
      }
    }
    
    this.dirtyRects = [];
    return merged;
  }

  /**
   * Check if rectangles overlap
   */
  private rectsOverlap(a: DirtyRectangle, b: DirtyRectangle): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  /**
   * Clear dirty rectangles
   */
  clearDirtyRects(): void {
    this.dirtyRects = [];
  }

  /**
   * Invalidate shape cache
   */
  invalidateShape(shapeId: number): void {
    const cached = this.shapeCache.get(shapeId);
    if (cached) {
      // Cleanup canvas
      cached.canvas.width = 0;
      cached.canvas.height = 0;
      this.shapeCache.delete(shapeId);
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    for (const cached of this.shapeCache.values()) {
      cached.canvas.width = 0;
      cached.canvas.height = 0;
    }
    this.shapeCache.clear();
    this.dirtyRects = [];
  }

  /**
   * Cleanup old cache entries
   */
  private cleanupCache(): void {
    if (this.shapeCache.size <= this.maxCacheSize) {
      return;
    }

    // Remove oldest entries
    const entries = Array.from(this.shapeCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    for (const [shapeId, cached] of toRemove) {
      cached.canvas.width = 0;
      cached.canvas.height = 0;
      this.shapeCache.delete(shapeId);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { hits: number; misses: number; size: number; hitRate: number } {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      size: this.shapeCache.size,
      hitRate: total > 0 ? this.cacheHits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

