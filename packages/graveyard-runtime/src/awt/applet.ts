/**
 * Applet class
 * Base class for Java applets
 */

import { Panel } from "./component";
import { Graphics } from "./graphics";

/**
 * Applet class extending Panel
 */
export class Applet extends Panel {
  private initialized: boolean = false;
  private started: boolean = false;
  private stopped: boolean = false;
  private destroyed: boolean = false;
  private parameters: Map<string, string> = new Map();

  /**
   * Initialize applet
   */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    console.log("[Applet] init() called");
  }

  /**
   * Start applet
   */
  start(): void {
    if (!this.initialized) {
      this.init();
    }
    this.started = true;
    this.stopped = false;
    console.log("[Applet] start() called");
  }

  /**
   * Stop applet
   */
  stop(): void {
    this.stopped = true;
    console.log("[Applet] stop() called");
  }

  /**
   * Destroy applet
   */
  destroy(): void {
    this.destroyed = true;
    this.removeAll();
    console.log("[Applet] destroy() called");
  }

  /**
   * Paint applet
   */
  paint(g: Graphics): void {
    // Default: paint background and children
    super.paint(g);
  }

  /**
   * Update applet
   */
  update(g: Graphics): void {
    // Default: update background and children
    super.update(g);
  }

  /**
   * Get parameter
   */
  getParameter(name: string): string | null {
    return this.parameters.get(name) || null;
  }

  /**
   * Set parameter
   */
  setParameter(name: string, value: string): void {
    this.parameters.set(name, value);
  }

  /**
   * Set parameters
   */
  setParameters(params: Map<string, string> | Record<string, string>): void {
    if (params instanceof Map) {
      this.parameters = new Map(params);
    } else {
      this.parameters = new Map(Object.entries(params));
    }
  }

  /**
   * Get code base (URL)
   */
  getCodeBase(): string {
    return window.location.href;
  }

  /**
   * Get document base (URL)
   */
  getDocumentBase(): string {
    return window.location.href;
  }

  /**
   * Show status message
   */
  showStatus(message: string): void {
    console.log(`[Applet] Status: ${message}`);
  }

  /**
   * Is active
   */
  isActive(): boolean {
    return this.started && !this.stopped;
  }

  /**
   * Is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Is started
   */
  isStarted(): boolean {
    return this.started;
  }

  /**
   * Is stopped
   */
  isStopped(): boolean {
    return this.stopped;
  }

  /**
   * Is destroyed
   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}

