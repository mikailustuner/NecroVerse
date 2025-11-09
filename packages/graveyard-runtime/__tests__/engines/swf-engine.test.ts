import { describe, it, expect, beforeEach } from "vitest";
import { SWFEngine } from "../../src/engines/swf-engine";
import { CanvasRenderer } from "../../src/renderers/canvas-renderer";
import { createMockSWF, createMockCanvas } from "../helpers";

describe("SWFEngine", () => {
  let engine: SWFEngine;
  let renderer: CanvasRenderer;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createMockCanvas();
    renderer = new CanvasRenderer(canvas, 800, 600);
    const swf = createMockSWF();
    engine = new SWFEngine(swf, renderer);
  });

  it("should initialize with SWF file", () => {
    expect(engine).toBeDefined();
  });

  it("should render frame", () => {
    expect(() => engine.render()).not.toThrow();
  });

  it("should play animation", () => {
    expect(() => engine.play()).not.toThrow();
  });

  it("should stop animation", () => {
    engine.play();
    expect(() => engine.stop()).not.toThrow();
  });

  it("should goto frame", () => {
    expect(() => engine.gotoFrame(1)).not.toThrow();
  });
});

