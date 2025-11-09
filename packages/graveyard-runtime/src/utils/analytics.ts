/**
 * Analytics utilities
 * Tracks file views, performance metrics, errors, and user behavior
 */

export interface AnalyticsEvent {
  type: string;
  fileId?: string;
  fileType?: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface FileViewStats {
  fileId: string;
  views: number;
  uniqueViews: number;
  avgViewDuration: number;
  lastViewed: Date;
}

export interface PerformanceMetrics {
  fileId: string;
  avgFPS: number;
  avgFrameTime: number;
  avgRenderTime: number;
  avgMemoryUsage: number;
  errorCount: number;
}

export interface ErrorStats {
  fileId: string;
  errorType: string;
  count: number;
  lastOccurred: Date;
  stack?: string;
}

/**
 * Analytics Manager
 */
export class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private fileViews: Map<string, FileViewStats> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private errorStats: Map<string, ErrorStats[]> = new Map();
  private maxEvents: number = 1000;

  /**
   * Track event
   */
  trackEvent(type: string, data?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  /**
   * Track file view
   */
  trackFileView(fileId: string, fileType: string, duration?: number): void {
    const stats = this.fileViews.get(fileId) || {
      fileId,
      views: 0,
      uniqueViews: 0,
      avgViewDuration: 0,
      lastViewed: new Date(),
    };

    stats.views++;
    stats.lastViewed = new Date();
    
    if (duration !== undefined) {
      stats.avgViewDuration = (stats.avgViewDuration * (stats.views - 1) + duration) / stats.views;
    }

    this.fileViews.set(fileId, stats);

    this.trackEvent("file_view", {
      fileId,
      fileType,
      duration,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(fileId: string, metrics: {
    fps: number;
    frameTime: number;
    renderTime: number;
    memoryUsage: number;
  }): void {
    const existing = this.performanceMetrics.get(fileId) || {
      fileId,
      avgFPS: 0,
      avgFrameTime: 0,
      avgRenderTime: 0,
      avgMemoryUsage: 0,
      errorCount: 0,
      sampleCount: 0,
    };

    const sampleCount = (existing as any).sampleCount || 0;

    existing.avgFPS = (existing.avgFPS * sampleCount + metrics.fps) / (sampleCount + 1);
    existing.avgFrameTime = (existing.avgFrameTime * sampleCount + metrics.frameTime) / (sampleCount + 1);
    existing.avgRenderTime = (existing.avgRenderTime * sampleCount + metrics.renderTime) / (sampleCount + 1);
    existing.avgMemoryUsage = (existing.avgMemoryUsage * sampleCount + metrics.memoryUsage) / (sampleCount + 1);
    (existing as any).sampleCount = sampleCount + 1;

    this.performanceMetrics.set(fileId, existing);

    this.trackEvent("performance", {
      fileId,
      ...metrics,
    });
  }

  /**
   * Track error
   */
  trackError(fileId: string, errorType: string, error: Error): void {
    const fileErrors = this.errorStats.get(fileId) || [];
    
    const existingError = fileErrors.find((e) => e.errorType === errorType);
    if (existingError) {
      existingError.count++;
      existingError.lastOccurred = new Date();
      existingError.stack = error.stack;
    } else {
      fileErrors.push({
        fileId,
        errorType,
        count: 1,
        lastOccurred: new Date(),
        stack: error.stack,
      });
    }

    this.errorStats.set(fileId, fileErrors);

    // Update performance metrics error count
    const perf = this.performanceMetrics.get(fileId);
    if (perf) {
      perf.errorCount++;
    }

    this.trackEvent("error", {
      fileId,
      errorType,
      message: error.message,
      stack: error.stack,
    });
  }

  /**
   * Get file view statistics
   */
  getFileViewStats(fileId: string): FileViewStats | null {
    return this.fileViews.get(fileId) || null;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(fileId: string): PerformanceMetrics | null {
    return this.performanceMetrics.get(fileId) || null;
  }

  /**
   * Get error statistics
   */
  getErrorStats(fileId: string): ErrorStats[] {
    return this.errorStats.get(fileId) || [];
  }

  /**
   * Get all events
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: string): AnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Clear analytics
   */
  clear(): void {
    this.events = [];
    this.fileViews.clear();
    this.performanceMetrics.clear();
    this.errorStats.clear();
  }
}

