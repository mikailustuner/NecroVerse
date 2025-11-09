import { XAPFile } from "../parsers/xap";
import { CanvasRenderer } from "../renderers/canvas-renderer";

/**
 * XAML Parser
 * Parses XAML files and converts to renderable structure
 * Supports namespaces, attached properties, and nested elements
 */
export class XAMLParser {
  private namespaces: Map<string, string> = new Map();
  private styles: Map<string, XAMLElement> = new Map();
  private templates: Map<string, XAMLElement> = new Map();
  private dataContext: any = {};

  parse(xaml: string): XAMLElement {
    // Remove XML declaration and comments
    xaml = xaml.replace(/<\?xml[^>]*\?>/g, "");
    xaml = xaml.replace(/<!--[\s\S]*?-->/g, "");
    
    // Parse namespaces
    this.parseNamespaces(xaml);
    
    // Parse root element
    const root = this.parseElement(xaml.trim(), 0);
    if (!root) {
      throw new Error("Invalid XAML: no root element found");
    }
    
    // Process styles and templates
    this.processStylesAndTemplates(root.element);
    
    return root.element;
  }

  /**
   * Process styles and templates from root element
   */
  private processStylesAndTemplates(root: XAMLElement): void {
    // Find Style and ControlTemplate elements in resources
    const resources = root.children.find(c => c.tag.toLowerCase() === "resources" || c.tag.toLowerCase() === "canvas.resources");
    if (resources) {
      for (const child of resources.children) {
        if (child.tag.toLowerCase() === "style") {
          const key = child.attributes["x:Key"] || child.attributes["TargetType"];
          if (key) {
            this.styles.set(key, child);
          }
        } else if (child.tag.toLowerCase() === "controltemplate") {
          const key = child.attributes["x:Key"] || child.attributes["TargetType"];
          if (key) {
            this.templates.set(key, child);
          }
        }
      }
    }
  }

  /**
   * Get style by key
   */
  getStyle(key: string): XAMLElement | undefined {
    return this.styles.get(key);
  }

  /**
   * Get template by key
   */
  getTemplate(key: string): XAMLElement | undefined {
    return this.templates.get(key);
  }

  /**
   * Set data context for data binding
   */
  setDataContext(context: any): void {
    this.dataContext = context;
  }

  /**
   * Resolve data binding expression
   */
  resolveBinding(expression: string): any {
    // Simple data binding: {Binding Path=PropertyName}
    // Or: {Binding PropertyName}
    const bindingMatch = expression.match(/\{Binding\s+(?:Path=)?(\w+)\}/);
    if (bindingMatch) {
      const path = bindingMatch[1];
      return this.getNestedProperty(this.dataContext, path);
    }
    
    // Static resource: {StaticResource ResourceKey}
    const staticResourceMatch = expression.match(/\{StaticResource\s+(\w+)\}/);
    if (staticResourceMatch) {
      const key = staticResourceMatch[1];
      const style = this.getStyle(key);
      if (style) {
        return style;
      }
      const template = this.getTemplate(key);
      if (template) {
        return template;
      }
    }
    
    return expression;
  }

  /**
   * Get nested property from object
   */
  private getNestedProperty(obj: any, path: string): any {
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * Parse XML namespaces
   */
  private parseNamespaces(xaml: string): void {
    const namespaceRegex = /xmlns(?::(\w+))?="([^"]+)"/g;
    let match;
    while ((match = namespaceRegex.exec(xaml)) !== null) {
      const prefix = match[1] || "";
      const uri = match[2];
      this.namespaces.set(prefix, uri);
    }
  }

  /**
   * Parse a single element
   */
  private parseElement(xaml: string, startIndex: number): { element: XAMLElement; endIndex: number } | null {
    // Find opening tag
    const openTagMatch = xaml.substring(startIndex).match(/^<([\w:]+)([^>]*?)(\/)?>/);
    if (!openTagMatch) {
      return null;
    }

    const tagName = openTagMatch[1];
    const attributesStr = openTagMatch[2];
    const isSelfClosing = openTagMatch[3] === "/";
    const tagStart = startIndex;
    const tagEnd = startIndex + openTagMatch[0].length;

    // Parse attributes
    const attributes = this.parseAttributes(attributesStr);

    // Parse namespace prefix
    const [prefix, localName] = tagName.includes(":") 
      ? tagName.split(":", 2) 
      : ["", tagName];

    const element: XAMLElement = {
      tag: localName,
      namespace: prefix ? this.namespaces.get(prefix) : undefined,
      attributes,
      children: [],
      attachedProperties: {},
    };

    // If self-closing, return immediately
    if (isSelfClosing) {
      return { element, endIndex: tagEnd };
    }

    // Find content and closing tag
    let currentIndex = tagEnd;
    let depth = 1;
    let contentStart = tagEnd;
    let contentEnd = tagEnd;

    while (currentIndex < xaml.length && depth > 0) {
      const nextOpen = xaml.indexOf("<", currentIndex);
      if (nextOpen === -1) break;

      // Check if it's a closing tag
      if (xaml[nextOpen + 1] === "/") {
        const closeTagMatch = xaml.substring(nextOpen).match(/^<\/([\w:]+)>/);
        if (closeTagMatch && closeTagMatch[1] === tagName) {
          depth--;
          if (depth === 0) {
            contentEnd = nextOpen;
            const closingTagEnd = nextOpen + closeTagMatch[0].length;
            
            // Extract text content
            const textContent = xaml.substring(contentStart, contentEnd).trim();
            if (textContent && !textContent.includes("<")) {
              element.content = textContent;
            }
            
            return { element, endIndex: closingTagEnd };
          }
        }
        currentIndex = nextOpen + 1;
      } else {
        // Check if it's a comment or CDATA
        if (xaml.substring(nextOpen, nextOpen + 4) === "<!--") {
          const commentEnd = xaml.indexOf("-->", nextOpen);
          if (commentEnd !== -1) {
            currentIndex = commentEnd + 3;
            continue;
          }
        }
        
        // It's an opening tag - check if it matches our tag name
        const nestedOpenMatch = xaml.substring(nextOpen).match(/^<([\w:]+)/);
        if (nestedOpenMatch && nestedOpenMatch[1] === tagName) {
          depth++;
        }
        
        // Try to parse as nested element
        const nestedResult = this.parseElement(xaml, nextOpen);
        if (nestedResult) {
          element.children.push(nestedResult.element);
          currentIndex = nestedResult.endIndex;
        } else {
          currentIndex = nextOpen + 1;
        }
      }
    }

    return { element, endIndex: xaml.length };
  }

  /**
   * Parse attributes including attached properties
   */
  private parseAttributes(attributesStr: string): Record<string, any> {
    const attributes: Record<string, any> = {};
    const attachedProperties: Record<string, string> = {};
    
    // Match attributes: name="value" or name='value'
    const attrRegex = /([\w:.]+)\s*=\s*(["'])((?:\\.|(?!\2).)*)\2/g;
    let match;
    
    while ((match = attrRegex.exec(attributesStr)) !== null) {
      const name = match[1];
      const value = match[3].replace(/\\(.)/g, "$1"); // Unescape
      
      // Check if it's an attached property (e.g., Canvas.Left)
      if (name.includes(".")) {
        const [type, prop] = name.split(".", 2);
        attachedProperties[name] = value;
        // Also store in a structured way
        if (!attributes.attachedProperties) {
          attributes.attachedProperties = {};
        }
        (attributes.attachedProperties as any)[type] = (attributes.attachedProperties as any)[type] || {};
        (attributes.attachedProperties as any)[type][prop] = value;
      } else {
        attributes[name] = value;
      }
    }
    
    // Merge attached properties into attributes
    if (Object.keys(attachedProperties).length > 0) {
      attributes.attachedProperties = attachedProperties;
    }
    
    return attributes;
  }
}

export interface XAMLElement {
  tag: string;
  namespace?: string;
  attributes: Record<string, any>;
  children: XAMLElement[];
  content?: string;
  attachedProperties?: Record<string, string>;
}

interface Transform {
  type: "translate" | "rotate" | "scale" | "skew";
  x?: number;
  y?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  angleX?: number;
  angleY?: number;
  centerX?: number;
  centerY?: number;
}

/**
 * Silverlight Rendering Engine
 * Renders XAML to Canvas
 */
export class SilverlightRenderer {
  private renderer: CanvasRenderer;
  private xamlParser: XAMLParser;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    this.xamlParser = new XAMLParser();
  }

  renderXAML(xaml: string): void {
    try {
      const root = this.xamlParser.parse(xaml);
      this.renderElement(root);
    } catch (error) {
      console.error("Failed to render XAML:", error);
    }
  }

  private renderElement(element: XAMLElement): void {
    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (!ctx) return;
    
    // Apply transforms if any
    const transform = this.parseTransform(element);
    if (transform) {
      ctx.save();
      this.applyTransform(ctx, transform);
    }
    
    try {
      switch (element.tag.toLowerCase()) {
        case "canvas":
          this.renderCanvas(element);
          break;
        case "rectangle":
          this.renderRectangle(element);
          break;
        case "ellipse":
          this.renderEllipse(element);
          break;
        case "textblock":
        case "text":
          this.renderText(element);
          break;
        case "button":
          this.renderButton(element);
          break;
        case "grid":
        case "stackpanel":
          this.renderContainer(element);
          break;
        case "path":
          this.renderPath(element);
          break;
        case "image":
          this.renderImage(element);
          break;
        case "mediaelement":
          this.renderMediaElement(element);
          break;
        case "storyboard":
          this.renderStoryboard(element);
          break;
        case "style":
          // Styles are processed during parsing, not rendering
          break;
        case "controltemplate":
          // Templates are processed during parsing, not rendering
          break;
        default:
          // Render children for unknown elements
          for (const child of element.children) {
            this.renderElement(child);
          }
          break;
      }
    } finally {
      // Restore transform
      if (transform) {
        ctx.restore();
      }
    }
  }

  /**
   * Parse transform from element
   */
  private parseTransform(element: XAMLElement): Transform | null {
    const renderTransform = this.getAttribute(element, "RenderTransform");
    if (!renderTransform) return null;
    
    // Check if it's a transform element in children
    const transformElement = element.children.find(
      c => c.tag.toLowerCase().includes("transform")
    );
    
    if (transformElement) {
      return this.parseTransformElement(transformElement);
    }
    
    return null;
  }

  /**
   * Parse transform element
   */
  private parseTransformElement(element: XAMLElement): Transform | null {
    const tag = element.tag.toLowerCase();
    
    switch (tag) {
      case "translatetransform":
        return {
          type: "translate",
          x: parseFloat(this.getAttribute(element, "X", "0")),
          y: parseFloat(this.getAttribute(element, "Y", "0")),
        };
        
      case "rotatetransform":
        return {
          type: "rotate",
          angle: parseFloat(this.getAttribute(element, "Angle", "0")),
          centerX: parseFloat(this.getAttribute(element, "CenterX", "0")),
          centerY: parseFloat(this.getAttribute(element, "CenterY", "0")),
        };
        
      case "scaletransform":
        return {
          type: "scale",
          scaleX: parseFloat(this.getAttribute(element, "ScaleX", "1")),
          scaleY: parseFloat(this.getAttribute(element, "ScaleY", "1")),
          centerX: parseFloat(this.getAttribute(element, "CenterX", "0")),
          centerY: parseFloat(this.getAttribute(element, "CenterY", "0")),
        };
        
      case "skewtransform":
        return {
          type: "skew",
          angleX: parseFloat(this.getAttribute(element, "AngleX", "0")),
          angleY: parseFloat(this.getAttribute(element, "AngleY", "0")),
          centerX: parseFloat(this.getAttribute(element, "CenterX", "0")),
          centerY: parseFloat(this.getAttribute(element, "CenterY", "0")),
        };
        
      case "transformgroup":
        // For now, just return first transform
        if (element.children.length > 0) {
          return this.parseTransformElement(element.children[0]);
        }
        return null;
        
      default:
        return null;
    }
  }

  /**
   * Apply transform to canvas context
   */
  private applyTransform(ctx: CanvasRenderingContext2D, transform: Transform): void {
    switch (transform.type) {
      case "translate":
        ctx.translate(transform.x, transform.y);
        break;
        
      case "rotate":
        if (transform.centerX !== undefined && transform.centerY !== undefined) {
          ctx.translate(transform.centerX, transform.centerY);
          ctx.rotate((transform.angle * Math.PI) / 180);
          ctx.translate(-transform.centerX, -transform.centerY);
        } else {
          ctx.rotate((transform.angle * Math.PI) / 180);
        }
        break;
        
      case "scale":
        if (transform.centerX !== undefined && transform.centerY !== undefined) {
          ctx.translate(transform.centerX, transform.centerY);
          ctx.scale(transform.scaleX, transform.scaleY);
          ctx.translate(-transform.centerX, -transform.centerY);
        } else {
          ctx.scale(transform.scaleX, transform.scaleY);
        }
        break;
        
      case "skew":
        // Skew is not directly supported in canvas - use transform matrix
        if (transform.centerX !== undefined && transform.centerY !== undefined) {
          ctx.translate(transform.centerX, transform.centerY);
          const skewX = Math.tan((transform.angleX * Math.PI) / 180);
          const skewY = Math.tan((transform.angleY * Math.PI) / 180);
          ctx.transform(1, skewY, skewX, 1, 0, 0);
          ctx.translate(-transform.centerX, -transform.centerY);
        } else {
          const skewX = Math.tan((transform.angleX * Math.PI) / 180);
          const skewY = Math.tan((transform.angleY * Math.PI) / 180);
          ctx.transform(1, skewY, skewX, 1, 0, 0);
        }
        break;
    }
  }

  /**
   * Render Path element
   */
  private renderPath(element: XAMLElement): void {
    const data = this.getAttribute(element, "Data", "");
    const fill = this.getAttribute(element, "Fill");
    const stroke = this.getAttribute(element, "Stroke");
    const strokeThickness = parseFloat(this.getAttribute(element, "StrokeThickness", "0"));
    
    if (!data) return;
    
    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (!ctx) return;
    
    // Parse path data (simplified - would need full PathGeometry parsing)
    ctx.beginPath();
    
    // Simple path parsing (M = move, L = line, C = curve, Z = close)
    const commands = data.match(/[MLCZ][^MLCZ]*/g) || [];
    
    for (const cmd of commands) {
      const type = cmd[0];
      const coords = cmd.substring(1).trim().split(/[\s,]+/).map(parseFloat);
      
      switch (type) {
        case "M":
          if (coords.length >= 2) {
            ctx.moveTo(coords[0], coords[1]);
          }
          break;
        case "L":
          if (coords.length >= 2) {
            ctx.lineTo(coords[0], coords[1]);
          }
          break;
        case "C":
          if (coords.length >= 6) {
            ctx.bezierCurveTo(
              coords[0], coords[1],
              coords[2], coords[3],
              coords[4], coords[5]
            );
          }
          break;
        case "Z":
          ctx.closePath();
          break;
      }
    }
    
    if (fill) {
      ctx.fillStyle = this.parseBrush(fill);
      ctx.fill();
    }
    
    if (stroke && strokeThickness > 0) {
      ctx.strokeStyle = this.parseBrush(stroke);
      ctx.lineWidth = strokeThickness;
      ctx.stroke();
    }
  }

  /**
   * Render Image element
   */
  private renderImage(element: XAMLElement): void {
    const source = this.getAttribute(element, "Source", "");
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const width = parseFloat(this.getAttribute(element, "Width", "100"));
    const height = parseFloat(this.getAttribute(element, "Height", "100"));
    
    if (!source) return;
    
    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (!ctx) return;
    
    // For now, just draw a placeholder
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Draw "Image" text
    ctx.fillStyle = "#666666";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Image", x + width / 2, y + height / 2);
  }

  private renderCanvas(element: XAMLElement): void {
    const width = parseFloat(element.attributes.Width || "800");
    const height = parseFloat(element.attributes.Height || "600");
    const background = element.attributes.Background || "#ffffff";

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    }

    for (const child of element.children) {
      this.renderElement(child);
    }
  }

  /**
   * Get attached property value
   */
  private getAttachedProperty(element: XAMLElement, type: string, property: string): string | undefined {
    if (element.attachedProperties) {
      return element.attachedProperties[`${type}.${property}`];
    }
    if (element.attributes.attachedProperties) {
      const attached = element.attributes.attachedProperties as any;
      return attached[type]?.[property];
    }
    return undefined;
  }

  /**
   * Get attribute value with fallback
   */
  private getAttribute(element: XAMLElement, name: string, defaultValue: string = ""): string {
    return element.attributes[name] || defaultValue;
  }

  /**
   * Parse brush value (color string, brush reference, or brush element)
   */
  private parseBrush(value: string | XAMLElement): string {
    if (!value) return "#000000";
    
    // If it's an element, parse as brush element
    if (typeof value === "object" && "tag" in value) {
      return this.parseBrushElement(value);
    }
    
    const valueStr = String(value);
    
    // Check if it's a brush reference (e.g., {StaticResource MyBrush})
    if (valueStr.startsWith("{") && valueStr.endsWith("}")) {
      // For now, return default color
      return "#000000";
    }
    
    // Check if it's a named color
    const namedColors: Record<string, string> = {
      "Red": "#FF0000",
      "Green": "#008000",
      "Blue": "#0000FF",
      "White": "#FFFFFF",
      "Black": "#000000",
      "Yellow": "#FFFF00",
      "Cyan": "#00FFFF",
      "Magenta": "#FF00FF",
      "Transparent": "transparent",
    };
    
    if (namedColors[valueStr]) {
      return namedColors[valueStr];
    }
    
    // Assume it's a hex color
    return valueStr;
  }

  /**
   * Parse brush element (SolidColorBrush, LinearGradientBrush, etc.)
   */
  private parseBrushElement(element: XAMLElement): string {
    const tag = element.tag.toLowerCase();
    
    switch (tag) {
      case "solidcolorbrush":
        const color = this.getAttribute(element, "Color", "#000000");
        return this.parseColor(color);
        
      case "lineargradientbrush":
        // For now, return first gradient stop color
        const gradientStops = element.children.filter(c => c.tag.toLowerCase() === "gradientstop");
        if (gradientStops.length > 0) {
          const firstStop = gradientStops[0];
          const stopColor = this.getAttribute(firstStop, "Color", "#000000");
          return this.parseColor(stopColor);
        }
        return "#000000";
        
      case "radialgradientbrush":
        // For now, return first gradient stop color
        const radialStops = element.children.filter(c => c.tag.toLowerCase() === "gradientstop");
        if (radialStops.length > 0) {
          const firstStop = radialStops[0];
          const stopColor = this.getAttribute(firstStop, "Color", "#000000");
          return this.parseColor(stopColor);
        }
        return "#000000";
        
      default:
        return "#000000";
    }
  }

  /**
   * Parse color value (hex, named, or ARGB)
   */
  private parseColor(color: string): string {
    if (!color) return "#000000";
    
    // Check if it's a named color
    const namedColors: Record<string, string> = {
      "Red": "#FF0000",
      "Green": "#008000",
      "Blue": "#0000FF",
      "White": "#FFFFFF",
      "Black": "#000000",
      "Yellow": "#FFFF00",
      "Cyan": "#00FFFF",
      "Magenta": "#FF00FF",
      "Transparent": "transparent",
    };
    
    if (namedColors[color]) {
      return namedColors[color];
    }
    
    // Check if it's ARGB format (e.g., #AARRGGBB or #RRGGBB)
    if (color.startsWith("#")) {
      if (color.length === 9) {
        // ARGB format - convert to RGBA
        const a = parseInt(color.substring(1, 3), 16) / 255;
        const r = parseInt(color.substring(3, 5), 16);
        const g = parseInt(color.substring(5, 7), 16);
        const b = parseInt(color.substring(7, 9), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
      }
      return color;
    }
    
    return color;
  }

  private renderRectangle(element: XAMLElement): void {
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const width = parseFloat(this.getAttribute(element, "Width", "100"));
    const height = parseFloat(this.getAttribute(element, "Height", "100"));
    
    // Check if Fill is an element
    const fillElement = element.children.find(c => 
      c.tag.toLowerCase() === "rectangle.fill" || 
      c.tag.toLowerCase() === "fill" ||
      (c.tag.toLowerCase().includes("brush") && element.children.indexOf(c) === 0)
    );
    const fill = fillElement 
      ? this.parseBrush(fillElement)
      : this.parseBrush(this.getAttribute(element, "Fill", "#000000"));
    
    // Check if Stroke is an element
    const strokeElement = element.children.find(c => 
      c.tag.toLowerCase() === "rectangle.stroke" || 
      c.tag.toLowerCase() === "stroke"
    );
    const stroke = strokeElement
      ? this.parseBrush(strokeElement)
      : this.getAttribute(element, "Stroke");
    const strokeThickness = parseFloat(this.getAttribute(element, "StrokeThickness", "0"));

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, width, height);

      if (stroke && strokeThickness > 0) {
        ctx.strokeStyle = typeof stroke === "string" ? this.parseBrush(stroke) : stroke;
        ctx.lineWidth = strokeThickness;
        ctx.strokeRect(x, y, width, height);
      }
    }
    
    // Render children (excluding brush elements)
    for (const child of element.children) {
      if (!child.tag.toLowerCase().includes("brush") && 
          child.tag.toLowerCase() !== "fill" && 
          child.tag.toLowerCase() !== "stroke") {
        this.renderElement(child);
      }
    }
  }

  private renderEllipse(element: XAMLElement): void {
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const width = parseFloat(this.getAttribute(element, "Width", "100"));
    const height = parseFloat(this.getAttribute(element, "Height", "100"));
    
    // Check if Fill is an element
    const fillElement = element.children.find(c => 
      c.tag.toLowerCase() === "ellipse.fill" || 
      c.tag.toLowerCase() === "fill" ||
      (c.tag.toLowerCase().includes("brush") && element.children.indexOf(c) === 0)
    );
    const fill = fillElement 
      ? this.parseBrush(fillElement)
      : this.parseBrush(this.getAttribute(element, "Fill", "#000000"));
    
    // Check if Stroke is an element
    const strokeElement = element.children.find(c => 
      c.tag.toLowerCase() === "ellipse.stroke" || 
      c.tag.toLowerCase() === "stroke"
    );
    const stroke = strokeElement
      ? this.parseBrush(strokeElement)
      : this.getAttribute(element, "Stroke");
    const strokeThickness = parseFloat(this.getAttribute(element, "StrokeThickness", "0"));

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      if (stroke && strokeThickness > 0) {
        ctx.strokeStyle = typeof stroke === "string" ? this.parseBrush(stroke) : stroke;
        ctx.lineWidth = strokeThickness;
        ctx.stroke();
      }
    }
    
    // Render children (excluding brush elements)
    for (const child of element.children) {
      if (!child.tag.toLowerCase().includes("brush") && 
          child.tag.toLowerCase() !== "fill" && 
          child.tag.toLowerCase() !== "stroke") {
        this.renderElement(child);
      }
    }
  }

  private renderText(element: XAMLElement): void {
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const text = element.content || this.getAttribute(element, "Text", "");
    const fontSize = parseFloat(this.getAttribute(element, "FontSize", "14"));
    const fontFamily = this.getAttribute(element, "FontFamily", "Arial");
    const foreground = this.parseBrush(this.getAttribute(element, "Foreground", "#000000"));

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      ctx.fillStyle = foreground;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillText(text, x, y);
    }
    
    // Render children
    for (const child of element.children) {
      this.renderElement(child);
    }
  }

  private renderButton(element: XAMLElement): void {
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const width = parseFloat(this.getAttribute(element, "Width", "100"));
    const height = parseFloat(this.getAttribute(element, "Height", "30"));
    const content = element.content || this.getAttribute(element, "Content", "Button");
    const background = this.parseBrush(this.getAttribute(element, "Background", "#e0e0e0"));
    const foreground = this.parseBrush(this.getAttribute(element, "Foreground", "#000000"));

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      // Draw button background
      ctx.fillStyle = background;
      ctx.fillRect(x, y, width, height);

      // Draw button border
      ctx.strokeStyle = "#808080";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);

      // Draw button text
      ctx.fillStyle = foreground;
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(content, x + width / 2, y + height / 2);
    }
    
    // Render children (button content)
    for (const child of element.children) {
      this.renderElement(child);
    }
  }

  private renderContainer(element: XAMLElement): void {
    // Render container children
    for (const child of element.children) {
      this.renderElement(child);
    }
  }

  /**
   * Render MediaElement (video/audio playback)
   */
  private renderMediaElement(element: XAMLElement): void {
    const x = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Left") || 
      this.getAttribute(element, "Canvas.Left") || 
      "0"
    );
    const y = parseFloat(
      this.getAttachedProperty(element, "Canvas", "Top") || 
      this.getAttribute(element, "Canvas.Top") || 
      "0"
    );
    const width = parseFloat(this.getAttribute(element, "Width", "400"));
    const height = parseFloat(this.getAttribute(element, "Height", "300"));
    const source = this.getAttribute(element, "Source", "");
    const autoPlay = this.getAttribute(element, "AutoPlay", "False").toLowerCase() === "true";
    const volume = parseFloat(this.getAttribute(element, "Volume", "1.0"));
    const isMuted = this.getAttribute(element, "IsMuted", "False").toLowerCase() === "true";

    const ctx = this.renderer["ctx"] as CanvasRenderingContext2D;
    if (!ctx) return;

    // Create video element if source is provided
    if (source) {
      // In a full implementation, we would create an HTML5 video element
      // and render it to the canvas
      // For now, draw a placeholder
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Media: ${source}`, x + width / 2, y + height / 2);
    } else {
      // Draw placeholder
      ctx.fillStyle = "#333333";
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MediaElement", x + width / 2, y + height / 2);
    }
  }

  /**
   * Render Storyboard (animations)
   */
  private renderStoryboard(element: XAMLElement): void {
    // Storyboards are processed during parsing and applied during rendering
    // This method is called when a Storyboard element is encountered
    // In a full implementation, we would parse and store animation definitions
    const name = this.getAttribute(element, "x:Name", "");
    const targetName = this.getAttribute(element, "TargetName", "");
    
    // Parse animation children (DoubleAnimation, ColorAnimation, etc.)
    for (const child of element.children) {
      this.parseAnimation(child, targetName);
    }
  }

  /**
   * Parse animation element
   */
  private parseAnimation(element: XAMLElement, targetName: string): void {
    const tag = element.tag.toLowerCase();
    
    switch (tag) {
      case "doubleanimation":
        {
          const propertyPath = this.getAttribute(element, "Storyboard.TargetProperty", "");
          const from = this.getAttribute(element, "From");
          const to = this.getAttribute(element, "To");
          const duration = this.getAttribute(element, "Duration", "0:0:1");
          const repeatBehavior = this.getAttribute(element, "RepeatBehavior", "1x");
          
          // Store animation definition
          // In a full implementation, we would create an animation timeline
        }
        break;
        
      case "coloranimation":
        {
          const propertyPath = this.getAttribute(element, "Storyboard.TargetProperty", "");
          const from = this.getAttribute(element, "From");
          const to = this.getAttribute(element, "To");
          const duration = this.getAttribute(element, "Duration", "0:0:1");
          
          // Store animation definition
        }
        break;
        
      case "pointanimation":
        {
          const propertyPath = this.getAttribute(element, "Storyboard.TargetProperty", "");
          const from = this.getAttribute(element, "From");
          const to = this.getAttribute(element, "To");
          const duration = this.getAttribute(element, "Duration", "0:0:1");
          
          // Store animation definition
        }
        break;
    }
  }
}

/**
 * XAP Execution Engine
 */
export class XAPEngine {
  private xap: XAPFile;
  private renderer: SilverlightRenderer;
  private canvasRenderer: CanvasRenderer;

  constructor(xap: XAPFile, canvasRenderer: CanvasRenderer) {
    this.xap = xap;
    this.canvasRenderer = canvasRenderer;
    this.renderer = new SilverlightRenderer(canvasRenderer);
  }

  initialize(): void {
    // Render main XAML file
    if (this.xap.xamlFiles.length > 0) {
      const mainXAML = this.xap.xamlFiles[0];
      this.renderer.renderXAML(mainXAML.content);
    } else {
      this.showMessage("Silverlight Runtime", "No XAML files found");
    }
  }

  private showMessage(title: string, message: string): void {
    const ctx = this.canvasRenderer["ctx"] as CanvasRenderingContext2D;
    if (ctx) {
      ctx.fillStyle = "#0a0612";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#a855f7";
      ctx.font = "24px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(title, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "14px Orbitron";
      ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
    }
  }
}

