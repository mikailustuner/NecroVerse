/**
 * Animation System for Amiron Intuition
 * Smooth transitions and effects for UI elements
 */

export interface Animation {
  startTime: number;
  duration: number;
  easing: (t: number) => number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
}

/**
 * Easing functions for smooth animations
 */
export const Easing = {
  linear: (t: number): number => t,
  
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  
  easeOut: (t: number): number => {
    return t * (2 - t);
  },
  
  easeIn: (t: number): number => {
    return t * t;
  },
};

/**
 * Animation Manager
 * Handles multiple concurrent animations
 */
export class AnimationManager {
  private animations: Map<string, Animation> = new Map();
  
  /**
   * Start a new animation
   */
  start(
    id: string,
    duration: number,
    onUpdate: (progress: number) => void,
    easing: (t: number) => number = Easing.easeInOut,
    onComplete?: () => void
  ): void {
    this.animations.set(id, {
      startTime: performance.now(),
      duration,
      easing,
      onUpdate,
      onComplete,
    });
  }
  
  /**
   * Stop an animation
   */
  stop(id: string): void {
    this.animations.delete(id);
  }
  
  /**
   * Update all active animations
   * Call this in the render loop
   */
  update(): void {
    const now = performance.now();
    const toRemove: string[] = [];
    
    for (const [id, animation] of this.animations.entries()) {
      const elapsed = now - animation.startTime;
      const rawProgress = Math.min(elapsed / animation.duration, 1);
      const easedProgress = animation.easing(rawProgress);
      
      animation.onUpdate(easedProgress);
      
      if (rawProgress >= 1) {
        if (animation.onComplete) {
          animation.onComplete();
        }
        toRemove.push(id);
      }
    }
    
    for (const id of toRemove) {
      this.animations.delete(id);
    }
  }
  
  /**
   * Check if any animations are active
   */
  hasActiveAnimations(): boolean {
    return this.animations.size > 0;
  }
  
  /**
   * Clear all animations
   */
  clear(): void {
    this.animations.clear();
  }
}

/**
 * Global animation manager instance
 */
export const globalAnimationManager = new AnimationManager();
