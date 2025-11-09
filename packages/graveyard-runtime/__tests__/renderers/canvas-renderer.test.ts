import { describe, it, expect, beforeEach } from "vitest";
import { CanvasRenderer, SWFShape } from "../../src/renderers/canvas-renderer";
import { createMockCanvas } from "../helpers";

describe("CanvasRenderer", () => {
  let renderer: CanvasRenderer;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createMockCanvas();
    renderer = new CanvasRenderer(canvas, 800, 600);
  });

  it("should initialize", () => {
    expect(renderer).toBeDefined();
  });

  it("should clear canvas", () => {
    expect(() => renderer.clear()).not.toThrow();
  });

  it("should draw shape", () => {
    const shape: SWFShape = {
      paths: [
        {
          startX: 0,
          startY: 0,
          segments: [
            { type: "line", x: 100, y: 0 },
            { type: "line", x: 100, y: 100 },
            { type: "line", x: 0, y: 100 },
          ],
        },
      ],
      fillStyle: {
        type: "solid",
        color: "#ff0000",
      },
    };
    expect(() => renderer.drawShape(shape)).not.toThrow();
  });

  it("should set image smoothing", () => {
    expect(() => renderer.setImageSmoothing(true, "high")).not.toThrow();
    expect(() => renderer.setImageSmoothing(false)).not.toThrow();
  });
});

