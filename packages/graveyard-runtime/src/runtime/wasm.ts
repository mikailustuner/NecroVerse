"use client";

import { RuntimeConfig } from "../types";

export async function loadWASMRuntime(
  wasmUrl: string
): Promise<WebAssembly.Module> {
  const response = await fetch(wasmUrl);
  const bytes = await response.arrayBuffer();
  return WebAssembly.compile(bytes);
}

export async function createWASMRunner(
  containerId: string,
  config: RuntimeConfig
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
  }

  // For JAR files, we'd need a Java-to-WASM compiler
  // For now, create a simulated environment
  const canvas = document.createElement("canvas");
  canvas.width = config.metadata.dimensions?.width || 800;
  canvas.height = config.metadata.dimensions?.height || 600;
  canvas.className = "border border-[#a855f7]/50 rounded-lg";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#a855f7";
    ctx.font = "24px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(
      "Java Applet Runtime",
      canvas.width / 2,
      canvas.height / 2 - 20
    );
    ctx.fillText(
      "Simulated Environment",
      canvas.width / 2,
      canvas.height / 2 + 20
    );
  }
}

