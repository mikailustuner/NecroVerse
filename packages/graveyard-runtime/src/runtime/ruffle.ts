"use client";

import { RuntimeConfig } from "../types";

export async function loadRuffleRuntime(): Promise<void> {
  if (typeof window === "undefined") return;

  // Dynamically load Ruffle
  if (!window.RufflePlayer) {
    const script = document.createElement("script");
    // Use the correct Ruffle CDN URL
    script.src = "https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle@0.2.0-nightly.2025.11.8/ruffle.min.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        // Wait for Ruffle to be fully initialized
        const checkRuffle = setInterval(() => {
          if (window.RufflePlayer) {
            clearInterval(checkRuffle);
            resolve();
          }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkRuffle);
          if (!window.RufflePlayer) {
            reject(new Error("Ruffle failed to initialize"));
          }
        }, 10000);
      };
      script.onerror = () => reject(new Error("Failed to load Ruffle"));
    });
  }
}

export function createRufflePlayer(
  containerId: string,
  config: RuntimeConfig
): void {
  if (typeof window === "undefined") {
    throw new Error("Window is not available");
  }

  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
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
      
      container.appendChild(player);

      // Load the SWF file - Ruffle API
      if (typeof (player as any).load === "function") {
        (player as any).load(config.url);
      } else if (typeof (player as any).loadFile === "function") {
        (player as any).loadFile(config.url);
      } else if ((player as any).setAttribute) {
        (player as any).setAttribute("src", config.url);
      } else {
        (player as any).src = config.url;
      }
      
      console.log("Ruffle player created with URL:", config.url);
    } else {
      // Fallback: Use ruffle-player web component directly
      const player = document.createElement("ruffle-player");
      player.setAttribute("src", config.url);
      player.style.width = "100%";
      player.style.height = "100%";
      player.style.display = "block";
      player.style.minHeight = "400px";
      
      container.appendChild(player);
      console.log("Ruffle web component created with URL:", config.url);
    }
  } catch (error) {
    console.error("Error creating Ruffle player:", error);
    throw error;
  }
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

