"use client";

import { parseDCR, DCRFile } from "../parsers/dcr";
import { DCREngine } from "../engines/dcr-engine";
import { CanvasRenderer } from "../renderers/canvas-renderer";
import { RuntimeConfig } from "../types";
import { Logger } from "../utils/logger";

/**
 * Custom DCR Runtime
 * Executes Shockwave Director content
 */
export class DCRRuntime {
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private engine: DCREngine | null = null;
  private dcr: DCRFile | null = null;

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

    // Load and parse DCR
    this.loadDCR(config.url);
  }

  private async loadDCR(url: string): Promise<void> {
    try {
      // Fetch DCR file
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Parse DCR
      this.dcr = parseDCR(arrayBuffer);

      // Update canvas size
      const width = this.dcr.header.dimensions?.width || 800;
      const height = this.dcr.header.dimensions?.height || 600;
      this.canvas.width = width;
      this.canvas.height = height;
      this.renderer = new CanvasRenderer(this.canvas, width, height);

      // Create engine
      this.engine = new DCREngine(this.dcr, this.renderer);

      // Set up interactivity
      this.setupInteractivity();

      // Start playback
      this.engine.play();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error("Failed to load DCR", err, { url });
      this.showError(err.message);
      throw err;
    }
  }

  private setupInteractivity(): void {
    // Mouse events
    this.canvas.addEventListener("mousedown", (e) => {
      if (this.engine) {
        this.engine.handleMouseEvent(e, this.canvas);
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (this.engine) {
        this.engine.handleMouseEvent(e, this.canvas);
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.engine) {
        this.engine.handleMouseEvent(e, this.canvas);
      }
    });
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
        "Failed to load DCR",
        this.canvas.width / 2,
        this.canvas.height / 2 - 20
      );
      ctx.fillStyle = "#f5f5f5";
      ctx.font = "14px Orbitron";
      ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  destroy(): void {
    if (this.engine) {
      this.engine.stop();
    }
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

/**
 * Create DCR runtime in container
 */
export function createDCRRuntime(containerId: string, config: RuntimeConfig): DCRRuntime {
  return new DCRRuntime(containerId, config);
}

