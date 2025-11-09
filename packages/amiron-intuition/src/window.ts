import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { Widget } from './widget';
import { InputEvent } from './events';
import { NecroTheme } from './theme';

export class Window {
  title: string;
  bounds: Rect;
  widgets: Widget[];
  focused: boolean = false;
  opacity: number = 0; // For fade-in animation
  glowIntensity: number = 0; // For focused glow effect
  
  constructor(title: string, bounds: Rect) {
    this.title = title;
    this.bounds = bounds;
    this.widgets = [];
  }
  
  addWidget(widget: Widget): void {
    this.widgets.push(widget);
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    
    // Apply opacity for fade-in effect
    if (this.opacity < 1) {
      ctx.setGlobalAlpha(this.opacity);
    }
    
    ctx.drawRect(this.bounds, theme.windowBackground);
    
    const titleBarHeight = 24;
    const titleBar: Rect = {
      x: this.bounds.x,
      y: this.bounds.y,
      width: this.bounds.width,
      height: titleBarHeight,
    };
    
    // Draw title bar with glow effect when focused
    if (this.focused && this.glowIntensity > 0) {
      // Draw glow layers for depth
      const glowColor = this.interpolateColor(theme.shadow, theme.accentGlow, this.glowIntensity);
      
      // Outer glow
      ctx.drawRect(
        { x: titleBar.x - 2, y: titleBar.y - 2, width: titleBar.width + 4, height: titleBar.height + 4 },
        this.adjustColorAlpha(theme.accentGlow, 0.3 * this.glowIntensity)
      );
      
      // Inner glow
      ctx.drawRect(titleBar, glowColor);
    } else {
      ctx.drawRect(titleBar, this.focused ? theme.accentGlow : theme.shadow);
    }
    
    ctx.drawText(
      this.title,
      { x: this.bounds.x + 8, y: this.bounds.y + 16 },
      theme.font,
      theme.text
    );
    
    this.drawBorder(ctx, this.bounds, theme.shadow);
    
    for (const widget of this.widgets) {
      widget.render(ctx);
    }
    
    // Reset opacity
    if (this.opacity < 1) {
      ctx.setGlobalAlpha(1);
    }
  }
  
  private interpolateColor(from: Color, to: Color, t: number): Color {
    return {
      r: Math.round(from.r + (to.r - from.r) * t),
      g: Math.round(from.g + (to.g - from.g) * t),
      b: Math.round(from.b + (to.b - from.b) * t),
    };
  }
  
  private adjustColorAlpha(color: Color, alpha: number): Color {
    // For canvas, we'll need to handle alpha in the graphics context
    // This returns the color as-is, alpha is handled by setGlobalAlpha
    return color;
  }
  
  private drawBorder(ctx: GraphicsContext, rect: Rect, color: Color): void {
    ctx.drawRect({ x: rect.x, y: rect.y, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y + rect.height - 1, width: rect.width, height: 1 }, color);
    ctx.drawRect({ x: rect.x, y: rect.y, width: 1, height: rect.height }, color);
    ctx.drawRect({ x: rect.x + rect.width - 1, y: rect.y, width: 1, height: rect.height }, color);
  }
  
  handleEvent(event: InputEvent): boolean {
    if (!this.containsPoint(event.position)) {
      return false;
    }
    
    for (const widget of this.widgets) {
      if (widget.handleEvent(event)) {
        return true;
      }
    }
    
    return true;
  }
  
  private containsPoint(point: Point): boolean {
    return point.x >= this.bounds.x &&
           point.x < this.bounds.x + this.bounds.width &&
           point.y >= this.bounds.y &&
           point.y < this.bounds.y + this.bounds.height;
  }
}
