"use client";

import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";
import { loadRuffleRuntime } from "./ruffle";

/**
 * SWF Runtime using Ruffle
 * Uses Ruffle for SWF playback
 */
export class SWFRuntime {
  private container: HTMLElement;
  private player: HTMLElement | null = null;
  private config: RuntimeConfig;

  constructor(containerId: string, config: RuntimeConfig) {
    console.log("🚀🚀🚀 SWF RUNTIME STARTING (Ruffle) 🚀🚀🚀");
    console.log("[SWFRuntime] Initializing runtime for container:", containerId);
    console.log("[SWFRuntime] Config:", config);
    
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("❌ Container not found:", containerId);
      throw new Error(`Container ${containerId} not found`);
    }
    
    console.log("✅ Container found:", containerId);
    
    this.container = container;
    this.config = config;

    // Load Ruffle and create player (async, but don't await in constructor)
    this.initializeRuffle().catch((error) => {
      console.error("[SWFRuntime] Failed to initialize Ruffle:", error);
      this.showError(error);
    });
  }

  private async initializeRuffle(): Promise<void> {
    console.log("📥📥📥 LOADING RUFFLE RUNTIME 📥📥📥");
    
    try {
      // Load Ruffle runtime
      await loadRuffleRuntime();
      console.log("✅✅✅ RUFFLE LOADED ✅✅✅");

      // Wait a bit for Ruffle to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create Ruffle player
      console.log("⚙️⚙️⚙️ CREATING RUFFLE PLAYER ⚙️⚙️⚙️");
      this.createPlayer();
      console.log("✅✅✅ RUFFLE PLAYER CREATED ✅✅✅");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("Failed to initialize Ruffle", err, { url: this.config.url });
      throw err;
    }
  }

  private createPlayer(): void {
    if (typeof window === "undefined") {
      throw new Error("Window is not available");
    }

    try {
      // Try using RufflePlayer API if available
      if (window.RufflePlayer) {
        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();
        
        // Set player style
        (player as HTMLElement).style.width = "100%";
        (player as HTMLElement).style.height = "100%";
        (player as HTMLElement).style.display = "block";
        (player as HTMLElement).style.minHeight = "400px";
        (player as HTMLElement).style.backgroundColor = "#0a0612";
        (player as HTMLElement).className = "border border-[#a855f7]/50 rounded-lg";
        
        this.container.appendChild(player);
        this.player = player;

        // Load the SWF file - Ruffle API
        if (typeof (player as any).load === "function") {
          (player as any).load(this.config.url);
        } else if (typeof (player as any).loadFile === "function") {
          (player as any).loadFile(this.config.url);
        } else if ((player as any).setAttribute) {
          (player as any).setAttribute("src", this.config.url);
        } else {
          (player as any).src = this.config.url;
        }
        
        console.log("[SWFRuntime] Ruffle player created with URL:", this.config.url);
      } else {
        // Fallback: Use ruffle-player web component directly
        const player = document.createElement("ruffle-player");
        player.setAttribute("src", this.config.url);
        player.style.width = "100%";
        player.style.height = "100%";
        player.style.display = "block";
        player.style.minHeight = "400px";
        player.style.backgroundColor = "#0a0612";
        player.className = "border border-[#a855f7]/50 rounded-lg";
        
        this.container.appendChild(player);
        this.player = player;
        console.log("[SWFRuntime] Ruffle web component created with URL:", this.config.url);
      }
    } catch (error) {
      console.error("[SWFRuntime] Error creating Ruffle player:", error);
      throw error;
    }
  }

  private showError(error: Error): void {
    // Create error display
    const errorDiv = document.createElement("div");
    errorDiv.style.width = "100%";
    errorDiv.style.height = "100%";
    errorDiv.style.display = "flex";
    errorDiv.style.flexDirection = "column";
    errorDiv.style.alignItems = "center";
    errorDiv.style.justifyContent = "center";
    errorDiv.style.backgroundColor = "#0a0612";
    errorDiv.style.color = "#ff006e";
    errorDiv.style.padding = "20px";
    errorDiv.style.textAlign = "center";
    errorDiv.className = "border border-[#a855f7]/50 rounded-lg";
    
    const title = document.createElement("div");
    title.textContent = "Failed to load SWF";
    title.style.fontSize = "24px";
    title.style.fontFamily = "Orbitron, sans-serif";
    title.style.marginBottom = "10px";
    
    const message = document.createElement("div");
    message.textContent = error.message;
    message.style.fontSize = "14px";
    message.style.fontFamily = "Orbitron, sans-serif";
    message.style.color = "#f5f5f5";
    
    errorDiv.appendChild(title);
    errorDiv.appendChild(message);
    this.container.appendChild(errorDiv);
  }

  destroy(): void {
    if (this.player && this.player.parentNode) {
      this.player.parentNode.removeChild(this.player);
    }
    // Clear container
    this.container.innerHTML = "";
  }
}

/**
 * Create SWF runtime in container using Ruffle
 */
export function createSWFRuntime(containerId: string, config: RuntimeConfig): SWFRuntime {
  return new SWFRuntime(containerId, config);
}

declare global {
  interface Window {
    RufflePlayer?: {
      newest: () => {
        createPlayer: () => HTMLElement;
      };
    };
  }
  
  // Ruffle web component
  namespace JSX {
    interface IntrinsicElements {
      "ruffle-player": {
        src?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

