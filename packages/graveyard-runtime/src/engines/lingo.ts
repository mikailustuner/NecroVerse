/**
 * Lingo Script Interpreter
 * Interprets Lingo scripts for Director/Shockwave
 */

export interface LingoContext {
  variables: Record<string, any>;
  functions: Record<string, Function>;
  sprites: Map<number, any>;
  stage: {
    width: number;
    height: number;
  };
  timeline?: {
    currentFrame: number;
    totalFrames: number;
    gotoFrame: (frame: number) => void;
    play: () => void;
    stop: () => void;
    pause: () => void;
  };
}

export class LingoInterpreter {
  private context: LingoContext;
  private stack: any[] = [];

  constructor(context: LingoContext) {
    this.context = context;
    this.initBuiltins();
  }

  private initBuiltins(): void {
    // Basic Lingo functions
    this.context.functions["put"] = (value: any) => {
      console.log("[Lingo]", value);
      return value;
    };

    this.context.functions["go"] = (frame: number | string) => {
      if (this.context.timeline) {
        const frameNum = typeof frame === "string" ? parseInt(frame) : frame;
        if (!isNaN(frameNum)) {
          this.context.timeline.gotoFrame(frameNum);
        }
      }
    };

    this.context.functions["goToFrame"] = (frame: number) => {
      if (this.context.timeline) {
        this.context.timeline.gotoFrame(frame);
      }
    };

    this.context.functions["play"] = () => {
      if (this.context.timeline) {
        this.context.timeline.play();
      }
    };

    this.context.functions["stop"] = () => {
      if (this.context.timeline) {
        this.context.timeline.stop();
      }
    };

    this.context.functions["pause"] = () => {
      if (this.context.timeline) {
        this.context.timeline.pause();
      }
    };

    this.context.functions["the"] = (property: string) => {
      // Access properties
      switch (property.toLowerCase()) {
        case "mousedown":
          return this.context.variables["_mouseDown"] || 0;
        case "mouseup":
          return this.context.variables["_mouseUp"] || 0;
        case "mouseloc":
          return {
            h: this.context.variables["_mouseX"] || 0,
            v: this.context.variables["_mouseY"] || 0,
          };
        case "mouseh":
          return this.context.variables["_mouseX"] || 0;
        case "mousev":
          return this.context.variables["_mouseY"] || 0;
        case "frame":
          return this.context.timeline?.currentFrame || this.context.variables["_currentFrame"] || 1;
        case "frames":
          return this.context.timeline?.totalFrames || this.context.variables["_totalFrames"] || 1;
        case "stagemouseh":
          return this.context.variables["_mouseX"] || 0;
        case "stagemousev":
          return this.context.variables["_mouseY"] || 0;
        default:
          return this.context.variables[property] || 0;
      }
    };

    this.context.functions["set"] = (property: string, value: any) => {
      this.context.variables[property] = value;
    };

    this.context.functions["sprite"] = (channel: number) => {
      return this.context.sprites.get(channel) || {};
    };

    // Math operations
    this.context.functions["abs"] = (value: number) => Math.abs(value);
    this.context.functions["sin"] = (value: number) => Math.sin(value);
    this.context.functions["cos"] = (value: number) => Math.cos(value);
    this.context.functions["tan"] = (value: number) => Math.tan(value);
    this.context.functions["sqrt"] = (value: number) => Math.sqrt(value);
    this.context.functions["pow"] = (base: number, exp: number) => Math.pow(base, exp);
    this.context.functions["random"] = (max: number) => Math.floor(Math.random() * max);
    this.context.functions["round"] = (value: number) => Math.round(value);
    this.context.functions["integer"] = (value: number) => Math.floor(value);
    this.context.functions["float"] = (value: any) => parseFloat(value);

    // String operations
    this.context.functions["length"] = (str: string) => str.length;
    this.context.functions["char"] = (str: string, index: number) => str.charAt(index - 1); // Lingo is 1-indexed
    this.context.functions["chars"] = (str: string, start: number, end: number) => str.substring(start - 1, end); // Lingo is 1-indexed
    this.context.functions["offset"] = (substr: string, str: string) => {
      const index = str.indexOf(substr);
      return index >= 0 ? index + 1 : 0; // Lingo is 1-indexed
    };
    this.context.functions["string"] = (value: any) => String(value);
    this.context.functions["value"] = (str: string) => {
      const num = parseFloat(str);
      return isNaN(num) ? str : num;
    };

    // Comparison operations
    this.context.functions["<"] = (a: any, b: any) => a < b ? 1 : 0;
    this.context.functions[">"] = (a: any, b: any) => a > b ? 1 : 0;
    this.context.functions["<="] = (a: any, b: any) => a <= b ? 1 : 0;
    this.context.functions[">="] = (a: any, b: any) => a >= b ? 1 : 0;
    this.context.functions["="] = (a: any, b: any) => a === b ? 1 : 0;
    this.context.functions["<>"] = (a: any, b: any) => a !== b ? 1 : 0;

    // Logical operations
    this.context.functions["and"] = (a: any, b: any) => a && b ? 1 : 0;
    this.context.functions["or"] = (a: any, b: any) => a || b ? 1 : 0;
    this.context.functions["not"] = (a: any) => a ? 0 : 1;

    // Arithmetic operations
    this.context.functions["+"] = (a: any, b: any) => {
      if (typeof a === "string" || typeof b === "string") {
        return String(a) + String(b);
      }
      return a + b;
    };
    this.context.functions["-"] = (a: any, b: any) => a - b;
    this.context.functions["*"] = (a: any, b: any) => a * b;
    this.context.functions["/"] = (a: any, b: any) => a / b;
    this.context.functions["mod"] = (a: any, b: any) => a % b;
    this.context.functions["div"] = (a: any, b: any) => Math.floor(a / b);

    // Sprite property access
    this.context.functions["locH"] = (channel: number) => {
      const sprite = this.context.sprites.get(channel);
      return sprite?.x || 0;
    };
    this.context.functions["locV"] = (channel: number) => {
      const sprite = this.context.sprites.get(channel);
      return sprite?.y || 0;
    };
    this.context.functions["visible"] = (channel: number) => {
      const sprite = this.context.sprites.get(channel);
      return sprite?.visible ? 1 : 0;
    };
    this.context.functions["member"] = (channel: number) => {
      const sprite = this.context.sprites.get(channel);
      return sprite?.member || "";
    };

    // Advanced Math functions
    this.context.functions["exp"] = (value: number) => Math.exp(value);
    this.context.functions["log"] = (value: number) => Math.log(value);
    this.context.functions["log10"] = (value: number) => Math.log10(value);
    this.context.functions["asin"] = (value: number) => Math.asin(value);
    this.context.functions["acos"] = (value: number) => Math.acos(value);
    this.context.functions["atan"] = (value: number) => Math.atan(value);
    this.context.functions["atan2"] = (y: number, x: number) => Math.atan2(y, x);
    this.context.functions["pi"] = () => Math.PI;
    this.context.functions["e"] = () => Math.E;
    this.context.functions["min"] = (...args: number[]) => Math.min(...args);
    this.context.functions["max"] = (...args: number[]) => Math.max(...args);
    this.context.functions["ceiling"] = (value: number) => Math.ceil(value);
    this.context.functions["truncate"] = (value: number) => Math.trunc(value);

    // 3D Commands
    this.context.functions["model"] = (modelName: string) => {
      // 3D model access - simplified
      return { name: modelName, x: 0, y: 0, z: 0, rotation: { x: 0, y: 0, z: 0 } };
    };
    this.context.functions["camera"] = () => {
      // Camera access - simplified
      return { x: 0, y: 0, z: 1000, rotation: { x: 0, y: 0, z: 0 } };
    };
    this.context.functions["light"] = (lightName: string) => {
      // Light access - simplified
      return { name: lightName, type: "directional", color: "#ffffff", intensity: 1.0 };
    };
    this.context.functions["point"] = (x: number, y: number, z: number) => {
      return { x, y, z };
    };
    this.context.functions["vector"] = (x: number, y: number, z: number) => {
      return { x, y, z, length: Math.sqrt(x * x + y * y + z * z) };
    };
    this.context.functions["distance"] = (point1: any, point2: any) => {
      if (point1 && point2 && point1.x !== undefined && point2.x !== undefined) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = (point2.z || 0) - (point1.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      return 0;
    };

    // Network Commands
    this.context.functions["getNetText"] = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
      } catch (error) {
        console.error("[Lingo] getNetText failed:", error);
        return "";
      }
    };
    this.context.functions["getNetBytes"] = async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      } catch (error) {
        console.error("[Lingo] getNetBytes failed:", error);
        return new Uint8Array(0);
      }
    };
    this.context.functions["postNetText"] = async (url: string, data: string) => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: data,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
      } catch (error) {
        console.error("[Lingo] postNetText failed:", error);
        return "";
      }
    };
    this.context.functions["netStatus"] = (url: string) => {
      // Check network status - simplified
      return navigator.onLine ? "connected" : "disconnected";
    };
    this.context.functions["netAbort"] = () => {
      // Abort network request - simplified
      return true;
    };

    // File I/O Commands
    this.context.functions["openFile"] = async (fileName: string, mode: string = "read") => {
      // File open - simplified (would need File System Access API)
      console.log("[Lingo] openFile:", fileName, mode);
      return { handle: fileName, mode };
    };
    this.context.functions["readFile"] = async (fileHandle: any) => {
      // File read - simplified
      console.log("[Lingo] readFile:", fileHandle);
      return "";
    };
    this.context.functions["writeFile"] = async (fileHandle: any, data: string) => {
      // File write - simplified
      console.log("[Lingo] writeFile:", fileHandle, data);
      return true;
    };
    this.context.functions["closeFile"] = async (fileHandle: any) => {
      // File close - simplified
      console.log("[Lingo] closeFile:", fileHandle);
      return true;
    };
    this.context.functions["getNthFileNameInFolder"] = (folderPath: string, n: number) => {
      // Get file name - simplified
      console.log("[Lingo] getNthFileNameInFolder:", folderPath, n);
      return "";
    };
    this.context.functions["fileExists"] = (fileName: string) => {
      // Check if file exists - simplified
      console.log("[Lingo] fileExists:", fileName);
      return false;
    };
    this.context.functions["deleteFile"] = async (fileName: string) => {
      // Delete file - simplified
      console.log("[Lingo] deleteFile:", fileName);
      return true;
    };
    this.context.functions["createFolder"] = async (folderName: string) => {
      // Create folder - simplified
      console.log("[Lingo] createFolder:", folderName);
      return true;
    };
    this.context.functions["deleteFolder"] = async (folderName: string) => {
      // Delete folder - simplified
      console.log("[Lingo] deleteFolder:", folderName);
      return true;
    };
  }

  /**
   * Execute Lingo script
   * This is a simplified interpreter - full Lingo parsing is complex
   */
  execute(script: string): void {
    try {
      // Simplified Lingo execution
      // In a full implementation, this would parse Lingo syntax properly
      const lines = script.split("\n");
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("--")) continue; // Skip comments
        
        // Parse simple statements
        this.executeLine(trimmed);
      }
    } catch (error) {
      console.error("Lingo execution error:", error);
    }
  }

  private executeLine(line: string): void {
    // Simplified line execution
    // Handle common Lingo patterns
    
    // put statement
    if (line.startsWith("put ")) {
      const value = line.substring(4).trim();
      this.context.functions["put"](this.evaluateExpression(value));
      return;
    }
    
    // go statement
    if (line.startsWith("go ")) {
      const target = line.substring(3).trim();
      const frame = parseInt(target);
      if (!isNaN(frame)) {
        this.context.functions["go"](frame);
      }
      return;
    }
    
    // set statement
    const setMatch = line.match(/set\s+(\w+)\s*=\s*(.+)/i);
    if (setMatch) {
      const property = setMatch[1];
      const value = this.evaluateExpression(setMatch[2]);
      this.context.functions["set"](property, value);
      return;
    }
    
    // set sprite property (set the property of sprite channel = value)
    const setSpriteMatch = line.match(/set\s+the\s+(\w+)\s+of\s+sprite\s*\((\d+)\)\s*=\s*(.+)/i);
    if (setSpriteMatch) {
      const property = setSpriteMatch[1].toLowerCase();
      const channel = parseInt(setSpriteMatch[2]);
      const value = this.evaluateExpression(setSpriteMatch[3].trim());
      const sprite = this.context.sprites.get(channel);
      if (sprite) {
        switch (property) {
          case "loch":
          case "loch":
            sprite.x = value;
            break;
          case "locv":
          case "locV":
            sprite.y = value;
            break;
          case "visible":
            sprite.visible = value ? true : false;
            break;
          default:
            sprite[property] = value;
        }
      }
      return;
    }
    
    // set sprite property (sprite(channel).property = value)
    const setSpritePropMatch = line.match(/sprite\s*\((\d+)\)\s*\.\s*(\w+)\s*=\s*(.+)/i);
    if (setSpritePropMatch) {
      const channel = parseInt(setSpritePropMatch[1]);
      const property = setSpritePropMatch[2];
      const value = this.evaluateExpression(setSpritePropMatch[3].trim());
      const sprite = this.context.sprites.get(channel);
      if (sprite) {
        sprite[property] = value;
      }
      return;
    }
    
    // Function call
    const funcMatch = line.match(/(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const args = funcMatch[2]
        .split(",")
        .map((arg) => this.evaluateExpression(arg.trim()));
      
      const func = this.context.functions[funcName];
      if (func) {
        func(...args);
      }
      return;
    }
    
    // Variable assignment
    const assignMatch = line.match(/(\w+)\s*=\s*(.+)/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const value = this.evaluateExpression(assignMatch[2]);
      this.context.variables[varName] = value;
      return;
    }
  }

  private evaluateExpression(expr: string): any {
    expr = expr.trim();
    
    // String literal
    if (expr.startsWith('"') && expr.endsWith('"')) {
      return expr.slice(1, -1);
    }
    
    // Number
    const num = parseFloat(expr);
    if (!isNaN(num)) {
      return num;
    }
    
    // Variable
    if (this.context.variables[expr] !== undefined) {
      return this.context.variables[expr];
    }
    
    // Function call
    const funcMatch = expr.match(/(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      const funcName = funcMatch[1];
      const args = funcMatch[2]
        .split(",")
        .map((arg) => this.evaluateExpression(arg.trim()));
      
      const func = this.context.functions[funcName];
      if (func) {
        return func(...args);
      }
    }
    
    // Property access (the property)
    const theMatch = expr.match(/the\s+(\w+)/i);
    if (theMatch) {
      return this.context.functions["the"](theMatch[1]);
    }
    
    // Sprite access
    const spriteMatch = expr.match(/sprite\s*\((\d+)\)/i);
    if (spriteMatch) {
      const channel = parseInt(spriteMatch[1]);
      return this.context.functions["sprite"](channel);
    }
    
    // Sprite property access (sprite(channel).property)
    const spritePropMatch = expr.match(/sprite\s*\((\d+)\)\s*\.\s*(\w+)/i);
    if (spritePropMatch) {
      const channel = parseInt(spritePropMatch[1]);
      const property = spritePropMatch[2];
      const sprite = this.context.sprites.get(channel);
      if (sprite) {
        return sprite[property] || 0;
      }
      return 0;
    }
    
    // Sprite property access (the property of sprite channel)
    const theSpriteMatch = expr.match(/the\s+(\w+)\s+of\s+sprite\s*\((\d+)\)/i);
    if (theSpriteMatch) {
      const property = theSpriteMatch[1].toLowerCase();
      const channel = parseInt(theSpriteMatch[2]);
      const sprite = this.context.sprites.get(channel);
      if (sprite) {
        switch (property) {
          case "loch":
          case "locH":
            return sprite.x || 0;
          case "locv":
          case "locV":
            return sprite.y || 0;
          case "visible":
            return sprite.visible ? 1 : 0;
          case "member":
            return sprite.member || "";
          default:
            return sprite[property] || 0;
        }
      }
      return 0;
    }
    
    // Arithmetic operations
    const addMatch = expr.match(/(.+)\s*\+\s*(.+)/);
    if (addMatch) {
      const left = this.evaluateExpression(addMatch[1].trim());
      const right = this.evaluateExpression(addMatch[2].trim());
      return this.context.functions["+"](left, right);
    }
    
    const subMatch = expr.match(/(.+)\s*-\s*(.+)/);
    if (subMatch) {
      const left = this.evaluateExpression(subMatch[1].trim());
      const right = this.evaluateExpression(subMatch[2].trim());
      return this.context.functions["-"](left, right);
    }
    
    const mulMatch = expr.match(/(.+)\s*\*\s*(.+)/);
    if (mulMatch) {
      const left = this.evaluateExpression(mulMatch[1].trim());
      const right = this.evaluateExpression(mulMatch[2].trim());
      return this.context.functions["*"](left, right);
    }
    
    const divMatch = expr.match(/(.+)\s*\/\s*(.+)/);
    if (divMatch) {
      const left = this.evaluateExpression(divMatch[1].trim());
      const right = this.evaluateExpression(divMatch[2].trim());
      return this.context.functions["/"](left, right);
    }
    
    // String concatenation (&&)
    const concatMatch = expr.match(/(.+)\s*&&\s*(.+)/);
    if (concatMatch) {
      const left = String(this.evaluateExpression(concatMatch[1].trim()));
      const right = String(this.evaluateExpression(concatMatch[2].trim()));
      return left + right;
    }
    
    return expr;
  }
}

