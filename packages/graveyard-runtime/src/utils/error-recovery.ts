/**
 * Error Recovery Utilities
 * Handles graceful degradation, partial rendering, and retry mechanisms
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface RecoveryState {
  isRecovering: boolean;
  retryCount: number;
  lastError: Error | null;
  partialData: any;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
  }
): Promise<T> {
  let lastError: Error | null = null;
  let delay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (config.retryableErrors && config.retryableErrors.length > 0) {
        const errorMessage = lastError.message.toLowerCase();
        const isRetryable = config.retryableErrors.some((retryableError) =>
          errorMessage.includes(retryableError.toLowerCase())
        );

        if (!isRetryable) {
          throw lastError;
        }
      }

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Increase delay for next retry
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelay);
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Graceful Degradation Manager
 */
export class GracefulDegradationManager {
  private fallbacks: Map<string, () => any> = new Map();
  private degradedFeatures: Set<string> = new Set();

  /**
   * Register fallback for feature
   */
  registerFallback(feature: string, fallback: () => any): void {
    this.fallbacks.set(feature, fallback);
  }

  /**
   * Execute with fallback
   */
  async executeWithFallback<T>(
    feature: string,
    fn: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Feature ${feature} failed, using fallback:`, error);
      this.degradedFeatures.add(feature);

      const fallbackFn = fallback || this.fallbacks.get(feature);
      if (fallbackFn) {
        return fallbackFn();
      }

      throw error;
    }
  }

  /**
   * Check if feature is degraded
   */
  isDegraded(feature: string): boolean {
    return this.degradedFeatures.has(feature);
  }

  /**
   * Reset degraded features
   */
  reset(): void {
    this.degradedFeatures.clear();
  }
}

/**
 * Partial Renderer
 * Supports partial rendering when full render fails
 */
export class PartialRenderer {
  private renderQueue: Array<{ priority: number; renderFn: () => void }> = [];
  private renderedItems: Set<string> = new Set();
  private maxRenderAttempts: number = 3;

  /**
   * Add render task
   */
  addRenderTask(id: string, renderFn: () => void, priority: number = 0): void {
    this.renderQueue.push({ priority, renderFn });
    this.renderQueue.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Render with fallback
   */
  async renderWithFallback(
    id: string,
    renderFn: () => Promise<void>,
    fallbackFn?: () => void
  ): Promise<void> {
    if (this.renderedItems.has(id)) {
      return; // Already rendered
    }

    let attempts = 0;
    while (attempts < this.maxRenderAttempts) {
      try {
        await renderFn();
        this.renderedItems.add(id);
        return;
      } catch (error) {
        attempts++;
        console.warn(`Render attempt ${attempts} failed for ${id}:`, error);

        if (attempts >= this.maxRenderAttempts) {
          // Use fallback if available
          if (fallbackFn) {
            try {
              fallbackFn();
              this.renderedItems.add(id);
            } catch (fallbackError) {
              console.error(`Fallback render failed for ${id}:`, fallbackError);
            }
          }
        } else {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 100 * attempts));
        }
      }
    }
  }

  /**
   * Clear rendered items
   */
  clear(): void {
    this.renderedItems.clear();
    this.renderQueue = [];
  }

  /**
   * Get render queue
   */
  getRenderQueue(): Array<{ priority: number; renderFn: () => void }> {
    return [...this.renderQueue];
  }
}

/**
 * Error Recovery Manager
 */
export class ErrorRecoveryManager {
  private recoveryState: RecoveryState = {
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    partialData: null,
  };
  private gracefulDegradation: GracefulDegradationManager;
  private partialRenderer: PartialRenderer;

  constructor() {
    this.gracefulDegradation = new GracefulDegradationManager();
    this.partialRenderer = new PartialRenderer();
  }

  /**
   * Recover from error
   */
  async recover<T>(
    fn: () => Promise<T>,
    fallback?: () => T,
    retryConfig?: RetryConfig
  ): Promise<T> {
    this.recoveryState.isRecovering = true;

    try {
      const result = await retryWithBackoff(fn, retryConfig);
      this.recoveryState.isRecovering = false;
      this.recoveryState.retryCount = 0;
      this.recoveryState.lastError = null;
      return result;
    } catch (error) {
      this.recoveryState.lastError = error instanceof Error ? error : new Error(String(error));
      this.recoveryState.retryCount++;

      if (fallback) {
        try {
          const fallbackResult = fallback();
          this.recoveryState.isRecovering = false;
          return fallbackResult;
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }

      this.recoveryState.isRecovering = false;
      throw error;
    }
  }

  /**
   * Get recovery state
   */
  getRecoveryState(): RecoveryState {
    return { ...this.recoveryState };
  }

  /**
   * Reset recovery state
   */
  reset(): void {
    this.recoveryState = {
      isRecovering: false,
      retryCount: 0,
      lastError: null,
      partialData: null,
    };
    this.gracefulDegradation.reset();
    this.partialRenderer.clear();
  }

  /**
   * Get graceful degradation manager
   */
  getGracefulDegradation(): GracefulDegradationManager {
    return this.gracefulDegradation;
  }

  /**
   * Get partial renderer
   */
  getPartialRenderer(): PartialRenderer {
    return this.partialRenderer;
  }
}

