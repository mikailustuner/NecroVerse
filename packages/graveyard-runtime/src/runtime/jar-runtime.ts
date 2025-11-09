"use client";

import { parseJAR, JARFile } from "../parsers/jar";
import { JVMInterpreter, JavaBytecodeParser } from "../engines/jar-engine";
import { CanvasRenderer } from "../renderers/canvas-renderer";
import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";
import { Graphics } from "../awt/graphics";
import { Applet } from "../awt/applet";
import { attachDOMEventListeners } from "../awt/dom-event-mapper";
import { Display } from "../midp/display";
import { Canvas } from "../midp/canvas";

/**
 * Custom JAR Runtime
 * Executes Java applets using JVM interpreter
 */
export class JARRuntime {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private interpreter: JVMInterpreter;
  private jar: JARFile | null = null;
  private applet: Applet | null = null;
  private graphics: Graphics | null = null;
  private animationFrame: number | null = null;
  private repaintRequested: boolean = false;
  private display: Display | null = null;
  private midletInstance: any = null;

  constructor(containerId: string, config: RuntimeConfig) {
    console.log("🚀🚀🚀 JAR RUNTIME STARTING 🚀🚀🚀");
    console.log("[JARRuntime] Initializing runtime for container:", containerId);
    console.log("[JARRuntime] Config:", config);
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("❌ Container not found:", containerId);
      throw new Error(`Container ${containerId} not found`);
    }
    
    console.log("✅ Container found:", containerId);

    // Initialize renderer with default size
    let width = Math.abs(config.metadata?.dimensions?.width || 800);
    let height = Math.abs(config.metadata?.dimensions?.height || 600);
    
    // Ensure minimum size
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    
    // Ensure reasonable maximum size
    width = Math.min(width, 1920);
    height = Math.min(height, 1080);

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Style canvas to fit container while maintaining aspect ratio
    this.canvas.style.width = "auto";
    this.canvas.style.height = "auto";
    this.canvas.style.maxWidth = "100%";
    this.canvas.style.maxHeight = "100%";
    this.canvas.style.display = "block";
    this.canvas.style.margin = "0 auto"; // Center horizontally
    this.canvas.style.backgroundColor = "#0a0612";
    this.canvas.className = "border border-[#a855f7]/50 rounded-lg";
    container.appendChild(this.canvas);

    console.log("[JARRuntime] Canvas size:", width, "x", height);
    
    // Initialize renderer
    this.renderer = new CanvasRenderer(this.canvas, width, height);

    // Initialize graphics
    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      this.graphics = new Graphics(ctx);
    }

    // Initialize JVM interpreter
    this.interpreter = new JVMInterpreter();

    // Show loading message
    this.showMessage("Java Applet Runtime", "Loading JAR file...");

    // Load and parse JAR (async, but don't await in constructor)
    this.loadJAR(config.url).catch((error) => {
      console.error("[JARRuntime] Failed to load JAR:", error);
      // Error is already handled in loadJAR
    });
  }

  private async loadJAR(url: string): Promise<void> {
    console.log("📥📥📥 LOADING JAR FILE 📥📥📥");
    try {
      console.log("[JARRuntime] Loading JAR from URL:", url);
      
      if (!url) {
        throw new Error("JAR URL is empty");
      }

      // Fetch JAR file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JAR: ${response.status} ${response.statusText}`);
      }
      
      console.log("[JARRuntime] JAR fetched, size:", response.headers.get("content-length") || "unknown");
      
      const arrayBuffer = await response.arrayBuffer();
      console.log("[JARRuntime] JAR loaded, parsing...");

      // Parse JAR
      console.log("🔍🔍🔍 PARSING JAR FILE 🔍🔍🔍");
      this.jar = await parseJAR(arrayBuffer);
      console.log("✅✅✅ JAR PARSED SUCCESSFULLY ✅✅✅");
      console.log("[JARRuntime] JAR parsed successfully:");
      console.log("  - Manifest:", this.jar.manifest ? "found" : "not found");
      console.log("  - Classes:", this.jar.classes.length);
      console.log("  - Resources:", this.jar.resources.length);
      console.log("  - Main Class:", this.jar.mainClass || "not found");
      
      if (this.jar.manifest && Object.keys(this.jar.manifest).length > 0) {
        console.log("  - Manifest keys:", Object.keys(this.jar.manifest));
      }

      // Load all classes
      for (const jarClass of this.jar.classes) {
        this.interpreter.loadClass(jarClass);
      }

      // Initialize applet if main class exists
      if (this.jar.mainClass) {
        console.log("[JARRuntime] Initializing applet with main class:", this.jar.mainClass);
        this.initializeApplet(this.jar.mainClass);
      } else {
        // Show message with more details
        const message = this.jar.classes.length > 0
          ? `No main class found. Found ${this.jar.classes.length} class(es).`
          : "No classes found in JAR.";
        console.warn("[JARRuntime] No main class found in JAR");
        this.showMessage("Java Applet Runtime", message);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("Failed to load JAR", err, { url });
      console.error("[JARRuntime] Failed to load JAR:", err);
      this.showError(err.message);
      throw err;
    }
  }

  private initializeApplet(mainClass: string): void {
    try {
      console.log("[JARRuntime] Initializing applet:", mainClass);
      
      // Try to instantiate applet class using JVM interpreter
      let appletInstance: any = null;
      let resolvedClassName: string = mainClass;
      
      try {
        // Try to instantiate using JVM
        // First, try to find the class by name
        let javaClass = this.interpreter.getClass(mainClass);
        
        // Check if the found class is actually an applet
        let isValidApplet = false;
        if (javaClass) {
          const methodNames = javaClass.methods.map((m: any) => m.name);
          const hasInit = methodNames.includes('init');
          const hasStart = methodNames.includes('start');
          const hasPaint = methodNames.includes('paint');
          const hasRun = methodNames.includes('run');
          
          // Valid if it has applet methods or run method (for MIDlet)
          isValidApplet = hasInit || hasStart || hasPaint || hasRun;
          
          if (!isValidApplet) {
            console.warn(`[JARRuntime] Main class ${mainClass} doesn't look like an applet/MIDlet, searching for better candidate...`);
            javaClass = null; // Force search
          }
        }
        
        // If not found or not valid, try to find by searching all loaded classes
        if (!javaClass) {
          console.warn("[JARRuntime] Main class not found by name, searching all classes...");
          const allClasses = this.interpreter.getClasses();
          console.log("[JARRuntime] Available classes:", Array.from(allClasses.keys()));
          
          // Score each class based on applet-like characteristics
          let bestScore = 0;
          let bestClass: any = null;
          let bestClassName: string = "";
          
          for (const [className, classData] of allClasses.entries()) {
            let score = 0;
            const methodNames = classData.methods.map((m: any) => m.name);
            
            // Check for applet lifecycle methods
            const hasInit = methodNames.includes('init');
            const hasStart = methodNames.includes('start');
            const hasPaint = methodNames.includes('paint');
            const hasStop = methodNames.includes('stop');
            const hasDestroy = methodNames.includes('destroy');
            const hasRun = methodNames.includes('run');
            
            // Score based on method presence
            if (hasPaint) score += 10; // Paint is most important
            if (hasInit) score += 5;
            if (hasStart) score += 5;
            if (hasStop) score += 3;
            if (hasDestroy) score += 3;
            if (hasRun) score += 2; // MIDlet or Runnable
            
            // Bonus for class name patterns
            const lowerName = className.toLowerCase();
            if (lowerName.includes('applet')) score += 8;
            if (lowerName.includes('midlet')) score += 15; // MIDlet is very important
            if (lowerName.includes('canvas')) score += 5;
            if (lowerName.includes('game')) score += 5;
            if (lowerName.includes('main')) score += 3;
            
            // Check superclass name if available
            if (classData.superClassName) {
              const superLower = classData.superClassName.toLowerCase();
              if (superLower.includes('midlet')) score += 10;
              if (superLower.includes('applet')) score += 10;
              if (superLower.includes('canvas')) score += 5;
            }
            
            // Penalty for very short names (likely obfuscated utility classes)
            if (className.length === 1) score -= 5;
            
            console.log(`[JARRuntime] Class ${className}: score=${score}, methods=${methodNames.join(', ')}`);
            
            if (score > bestScore) {
              bestScore = score;
              bestClass = classData;
              bestClassName = className;
            }
          }
          
          if (bestClass && bestScore > 0) {
            console.log(`[JARRuntime] Selected best applet candidate: ${bestClassName} (score: ${bestScore})`);
            javaClass = bestClass;
            resolvedClassName = bestClassName;
          } else {
            console.warn("[JARRuntime] No suitable applet class found");
          }
        }
        
        if (javaClass) {
          console.log(`[JARRuntime] Using class: ${resolvedClassName}`);
          console.log(`[JARRuntime] Available methods: ${javaClass.methods.map(m => m.name).join(', ')}`);
          // Create applet wrapper that uses JVM for method calls
          appletInstance = this.createAppletWrapper(resolvedClassName, javaClass);
        }
      } catch (e) {
        console.warn("[JARRuntime] Failed to instantiate applet via JVM, using fallback:", e);
      }
      
      // Fallback to basic applet if JVM instantiation failed
      if (!appletInstance) {
        console.warn("[JARRuntime] Using fallback Applet instance");
        appletInstance = new Applet();
      }
      
      this.applet = appletInstance;
      
      // Set applet size
      this.applet.setSize(this.canvas.width, this.canvas.height);
      
      // Set applet parameters from config
      if (this.jar?.manifest) {
        const params: Record<string, string> = {};
        for (const [key, value] of Object.entries(this.jar.manifest)) {
          if (key.startsWith("Applet-Parameter-")) {
            const paramName = key.substring("Applet-Parameter-".length);
            params[paramName] = String(value);
          }
        }
        this.applet.setParameters(params);
      }
      
      // Call applet lifecycle methods
      this.applet.init();
      this.applet.start();
      
      // Create Display instance for MIDlet
      this.midletInstance = {}; // Placeholder MIDlet instance
      this.display = Display.getDisplay(this.midletInstance);
      this.display.setCanvas(this.canvas);
      
      console.log("[JARRuntime] Display created and canvas set");
      
      // Attach DOM event listeners
      attachDOMEventListeners(this.canvas, this.applet);
      
      console.log("[JARRuntime] Requesting initial repaint");
      console.log("[JARRuntime] Applet size:", this.applet.width, "x", this.applet.height);
      console.log("[JARRuntime] Applet has children:", this.applet.getComponentCount());
      
      // Request initial repaint
      this.applet.requestRepaint();
      
      console.log("[JARRuntime] Applet repaint requested:", this.applet.isRepaintRequested());
      
      // Start rendering loop (for applet fallback)
      this.startRenderingLoop();
      
      console.log("[JARRuntime] Applet initialized and started");
    } catch (error) {
      console.error("Failed to initialize applet:", error);
      this.showError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Create applet wrapper that delegates method calls to JVM
   */
  private createAppletWrapper(className: string, javaClass: any): Applet {
    const baseApplet = new Applet();
    
    // Check which methods are available in the Java class
    const hasInitMethod = javaClass.methods.some((m: any) => m.name === 'init');
    const hasStartMethod = javaClass.methods.some((m: any) => m.name === 'start');
    const hasPaintMethod = javaClass.methods.some((m: any) => m.name === 'paint');
    const hasStopMethod = javaClass.methods.some((m: any) => m.name === 'stop');
    const hasDestroyMethod = javaClass.methods.some((m: any) => m.name === 'destroy');
    
    // MIDlet specific methods
    const hasStartAppMethod = javaClass.methods.some((m: any) => m.name === 'startApp');
    const hasPauseAppMethod = javaClass.methods.some((m: any) => m.name === 'pauseApp');
    const hasDestroyAppMethod = javaClass.methods.some((m: any) => m.name === 'destroyApp');
    
    console.log(`[JARRuntime] Class ${className} method availability:`, {
      init: hasInitMethod,
      start: hasStartMethod,
      paint: hasPaintMethod,
      stop: hasStopMethod,
      destroy: hasDestroyMethod,
      startApp: hasStartAppMethod,
      pauseApp: hasPauseAppMethod,
      destroyApp: hasDestroyAppMethod,
    });
    
    // Override methods to delegate to JVM
    const originalInit = baseApplet.init.bind(baseApplet);
    const originalStart = baseApplet.start.bind(baseApplet);
    const originalPaint = baseApplet.paint.bind(baseApplet);
    const originalStop = baseApplet.stop.bind(baseApplet);
    const originalDestroy = baseApplet.destroy.bind(baseApplet);
    
    // Wrap methods to call JVM if method exists
    baseApplet.init = () => {
      if (hasInitMethod) {
        try {
          this.interpreter.executeMethod(className, 'init', []);
          return;
        } catch (e) {
          console.warn("[JARRuntime] Error calling init via JVM:", e);
        }
      }
      // Fallback to default
      originalInit();
    };
    
    baseApplet.start = () => {
      // Try MIDlet startApp first
      if (hasStartAppMethod) {
        try {
          console.log("[JARRuntime] Calling MIDlet startApp()");
          this.interpreter.executeMethod(className, 'startApp', []);
          return;
        } catch (e) {
          console.warn("[JARRuntime] Error calling startApp via JVM:", e);
        }
      }
      
      // Try regular start
      if (hasStartMethod) {
        try {
          this.interpreter.executeMethod(className, 'start', []);
          return;
        } catch (e) {
          console.warn("[JARRuntime] Error calling start via JVM:", e);
        }
      }
      
      // Fallback to default
      originalStart();
    };
    
    let isPainting = false; // Prevent recursive paint calls
    baseApplet.paint = (g: Graphics) => {
      // Prevent recursive calls
      if (isPainting) {
        return;
      }
      
      isPainting = true;
      
      try {
        // Reset repaint flag before painting to prevent infinite loop
        if (baseApplet.isRepaintRequested()) {
          (baseApplet as any).repaintRequested = false;
        }
        
        if (hasPaintMethod) {
          try {
            this.interpreter.executeMethod(className, 'paint', [g]);
            return;
          } catch (e) {
            console.warn("[JARRuntime] Error calling paint via JVM:", e);
          }
        }
        
        // Fallback to default
        try {
          originalPaint(g);
        } catch (fallbackError) {
          console.error("[JARRuntime] Fallback paint also failed:", fallbackError);
        }
      } finally {
        isPainting = false;
      }
    };
    
    baseApplet.stop = () => {
      if (hasStopMethod) {
        try {
          this.interpreter.executeMethod(className, 'stop', []);
          return;
        } catch (e) {
          console.warn("[JARRuntime] Error calling stop via JVM:", e);
        }
      }
      // Fallback to default
      originalStop();
    };
    
    baseApplet.destroy = () => {
      if (hasDestroyMethod) {
        try {
          this.interpreter.executeMethod(className, 'destroy', []);
          return;
        } catch (e) {
          console.warn("[JARRuntime] Error calling destroy via JVM:", e);
        }
      }
      // Fallback to default
      originalDestroy();
    };
    
    return baseApplet;
  }

  /**
   * Start rendering loop
   */
  private startRenderingLoop(): void {
    console.log("[JARRuntime] Starting rendering loop");
    let lastRepaintTime = 0;
    const minRepaintInterval = 16; // ~60fps max
    let isPainting = false; // Prevent recursive paint calls
    let frameCount = 0;
    
    const render = () => {
      frameCount++;
      
      if (this.applet && this.graphics && !isPainting) {
        const now = Date.now();
        const needsRepaint = (this.applet.isRepaintRequested() || this.repaintRequested) && 
                            (now - lastRepaintTime >= minRepaintInterval);
        
        // Log first few frames for debugging
        if (frameCount <= 5) {
          console.log(`[JARRuntime] Frame ${frameCount}: needsRepaint=${needsRepaint}, appletRepaint=${this.applet.isRepaintRequested()}, runtimeRepaint=${this.repaintRequested}`);
        }
        
        if (needsRepaint) {
          if (frameCount <= 5) {
            console.log(`[JARRuntime] Painting frame ${frameCount}`);
          }
          
          isPainting = true;
          this.repaintRequested = false;
          
          // Clear repaint flag before painting
          if (this.applet.isRepaintRequested()) {
            (this.applet as any).repaintRequested = false;
          }
          
          lastRepaintTime = now;
          
          // Clear canvas
          const ctx = this.canvas.getContext("2d");
          if (ctx) {
            try {
              ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
              
              // Update graphics context
              this.graphics = new Graphics(ctx);
              
              // Paint applet (prevent repaint during paint)
              this.applet.paint(this.graphics);
              
              if (frameCount <= 5) {
                console.log(`[JARRuntime] Paint completed for frame ${frameCount}`);
              }
            } catch (error) {
              console.error("[JARRuntime] Error during paint:", error);
            }
          }
          
          isPainting = false;
        } else {
          // If no repaint requested, still check periodically (every 100ms)
          // This ensures the applet is rendered at least once
          if (now - lastRepaintTime > 100 && lastRepaintTime === 0) {
            // First render - force it
            console.log("[JARRuntime] Forcing first render");
            this.repaintRequested = true;
          }
        }
      } else {
        if (frameCount === 1) {
          console.warn("[JARRuntime] Rendering loop started but applet or graphics not ready:", {
            hasApplet: !!this.applet,
            hasGraphics: !!this.graphics,
            isPainting,
          });
        }
      }
      
      // Continue animation loop
      this.animationFrame = requestAnimationFrame(render);
    };
    
    this.animationFrame = requestAnimationFrame(render);
    console.log("[JARRuntime] Rendering loop started");
  }

  /**
   * Stop rendering loop
   */
  private stopRenderingLoop(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Request repaint
   */
  requestRepaint(): void {
    this.repaintRequested = true;
  }

  private showMessage(title: string, message: string): void {
    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      // Ensure canvas has valid dimensions
      if (this.canvas.width === 0 || this.canvas.height === 0) {
        this.canvas.width = 800;
        this.canvas.height = 600;
      }
      
      ctx.fillStyle = "#0a0612";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#a855f7";
      ctx.font = "24px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 20);
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "14px Orbitron";
      ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  private showError(message: string): void {
    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      // Ensure canvas has valid dimensions
      if (this.canvas.width === 0 || this.canvas.height === 0) {
        this.canvas.width = 800;
        this.canvas.height = 600;
      }
      
      ctx.fillStyle = "#0a0612";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#ff006e";
      ctx.font = "24px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(
        "Failed to load JAR",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20
      );
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "14px Orbitron";
      ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  destroy(): void {
    // Stop display rendering loop
    if (this.display) {
      this.display.stopRenderingLoop();
      this.display = null;
    }
    
    // Stop rendering loop
    this.stopRenderingLoop();
    
    // Destroy applet
    if (this.applet) {
      this.applet.stop();
      this.applet.destroy();
      this.applet = null;
    }
    
    // Dispose graphics
    if (this.graphics) {
      this.graphics.dispose();
      this.graphics = null;
    }
    
    // Remove canvas
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
  
  /**
   * Get Display instance (for external access)
   */
  getDisplay(): Display | null {
    return this.display;
  }
  
  /**
   * Get MIDlet instance (for external access)
   */
  getMIDletInstance(): any {
    return this.midletInstance;
  }
}

/**
 * Create JAR runtime in container
 */
export function createJARRuntime(containerId: string, config: RuntimeConfig): JARRuntime {
  return new JARRuntime(containerId, config);
}

