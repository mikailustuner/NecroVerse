"use client";

import { RuntimeConfig } from "../types";

export function createCanvasRuntime(
  containerId: string,
  config: RuntimeConfig
): void {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container ${containerId} not found`);
  }

  const canvas = document.createElement("canvas");
  canvas.width = config.metadata.dimensions?.width || 800;
  canvas.height = config.metadata.dimensions?.height || 600;
  canvas.className = "border border-[#a855f7]/50 rounded-lg bg-[#0a0612]";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Simulate runtime visualization
    ctx.fillStyle = "#0a0612";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated background
    let frame = 0;
    const animate = () => {
      ctx.fillStyle = "#0a0612";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw data veins
      ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 + Math.sin(frame * 0.1) * 0.2})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 5) * i);
        ctx.lineTo(
          canvas.width,
          (canvas.height / 5) * i + Math.sin(frame * 0.05 + i) * 50
        );
        ctx.stroke();
      }

      // Draw title
      ctx.fillStyle = "#a855f7";
      ctx.font = "32px Orbitron";
      ctx.textAlign = "center";
      ctx.fillText(
        `${config.metadata.type.toUpperCase()} Runtime`,
        canvas.width / 2,
        canvas.height / 2 - 40
      );
      ctx.fillStyle = "#00fff7";
      ctx.font = "18px Orbitron";
      ctx.fillText(
        "Resurrected Experience",
        canvas.width / 2,
        canvas.height / 2 + 20
      );

      frame++;
      requestAnimationFrame(animate);
    };

    animate();
  }
}

