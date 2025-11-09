/**
 * Interactivity support for SWF runtime
 * Handles buttons, mouse events, and keyboard input
 */

export interface ButtonState {
  up: boolean;
  over: boolean;
  down: boolean;
  hitTest: boolean;
}

export interface MouseEvent {
  type: "click" | "mouseDown" | "mouseUp" | "mouseMove" | "mouseOver" | "mouseOut";
  x: number;
  y: number;
  button: number;
}

export interface KeyboardEvent {
  type: "keyDown" | "keyUp";
  keyCode: number;
  key: string;
}

export class InteractivityManager {
  private canvas: HTMLCanvasElement;
  private buttons: Map<number, ButtonState> = new Map();
  private mouseX: number = 0;
  private mouseY: number = 0;
  private mouseDown: boolean = false;
  private keyStates: Map<number, boolean> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("click", (e) => this.handleClick(e));
    this.canvas.addEventListener("mouseenter", () => this.handleMouseEnter());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseLeave());

    // Keyboard events
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseDown = true;

    this.emit("mouseDown", {
      type: "mouseDown",
      x: this.mouseX,
      y: this.mouseY,
      button: e.button,
    });
  }

  private handleMouseUp(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseDown = false;

    this.emit("mouseUp", {
      type: "mouseUp",
      x: this.mouseX,
      y: this.mouseY,
      button: e.button,
    });
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    this.emit("mouseMove", {
      type: "mouseMove",
      x: this.mouseX,
      y: this.mouseY,
      button: 0,
    });
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;

    this.emit("click", {
      type: "click",
      x: this.mouseX,
      y: this.mouseY,
      button: e.button,
    });
  }

  private handleMouseEnter(): void {
    this.emit("mouseOver", {
      type: "mouseOver",
      x: this.mouseX,
      y: this.mouseY,
      button: 0,
    });
  }

  private handleMouseLeave(): void {
    this.emit("mouseOut", {
      type: "mouseOut",
      x: this.mouseX,
      y: this.mouseY,
      button: 0,
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    this.keyStates.set(e.keyCode, true);
    this.emit("keyDown", {
      type: "keyDown",
      keyCode: e.keyCode,
      key: e.key,
    });
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keyStates.set(e.keyCode, false);
    this.emit("keyUp", {
      type: "keyUp",
      keyCode: e.keyCode,
      key: e.key,
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(data);
      }
    }
  }

  getMouseX(): number {
    return this.mouseX;
  }

  getMouseY(): number {
    return this.mouseY;
  }

  isMouseDown(): boolean {
    return this.mouseDown;
  }

  isKeyDown(keyCode: number): boolean {
    return this.keyStates.get(keyCode) || false;
  }

  hitTest(x: number, y: number, width: number, height: number): boolean {
    return (
      this.mouseX >= x &&
      this.mouseX <= x + width &&
      this.mouseY >= y &&
      this.mouseY <= y + height
    );
  }

  destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("click", this.handleClick);
    this.canvas.removeEventListener("mouseenter", this.handleMouseEnter);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}

