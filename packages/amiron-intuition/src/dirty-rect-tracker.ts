import { Rect } from '@amiron/pal';

/**
 * Tracks dirty rectangles to minimize redraws.
 * Only regions marked as dirty will be redrawn in the next frame.
 */
export class DirtyRectTracker {
  private dirtyRegions: Rect[] = [];
  private fullRedraw: boolean = true;
  
  /**
   * Mark a region as dirty (needs redraw)
   */
  markDirty(rect: Rect): void {
    this.dirtyRegions.push({ ...rect });
    this.fullRedraw = false;
  }
  
  /**
   * Mark the entire canvas as dirty
   */
  markFullRedraw(): void {
    this.fullRedraw = true;
    this.dirtyRegions = [];
  }
  
  /**
   * Check if a region needs to be redrawn
   */
  isDirty(rect: Rect): boolean {
    if (this.fullRedraw) {
      return true;
    }
    
    // Check if rect intersects with any dirty region
    for (const dirty of this.dirtyRegions) {
      if (this.rectsIntersect(rect, dirty)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get all dirty regions for this frame
   */
  getDirtyRegions(): Rect[] {
    if (this.fullRedraw) {
      return [];
    }
    return [...this.dirtyRegions];
  }
  
  /**
   * Check if full redraw is needed
   */
  needsFullRedraw(): boolean {
    return this.fullRedraw;
  }
  
  /**
   * Clear dirty regions after rendering
   */
  clear(): void {
    this.dirtyRegions = [];
    this.fullRedraw = false;
  }
  
  /**
   * Check if two rectangles intersect
   */
  private rectsIntersect(a: Rect, b: Rect): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
  
  /**
   * Merge overlapping dirty regions to reduce draw calls
   */
  optimize(): void {
    if (this.dirtyRegions.length <= 1) {
      return;
    }
    
    const merged: Rect[] = [];
    const processed = new Set<number>();
    
    for (let i = 0; i < this.dirtyRegions.length; i++) {
      if (processed.has(i)) continue;
      
      let current = { ...this.dirtyRegions[i] };
      let didMerge = true;
      
      while (didMerge) {
        didMerge = false;
        
        for (let j = i + 1; j < this.dirtyRegions.length; j++) {
          if (processed.has(j)) continue;
          
          if (this.rectsIntersect(current, this.dirtyRegions[j])) {
            current = this.mergeRects(current, this.dirtyRegions[j]);
            processed.add(j);
            didMerge = true;
          }
        }
      }
      
      merged.push(current);
      processed.add(i);
    }
    
    this.dirtyRegions = merged;
  }
  
  /**
   * Merge two rectangles into their bounding box
   */
  private mergeRects(a: Rect, b: Rect): Rect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    
    return {
      x,
      y,
      width: right - x,
      height: bottom - y,
    };
  }
}
