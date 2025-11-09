import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { InputEvent } from './events';
import { NecroTheme } from './theme';

export abstract class Widget {
  bounds: Rect;
  
  constructor(bounds: Rect) {
    this.bounds = bounds;
  }
  
  abstract render(ctx: GraphicsContext): void;
  abstract handleEvent(event: InputEvent): boolean;
  
  protected containsPoint(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y < this.bounds.y + this.bounds.height;
  }
}

export class Button extends Widget {
  label: string;
  onClick: () => void;
  hovered: boolean = false;
  hoverTransition: number = 0; // 0 to 1 for smooth color transition
  
  constructor(bounds: Rect, label: string, onClick: () => void) {
    super(bounds);
    this.label = label;
    this.onClick = onClick;
  }
  
  /**
   * Update hover transition (call this in render loop)
   */
  updateTransition(deltaTime: number): void {
    const transitionSpeed = 0.008; // Adjust for smoothness
    
    if (this.hovered && this.hoverTransition < 1) {
      this.hoverTransition = Math.min(1, this.hoverTransition + transitionSpeed * deltaTime);
    } else if (!this.hovered && this.hoverTransition > 0) {
      this.hoverTransition = Math.max(0, this.hoverTransition - transitionSpeed * deltaTime);
    }
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Smooth color transition
    const bgColor = this.interpolateColor(theme.shadow, theme.accentGlow, this.hoverTransition);
    
    ctx.drawRect(this.bounds, bgColor);
    
    const textX = this.bounds.x + (this.bounds.width / 2) - (this.label.length * 4);
    const textY = this.bounds.y + (this.bounds.height / 2) + 4;
    
    ctx.drawText(this.label, { x: textX, y: textY }, theme.font, theme.text);
  }
  
  private interpolateColor(from: Color, to: Color, t: number): Color {
    return {
      r: Math.round(from.r + (to.r - from.r) * t),
      g: Math.round(from.g + (to.g - from.g) * t),
      b: Math.round(from.b + (to.b - from.b) * t),
    };
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'mousemove') {
      this.hovered = this.containsPoint(event.position);
      return false;
    }
    
    if (event.type === 'click' && this.containsPoint(event.position)) {
      this.onClick();
      return true;
    }
    
    return false;
  }
}

export class Label extends Widget {
  text: string;
  
  constructor(bounds: Rect, text: string) {
    super(bounds);
    this.text = text;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    ctx.drawText(this.text, { x: this.bounds.x, y: this.bounds.y }, theme.font, theme.text);
  }
  
  handleEvent(event: InputEvent): boolean {
    return false;
  }
}

export class TextField extends Widget {
  text: string;
  cursorPosition: number;
  focused: boolean = false;
  
  constructor(bounds: Rect, initialText: string = '') {
    super(bounds);
    this.text = initialText;
    this.cursorPosition = initialText.length;
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Draw background
    const bgColor = this.focused ? theme.windowBackground : theme.shadow;
    ctx.drawRect(this.bounds, bgColor);
    
    // Draw border
    const borderColor = this.focused ? theme.accentGlow : theme.shadow;
    this.drawBorder(ctx, this.bounds, borderColor);
    
    // Draw text
    const textX = this.bounds.x + 4;
    const textY = this.bounds.y + (this.bounds.height / 2) + 4;
    ctx.drawText(this.text, { x: textX, y: textY }, theme.font, theme.text);
    
    // Draw cursor if focused
    if (this.focused) {
      const cursorX = textX + (this.cursorPosition * 7); // Approximate character width
      ctx.drawRect(
        { x: cursorX, y: this.bounds.y + 4, width: 2, height: this.bounds.height - 8 },
        theme.highlight
      );
    }
  }
  
  private drawBorder(ctx: GraphicsContext, rect: Rect, color: Color): void {
    ctx.drawRect({ x: rect.x, y: rect.y, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y + rect.height - 1, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y, width: 1, height: rect.height }, color);
    ctx.drawRect({ x: rect.x + rect.width - 1, y: rect.y, width: 1, height: rect.height }, color);
  }
  
  handleEvent(event: InputEvent): boolean {
    if (event.type === 'click' && this.containsPoint(event.position)) {
      this.focused = true;
      return true;
    }
    
    if (event.type === 'click' && !this.containsPoint(event.position)) {
      this.focused = false;
      return false;
    }
    
    if (this.focused && event.type === 'keydown' && event.key) {
      if (event.key === 'Backspace') {
        if (this.cursorPosition > 0) {
          this.text = this.text.slice(0, this.cursorPosition - 1) + this.text.slice(this.cursorPosition);
          this.cursorPosition--;
        }
        return true;
      } else if (event.key === 'Delete') {
        if (this.cursorPosition < this.text.length) {
          this.text = this.text.slice(0, this.cursorPosition) + this.text.slice(this.cursorPosition + 1);
        }
        return true;
      } else if (event.key === 'ArrowLeft') {
        if (this.cursorPosition > 0) {
          this.cursorPosition--;
        }
        return true;
      } else if (event.key === 'ArrowRight') {
        if (this.cursorPosition < this.text.length) {
          this.cursorPosition++;
        }
        return true;
      } else if (event.key.length === 1) {
        // Single character input
        this.text = this.text.slice(0, this.cursorPosition) + event.key + this.text.slice(this.cursorPosition);
        this.cursorPosition++;
        return true;
      }
    }
    
    return false;
  }
}
