/**
 * Native Method Bridge
 * Maps Java native methods to JavaScript implementations
 */

import { Graphics } from "./graphics";
import { Component } from "./component";
import { Display } from "../midp/display";
import { Canvas } from "../midp/canvas";

/**
 * Native method registry
 */
export class NativeMethodBridge {
  private static instance: NativeMethodBridge | null = null;
  private methods: Map<string, Function> = new Map();

  private constructor() {
    this.registerNativeMethods();
  }

  static getInstance(): NativeMethodBridge {
    if (!NativeMethodBridge.instance) {
      NativeMethodBridge.instance = new NativeMethodBridge();
    }
    return NativeMethodBridge.instance;
  }

  /**
   * Register all native methods
   */
  private registerNativeMethods(): void {
    // java.lang.System
    this.register("java/lang/System.currentTimeMillis", () => Date.now());
    this.register("java/lang/System.nanoTime", () => performance.now() * 1000000);
    this.register("java/lang/System.arraycopy", (src: any, srcPos: number, dest: any, destPos: number, length: number) => {
      if (Array.isArray(src) && Array.isArray(dest)) {
        for (let i = 0; i < length; i++) {
          dest[destPos + i] = src[srcPos + i];
        }
      }
    });

    // java.lang.Math
    this.register("java/lang/Math.sin", (a: number) => Math.sin(a));
    this.register("java/lang/Math.cos", (a: number) => Math.cos(a));
    this.register("java/lang/Math.tan", (a: number) => Math.tan(a));
    this.register("java/lang/Math.sqrt", (a: number) => Math.sqrt(a));
    this.register("java/lang/Math.pow", (a: number, b: number) => Math.pow(a, b));
    this.register("java/lang/Math.abs", (a: number) => Math.abs(a));
    this.register("java/lang/Math.max", (a: number, b: number) => Math.max(a, b));
    this.register("java/lang/Math.min", (a: number, b: number) => Math.min(a, b));
    this.register("java/lang/Math.random", () => Math.random());
    this.register("java/lang/Math.floor", (a: number) => Math.floor(a));
    this.register("java/lang/Math.ceil", (a: number) => Math.ceil(a));
    this.register("java/lang/Math.round", (a: number) => Math.round(a));

    // java.lang.Object
    this.register("java/lang/Object.hashCode", (obj: any) => {
      if (obj && typeof obj === 'object') {
        return obj.__id || 0;
      }
      return 0;
    });
    this.register("java/lang/Object.toString", (obj: any) => {
      if (obj && typeof obj === 'object') {
        return obj.__class || 'java.lang.Object';
      }
      return String(obj);
    });

    // java.lang.String
    this.register("java/lang/String.length", (str: string) => str.length);
    this.register("java/lang/String.charAt", (str: string, index: number) => str.charAt(index));
    this.register("java/lang/String.substring", (str: string, begin: number, end?: number) => {
      if (end !== undefined) {
        return str.substring(begin, end);
      }
      return str.substring(begin);
    });

    // java.awt.Component
    this.register("java/awt/Component.paint", (comp: Component, g: Graphics) => {
      comp.paint(g);
    });
    this.register("java/awt/Component.repaint", (comp: Component) => {
      comp.repaint();
    });
    this.register("java/awt/Component.update", (comp: Component, g: Graphics) => {
      comp.update(g);
    });

    // javax.microedition.lcdui.Display
    this.register("javax/microedition/lcdui/Display.getDisplay", (midlet: any) => {
      return Display.getDisplay(midlet);
    });
    this.register("javax/microedition/lcdui/Display.setCurrent", (display: Display, displayable: any) => {
      display.setCurrent(displayable);
    });
    this.register("javax/microedition/lcdui/Display.getCurrent", (display: Display) => {
      return display.getCurrent();
    });

    // javax.microedition.lcdui.Canvas
    this.register("javax/microedition/lcdui/Canvas.getWidth", (canvas: Canvas) => {
      return canvas.getWidth();
    });
    this.register("javax/microedition/lcdui/Canvas.getHeight", (canvas: Canvas) => {
      return canvas.getHeight();
    });
    this.register("javax/microedition/lcdui/Canvas.repaint", (canvas: Canvas) => {
      canvas.repaint();
    });

    // java.awt.Graphics
    this.register("java/awt/Graphics.setColor", (g: Graphics, color: any) => {
      g.setColor(color);
    });
    this.register("java/awt/Graphics.setFont", (g: Graphics, font: any) => {
      g.setFont(font);
    });
    this.register("java/awt/Graphics.drawLine", (g: Graphics, x1: number, y1: number, x2: number, y2: number) => {
      g.drawLine(x1, y1, x2, y2);
    });
    this.register("java/awt/Graphics.drawRect", (g: Graphics, x: number, y: number, width: number, height: number) => {
      g.drawRect(x, y, width, height);
    });
    this.register("java/awt/Graphics.fillRect", (g: Graphics, x: number, y: number, width: number, height: number) => {
      g.fillRect(x, y, width, height);
    });
    this.register("java/awt/Graphics.drawOval", (g: Graphics, x: number, y: number, width: number, height: number) => {
      g.drawOval(x, y, width, height);
    });
    this.register("java/awt/Graphics.fillOval", (g: Graphics, x: number, y: number, width: number, height: number) => {
      g.fillOval(x, y, width, height);
    });
    this.register("java/awt/Graphics.drawString", (g: Graphics, str: string, x: number, y: number) => {
      g.drawString(str, x, y);
    });
    this.register("java/awt/Graphics.drawImage", (g: Graphics, img: any, x: number, y: number, ...args: any[]) => {
      g.drawImage(img, x, y, ...args);
    });
  }

  /**
   * Register a native method
   */
  register(signature: string, method: Function): void {
    this.methods.set(signature, method);
  }

  /**
   * Invoke a native method
   */
  invoke(className: string, methodName: string, descriptor: string, ...args: any[]): any {
    const signature = `${className}.${methodName}`;
    const method = this.methods.get(signature);
    if (method) {
      return method(...args);
    }
    
    // Try with full descriptor
    const fullSignature = `${className}.${methodName}${descriptor}`;
    const fullMethod = this.methods.get(fullSignature);
    if (fullMethod) {
      return fullMethod(...args);
    }
    
    console.warn(`[NativeMethodBridge] Native method not found: ${signature}`);
    return undefined;
  }

  /**
   * Check if a native method exists
   */
  hasMethod(className: string, methodName: string): boolean {
    const signature = `${className}.${methodName}`;
    return this.methods.has(signature);
  }
}

/**
 * Get native method bridge instance
 */
export function getNativeMethodBridge(): NativeMethodBridge {
  return NativeMethodBridge.getInstance();
}

