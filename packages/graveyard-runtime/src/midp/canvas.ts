/**
 * MIDP Canvas Emulation
 * javax.microedition.lcdui.Canvas
 */

import { Graphics } from "../awt/graphics";

export abstract class Canvas {
  protected width: number = 0;
  protected height: number = 0;
  private repaintRequested: boolean = false;
  private keyStates: Map<number, boolean> = new Map();

  /**
   * Get canvas width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Get canvas height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Paint method - must be implemented by subclass
   */
  abstract paint(g: Graphics): void;

  /**
   * Key pressed event
   */
  protected keyPressed(keyCode: number): void {
    // Override in subclass
  }

  /**
   * Key released event
   */
  protected keyReleased(keyCode: number): void {
    // Override in subclass
  }

  /**
   * Key repeated event
   */
  protected keyRepeated(keyCode: number): void {
    // Override in subclass
  }

  /**
   * Pointer pressed event
   */
  protected pointerPressed(x: number, y: number): void {
    // Override in subclass
  }

  /**
   * Pointer released event
   */
  protected pointerReleased(x: number, y: number): void {
    // Override in subclass
  }

  /**
   * Pointer dragged event
   */
  protected pointerDragged(x: number, y: number): void {
    // Override in subclass
  }

  /**
   * Show notify - called when canvas becomes visible
   */
  protected showNotify(): void {
    // Override in subclass
  }

  /**
   * Hide notify - called when canvas becomes hidden
   */
  protected hideNotify(): void {
    // Override in subclass
  }

  /**
   * Repaint canvas
   */
  repaint(): void;
  repaint(x: number, y: number, width: number, height: number): void;
  repaint(x?: number, y?: number, width?: number, height?: number): void {
    this.repaintRequested = true;
  }

  /**
   * Service repaints immediately
   */
  serviceRepaints(): void {
    if (this.repaintRequested) {
      this.repaintRequested = false;
      // Repaint will be handled by Display
    }
  }

  /**
   * Check if repaint is requested
   */
  isRepaintRequested(): boolean {
    return this.repaintRequested;
  }

  /**
   * Get key states
   */
  getKeyStates(): number {
    let states = 0;
    // Combine key states into bitmask
    return states;
  }

  /**
   * Has pointer events
   */
  hasPointerEvents(): boolean {
    return true;
  }

  /**
   * Has pointer motion events
   */
  hasPointerMotionEvents(): boolean {
    return true;
  }

  /**
   * Has repeat events
   */
  hasRepeatEvents(): boolean {
    return true;
  }

  /**
   * Set size
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /**
   * Internal method to dispatch key pressed
   */
  _dispatchKeyPressed(keyCode: number): void {
    this.keyStates.set(keyCode, true);
    this.keyPressed(keyCode);
  }

  /**
   * Internal method to dispatch key released
   */
  _dispatchKeyReleased(keyCode: number): void {
    this.keyStates.set(keyCode, false);
    this.keyReleased(keyCode);
  }

  /**
   * Internal method to dispatch pointer pressed
   */
  _dispatchPointerPressed(x: number, y: number): void {
    this.pointerPressed(x, y);
  }

  /**
   * Internal method to dispatch pointer released
   */
  _dispatchPointerReleased(x: number, y: number): void {
    this.pointerReleased(x, y);
  }

  /**
   * Internal method to dispatch pointer dragged
   */
  _dispatchPointerDragged(x: number, y: number): void {
    this.pointerDragged(x, y);
  }

  /**
   * Internal method to call showNotify
   */
  _callShowNotify(): void {
    this.showNotify();
  }

  /**
   * Internal method to call hideNotify
   */
  _callHideNotify(): void {
    this.hideNotify();
  }
}

/**
 * Game Canvas - extended canvas with game-specific features
 */
export abstract class GameCanvas extends Canvas {
  // Game action constants
  static readonly UP_PRESSED = 1 << 1;
  static readonly DOWN_PRESSED = 1 << 6;
  static readonly LEFT_PRESSED = 1 << 2;
  static readonly RIGHT_PRESSED = 1 << 5;
  static readonly FIRE_PRESSED = 1 << 8;
  static readonly GAME_A_PRESSED = 1 << 9;
  static readonly GAME_B_PRESSED = 1 << 10;
  static readonly GAME_C_PRESSED = 1 << 11;
  static readonly GAME_D_PRESSED = 1 << 12;

  /**
   * Flush graphics buffer
   */
  flushGraphics(): void;
  flushGraphics(x: number, y: number, width: number, height: number): void;
  flushGraphics(x?: number, y?: number, width?: number, height?: number): void {
    // Request repaint
    this.repaint();
  }
}
