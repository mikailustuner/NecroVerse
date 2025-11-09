import { Color, Rect, Point, Font } from './types';

export interface Surface {
  width: number;
  height: number;
  data: ImageData;
}

export interface GraphicsContext {
  createSurface(width: number, height: number): Surface;
  present(surface: Surface): void;
  clear(color: Color): void;
  drawRect(rect: Rect, color: Color): void;
  drawText(text: string, pos: Point, font: Font, color: Color): void;
  drawImage(image: ImageData, pos: Point): void;
  setGlobalAlpha(alpha: number): void;
}

export class CanvasGraphics implements GraphicsContext {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = context;
  }
  
  createSurface(width: number, height: number): Surface {
    const data = this.ctx.createImageData(width, height);
    return { width, height, data };
  }
  
  present(surface: Surface): void {
    this.ctx.putImageData(surface.data, 0, 0);
  }
  
  clear(color: Color): void {
    this.ctx.fillStyle = this.colorToCSS(color);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  drawRect(rect: Rect, color: Color): void {
    this.ctx.fillStyle = this.colorToCSS(color);
    this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }
  
  drawText(text: string, pos: Point, font: Font, color: Color): void {
    this.ctx.font = `${font.size}px ${font.family}`;
    this.ctx.fillStyle = this.colorToCSS(color);
    this.ctx.fillText(text, pos.x, pos.y);
  }
  
  drawImage(image: ImageData, pos: Point): void {
    this.ctx.putImageData(image, pos.x, pos.y);
  }
  
  setGlobalAlpha(alpha: number): void {
    this.ctx.globalAlpha = alpha;
  }
  
  private colorToCSS(color: Color): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }
}
