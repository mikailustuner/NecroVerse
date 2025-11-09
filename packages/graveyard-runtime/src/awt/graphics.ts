/**
 * AWT Graphics API Emulation
 * Maps Java Graphics API to Canvas 2D context
 */

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Font {
  name: string;
  style: number; // Font.PLAIN, Font.BOLD, Font.ITALIC
  size: number;
}

export interface Image {
  width: number;
  height: number;
  data: ImageData | HTMLImageElement | HTMLCanvasElement;
}

/**
 * Graphics class - wraps Canvas 2D context
 */
export class Graphics {
  private ctx: CanvasRenderingContext2D;
  private color: Color = { r: 0, g: 0, b: 0, a: 1 };
  private font: Font = { name: 'Arial', style: 0, size: 12 };
  private clipX: number = 0;
  private clipY: number = 0;
  private clipWidth: number = 0;
  private clipHeight: number = 0;
  private hasClip: boolean = false;
  private transformStack: DOMMatrix[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.ctx.save();
  }

  /**
   * Set color
   */
  setColor(color: Color | number | string): void {
    if (typeof color === 'number') {
      // Assume RGB integer
      this.color = {
        r: (color >> 16) & 0xff,
        g: (color >> 8) & 0xff,
        b: color & 0xff,
        a: 1,
      };
    } else if (typeof color === 'string') {
      // Parse color string
      const match = color.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
      if (match) {
        this.color = {
          r: parseInt(match[1].substring(0, 2), 16),
          g: parseInt(match[1].substring(2, 4), 16),
          b: parseInt(match[1].substring(4, 6), 16),
          a: match[2] ? parseInt(match[2], 16) / 255 : 1,
        };
      }
    } else {
      this.color = color;
    }
    
    // Convert color to CSS string
    const cssColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
    this.ctx.fillStyle = cssColor;
    this.ctx.strokeStyle = cssColor;
  }

  /**
   * Set font
   */
  setFont(font: Font): void {
    this.font = font;
    const style = font.style === 1 ? 'bold' : font.style === 2 ? 'italic' : font.style === 3 ? 'bold italic' : 'normal';
    this.ctx.font = `${style} ${font.size}px ${font.name}`;
  }

  /**
   * Draw line
   */
  drawLine(x1: number, y1: number, x2: number, y2: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * Draw rectangle outline
   */
  drawRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height);
  }

  /**
   * Fill rectangle
   */
  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw oval outline
   */
  drawOval(x: number, y: number, width: number, height: number): void {
    this.ctx.beginPath();
    this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  /**
   * Fill oval
   */
  fillOval(x: number, y: number, width: number, height: number): void {
    this.ctx.beginPath();
    this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * Draw string
   */
  drawString(str: string, x: number, y: number): void {
    this.ctx.fillText(str, x, y);
  }

  /**
   * Draw image
   */
  drawImage(img: Image, x: number, y: number): void;
  drawImage(img: Image, x: number, y: number, width: number, height: number): void;
  drawImage(img: Image, dx: number, dy: number, dw: number, dh: number, sx: number, sy: number, sw: number, sh: number): void;
  drawImage(img: Image, ...args: number[]): void {
    if (args.length === 2) {
      // drawImage(img, x, y)
      const [x, y] = args;
      if (img.data instanceof HTMLImageElement || img.data instanceof HTMLCanvasElement) {
        this.ctx.drawImage(img.data, x, y);
      } else if (img.data instanceof ImageData) {
        // Create temporary canvas for ImageData
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.putImageData(img.data, 0, 0);
          this.ctx.drawImage(tempCanvas, x, y);
        }
      }
    } else if (args.length === 4) {
      // drawImage(img, x, y, width, height)
      const [x, y, width, height] = args;
      if (img.data instanceof HTMLImageElement || img.data instanceof HTMLCanvasElement) {
        this.ctx.drawImage(img.data, x, y, width, height);
      } else if (img.data instanceof ImageData) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.putImageData(img.data, 0, 0);
          this.ctx.drawImage(tempCanvas, x, y, width, height);
        }
      }
    } else if (args.length === 8) {
      // drawImage(img, dx, dy, dw, dh, sx, sy, sw, sh)
      const [dx, dy, dw, dh, sx, sy, sw, sh] = args;
      if (img.data instanceof HTMLImageElement || img.data instanceof HTMLCanvasElement) {
        this.ctx.drawImage(img.data, sx, sy, sw, sh, dx, dy, dw, dh);
      } else if (img.data instanceof ImageData) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.putImageData(img.data, 0, 0);
          this.ctx.drawImage(tempCanvas, sx, sy, sw, sh, dx, dy, dw, dh);
        }
      }
    }
  }

  /**
   * Draw polygon outline
   */
  drawPolygon(xPoints: number[], yPoints: number[], nPoints: number): void {
    if (nPoints < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(xPoints[0], yPoints[0]);
    for (let i = 1; i < nPoints; i++) {
      this.ctx.lineTo(xPoints[i], yPoints[i]);
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }

  /**
   * Fill polygon
   */
  fillPolygon(xPoints: number[], yPoints: number[], nPoints: number): void {
    if (nPoints < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(xPoints[0], yPoints[0]);
    for (let i = 1; i < nPoints; i++) {
      this.ctx.lineTo(xPoints[i], yPoints[i]);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Set clip rectangle
   */
  setClip(x: number, y: number, width: number, height: number): void {
    this.clipX = x;
    this.clipY = y;
    this.clipWidth = width;
    this.clipHeight = height;
    this.hasClip = true;
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
  }

  /**
   * Get clip bounds
   */
  getClipBounds(): { x: number; y: number; width: number; height: number } | null {
    if (!this.hasClip) return null;
    return { x: this.clipX, y: this.clipY, width: this.clipWidth, height: this.clipHeight };
  }

  /**
   * Translate coordinate system
   */
  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  /**
   * Scale coordinate system
   */
  scale(sx: number, sy: number): void {
    this.ctx.scale(sx, sy);
  }

  /**
   * Rotate coordinate system
   */
  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  /**
   * Clear rectangle
   */
  clearRect(x: number, y: number, width: number, height: number): void {
    this.ctx.clearRect(x, y, width, height);
  }

  /**
   * Get color
   */
  getColor(): Color {
    return { ...this.color };
  }

  /**
   * Get font
   */
  getFont(): Font {
    return { ...this.font };
  }

  /**
   * Get font metrics
   */
  getFontMetrics(): { height: number; ascent: number; descent: number } {
    const metrics = this.ctx.measureText('M');
    return {
      height: this.font.size,
      ascent: this.font.size * 0.8,
      descent: this.font.size * 0.2,
    };
  }

  /**
   * Measure text width
   */
  measureText(text: string): number {
    return this.ctx.measureText(text).width;
  }

  /**
   * Save graphics state
   */
  save(): void {
    this.ctx.save();
  }

  /**
   * Restore graphics state
   */
  restore(): void {
    this.ctx.restore();
  }

  /**
   * Dispose graphics (cleanup)
   */
  dispose(): void {
    this.ctx.restore();
  }

  /**
   * Convert color to CSS string
   */
  private colorToCSS(): string {
    return `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`;
  }
}

/**
 * Color constants
 */
export const ColorConstants = {
  WHITE: { r: 255, g: 255, b: 255, a: 1 },
  BLACK: { r: 0, g: 0, b: 0, a: 1 },
  RED: { r: 255, g: 0, b: 0, a: 1 },
  GREEN: { r: 0, g: 255, b: 0, a: 1 },
  BLUE: { r: 0, g: 0, b: 255, a: 1 },
  YELLOW: { r: 255, g: 255, b: 0, a: 1 },
  CYAN: { r: 0, g: 255, b: 255, a: 1 },
  MAGENTA: { r: 255, g: 0, b: 255, a: 1 },
  GRAY: { r: 128, g: 128, b: 128, a: 1 },
  DARK_GRAY: { r: 64, g: 64, b: 64, a: 1 },
  LIGHT_GRAY: { r: 192, g: 192, b: 192, a: 1 },
  ORANGE: { r: 255, g: 165, b: 0, a: 1 },
  PINK: { r: 255, g: 192, b: 203, a: 1 },
};

/**
 * Font constants
 */
export const FontConstants = {
  PLAIN: 0,
  BOLD: 1,
  ITALIC: 2,
  BOLD_ITALIC: 3,
};

