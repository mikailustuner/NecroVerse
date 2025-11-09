/**
 * Loading Indicator Widget
 * Animated spinner for async operations
 */

import { GraphicsContext, Rect, Point, Color } from '@amiron/pal';
import { Widget } from './widget';
import { InputEvent } from './events';
import { NecroTheme } from './theme';

export class LoadingIndicator extends Widget {
  private rotation: number = 0;
  private rotationSpeed: number = 0.05; // Radians per frame
  private size: number;
  private message: string;
  
  constructor(bounds: Rect, message: string = 'Loading...') {
    super(bounds);
    this.size = Math.min(bounds.width, bounds.height);
    this.message = message;
  }
  
  /**
   * Update rotation animation
   */
  update(deltaTime: number): void {
    this.rotation += this.rotationSpeed * deltaTime;
    if (this.rotation > Math.PI * 2) {
      this.rotation -= Math.PI * 2;
    }
  }
  
  render(ctx: GraphicsContext): void {
    const theme = NecroTheme;
    const centerX = this.bounds.x + this.bounds.width / 2;
    const centerY = this.bounds.y + this.bounds.height / 2;
    const radius = this.size / 3;
    
    // Draw background circle (dim)
    this.drawCircle(ctx, centerX, centerY, radius, theme.shadow, 3);
    
    // Draw animated arc
    this.drawArc(ctx, centerX, centerY, radius, this.rotation, this.rotation + Math.PI * 1.5, theme.accentGlow, 3);
    
    // Draw highlight tip
    const tipX = centerX + Math.cos(this.rotation + Math.PI * 1.5) * radius;
    const tipY = centerY + Math.sin(this.rotation + Math.PI * 1.5) * radius;
    this.drawCircle(ctx, tipX, tipY, 4, theme.highlight, 0);
    
    // Draw message below spinner
    if (this.message) {
      const textX = centerX - (this.message.length * 4);
      const textY = centerY + radius + 20;
      ctx.drawText(this.message, { x: textX, y: textY }, theme.font, theme.textDim);
    }
  }
  
  private drawCircle(
    ctx: GraphicsContext,
    x: number,
    y: number,
    radius: number,
    color: Color,
    lineWidth: number
  ): void {
    // Approximate circle with rectangles for canvas
    const segments = 32;
    for (let i = 0; i < segments; i++) {
      const angle1 = (i / segments) * Math.PI * 2;
      const angle2 = ((i + 1) / segments) * Math.PI * 2;
      
      const x1 = x + Math.cos(angle1) * radius;
      const y1 = y + Math.sin(angle1) * radius;
      const x2 = x + Math.cos(angle2) * radius;
      const y2 = y + Math.sin(angle2) * radius;
      
      if (lineWidth > 0) {
        // Draw line segment
        this.drawLine(ctx, x1, y1, x2, y2, color, lineWidth);
      } else {
        // Draw filled circle (approximate with small rect)
        ctx.drawRect({ x: x - radius, y: y - radius, width: radius * 2, height: radius * 2 }, color);
      }
    }
  }
  
  private drawArc(
    ctx: GraphicsContext,
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    color: Color,
    lineWidth: number
  ): void {
    const segments = 32;
    const angleRange = endAngle - startAngle;
    const segmentCount = Math.floor((angleRange / (Math.PI * 2)) * segments);
    
    for (let i = 0; i < segmentCount; i++) {
      const angle1 = startAngle + (i / segmentCount) * angleRange;
      const angle2 = startAngle + ((i + 1) / segmentCount) * angleRange;
      
      const x1 = x + Math.cos(angle1) * radius;
      const y1 = y + Math.sin(angle1) * radius;
      const x2 = x + Math.cos(angle2) * radius;
      const y2 = y + Math.sin(angle2) * radius;
      
      this.drawLine(ctx, x1, y1, x2, y2, color, lineWidth);
    }
  }
  
  private drawLine(
    ctx: GraphicsContext,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: Color,
    width: number
  ): void {
    // Approximate line with small rectangles
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(length);
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = x1 + dx * t;
      const y = y1 + dy * t;
      ctx.drawRect({ x: x - width / 2, y: y - width / 2, width, height: width }, color);
    }
  }
  
  handleEvent(event: InputEvent): boolean {
    // Loading indicator doesn't handle events
    return false;
  }
  
  setMessage(message: string): void {
    this.message = message;
  }
}
