/**
 * MIDP Display Emulation
 * javax.microedition.lcdui.Display
 */

import { Canvas } from "./canvas";
import { Graphics } from "../awt/graphics";

/**
 * Displayable - base class for all displayable items
 */
export abstract class Displayable {
  protected width: number = 0;
  protected height: number = 0;

  abstract paint(g: Graphics): void;

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}

/**
 * Display - manages the display and current displayable
 */
export class Display {
  private static instances: Map<any, Display> = new Map();
  private current: Displayable | Canvas | null = null;
  private midlet: any;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private graphics: Graphics | null = null;
  private animationFrame: number | null = null;

  private constructor(midlet: any) {
    this.midlet = midlet;
  }

  /**
   * Get display instance for MIDlet
   */
  static getDisplay(midlet: any): Display {
    if (!Display.instances.has(midlet)) {
      Display.instances.set(midlet, new Display(midlet));
    }
    return Display.instances.get(midlet)!;
  }

  /**
   * Set current displayable
   */
  setCurrent(displayable: Displayable | Canvas | null): void {
    // Hide previous
    if (this.current && this.current instanceof Canvas) {
      this.current._callHideNotify();
    }

    this.current = displayable;

    // Show new
    if (this.current && this.current instanceof Canvas) {
      this.current._callShowNotify();
      this.current.repaint();
    }

    console.log("[Display] setCurrent called with:", displayable?.constructor.name || "null");
  }

  /**
   * Get current displayable
   */
  getCurrent(): Displayable | Canvas | null {
    return this.current;
  }

  /**
   * Set canvas for rendering
   */
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.graphics = new Graphics(this.ctx);
    }

    // Set size for current displayable
    if (this.current) {
      this.current.setSize(canvas.width, canvas.height);
    }

    // Start rendering loop
    this.startRenderingLoop();
  }

  /**
   * Start rendering loop
   */
  private startRenderingLoop(): void {
    if (this.animationFrame !== null) {
      return; // Already running
    }

    console.log("[Display] Starting rendering loop");

    const render = () => {
      if (this.current && this.canvas && this.ctx && this.graphics) {
        // Check if repaint is needed
        let needsRepaint = false;

        if (this.current instanceof Canvas) {
          needsRepaint = this.current.isRepaintRequested();
        }

        if (needsRepaint) {
          // Clear canvas
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

          // Create fresh graphics context
          this.graphics = new Graphics(this.ctx);

          // Paint current displayable
          try {
            this.current.paint(this.graphics);
          } catch (error) {
            console.error("[Display] Error during paint:", error);
          }
        }
      }

      this.animationFrame = requestAnimationFrame(render);
    };

    this.animationFrame = requestAnimationFrame(render);
  }

  /**
   * Stop rendering loop
   */
  stopRenderingLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Call serially - execute runnable on display thread
   */
  callSerially(runnable: () => void): void {
    // Execute immediately (we're already on the main thread)
    try {
      runnable();
    } catch (error) {
      console.error("[Display] Error in callSerially:", error);
    }
  }

  /**
   * Vibrate device
   */
  vibrate(duration: number): boolean {
    // Not supported in browser
    console.log("[Display] vibrate called:", duration);
    return false;
  }

  /**
   * Flash backlight
   */
  flashBacklight(duration: number): boolean {
    // Not supported in browser
    console.log("[Display] flashBacklight called:", duration);
    return false;
  }

  /**
   * Get color count
   */
  numColors(): number {
    return 16777216; // 24-bit color
  }

  /**
   * Is color display
   */
  isColor(): boolean {
    return true;
  }

  /**
   * Get number of alpha levels
   */
  numAlphaLevels(): number {
    return 256;
  }
}
