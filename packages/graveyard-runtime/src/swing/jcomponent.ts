/**
 * Swing JComponent base class
 */

import { Component } from "../awt/component";
import { Graphics, Color } from "../awt/graphics";

/**
 * JComponent base class for Swing components
 */
export class JComponent extends Component {
  private opaque: boolean = true;
  private doubleBuffered: boolean = true;
  private border: any = null;
  private toolTipText: string | null = null;

  /**
   * Paint component
   */
  paint(g: Graphics): void {
    // Paint background if opaque
    if (this.opaque && this.background) {
      g.setColor(this.background);
      g.fillRect(0, 0, this.width, this.height);
    }

    // Paint border if present
    if (this.border) {
      this.paintBorder(g);
    }

    // Paint component content
    this.paintComponent(g);
  }

  /**
   * Paint component content (override in subclasses)
   */
  protected paintComponent(g: Graphics): void {
    // Override in subclasses
  }

  /**
   * Paint border
   */
  protected paintBorder(g: Graphics): void {
    if (this.border) {
      // Simple border rendering
      g.setColor(this.foreground || { r: 0, g: 0, b: 0, a: 1 });
      g.drawRect(0, 0, this.width - 1, this.height - 1);
    }
  }

  /**
   * Set opaque
   */
  setOpaque(opaque: boolean): void {
    this.opaque = opaque;
    this.repaint();
  }

  /**
   * Is opaque
   */
  isOpaque(): boolean {
    return this.opaque;
  }

  /**
   * Set double buffered
   */
  setDoubleBuffered(doubleBuffered: boolean): void {
    this.doubleBuffered = doubleBuffered;
  }

  /**
   * Is double buffered
   */
  isDoubleBuffered(): boolean {
    return this.doubleBuffered;
  }

  /**
   * Set border
   */
  setBorder(border: any): void {
    this.border = border;
    this.repaint();
  }

  /**
   * Get border
   */
  getBorder(): any {
    return this.border;
  }

  /**
   * Set tooltip text
   */
  setToolTipText(text: string | null): void {
    this.toolTipText = text;
  }

  /**
   * Get tooltip text
   */
  getToolTipText(): string | null {
    return this.toolTipText;
  }
}

