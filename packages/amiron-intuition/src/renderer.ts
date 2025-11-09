import { GraphicsContext } from '@amiron/pal';
import { Window } from './window';
import { NecroTheme } from './theme';
import { DirtyRectTracker } from './dirty-rect-tracker';
import { globalAnimationManager } from './animations';
import { Button } from './widget';

export class Renderer {
  private ctx: GraphicsContext;
  private windows: Window[] = [];
  private running: boolean = false;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsUpdateTime: number = 0;
  private showFPS: boolean = false;
  private dirtyTracker: DirtyRectTracker;
  
  constructor(ctx: GraphicsContext, showFPS: boolean = false) {
    this.ctx = ctx;
    this.showFPS = showFPS;
    this.dirtyTracker = new DirtyRectTracker();
  }
  
  addWindow(window: Window): void {
    this.windows.push(window);
    this.dirtyTracker.markFullRedraw();
    
    // Start fade-in animation
    window.opacity = 0;
    globalAnimationManager.start(
      `window-fade-${Date.now()}`,
      300, // 300ms fade-in
      (progress) => {
        window.opacity = progress;
      }
    );
    
    // Start glow animation for focused windows
    if (window.focused) {
      this.startGlowAnimation(window);
    }
  }
  
  private startGlowAnimation(window: Window): void {
    globalAnimationManager.start(
      `window-glow-${Date.now()}`,
      200, // 200ms glow
      (progress) => {
        window.glowIntensity = progress;
      }
    );
  }
  
  removeWindow(window: Window): void {
    const index = this.windows.indexOf(window);
    if (index > -1) {
      this.windows.splice(index, 1);
      this.dirtyTracker.markFullRedraw();
    }
  }
  
  setWindows(windows: Window[]): void {
    this.windows = windows;
    this.dirtyTracker.markFullRedraw();
  }
  
  /**
   * Mark a region as dirty for optimized redraw
   */
  markDirty(x: number, y: number, width: number, height: number): void {
    this.dirtyTracker.markDirty({ x, y, width, height });
  }
  
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;
    this.renderLoop();
  }
  
  stop(): void {
    this.running = false;
  }
  
  private renderLoop = (): void => {
    if (!this.running) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    // Update animations
    globalAnimationManager.update();
    
    // Update button transitions
    this.updateButtonTransitions(deltaTime);
    
    // Measure frame time to ensure sub-16ms rendering
    if (deltaTime < 16.67) {
      // Target 60 FPS (16.67ms per frame)
      this.render();
    } else {
      // Frame took too long, still render but log warning
      console.warn(`Frame time exceeded 16ms: ${deltaTime.toFixed(2)}ms`);
      this.render();
    }
    
    // Update FPS counter
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
    
    this.lastFrameTime = currentTime;
    requestAnimationFrame(this.renderLoop);
  };
  
  private updateButtonTransitions(deltaTime: number): void {
    // Update all button hover transitions
    for (const window of this.windows) {
      for (const widget of window.widgets) {
        if (widget instanceof Button) {
          widget.updateTransition(deltaTime);
        }
      }
    }
  }
  
  private render(): void {
    // Optimize dirty regions before rendering
    this.dirtyTracker.optimize();
    
    // Only clear and redraw if needed
    if (this.dirtyTracker.needsFullRedraw()) {
      // Full redraw
      this.ctx.clear(NecroTheme.background);
      
      // Render all windows in z-order (back to front)
      const sortedWindows = [...this.windows].sort((a, b) => {
        if (a.focused && !b.focused) return 1;
        if (!a.focused && b.focused) return -1;
        return 0;
      });
      
      for (const window of sortedWindows) {
        window.render(this.ctx);
      }
    } else {
      // Partial redraw - only render windows that intersect dirty regions
      const dirtyRegions = this.dirtyTracker.getDirtyRegions();
      
      if (dirtyRegions.length > 0) {
        const sortedWindows = [...this.windows].sort((a, b) => {
          if (a.focused && !b.focused) return 1;
          if (!a.focused && b.focused) return -1;
          return 0;
        });
        
        for (const window of sortedWindows) {
          if (this.dirtyTracker.isDirty(window.bounds)) {
            window.render(this.ctx);
          }
        }
      }
    }
    
    // Render FPS counter if enabled
    if (this.showFPS) {
      this.renderFPS();
    }
    
    // Clear dirty regions after rendering
    this.dirtyTracker.clear();
  }
  
  private renderFPS(): void {
    const fpsText = `FPS: ${this.fps}`;
    const x = 10;
    const y = 20;
    
    // Draw background for readability
    this.ctx.drawRect(
      { x: x - 2, y: y - 14, width: 60, height: 18 },
      NecroTheme.shadow
    );
    
    // Draw FPS text
    this.ctx.drawText(
      fpsText,
      { x, y },
      NecroTheme.font,
      this.fps >= 60 ? NecroTheme.highlight : this.fps >= 30 ? NecroTheme.warning : NecroTheme.warning
    );
  }
  
  getFrameTime(): number {
    return performance.now() - this.lastFrameTime;
  }
  
  getFPS(): number {
    return this.fps;
  }
}
