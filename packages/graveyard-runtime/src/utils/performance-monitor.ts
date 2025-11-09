/**
 * Performance Monitor
 * Tracks FPS, memory usage, and render time profiling
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  renderTime: number;
  timestamp: number;
}

export interface PerformanceStats {
  avgFPS: number;
  minFPS: number;
  maxFPS: number;
  avgFrameTime: number;
  avgRenderTime: number;
  avgMemoryUsage: number;
  samples: number;
}

/**
 * Performance Monitor
 */
export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private renderTimes: number[] = [];
  private memoryUsages: number[] = [];
  private timestamps: number[] = [];
  private maxSamples: number = 60; // Keep last 60 samples
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateInterval: number = 1000; // Update FPS every second
  private lastFpsUpdate: number = 0;
  private currentFPS: number = 0;
  private renderStartTime: number = 0;
  private isProfiling: boolean = false;

  /**
   * Start frame
   */
  startFrame(): void {
    const now = performance.now();
    this.lastFrameTime = now;
    this.frameCount++;
    
    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFPS = (this.frameCount * 1000) / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * End frame
   */
  endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    this.addSample(frameTime, this.renderStartTime > 0 ? now - this.renderStartTime : 0);
    this.renderStartTime = 0;
  }

  /**
   * Start render profiling
   */
  startRender(): void {
    this.renderStartTime = performance.now();
    this.isProfiling = true;
  }

  /**
   * End render profiling
   */
  endRender(): number {
    if (this.renderStartTime > 0) {
      const renderTime = performance.now() - this.renderStartTime;
      this.renderStartTime = 0;
      this.isProfiling = false;
      return renderTime;
    }
    return 0;
  }

  /**
   * Add sample
   */
  private addSample(frameTime: number, renderTime: number): void {
    const memoryUsage = this.getMemoryUsage();
    
    this.frameTimes.push(frameTime);
    this.renderTimes.push(renderTime);
    this.memoryUsages.push(memoryUsage);
    this.timestamps.push(Date.now());
    
    // Keep only last N samples
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
      this.renderTimes.shift();
      this.memoryUsages.shift();
      this.timestamps.shift();
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const now = performance.now();
    const frameTime = this.frameTimes.length > 0 ? this.frameTimes[this.frameTimes.length - 1] : 0;
    const renderTime = this.renderTimes.length > 0 ? this.renderTimes[this.renderTimes.length - 1] : 0;
    const memoryUsage = this.getMemoryUsage();
    
    return {
      fps: this.currentFPS,
      frameTime,
      memoryUsage,
      renderTime,
      timestamp: now,
    };
  }

  /**
   * Get performance statistics
   */
  getStats(): PerformanceStats {
    if (this.frameTimes.length === 0) {
      return {
        avgFPS: 0,
        minFPS: 0,
        maxFPS: 0,
        avgFrameTime: 0,
        avgRenderTime: 0,
        avgMemoryUsage: 0,
        samples: 0,
      };
    }

    const fpsValues = this.frameTimes.map(ft => 1000 / ft);
    const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
    const minFPS = Math.min(...fpsValues);
    const maxFPS = Math.max(...fpsValues);
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    const avgRenderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    const avgMemoryUsage = this.memoryUsages.reduce((a, b) => a + b, 0) / this.memoryUsages.length;

    return {
      avgFPS,
      minFPS,
      maxFPS,
      avgFrameTime,
      avgRenderTime,
      avgMemoryUsage,
      samples: this.frameTimes.length,
    };
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== "undefined" && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Get all samples
   */
  getSamples(): Array<{ timestamp: number; frameTime: number; renderTime: number; memoryUsage: number }> {
    const samples: Array<{ timestamp: number; frameTime: number; renderTime: number; memoryUsage: number }> = [];
    
    for (let i = 0; i < this.frameTimes.length; i++) {
      samples.push({
        timestamp: this.timestamps[i],
        frameTime: this.frameTimes[i],
        renderTime: this.renderTimes[i],
        memoryUsage: this.memoryUsages[i],
      });
    }
    
    return samples;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.frameTimes = [];
    this.renderTimes = [];
    this.memoryUsages = [];
    this.timestamps = [];
    this.frameCount = 0;
    this.currentFPS = 0;
    this.lastFpsUpdate = performance.now();
  }

  /**
   * Is profiling
   */
  isProfilingActive(): boolean {
    return this.isProfiling;
  }
}

