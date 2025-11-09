/**
 * AWT Event System
 * Event classes and event handling
 */

import { Component } from "./component";

/**
 * AWTEvent base class
 */
export class AWTEvent {
  source: Component;
  id: number;
  timestamp: number;

  constructor(source: Component, id: number) {
    this.source = source;
    this.id = id;
    this.timestamp = Date.now();
  }
}

/**
 * ComponentEvent - component-level events
 */
export class ComponentEvent extends AWTEvent {
  static COMPONENT_MOVED = 1;
  static COMPONENT_RESIZED = 2;
  static COMPONENT_SHOWN = 3;
  static COMPONENT_HIDDEN = 4;

  constructor(source: Component, id: number) {
    super(source, id);
  }
}

/**
 * MouseEvent - mouse events
 */
export class MouseEvent extends AWTEvent {
  static MOUSE_CLICKED = 500;
  static MOUSE_PRESSED = 501;
  static MOUSE_RELEASED = 502;
  static MOUSE_ENTERED = 503;
  static MOUSE_EXITED = 504;
  static MOUSE_DRAGGED = 506;
  static MOUSE_MOVED = 507;

  x: number;
  y: number;
  button: number;
  clickCount: number;
  modifiers: number;

  constructor(
    source: Component,
    id: number,
    when: number,
    modifiers: number,
    x: number,
    y: number,
    clickCount: number,
    popupTrigger: boolean,
    button: number
  ) {
    super(source, id);
    this.x = x;
    this.y = y;
    this.button = button;
    this.clickCount = clickCount;
    this.modifiers = modifiers;
  }

  /**
   * Get X coordinate
   */
  getX(): number {
    return this.x;
  }

  /**
   * Get Y coordinate
   */
  getY(): number {
    return this.y;
  }

  /**
   * Get point
   */
  getPoint(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Get button
   */
  getButton(): number {
    return this.button;
  }

  /**
   * Get click count
   */
  getClickCount(): number {
    return this.clickCount;
  }

  /**
   * Get modifiers
   */
  getModifiers(): number {
    return this.modifiers;
  }
}

/**
 * KeyEvent - keyboard events
 */
export class KeyEvent extends AWTEvent {
  static KEY_PRESSED = 401;
  static KEY_RELEASED = 402;
  static KEY_TYPED = 400;

  keyCode: number;
  keyChar: string;
  keyLocation: number;
  modifiers: number;

  constructor(
    source: Component,
    id: number,
    when: number,
    modifiers: number,
    keyCode: number,
    keyChar: string,
    keyLocation: number
  ) {
    super(source, id);
    this.keyCode = keyCode;
    this.keyChar = keyChar;
    this.keyLocation = keyLocation;
    this.modifiers = modifiers;
  }

  /**
   * Get key code
   */
  getKeyCode(): number {
    return this.keyCode;
  }

  /**
   * Get key char
   */
  getKeyChar(): string {
    return this.keyChar;
  }

  /**
   * Get key location
   */
  getKeyLocation(): number {
    return this.keyLocation;
  }

  /**
   * Get modifiers
   */
  getModifiers(): number {
    return this.modifiers;
  }
}

/**
 * ActionEvent - action events
 */
export class ActionEvent extends AWTEvent {
  static ACTION_PERFORMED = 1001;

  actionCommand: string;
  modifiers: number;
  when: number;

  constructor(
    source: Component,
    id: number,
    actionCommand: string,
    modifiers: number,
    when: number
  ) {
    super(source, id);
    this.actionCommand = actionCommand;
    this.modifiers = modifiers;
    this.when = when;
  }

  /**
   * Get action command
   */
  getActionCommand(): string {
    return this.actionCommand;
  }

  /**
   * Get modifiers
   */
  getModifiers(): number {
    return this.modifiers;
  }

  /**
   * Get when
   */
  getWhen(): number {
    return this.when;
  }
}

/**
 * EventListener interface
 */
export interface EventListener {
  // Marker interface
}

/**
 * MouseListener interface
 */
export interface MouseListener extends EventListener {
  mouseClicked(e: MouseEvent): void;
  mousePressed(e: MouseEvent): void;
  mouseReleased(e: MouseEvent): void;
  mouseEntered(e: MouseEvent): void;
  mouseExited(e: MouseEvent): void;
}

/**
 * MouseMotionListener interface
 */
export interface MouseMotionListener extends EventListener {
  mouseDragged(e: MouseEvent): void;
  mouseMoved(e: MouseEvent): void;
}

/**
 * KeyListener interface
 */
export interface KeyListener extends EventListener {
  keyTyped(e: KeyEvent): void;
  keyPressed(e: KeyEvent): void;
  keyReleased(e: KeyEvent): void;
}

/**
 * ActionListener interface
 */
export interface ActionListener extends EventListener {
  actionPerformed(e: ActionEvent): void;
}

/**
 * Component listener manager
 */
export class ComponentListenerManager {
  private mouseListeners: MouseListener[] = [];
  private mouseMotionListeners: MouseMotionListener[] = [];
  private keyListeners: KeyListener[] = [];
  private actionListeners: ActionListener[] = [];

  /**
   * Add mouse listener
   */
  addMouseListener(listener: MouseListener): void {
    if (!this.mouseListeners.includes(listener)) {
      this.mouseListeners.push(listener);
    }
  }

  /**
   * Remove mouse listener
   */
  removeMouseListener(listener: MouseListener): void {
    const index = this.mouseListeners.indexOf(listener);
    if (index >= 0) {
      this.mouseListeners.splice(index, 1);
    }
  }

  /**
   * Add mouse motion listener
   */
  addMouseMotionListener(listener: MouseMotionListener): void {
    if (!this.mouseMotionListeners.includes(listener)) {
      this.mouseMotionListeners.push(listener);
    }
  }

  /**
   * Remove mouse motion listener
   */
  removeMouseMotionListener(listener: MouseMotionListener): void {
    const index = this.mouseMotionListeners.indexOf(listener);
    if (index >= 0) {
      this.mouseMotionListeners.splice(index, 1);
    }
  }

  /**
   * Add key listener
   */
  addKeyListener(listener: KeyListener): void {
    if (!this.keyListeners.includes(listener)) {
      this.keyListeners.push(listener);
    }
  }

  /**
   * Remove key listener
   */
  removeKeyListener(listener: KeyListener): void {
    const index = this.keyListeners.indexOf(listener);
    if (index >= 0) {
      this.keyListeners.splice(index, 1);
    }
  }

  /**
   * Add action listener
   */
  addActionListener(listener: ActionListener): void {
    if (!this.actionListeners.includes(listener)) {
      this.actionListeners.push(listener);
    }
  }

  /**
   * Remove action listener
   */
  removeActionListener(listener: ActionListener): void {
    const index = this.actionListeners.indexOf(listener);
    if (index >= 0) {
      this.actionListeners.splice(index, 1);
    }
  }

  /**
   * Fire mouse event
   */
  fireMouseEvent(e: MouseEvent): void {
    switch (e.id) {
      case MouseEvent.MOUSE_CLICKED:
        for (const listener of this.mouseListeners) {
          listener.mouseClicked(e);
        }
        break;
      case MouseEvent.MOUSE_PRESSED:
        for (const listener of this.mouseListeners) {
          listener.mousePressed(e);
        }
        break;
      case MouseEvent.MOUSE_RELEASED:
        for (const listener of this.mouseListeners) {
          listener.mouseReleased(e);
        }
        break;
      case MouseEvent.MOUSE_ENTERED:
        for (const listener of this.mouseListeners) {
          listener.mouseEntered(e);
        }
        break;
      case MouseEvent.MOUSE_EXITED:
        for (const listener of this.mouseListeners) {
          listener.mouseExited(e);
        }
        break;
      case MouseEvent.MOUSE_DRAGGED:
        for (const listener of this.mouseMotionListeners) {
          listener.mouseDragged(e);
        }
        break;
      case MouseEvent.MOUSE_MOVED:
        for (const listener of this.mouseMotionListeners) {
          listener.mouseMoved(e);
        }
        break;
    }
  }

  /**
   * Fire key event
   */
  fireKeyEvent(e: KeyEvent): void {
    switch (e.id) {
      case KeyEvent.KEY_TYPED:
        for (const listener of this.keyListeners) {
          listener.keyTyped(e);
        }
        break;
      case KeyEvent.KEY_PRESSED:
        for (const listener of this.keyListeners) {
          listener.keyPressed(e);
        }
        break;
      case KeyEvent.KEY_RELEASED:
        for (const listener of this.keyListeners) {
          listener.keyReleased(e);
        }
        break;
    }
  }

  /**
   * Fire action event
   */
  fireActionEvent(e: ActionEvent): void {
    for (const listener of this.actionListeners) {
      listener.actionPerformed(e);
    }
  }
}

