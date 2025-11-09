"use client";

import { parseJAR, JARFile } from "../parsers/jar";
import { JVMInterpreter, JavaBytecodeParser } from "../engines/jar-engine";
import { CanvasRenderer } from "../renderers/canvas-renderer";
import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";
import { Graphics } from "../awt/graphics";
import { Applet } from "../awt/applet";

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
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
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
      // For now, create a basic applet instance
      // In full implementation, would use JVM to instantiate the actual class
      this.applet = new Applet();
      
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
      
      // Start rendering loop
      this.startRenderingLoop();
      
      console.log("[JARRuntime] Applet initialized and started");
    } catch (error) {
      console.error("Failed to initialize applet:", error);
      this.showError(error instanceof Error ? error.message : "Unknown error");
    }
  }

  /**
   * Start rendering loop
   */
  private startRenderingLoop(): void {
    const render = () => {
      if (this.applet && this.graphics) {
        // Check if repaint is requested
        if (this.applet.isRepaintRequested() || this.repaintRequested) {
          this.repaintRequested = false;
          
          // Clear canvas
          const ctx = this.canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update graphics context
            this.graphics = new Graphics(ctx);
            
            // Paint applet
            this.applet.paint(this.graphics);
          }
        }
      }
      
      // Continue animation loop
      this.animationFrame = requestAnimationFrame(render);
    };
    
    this.animationFrame = requestAnimationFrame(render);
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
}

/**
 * Create JAR runtime in container
 */
export function createJARRuntime(containerId: string, config: RuntimeConfig): JARRuntime {
  return new JARRuntime(containerId, config);
}

