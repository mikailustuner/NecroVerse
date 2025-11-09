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
    // Prevent repaint during paint to avoid infinite loop
    const wasRepaintRequested = this.isRepaintRequested();
    if (wasRepaintRequested) {
      // Temporarily clear repaint flag
      (this as any).repaintRequested = false;
    }
    
    try {
      // Default: paint background
      if (this.background) {
        g.setColor(this.background);
        g.fillRect(0, 0, this.width, this.height);
      } else {
        // Default gray background
        g.setColor({ r: 192, g: 192, b: 192, a: 1 });
        g.fillRect(0, 0, this.width, this.height);
      }
      
      // Paint children
      super.paint(g);
      
      // If no children and no custom paint, show a message
      if (this.getComponentCount() === 0) {
        g.setColor({ r: 0, g: 0, b: 0, a: 1 });
        g.setFont({ name: "Arial", size: 16, style: 0 });
        g.drawString("Java MIDlet Runtime", 10, 30);
        g.drawString(`Size: ${this.width}x${this.height}`, 10, 55);
        g.drawString("MIDlet started successfully", 10, 80);
        
        // Draw a test rectangle to verify rendering
        g.setColor({ r: 168, g: 85, b: 247, a: 1 }); // Purple
        g.fillRect(10, 100, 200, 100);
        
        g.setColor({ r: 255, g: 255, b: 255, a: 1 }); // White
        g.drawString("Test Rectangle", 20, 140);
      }
    } finally {
      // Restore repaint flag if it was set
      if (wasRepaintRequested) {
        (this as any).repaintRequested = true;
      }
    }
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

