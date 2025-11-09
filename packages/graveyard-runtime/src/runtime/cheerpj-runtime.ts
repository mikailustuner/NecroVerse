/**
 * CheerpJ-based JAR Runtime
 * Uses CheerpJ to run Java applications in the browser
 */

import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";

// Declare CheerpJ global types
declare global {
  interface Window {
    cheerpjInit: (options?: any) => Promise<void>;
    cheerpjRunJar: (jarPath: string, ...args: string[]) => Promise<number>;
    cheerpjRunMain: (className: string, classPath: string, ...args: string[]) => Promise<number>;
    cheerpjCreateDisplay: (width: number, height: number, parent?: HTMLElement) => HTMLElement;
    cjCall: (className: string, methodName: string, ...args: any[]) => Promise<any>;
    cjNew: (className: string, ...args: any[]) => Promise<any>;
  }
}

/**
 * CheerpJ JAR Runtime
 */
export class CheerpJRuntime {
  private container: HTMLElement;
  private config: RuntimeConfig;
  private initialized: boolean = false;
  private displayElement: HTMLElement | null = null;

  constructor(containerId: string, config: RuntimeConfig) {
    console.log("🚀 CheerpJ Runtime Starting");
    console.log("[CheerpJRuntime] Config:", config);

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.container = container;
    this.config = config;

    // Initialize CheerpJ
    this.initialize().catch((error) => {
      console.error("[CheerpJRuntime] Initialization failed:", error);
      this.showError(error.message);
    });
  }

  private async initialize(): Promise<void> {
    try {
      // Show loading message
      this.showMessage("CheerpJ Runtime", "Loading Java environment...");

      // Load CheerpJ script if not already loaded
      if (!window.cheerpjInit) {
        await this.loadCheerpJScript();
      }

      // Check if CheerpJ is already initialized
      // CheerpJ sets a global flag when initialized
      const alreadyInitialized = (window as any).__cheerpjInitialized;

      if (!alreadyInitialized) {
        // Initialize CheerpJ
        console.log("[CheerpJRuntime] Initializing CheerpJ...");
        await window.cheerpjInit({
          version: 3,
          enableInputMethods: true,
          enablePreciseTimers: true,
        });
        
        // Mark as initialized
        (window as any).__cheerpjInitialized = true;
        console.log("[CheerpJRuntime] CheerpJ initialized successfully");
      } else {
        console.log("[CheerpJRuntime] CheerpJ already initialized, skipping");
      }

      this.initialized = true;

      // Create display
      const width = Math.abs(this.config.metadata?.dimensions?.width || 800);
      const height = Math.abs(this.config.metadata?.dimensions?.height || 600);

      console.log("[CheerpJRuntime] Creating display:", width, "x", height);
      this.displayElement = window.cheerpjCreateDisplay(width, height, this.container);

      // Style the display
      if (this.displayElement) {
        this.displayElement.style.width = "auto";
        this.displayElement.style.height = "auto";
        this.displayElement.style.maxWidth = "100%";
        this.displayElement.style.maxHeight = "100%";
        this.displayElement.style.margin = "0 auto";
        this.displayElement.style.display = "block";
      }

      // Run the JAR
      await this.runJAR();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("CheerpJ initialization failed", err, { config: this.config });
      throw err;
    }
  }

  private async loadCheerpJScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector('script[src*="cj3loader.js"]');
      if (existingScript) {
        console.log("[CheerpJRuntime] CheerpJ script already loaded");
        resolve();
        return;
      }

      console.log("[CheerpJRuntime] Loading CheerpJ script...");

      const script = document.createElement("script");
      script.src = "https://cjrtnc.leaningtech.com/3.0/cj3loader.js";
      script.async = true;

      script.onload = () => {
        console.log("[CheerpJRuntime] CheerpJ script loaded");
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Failed to load CheerpJ script"));
      };

      document.head.appendChild(script);
    });
  }

  private async runJAR(): Promise<void> {
    try {
      console.log("[CheerpJRuntime] Running JAR:", this.config.url);

      // Show running message
      this.showMessage("CheerpJ Runtime", "Starting application...");

      // Download JAR to virtual filesystem
      const jarPath = "/app/application.jar";
      
      // Fetch JAR file
      const response = await fetch(this.config.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch JAR: ${response.status} ${response.statusText}`);
      }

      const jarData = await response.arrayBuffer();
      console.log("[CheerpJRuntime] JAR downloaded, size:", jarData.byteLength);

      // Write to CheerpJ virtual filesystem
      // Note: CheerpJ 3.0 handles this automatically when using URLs
      // We can pass the URL directly to cheerpjRunJar

      // Clear loading message
      const loadingMsg = this.container.querySelector(".loading-message");
      if (loadingMsg) {
        loadingMsg.remove();
      }

      // Run the JAR
      console.log("[CheerpJRuntime] Executing JAR...");
      const exitCode = await window.cheerpjRunJar(this.config.url);
      
      console.log("[CheerpJRuntime] JAR execution completed with exit code:", exitCode);

      if (exitCode !== 0) {
        console.warn("[CheerpJRuntime] JAR exited with non-zero code:", exitCode);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("Failed to run JAR", err, { url: this.config.url });
      console.error("[CheerpJRuntime] Failed to run JAR:", err);
      this.showError(err.message);
      throw err;
    }
  }

  private showMessage(title: string, message: string): void {
    // Remove existing message
    const existing = this.container.querySelector(".loading-message");
    if (existing) {
      existing.remove();
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = "loading-message";
    messageDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #a855f7;
      font-family: 'Orbitron', monospace;
      z-index: 1000;
    `;

    messageDiv.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${title}</div>
      <div style="font-size: 14px; color: #f5f5f5;">${message}</div>
    `;

    this.container.appendChild(messageDiv);
  }

  private showError(message: string): void {
    // Remove existing message
    const existing = this.container.querySelector(".loading-message");
    if (existing) {
      existing.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #ff006e;
      font-family: 'Orbitron', monospace;
      padding: 20px;
      background: rgba(10, 6, 18, 0.9);
      border: 1px solid #ff006e;
      border-radius: 8px;
      max-width: 80%;
      z-index: 1000;
    `;

    errorDiv.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">Failed to load JAR</div>
      <div style="font-size: 14px; color: #f5f5f5;">${message}</div>
    `;

    this.container.appendChild(errorDiv);
  }

  destroy(): void {
    console.log("[CheerpJRuntime] Destroying runtime");

    // Remove display element
    if (this.displayElement && this.displayElement.parentNode) {
      this.displayElement.parentNode.removeChild(this.displayElement);
    }

    // Clear container
    this.container.innerHTML = "";
  }
}

/**
 * Create CheerpJ runtime
 */
export function createCheerpJRuntime(
  containerId: string,
  config: RuntimeConfig
): CheerpJRuntime {
  return new CheerpJRuntime(containerId, config);
}
