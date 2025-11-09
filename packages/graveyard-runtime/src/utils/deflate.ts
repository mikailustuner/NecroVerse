/**
 * Decompression utilities for compressed SWF files (CWS)
 * Uses browser's built-in decompression or pako library
 */

import pako from "pako";

export async function decompressZlib(data: Uint8Array): Promise<Uint8Array> {
  // Try using browser's DecompressionStream API (modern browsers)
  if (typeof DecompressionStream !== "undefined") {
    try {
      const stream = new DecompressionStream("deflate");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(data);
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }

      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }

      return result;
    } catch (error) {
      // Fall through to pako
    }
  }

  // Fallback: use pako library
  try {
    const decompressed = pako.inflate(data);
    return new Uint8Array(decompressed);
  } catch (error) {
    throw new Error(`Decompression failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

