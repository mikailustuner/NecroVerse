/**
 * Canvas-based renderer for SWF content
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }
  private width: number;
  private height: number;
  private imageSmoothingEnabled: boolean = true;
  private imageSmoothingQuality: "low" | "medium" | "high" = "high";

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: false,
      willReadFrequently: false,
    });
    
    if (!context) {
      throw new Error("Failed to get 2D rendering context");
    }
    
    this.ctx = context;
    this.width = width;
    this.height = height;
    
    canvas.width = width;
    canvas.height = height;
    
    // Configure rendering quality
    this.ctx.imageSmoothingEnabled = this.imageSmoothingEnabled;
    this.ctx.imageSmoothingQuality = this.imageSmoothingQuality;
    
    // Set background
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * Set image smoothing (anti-aliasing)
   */
  setImageSmoothing(enabled: boolean, quality?: "low" | "medium" | "high"): void {
    this.imageSmoothingEnabled = enabled;
    if (quality) {
      this.imageSmoothingQuality = quality;
    }
    this.ctx.imageSmoothingEnabled = enabled;
    this.ctx.imageSmoothingQuality = this.imageSmoothingQuality;
  }

  clear(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawShape(shape: SWFShape): void {
    this.ctx.save();
    this.ctx.beginPath();
    
    // Draw shape paths
    let hasPaths = false;
    for (const path of shape.paths) {
      if (path.segments.length > 0 || path.startX !== 0 || path.startY !== 0) {
        hasPaths = true;
        this.ctx.moveTo(path.startX, path.startY);
        
        for (const segment of path.segments) {
          if (segment.type === "line") {
            this.ctx.lineTo(segment.x, segment.y);
          } else if (segment.type === "curve") {
            this.ctx.quadraticCurveTo(segment.controlX, segment.controlY, segment.x, segment.y);
          }
        }
      }
    }
    
    // If no paths, draw a small rectangle as a fallback (for debugging)
    if (!hasPaths && shape.paths.length === 0) {
      // No paths to draw - this might be an empty shape
      // Draw a small rectangle as a debug indicator
      this.ctx.rect(0, 0, 10, 10);
    }
    
    // Fill
    if (shape.fillStyle) {
      const fillStyle = this.createFillStyle(shape.fillStyle);
      if (fillStyle) {
        this.ctx.fillStyle = fillStyle;
        this.ctx.fill();
      } else {
        // Fallback fill if fillStyle creation failed
        this.ctx.fillStyle = "#FF0000"; // Red for debugging
        this.ctx.fill();
      }
    } else if (hasPaths) {
      // If we have paths but no fill style, use a default fill
      this.ctx.fillStyle = "#FFFFFF"; // White for debugging
      this.ctx.fill();
    }
    
    // Stroke
    if (shape.lineStyle) {
      this.ctx.strokeStyle = shape.lineStyle.color;
      this.ctx.lineWidth = shape.lineStyle.width;
      this.ctx.stroke();
    } else if (hasPaths) {
      // If we have paths but no line style, use a default stroke
      this.ctx.strokeStyle = "#000000"; // Black for debugging
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  /**
   * Create fill style (solid color, gradient, or bitmap pattern)
   */
  private createFillStyle(fillStyle: FillStyle): string | CanvasGradient | CanvasPattern | null {
    if (fillStyle.type === "solid" && fillStyle.color) {
      return fillStyle.color;
    }
    
    if (fillStyle.type === "gradient" && fillStyle.gradient) {
      return this.createGradient(fillStyle.gradient);
    }
    
    if (fillStyle.type === "bitmap" && fillStyle.bitmap) {
      return this.createBitmapPattern(fillStyle.bitmap);
    }
    
    return null;
  }

  /**
   * Create gradient fill
   */
  private createGradient(gradient: GradientFill): CanvasGradient | null {
    // Calculate bounding box of current path
    // For simplicity, use canvas dimensions or a default size
    const width = this.width;
    const height = this.height;
    
    let canvasGradient: CanvasGradient;
    
    if (gradient.type === "linear") {
      // Linear gradient from left to right (can be transformed)
      canvasGradient = this.ctx.createLinearGradient(0, 0, width, 0);
    } else {
      // Radial gradient centered
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2;
      canvasGradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    }
    
    // Add color stops
    for (const stop of gradient.colors) {
      canvasGradient.addColorStop(stop.offset, stop.color);
    }
    
    return canvasGradient;
  }

  /**
   * Create bitmap pattern
   */
  private createBitmapPattern(bitmapFill: BitmapFill): CanvasPattern | null {
    try {
      const pattern = this.ctx.createPattern(
        bitmapFill.image,
        bitmapFill.repeat ? "repeat" : "no-repeat"
      );
      
      if (pattern && bitmapFill.matrix) {
        // Apply transform matrix to pattern
        // Note: Canvas patterns don't directly support transforms in 2D context
        // We'll need to apply the transform to the context before filling
        // This is handled in the drawShape method by applying matrix to context
      }
      
      return pattern;
    } catch (error) {
      console.error("Failed to create bitmap pattern:", error);
      return null;
    }
  }

  drawBitmap(bitmap: ImageBitmap | HTMLImageElement, x: number, y: number, width: number, height: number): void {
    this.ctx.drawImage(bitmap, x, y, width, height);
  }

  drawText(text: string, x: number, y: number, style: TextStyle): void {
    this.ctx.save();
    this.ctx.font = `${style.size}px ${style.fontFamily || "Arial"}`;
    this.ctx.fillStyle = style.color || "#ffffff";
    this.ctx.textAlign = style.align || "left";
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  setTransform(matrix: TransformMatrix): void {
    this.ctx.setTransform(
      matrix.scaleX,
      matrix.skewY,
      matrix.skewX,
      matrix.scaleY,
      matrix.translateX,
      matrix.translateY
    );
  }

  resetTransform(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}

export interface SWFShape {
  paths: ShapePath[];
  fillStyle?: FillStyle;
  lineStyle?: LineStyle;
}

export interface ShapePath {
  startX: number;
  startY: number;
  segments: PathSegment[];
}

export interface PathSegment {
  type: "line" | "curve";
  x: number;
  y: number;
  controlX?: number;
  controlY?: number;
}

export interface FillStyle {
  color?: string;
  type: "solid" | "gradient" | "bitmap";
  gradient?: GradientFill;
  bitmap?: BitmapFill;
}

export interface GradientFill {
  type: "linear" | "radial";
  colors: Array<{ offset: number; color: string }>;
  matrix?: TransformMatrix;
  spreadMethod?: "pad" | "reflect" | "repeat";
}

export interface BitmapFill {
  image: ImageBitmap | HTMLImageElement;
  matrix?: TransformMatrix;
  repeat?: boolean;
  smooth?: boolean;
}

export interface LineStyle {
  color: string;
  width: number;
}

export interface TextStyle {
  fontFamily?: string;
  size: number;
  color: string;
  align?: "left" | "center" | "right";
}

export interface TransformMatrix {
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

