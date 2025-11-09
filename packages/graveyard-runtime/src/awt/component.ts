/**
 * AWT Component Hierarchy
 * Base classes for AWT components
 */

import { Graphics, Color, Font } from "./graphics";
import { ComponentListenerManager, MouseEvent, KeyEvent, ActionEvent } from "./events";

/**
 * Component base class
 */
export abstract class Component {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  height: number = 0;
  visible: boolean = true;
  enabled: boolean = true;
  background: Color | null = null;
  foreground: Color | null = null;
  font: Font | null = null;
  parent: Container | null = null;
  private repaintRequested: boolean = false;
  private repaintTimer: number | null = null;
  protected listeners: ComponentListenerManager = new ComponentListenerManager();

  /**
   * Paint component
   */
  abstract paint(g: Graphics): void;

  /**
   * Update component (called before paint)
   */
  update(g: Graphics): void {
    // Prevent repaint during update/paint
    const wasRepaintRequested = this.isRepaintRequested();
    if (wasRepaintRequested) {
      (this as any).repaintRequested = false;
    }
    
    try {
      this.paint(g);
    } finally {
      if (wasRepaintRequested) {
        (this as any).repaintRequested = true;
      }
    }
  }

  /**
   * Internal repaint implementation
   */
  private doRepaint(): void {
    // Simply set the flag - external rendering loop will handle the actual paint
    this.repaintRequested = true;
  }

  /**
   * Repaint component
   */
  repaint(): void;
  repaint(delay: number): void;
  repaint(x: number, y: number, width: number, height: number): void;
  repaint(xOrDelay?: number, y?: number, width?: number, height?: number): void {
    if (y !== undefined && width !== undefined && height !== undefined) {
      // Repaint specific rectangle - just set flag
      this.repaintRequested = true;
    } else if (xOrDelay !== undefined && xOrDelay > 0) {
      // Repaint with delay
      setTimeout(() => {
        this.repaintRequested = true;
      }, xOrDelay);
    } else {
      // No parameters - immediate repaint request
      this.repaintRequested = true;
    }
  }

  /**
   * Get size
   */
  getSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  /**
   * Set size
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.repaint();
  }

  /**
   * Get location
   */
  getLocation(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Set location
   */
  setLocation(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.repaint();
  }

  /**
   * Get bounds
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /**
   * Set bounds
   */
  setBounds(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.repaint();
  }

  /**
   * Set background color
   */
  setBackground(color: Color): void {
    this.background = color;
    this.repaint();
  }

  /**
   * Get background color
   */
  getBackground(): Color | null {
    return this.background;
  }

  /**
   * Set foreground color
   */
  setForeground(color: Color): void {
    this.foreground = color;
    this.repaint();
  }

  /**
   * Get foreground color
   */
  getForeground(): Color | null {
    return this.foreground;
  }

  /**
   * Set font
   */
  setFont(font: Font): void {
    this.font = font;
    this.repaint();
  }

  /**
   * Get font
   */
  getFont(): Font | null {
    return this.font;
  }

  /**
   * Set visible
   */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (this.parent) {
      this.parent.repaint();
    }
  }

  /**
   * Is visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Set enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.repaint();
  }

  /**
   * Is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get parent
   */
  getParent(): Container | null {
    return this.parent;
  }

  /**
   * Check if repaint is requested
   */
  isRepaintRequested(): boolean {
    return this.repaintRequested;
  }

  /**
   * Request repaint
   */
  requestRepaint(): void {
    this.repaint();
  }
}

/**
 * Container base class
 */
export class Container extends Component {
  private children: Component[] = [];
  private layoutManager: LayoutManager | null = null;

  /**
   * Add component
   */
  add(comp: Component): Component;
  add(comp: Component, constraints: any): Component;
  add(comp: Component, constraints?: any): Component {
    if (comp.parent) {
      comp.parent.remove(comp);
    }
    comp.parent = this;
    this.children.push(comp);
    if (this.layoutManager) {
      this.layoutManager.addLayoutComponent(comp, constraints);
    }
    this.repaint();
    return comp;
  }

  /**
   * Remove component
   */
  remove(comp: Component): void {
    const index = this.children.indexOf(comp);
    if (index >= 0) {
      this.children.splice(index, 1);
      comp.parent = null;
      if (this.layoutManager) {
        this.layoutManager.removeLayoutComponent(comp);
      }
      this.repaint();
    }
  }

  /**
   * Remove all components
   */
  removeAll(): void {
    for (const comp of this.children) {
      comp.parent = null;
    }
    this.children = [];
    if (this.layoutManager) {
      this.layoutManager.removeAllComponents();
    }
    this.repaint();
  }

  /**
   * Get components
   */
  getComponents(): Component[] {
    return [...this.children];
  }

  /**
   * Get component count
   */
  getComponentCount(): number {
    return this.children.length;
  }

  /**
   * Set layout manager
   */
  setLayout(layout: LayoutManager | null): void {
    this.layoutManager = layout;
    if (layout) {
      layout.layoutContainer(this);
    }
    this.repaint();
  }

  /**
   * Get layout manager
   */
  getLayout(): LayoutManager | null {
    return this.layoutManager;
  }

  /**
   * Paint container and children
   */
  paint(g: Graphics): void {
    // Prevent repaint during paint
    const wasRepaintRequested = this.isRepaintRequested();
    if (wasRepaintRequested) {
      (this as any).repaintRequested = false;
    }
    
    try {
      // Paint background
      if (this.background) {
        g.setColor(this.background);
        g.fillRect(0, 0, this.width, this.height);
      }

      // Paint children
      for (const child of this.children) {
        if (child.visible) {
          g.save();
          g.translate(child.x, child.y);
          g.setClip(0, 0, child.width, child.height);
          child.paint(g);
          g.restore();
        }
      }
    } finally {
      if (wasRepaintRequested) {
        (this as any).repaintRequested = true;
      }
    }
  }

  /**
   * Update container and children
   */
  update(g: Graphics): void {
    // Prevent repaint during update
    const wasRepaintRequested = this.isRepaintRequested();
    if (wasRepaintRequested) {
      (this as any).repaintRequested = false;
    }
    
    try {
      // Update background
      if (this.background) {
        g.setColor(this.background);
        g.fillRect(0, 0, this.width, this.height);
      }

      // Update children
      for (const child of this.children) {
        if (child.visible) {
          g.save();
          g.translate(child.x, child.y);
          g.setClip(0, 0, child.width, child.height);
          child.update(g);
          g.restore();
        }
      }
    } finally {
      if (wasRepaintRequested) {
        (this as any).repaintRequested = true;
      }
    }
  }

  /**
   * Validate layout
   */
  validate(): void {
    if (this.layoutManager) {
      this.layoutManager.layoutContainer(this);
    }
    for (const child of this.children) {
      if (child instanceof Container) {
        child.validate();
      }
    }
  }
}

/**
 * Panel class
 */
export class Panel extends Container {
  /**
   * Paint panel
   */
  paint(g: Graphics): void {
    super.paint(g);
  }
}

/**
 * Layout Manager interface
 */
export interface LayoutManager {
  addLayoutComponent(comp: Component, constraints?: any): void;
  removeLayoutComponent(comp: Component): void;
  removeAllComponents(): void;
  layoutContainer(parent: Container): void;
  minimumLayoutSize(parent: Container): { width: number; height: number };
  preferredLayoutSize(parent: Container): { width: number; height: number };
  maximumLayoutSize(parent: Container): { width: number; height: number };
}

// Export LayoutManager from layout.ts
export type { LayoutManager } from "./layout";
// Re-export as LayoutManagerImpl for compatibility
export type { LayoutManager as LayoutManagerImpl } from "./layout";

