/**
 * WebGL-based renderer for SWF content
 * 
 * Provides hardware-accelerated rendering using WebGL. Converts Canvas-based
 * geometry to WebGL shaders and buffers for improved performance.
 * 
 * @example
 * ```typescript
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const renderer = new WebGLRenderer(canvas, 800, 600);
 * renderer.drawShape(shape);
 * ```
 */

import { SWFShape, FillStyle, LineStyle, TextStyle, TransformMatrix } from "./canvas-renderer";

export class WebGLRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private width: number;
  private height: number;
  private currentTransform: TransformMatrix = {
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    translateX: 0,
    translateY: 0,
  };
  private shapeCache: Map<number, WebGLShapeBuffer> = new Map();
  private program: WebGLProgram | null = null;
  private vertexShader: WebGLShader | null = null;
  private fragmentShader: WebGLShader | null = null;
  private isWebGL2: boolean = false;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    canvas.width = width;
    canvas.height = height;

    // Try WebGL2 first, fallback to WebGL1
    const gl2 = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      depth: true,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "default",
    });

    if (gl2) {
      this.gl = gl2;
      this.isWebGL2 = true;
    } else {
      const gl1 = canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        depth: true,
        stencil: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "default",
      });

      if (!gl1) {
        throw new Error("WebGL not supported");
      }

      this.gl = gl1;
      this.isWebGL2 = false;
    }

    this.initShaders();
    this.setupViewport();
  }

  /**
   * Get canvas element
   */
  public get canvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Initialize WebGL shaders
   */
  private initShaders(): void {
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      attribute vec4 a_color;
      
      uniform mat3 u_matrix;
      
      varying vec2 v_texCoord;
      varying vec4 v_color;
      
      void main() {
        vec3 position = u_matrix * vec3(a_position, 1.0);
        gl_Position = vec4(position.xy, 0.0, 1.0);
        v_texCoord = a_texCoord;
        v_color = a_color;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      
      varying vec2 v_texCoord;
      varying vec4 v_color;
      
      uniform sampler2D u_texture;
      uniform bool u_useTexture;
      
      void main() {
        if (u_useTexture) {
          gl_FragColor = texture2D(u_texture, v_texCoord) * v_color;
        } else {
          gl_FragColor = v_color;
        }
      }
    `;

    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    this.fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!this.vertexShader || !this.fragmentShader) {
      throw new Error("Failed to create shaders");
    }

    this.program = this.gl.createProgram();
    if (!this.program) {
      throw new Error("Failed to create program");
    }

    this.gl.attachShader(this.program, this.vertexShader);
    this.gl.attachShader(this.program, this.fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(this.program);
      throw new Error(`Failed to link program: ${info}`);
    }
  }

  /**
   * Create shader from source
   */
  private createShader(type: number, source: string): WebGLShader | null {
    const shader = this.gl.createShader(type);
    if (!shader) {
      return null;
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      console.error(`Shader compilation error: ${info}`);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Setup viewport
   */
  private setupViewport(): void {
    this.gl.viewport(0, 0, this.width, this.height);
  }

  /**
   * Set image smoothing (anti-aliasing)
   */
  setImageSmoothing(enabled: boolean, quality?: "low" | "medium" | "high"): void {
    // WebGL handles anti-aliasing through context creation
    // This is a no-op for WebGL renderer
  }

  /**
   * Clear the canvas
   */
  clear(): void {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  /**
   * Draw shape using WebGL
   */
  drawShape(shape: SWFShape): void {
    if (!this.program) {
      return;
    }

    // Convert shape to WebGL geometry
    const buffer = this.getOrCreateShapeBuffer(shape);
    if (!buffer) {
      return;
    }

    this.gl.useProgram(this.program);

    // Set up attributes
    const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
    const texCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
    const colorLocation = this.gl.getAttribLocation(this.program, "a_color");

    // Bind buffers
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.positionBuffer);
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    if (buffer.texCoordBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.texCoordBuffer);
      this.gl.enableVertexAttribArray(texCoordLocation);
      this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    } else {
      this.gl.disableVertexAttribArray(texCoordLocation);
    }

    if (buffer.colorBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer.colorBuffer);
      this.gl.enableVertexAttribArray(colorLocation);
      this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    } else {
      // Use uniform color
      const color = this.parseColor(shape.fillStyle?.color || "#ffffff");
      this.gl.disableVertexAttribArray(colorLocation);
      this.gl.vertexAttrib4f(colorLocation, color[0], color[1], color[2], color[3]);
    }

    // Set matrix uniform
    const matrixLocation = this.gl.getUniformLocation(this.program, "u_matrix");
    const matrix = this.getTransformMatrix();
    this.gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Set texture uniform
    const textureLocation = this.gl.getUniformLocation(this.program, "u_texture");
    const useTextureLocation = this.gl.getUniformLocation(this.program, "u_useTexture");

    if (buffer.texture && buffer.texture !== null) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, buffer.texture);
      this.gl.uniform1i(textureLocation, 0);
      this.gl.uniform1i(useTextureLocation, 1);
    } else {
      this.gl.uniform1i(useTextureLocation, 0);
    }

    // Draw
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, buffer.indexCount, this.gl.UNSIGNED_SHORT, 0);
  }

  /**
   * Get or create shape buffer
   */
  private getOrCreateShapeBuffer(shape: SWFShape): WebGLShapeBuffer | null {
    // Use shape hash as key (simplified - in production, use proper hashing)
    const shapeId = this.hashShape(shape);
    
    let buffer = this.shapeCache.get(shapeId);
    if (buffer) {
      return buffer;
    }

    // Create new buffer
    buffer = this.createShapeBuffer(shape);
    if (buffer) {
      this.shapeCache.set(shapeId, buffer);
    }

    return buffer;
  }

  /**
   * Create shape buffer from shape
   */
  private createShapeBuffer(shape: SWFShape): WebGLShapeBuffer | null {
    // Convert shape paths to triangles
    const vertices: number[] = [];
    const texCoords: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Triangulate shape paths
    for (const path of shape.paths) {
      const pathVertices: number[] = [];
      
      pathVertices.push(path.startX, path.startY);
      
      for (const segment of path.segments) {
        if (segment.type === "line") {
          pathVertices.push(segment.x, segment.y);
        } else if (segment.type === "curve") {
          // Approximate curve with line segments
          const steps = 10;
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
          const lastX = pathVertices[pathVertices.length - 2];
          const lastY = pathVertices[pathVertices.length - 1];
          const x = (1 - t) * (1 - t) * lastX +
                    2 * (1 - t) * t * (segment.controlX || 0) +
                    t * t * segment.x;
          const y = (1 - t) * (1 - t) * lastY +
                    2 * (1 - t) * t * (segment.controlY || 0) +
                    t * t * segment.y;
          pathVertices.push(x, y);
          }
        }
      }

      // Triangulate polygon (ear clipping algorithm simplified)
      if (pathVertices.length >= 6) {
        const baseIndex = vertices.length / 2;
        
        for (let i = 0; i < pathVertices.length; i += 2) {
          vertices.push(pathVertices[i], pathVertices[i + 1]);
          texCoords.push(0, 0); // Placeholder
          
          const color = this.parseColor(shape.fillStyle?.color || "#ffffff");
          colors.push(color[0], color[1], color[2], color[3]);
        }

        // Create triangle fan
        for (let i = 1; i < pathVertices.length / 2 - 1; i++) {
          indices.push(baseIndex, baseIndex + i, baseIndex + i + 1);
        }
      }
    }

    if (vertices.length === 0) {
      return null;
    }

    // Create WebGL buffers
    const positionBuffer = this.gl.createBuffer();
    if (!positionBuffer) {
      return null;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

    const texCoordBuffer = this.gl.createBuffer();
    if (texCoordBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
    }

    const colorBuffer = this.gl.createBuffer();
    if (colorBuffer) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    const indexBuffer = this.gl.createBuffer();
    if (!indexBuffer) {
      return null;
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

    return {
      positionBuffer,
      texCoordBuffer,
      colorBuffer,
      indexBuffer,
      indexCount: indices.length,
      texture: null,
    };
  }

  /**
   * Hash shape for caching
   */
  private hashShape(shape: SWFShape): number {
    // Simple hash function (in production, use proper hashing)
    let hash = 0;
    for (const path of shape.paths) {
      hash = ((hash << 5) - hash) + path.startX;
      hash = ((hash << 5) - hash) + path.startY;
      for (const segment of path.segments) {
        hash = ((hash << 5) - hash) + segment.x;
        hash = ((hash << 5) - hash) + segment.y;
      }
    }
    return hash;
  }

  /**
   * Parse color string to RGBA array
   */
  private parseColor(color: string): [number, number, number, number] {
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      const a = color.length > 7 ? parseInt(color.slice(7, 9), 16) / 255 : 1;
      return [r, g, b, a];
    }
    return [1, 1, 1, 1]; // Default white
  }

  /**
   * Get transform matrix as 3x3 matrix
   */
  private getTransformMatrix(): Float32Array {
    const m = this.currentTransform;
    return new Float32Array([
      m.scaleX, m.skewX, m.translateX,
      m.skewY, m.scaleY, m.translateY,
      0, 0, 1,
    ]);
  }

  /**
   * Draw bitmap
   */
  drawBitmap(bitmap: ImageBitmap | HTMLImageElement, x: number, y: number, width: number, height: number): void {
    // TODO: Implement bitmap rendering in WebGL
    // This would involve creating a texture from the bitmap and rendering a quad
  }

  /**
   * Draw text
   */
  drawText(text: string, x: number, y: number, style: TextStyle): void {
    // TODO: Implement text rendering in WebGL
    // This would involve creating a texture from text or using SDF fonts
  }

  /**
   * Set transform matrix
   */
  setTransform(matrix: TransformMatrix): void {
    this.currentTransform = { ...matrix };
  }

  /**
   * Reset transform
   */
  resetTransform(): void {
    this.currentTransform = {
      scaleX: 1,
      scaleY: 1,
      skewX: 0,
      skewY: 0,
      translateX: 0,
      translateY: 0,
    };
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    // Clean up buffers
    for (const buffer of this.shapeCache.values()) {
      this.gl.deleteBuffer(buffer.positionBuffer);
      if (buffer.texCoordBuffer) {
        this.gl.deleteBuffer(buffer.texCoordBuffer);
      }
      if (buffer.colorBuffer) {
        this.gl.deleteBuffer(buffer.colorBuffer);
      }
      this.gl.deleteBuffer(buffer.indexBuffer);
      if (buffer.texture) {
        this.gl.deleteTexture(buffer.texture);
      }
    }

    this.shapeCache.clear();

    // Clean up shaders and program
    if (this.vertexShader) {
      this.gl.deleteShader(this.vertexShader);
    }
    if (this.fragmentShader) {
      this.gl.deleteShader(this.fragmentShader);
    }
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
  }
}

interface WebGLShapeBuffer {
  positionBuffer: WebGLBuffer;
  texCoordBuffer: WebGLBuffer | null;
  colorBuffer: WebGLBuffer | null;
  indexBuffer: WebGLBuffer;
  indexCount: number;
  texture: WebGLTexture | null;
}

