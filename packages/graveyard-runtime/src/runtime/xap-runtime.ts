"use client";

import { parseXAP, XAPFile } from "../parsers/xap";
import { XAPEngine } from "../engines/xap-engine";
import { CanvasRenderer } from "../renderers/canvas-renderer";
import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";

/**
 * Custom XAP Runtime
 * Executes Silverlight applications
 */
export class XAPRuntime {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private engine: XAPEngine | null = null;
  private xap: XAPFile | null = null;

  constructor(containerId: string, config: RuntimeConfig) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
    this.canvas.className = "border border-[#a855f7]/50 rounded-lg";
    container.appendChild(this.canvas);

    // Initialize renderer
    const width = config.metadata.dimensions?.width || 800;
    const height = config.metadata.dimensions?.height || 600;
    this.renderer = new CanvasRenderer(this.canvas, width, height);

    // Load and parse XAP
    this.loadXAP(config.url);
  }

  private async loadXAP(url: string): Promise<void> {
    try {
      // Fetch XAP file
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Parse XAP
      this.xap = await parseXAP(arrayBuffer);

      // Create engine
      this.engine = new XAPEngine(this.xap, this.renderer);

      // Initialize and render
      this.engine.initialize();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("Failed to load XAP", err, { url });
      this.showError(err.message);
      throw err;
    }
  }

  private showError(message: string): void {
    const ctx = this.canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0a0612";
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.fillStyle = "#ff006e";
      ctx.font = "24px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(
        "Failed to load XAP",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20
      );
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "14px Orbitron";
      ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  destroy(): void {
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

/**
 * Create XAP runtime in container
 */
export function createXAPRuntime(containerId: string, config: RuntimeConfig): XAPRuntime {
  return new XAPRuntime(containerId, config);
}

