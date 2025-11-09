/**
 * Test helpers and utilities
 */

import { SWFFile } from "../src/parsers/swf";
import { DCRFile } from "../src/parsers/dcr";
import { XAPFile } from "../src/parsers/xap";
import { JavaClass } from "../src/parsers/jar-bytecode";

/**
 * Create mock SWF file
 */
export function createMockSWF(): SWFFile {
  return {
    header: {
      version: 1,
      fileLength: 0,
      frameSize: {
        xMin: 0,
        xMax: 800,
        yMin: 0,
        yMax: 600,
      },
      frameRate: 12,
      frameCount: 1,
    },
    tags: [],
  };
}

/**
 * Create mock DCR file
 */
export function createMockDCR(): DCRFile {
  return {
    header: {
      version: 1,
      dimensions: {
        width: 800,
        height: 600,
      },
    },
    sprites: [],
    frames: [],
    scripts: {},
  };
}

/**
 * Create mock XAP file
 */
export function createMockXAP(): XAPFile {
  return {
    manifest: {
      entryPoint: "App.xaml",
    },
    files: new Map(),
  };
}

/**
 * Create mock Java class
 */
export function createMockJavaClass(): JavaClass {
  return {
    magic: 0xcafebabe,
    minorVersion: 0,
    majorVersion: 52,
    constantPool: [],
    accessFlags: 0,
    thisClass: 0,
    superClass: 0,
    interfaces: [],
    fields: [],
    methods: [],
    attributes: [],
  };
}

/**
 * Wait for async operation
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock canvas element
 */
export function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
}

