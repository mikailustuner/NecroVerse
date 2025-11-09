import { SWFFile, SWFTag } from "../parsers/swf";
import { CanvasRenderer, SWFShape } from "../renderers/canvas-renderer";
import { BinaryReader } from "../utils/binary-reader";
import { ActionScriptInterpreter, ActionScriptContext } from "./actionscript";
import { AudioManager } from "./audio-manager";
import { VideoManager } from "./video-manager";

/**
 * SWF Execution Engine
 * 
 * Handles timeline, sprites, buttons, and rendering for SWF files.
 * Supports ActionScript v1.0 execution, audio playback, and interactive elements.
 * 
 * @example
 * ```typescript
 * const swfFile = await parseSWF(arrayBuffer);
 * const canvas = document.getElementById("canvas") as HTMLCanvasElement;
 * const renderer = new CanvasRenderer(canvas, 800, 600);
 * const engine = new SWFEngine(swfFile, renderer);
 * engine.play();
 * ```
 */
export class SWFEngine {
  private swf: SWFFile;
  private renderer: CanvasRenderer;
  private currentFrame: number = 0;
  private displayList: DisplayObject[] = [];
  private shapes: Map<number, SWFShape> = new Map();
  private sprites: Map<number, SWFSprite> = new Map();
  private spriteInstances: Map<number, SpriteInstance> = new Map(); // Active sprite instances
  private frameRate: number = 12;
  private animationId?: number;
  private actionScript: ActionScriptInterpreter;
  private actionScriptContext: ActionScriptContext;
  private buttons: Map<number, SWFButton> = new Map();
  private textFields: Map<number, SWFTextField> = new Map();
  private bitmaps: Map<number, { characterId: number; data: Uint8Array }> = new Map(); // Bitmap characters
  private mouseState: { x: number; y: number; down: boolean } = { x: 0, y: 0, down: false };
  private frameTags: Map<number, SWFTag[]> = new Map(); // Tags per frame
  private frameBoundaries: number[] = []; // Frame boundary positions in tags array

  private draggingObject: { depth: number; lockCenter: boolean; bounds?: { left?: number; top?: number; right?: number; bottom?: number } } | null = null;
  private audioManager: AudioManager;
  private videoManager: VideoManager;
  private sounds: Map<number, { format: number; sampleRate: number; channels: number; sampleCount: number; data: ArrayBuffer }> = new Map();
  private videoStreams: Map<number, number> = new Map(); // characterId -> streamId mapping
  private hasLoggedFrame0: boolean = false; // Track if we've logged frame 0 summary
  private hasLoggedRendering: boolean = false; // Track if we've logged rendering details
  private missingCharacters: Set<number> = new Set(); // Track missing characters to avoid spam

  constructor(swf: SWFFile, renderer: CanvasRenderer) {
    this.swf = swf;
    this.renderer = renderer;
    this.frameRate = swf.header.frameRate;
    this.audioManager = new AudioManager();
    this.videoManager = new VideoManager(renderer.canvasElement);
    
    // Initialize ActionScript context
    this.actionScriptContext = {
      variables: {},
      functions: {},
      timeline: {
        currentFrame: 0,
        totalFrames: swf.header.frameCount,
        gotoFrame: (frame: number) => this.gotoFrame(frame),
        play: () => this.play(),
        stop: () => this.stop(),
      },
      // Display object access
      getDisplayObjectProperty: (target: string | number, property: number) => {
        return this.getDisplayObjectProperty(target, property);
      },
      setDisplayObjectProperty: (target: string | number, property: number, value: any) => {
        this.setDisplayObjectProperty(target, property, value);
      },
      // Sprite operations
      cloneSprite: (depth: number, newDepth: number) => {
        this.cloneSprite(depth, newDepth);
      },
      removeSprite: (depth: number) => {
        this.removeSprite(depth);
      },
      // Drag operations
      startDrag: (target: string | number, lockCenter: boolean, left?: number, top?: number, right?: number, bottom?: number) => {
        this.startDrag(target, lockCenter, left, top, right, bottom);
      },
      stopDrag: () => {
        this.stopDrag();
      },
    };
    
    this.actionScript = new ActionScriptInterpreter(this.actionScriptContext);
    
    // Add ActionScript functions for interactivity
    this.actionScriptContext.functions["_xmouse"] = () => this.mouseState.x;
    this.actionScriptContext.functions["_ymouse"] = () => this.mouseState.y;
    this.actionScriptContext.functions["_mouseDown"] = () => this.mouseState.down ? 1 : 0;
    
    this.parseTags();
    this.buildFrameStructure();
  }

  /**
   * Create a BinaryReader for tag data, properly handling buffer offset.
   * tag.data is a Uint8Array view into a larger buffer, so we need to create
   * a copy to ensure we start at byte 0.
   */
  private createTagReader(tag: SWFTag): BinaryReader {
    // Create a copy of the tag data to ensure we start at byte 0
    const dataCopy = new Uint8Array(tag.data);
    return new BinaryReader(dataCopy.buffer, false);
  }

  private parseTags(): void {
    // First pass: parse all definition tags (shapes, sprites, buttons, etc.)
    let shapeCount = 0;
    let spriteCount = 0;
    let buttonCount = 0;
    
    for (const tag of this.swf.tags) {
      switch (tag.code) {
        case 2: // DefineShape
        case 22: // DefineShape2
        case 28: // DefineShape3
        case 43: // DefineShape4
          this.parseDefineShape(tag);
          shapeCount++;
          break;
        case 37: // DefineSprite
          this.parseDefineSprite(tag);
          spriteCount++;
          break;
        case 7: // DefineButton
        case 33: // DefineButton2
          this.parseDefineButton(tag);
          buttonCount++;
          break;
        case 9: // SetBackgroundColor
          this.parseSetBackgroundColor(tag);
          break;
        case 14: // DefineSound
          this.parseDefineSound(tag);
          break;
        case 15: // StartSound
        case 89: // StartSound2
          this.parseStartSound(tag);
          break;
        case 36: // DefineEditText
          this.parseDefineEditText(tag);
          break;
        case 6: // DefineBits
        case 20: // DefineBitsLossless
        case 21: // DefineBitsJPEG2
        case 34: // DefineBitsJPEG3
        case 35: // DefineBitsLossless2
          this.parseDefineBits(tag);
          break;
        case 60: // DefineVideoStream
          this.parseDefineVideoStream(tag);
          break;
      }
    }
    
    // Log all tag types found
    const tagTypes = new Map<number, number>();
    for (const tag of this.swf.tags) {
      tagTypes.set(tag.code, (tagTypes.get(tag.code) || 0) + 1);
    }
    
    const tagSummary = Array.from(tagTypes.entries())
      .map(([code, count]) => {
        const tagName = code === 0 ? "End" :
                       code === 1 ? "ShowFrame" :
                       code === 2 ? "DefineShape" :
                       code === 4 ? "PlaceObject" :
                       code === 7 ? "DefineButton" :
                       code === 9 ? "SetBackgroundColor" :
                       code === 14 ? "DefineSound" :
                       code === 15 ? "StartSound" :
                       code === 22 ? "DefineShape2" :
                       code === 26 ? "PlaceObject2" :
                       code === 28 ? "DefineShape3" :
                       code === 33 ? "DefineButton2" :
                       code === 36 ? "DefineEditText" :
                       code === 37 ? "DefineSprite" :
                       code === 42 ? "DefineScalingGrid" :
                       code === 43 ? "DefineShape4" :
                       code === 45 ? "DefineBinaryData" :
                       code === 89 ? "StartSound2" :
                       code === 70 ? "PlaceObject3" :
                       `Unknown_${code}`;
        return `${tagName}:${count}`;
      })
      .join(', ');
    
    console.log(`\n🎯🎯🎯 [SWFEngine] ===== TAG SUMMARY ===== 🎯🎯🎯`);
    console.log(`[SWFEngine] Parsed: ${shapeCount} shapes, ${spriteCount} sprites, ${buttonCount} buttons, ${this.textFields.size} textFields`);
    console.log(`[SWFEngine] Total tags: ${this.swf.tags.length}`);
    console.log(`[SWFEngine] Tag breakdown: ${tagSummary}`);
    console.log(`[SWFEngine] ======================================\n`);
    
    // Force console output
    if (this.swf.tags.length < 10) {
      console.warn(`[SWFEngine] ⚠️ WARNING: Only ${this.swf.tags.length} tags found! This SWF may be incomplete.`);
    }
    
    // Warn if no visual content
    if (shapeCount === 0 && spriteCount === 0 && buttonCount === 0 && this.textFields.size === 0) {
      console.warn(`[SWFEngine] WARNING: No visual content found! This SWF may be incomplete or only contain binary data.`);
    }
  }

  /**
   * Build frame structure by tracking ShowFrame tags
   */
  private buildFrameStructure(): void {
    let currentFrameIndex = 0;
    const frameTags: SWFTag[] = [];

    for (const tag of this.swf.tags) {
      if (tag.code === 1) {
        // ShowFrame - frame boundary
        // Save tags for current frame before moving to next
        if (frameTags.length > 0) {
          this.frameTags.set(currentFrameIndex, [...frameTags]);
          this.frameBoundaries.push(currentFrameIndex);
        } else if (currentFrameIndex === 0) {
          // Even if no tags, ensure frame 0 exists
          this.frameTags.set(currentFrameIndex, []);
          this.frameBoundaries.push(currentFrameIndex);
        }
        currentFrameIndex++;
        frameTags.length = 0; // Clear for next frame
      } else {
        // Add tag to current frame
        frameTags.push(tag);
      }
    }

    // Handle last frame if no ShowFrame at end
    if (frameTags.length > 0) {
      this.frameTags.set(currentFrameIndex, [...frameTags]);
      this.frameBoundaries.push(currentFrameIndex);
    } else if (currentFrameIndex === 0) {
      // If no ShowFrame tags at all, put all tags in frame 0
      const allTags: SWFTag[] = [];
      for (const tag of this.swf.tags) {
        if (tag.code !== 1) { // Exclude ShowFrame tags
          allTags.push(tag);
        }
      }
      if (allTags.length > 0) {
        this.frameTags.set(0, allTags);
        this.frameBoundaries.push(0);
      }
    }
    
    // Debug: Log frame structure
    console.log(`[SWFEngine] Built frame structure: ${this.frameBoundaries.length} frames, frame 0 has ${this.frameTags.get(0)?.length || 0} tags`);
  }

  /**
   * Process tags for a specific frame
   */
  private processFrameTags(frameIndex: number): void {
    const tags = this.frameTags.get(frameIndex) || [];
    
    // Process frame tags silently

    for (const tag of tags) {
      switch (tag.code) {
        case 4: // PlaceObject (old version)
        case 26: // PlaceObject2
        case 70: // PlaceObject3
          this.parsePlaceObject(tag);
          break;
        case 12: // DoAction
          this.parseDoAction(tag);
          break;
        case 27: // RemoveObject
        case 28: // RemoveObject2
          this.parseRemoveObject(tag);
          break;
        case 9: // SetBackgroundColor
          this.parseSetBackgroundColor(tag);
          break;
        case 61: // VideoFrame
          this.parseVideoFrame(tag);
          break;
      }
    }
  }

  private parseDefineShape(tag: SWFTag): void {
    try {
      const reader = this.createTagReader(tag);
      
      // Check if we have enough data for shapeId (2 bytes)
      if (reader.remaining < 2) {
        console.warn(`[SWFEngine] parseDefineShape: Not enough data for shapeId, remaining: ${reader.remaining}`);
        return;
      }
      
      const shapeId = reader.readUint16();
      
      const beforeRectPos = reader.position;
      
      // Check if we have enough data for RECT (at least 1 byte for nBits)
      if (reader.remaining < 1) {
        console.warn(`[SWFEngine] parseDefineShape: Not enough data for RECT, remaining: ${reader.remaining}`);
        return;
      }
      
      // Parse shape bounds (RECT) - use signed bits for coordinates
      const nBits = reader.readBits(5);
      
      // Validate nBits - should be reasonable (0-31, but typically 1-16 for coordinates)
      if (nBits < 0 || nBits > 31) {
        console.warn(`[SWFEngine] parseDefineShape: Invalid nBits value: ${nBits}, skipping shape ${shapeId}`);
        return;
      }
      
      // Calculate minimum bytes needed for RECT (5 bits for nBits + nBits * 4 for coordinates)
      // Total bits = 5 + 4 * nBits, convert to bytes
      const totalBitsNeeded = 5 + (nBits * 4);
      const minBytesNeeded = Math.ceil(totalBitsNeeded / 8);
      
      // Check if we have enough bytes available
      // Note: remaining is in bytes, and we need at least minBytesNeeded bytes
      if (reader.remaining < minBytesNeeded) {
        console.warn(`[SWFEngine] parseDefineShape: Not enough data for RECT coordinates, need ${minBytesNeeded} bytes (${totalBitsNeeded} bits), have ${reader.remaining} bytes`);
        return;
      }
      
      const xMin = reader.readSignedBits(nBits) / 20;
      const xMax = reader.readSignedBits(nBits) / 20;
      const yMin = reader.readSignedBits(nBits) / 20;
      const yMax = reader.readSignedBits(nBits) / 20;
      reader.alignToByte();
      
      const afterRectPos = reader.position;
      const startRemaining = reader.remaining;
      
      // Debug logging for first shape only
      const isFirstShape = this.shapes.size === 0;
      if (isFirstShape) {
        console.log(`[SWFEngine] parseDefineShape: shapeId=${shapeId}, nBits=${nBits}, bounds=(${xMin},${yMin}) to (${xMax},${yMax})`);
        console.log(`[SWFEngine] parseDefineShape: beforeRect=${beforeRectPos} bits, afterRect=${afterRectPos} bits, remaining=${startRemaining} bytes`);
        // Peek at next few bytes using peekUint8
        const peekBytes = [];
        const savedPosition = reader.position;
        for (let i = 0; i < 4 && reader.remaining > 0; i++) {
          try {
            const byteValue = reader.peekUint8();
            peekBytes.push(byteValue);
            reader.skip(1);
          } catch (e) {
            break;
          }
        }
        reader.position = savedPosition;
        if (peekBytes.length > 0) {
          console.log(`[SWFEngine] parseDefineShape: next ${peekBytes.length} bytes: ${peekBytes.map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')}`);
        }
      }
      
      // Parse shape with styles and paths
      const shape = this.parseShape(reader, xMin, xMax, yMin, yMax);
      
      // Debug logging for first shape only
      if (isFirstShape) {
        console.log(`[SWFEngine] Parsing shape ${shapeId}: bounds=(${xMin},${yMin}) to (${xMax},${yMax}), remaining=${startRemaining} -> ${reader.remaining}, paths=${shape.paths.length}`);
      }
      
      this.shapes.set(shapeId, shape);
    } catch (error) {
      console.error(`[SWFEngine] parseDefineShape: Error parsing shape:`, error);
      // Don't throw - just skip this shape and continue with others
    }
  }

  private parseShape(reader: BinaryReader, xMin: number, xMax: number, yMin: number, yMax: number): SWFShape {
    // Parse fill styles
    const fillStyleArray = this.parseFillStyleArray(reader);
    const lineStyleArray = this.parseLineStyleArray(reader);
    
    const stylesRemaining = reader.remaining;
    
    // Parse shape records
    const paths: SWFShape["paths"] = [];
    let currentPath: SWFShape["paths"][0] | null = null;
    let currentX = 0;
    let currentY = 0;
    
    const numFillBits = reader.readBits(4);
    const numLineBits = reader.readBits(4);
    reader.alignToByte();
    
    // Debug logging for first shape only
    const isFirstShape = this.shapes.size === 0;
    if (isFirstShape) {
      console.log(`[SWFEngine] parseShape: fillStyles=${fillStyleArray.length}, lineStyles=${lineStyleArray.length}, numFillBits=${numFillBits}, numLineBits=${numLineBits}, remaining=${stylesRemaining}`);
    }
    
    // Parse shape records
    let recordCount = 0;
    const maxRecords = 10000; // Safety limit
    
    while (reader.remaining > 0 && recordCount < maxRecords) {
      recordCount++;
      
      if (isFirstShape && recordCount <= 10) {
        const beforeBits = reader.position;
        const peekBit = reader.peekUint8 ? (reader.peekUint8() >> 7) : 0;
        console.log(`[SWFEngine] Shape record ${recordCount}: remaining=${reader.remaining}, firstBit=${peekBit}`);
      }
      
      // Peek at first bit to check for end record
      const firstBit = reader.readBits(1);
      if (firstBit === 0) {
        // Could be end record (all 6 bits are 0) or style change record
        const next5Bits = reader.readBits(5);
        if (next5Bits === 0) {
          // All 6 bits are zero - end of shape
          if (isFirstShape) {
            console.log(`[SWFEngine] End of shape detected at record ${recordCount}`);
          }
          break;
        }
        // Not end of shape - it's a style change record
        // The 5 bits we just read are the stateFlags
        const stateFlags = next5Bits;
        const hasNewStyles = (stateFlags & 0x10) !== 0;
        const hasLineStyle = (stateFlags & 0x08) !== 0;
        const hasFillStyle1 = (stateFlags & 0x04) !== 0;
        const hasFillStyle0 = (stateFlags & 0x02) !== 0;
        const hasMoveTo = (stateFlags & 0x01) !== 0;
        
        if (hasMoveTo) {
          const moveBits = reader.readBits(5);
          const moveDeltaX = reader.readSignedBits(moveBits) / 20;
          const moveDeltaY = reader.readSignedBits(moveBits) / 20;
          currentX += moveDeltaX;
          currentY += moveDeltaY;
          
          // Start a new path at the move position
          currentPath = {
            startX: currentX,
            startY: currentY,
            segments: [],
          };
          paths.push(currentPath);
          
          if (isFirstShape && recordCount <= 10) {
            console.log(`[SWFEngine] MoveTo: (${currentX}, ${currentY}), paths=${paths.length}`);
          }
        }
        
        // Parse style indices if present
        if (hasFillStyle0 && numFillBits > 0) {
          const fillStyle0 = reader.readBits(numFillBits);
        }
        if (hasFillStyle1 && numFillBits > 0) {
          const fillStyle1 = reader.readBits(numFillBits);
        }
        if (hasLineStyle && numLineBits > 0) {
          const lineStyle = reader.readBits(numLineBits);
        }
        
        if (hasNewStyles) {
          // Parse new fill and line style arrays (simplified - skip for now)
          reader.alignToByte();
          // Skip new style arrays for now
          break; // For now, break if new styles are encountered
        }
        
        reader.alignToByte();
      } else {
        // Edge record (firstBit was 1, so edgeFlag is 1)
        const straightFlag = reader.readBits(1);
        const numBits = reader.readBits(4) + 2;
        
        if (straightFlag === 1) {
          // Straight edge
          const generalLineFlag = reader.readBits(1);
          let deltaX = 0;
          let deltaY = 0;
          
          if (generalLineFlag === 1) {
            deltaX = reader.readSignedBits(numBits) / 20;
            deltaY = reader.readSignedBits(numBits) / 20;
          } else {
            const vertLineFlag = reader.readBits(1);
            if (vertLineFlag === 1) {
              deltaY = reader.readSignedBits(numBits) / 20;
            } else {
              deltaX = reader.readSignedBits(numBits) / 20;
            }
          }
          
          currentX += deltaX;
          currentY += deltaY;
          
          if (!currentPath) {
            currentPath = {
              startX: currentX - deltaX,
              startY: currentY - deltaY,
              segments: [],
            };
            paths.push(currentPath);
          }
          
          currentPath.segments.push({
            type: "line",
            x: currentX,
            y: currentY,
          });
          
          if (isFirstShape && recordCount <= 10) {
            console.log(`[SWFEngine] Line edge: to (${currentX}, ${currentY}), segments=${currentPath.segments.length}`);
          }
        } else {
          // Curved edge
          const controlDeltaX = reader.readSignedBits(numBits) / 20;
          const controlDeltaY = reader.readSignedBits(numBits) / 20;
          const anchorDeltaX = reader.readSignedBits(numBits) / 20;
          const anchorDeltaY = reader.readSignedBits(numBits) / 20;
          
          currentX += controlDeltaX + anchorDeltaX;
          currentY += controlDeltaY + anchorDeltaY;
          
          if (!currentPath) {
            currentPath = {
              startX: currentX - controlDeltaX - anchorDeltaX,
              startY: currentY - controlDeltaY - anchorDeltaY,
              segments: [],
            };
            paths.push(currentPath);
          }
          
          currentPath.segments.push({
            type: "curve",
            x: currentX,
            y: currentY,
            controlX: currentX - anchorDeltaX,
            controlY: currentY - anchorDeltaY,
          });
        }
      }
    }
    
    // Use first fill style if available
    const fillStyle = fillStyleArray.length > 0 ? fillStyleArray[0] : {
      color: "#ffffff",
      type: "solid" as const,
    };
    
    const lineStyle = lineStyleArray.length > 0 ? lineStyleArray[0] : undefined;
    
    return {
      paths,
      fillStyle,
      lineStyle,
    };
  }

  private parseFillStyleArray(reader: BinaryReader): Array<{ color: string; type: "solid" | "gradient" | "bitmap" }> {
    const fillStyleArray: Array<{ color: string; type: "solid" | "gradient" | "bitmap" }> = [];
    
    // Check if we have enough bytes
    if (reader.remaining < 1) {
      return fillStyleArray;
    }
    
    const beforePos = reader.position;
    const fillStyleCount = reader.readUint8();
    
    // Debug logging for first shape only
    const isFirstShape = this.shapes.size === 0;
    if (isFirstShape) {
      console.log(`[SWFEngine] parseFillStyleArray: count=${fillStyleCount} (0x${fillStyleCount.toString(16)}), remaining=${reader.remaining}, position=${beforePos})`);
    }
    
    // Validate count - if it's too high (> 100), it's probably wrong data
    if (fillStyleCount > 100 && fillStyleCount !== 0xff) {
      // Likely reading wrong data - return empty array
      // Rewind the byte we just read
      if (isFirstShape) {
        console.warn(`[SWFEngine] Invalid fill style count: ${fillStyleCount}, rewinding`);
      }
      reader.seek(reader.position - 8);
      return fillStyleArray;
    }
    
    if (fillStyleCount === 0xff) {
      // Extended count
      if (reader.remaining < 2) {
        return fillStyleArray;
      }
      const extendedCount = reader.readUint16();
      if (extendedCount > 1000) {
        // Invalid count - rewind
        reader.seek(reader.position - 24);
        return fillStyleArray;
      }
      for (let i = 0; i < extendedCount && reader.remaining > 0; i++) {
        try {
          fillStyleArray.push(this.parseFillStyle(reader));
        } catch (e) {
          // Error parsing fill style - break
          break;
        }
      }
    } else {
      for (let i = 0; i < fillStyleCount && reader.remaining > 0; i++) {
        try {
          fillStyleArray.push(this.parseFillStyle(reader));
        } catch (e) {
          // Error parsing fill style - break
          break;
        }
      }
    }
    
    return fillStyleArray;
  }

  private parseFillStyle(reader: BinaryReader): { color: string; type: "solid" | "gradient" | "bitmap" } {
    const fillStyleType = reader.readUint8();
    
    switch (fillStyleType) {
      case 0x00: // Solid fill
        const r = reader.readUint8();
        const g = reader.readUint8();
        const b = reader.readUint8();
        const a = reader.readUint8();
        return {
          color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
          type: "solid",
        };
      case 0x10: // Linear gradient
      case 0x12: // Radial gradient
        // Parse gradient (simplified)
        return {
          color: "#ffffff",
          type: "gradient",
        };
      case 0x40: // Bitmap fill
      case 0x41: // Tiled bitmap
      case 0x42: // Clipped bitmap
        return {
          color: "#ffffff",
          type: "bitmap",
        };
      default:
        return {
          color: "#ffffff",
          type: "solid",
        };
    }
  }

  private parseLineStyleArray(reader: BinaryReader): Array<{ color: string; width: number }> {
    const lineStyleArray: Array<{ color: string; width: number }> = [];
    
    // Check if we have enough bytes
    if (reader.remaining < 1) {
      return lineStyleArray;
    }
    
    const beforePos = reader.position;
    const lineStyleCount = reader.readUint8();
    
    // Debug logging for first shape only
    const isFirstShape = this.shapes.size === 0;
    if (isFirstShape) {
      console.log(`[SWFEngine] parseLineStyleArray: count=${lineStyleCount} (0x${lineStyleCount.toString(16)}), remaining=${reader.remaining}, position=${beforePos})`);
    }
    
    // Validate count - if it's too high (> 100), it's probably wrong data
    if (lineStyleCount > 100 && lineStyleCount !== 0xff) {
      // Likely reading wrong data - return empty array
      // Rewind the byte we just read
      if (isFirstShape) {
        console.warn(`[SWFEngine] Invalid line style count: ${lineStyleCount}, rewinding`);
      }
      reader.seek(reader.position - 8);
      return lineStyleArray;
    }
    
    if (lineStyleCount === 0xff) {
      // Extended count
      if (reader.remaining < 2) {
        return lineStyleArray;
      }
      const extendedCount = reader.readUint16();
      if (extendedCount > 1000) {
        // Invalid count - rewind
        reader.seek(reader.position - 24);
        return lineStyleArray;
      }
      for (let i = 0; i < extendedCount && reader.remaining > 0; i++) {
        try {
          lineStyleArray.push(this.parseLineStyle(reader));
        } catch (e) {
          // Error parsing line style - break
          break;
        }
      }
    } else {
      for (let i = 0; i < lineStyleCount && reader.remaining > 0; i++) {
        try {
          lineStyleArray.push(this.parseLineStyle(reader));
        } catch (e) {
          // Error parsing line style - break
          break;
        }
      }
    }
    
    return lineStyleArray;
  }

  private parseLineStyle(reader: BinaryReader): { color: string; width: number } {
    const width = reader.readUint16() / 20; // Convert from twips
    const r = reader.readUint8();
    const g = reader.readUint8();
    const b = reader.readUint8();
    const a = reader.readUint8();
    
    return {
      color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
      width,
    };
  }

  private parseDefineButton(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const buttonId = reader.readUint16();
    
    // Parse button states (up, over, down, hitTest)
    const button: SWFButton = {
      id: buttonId,
      states: {
        up: [],
        over: [],
        down: [],
        hitTest: [],
      },
      actions: [],
    };
    
    // Read button characters (states)
    // Button characters end with a zero byte (UI8)
    while (reader.remaining > 0) {
      // Peek at the next byte to check if it's the end marker
      const nextByte = reader.peekUint8();
      if (nextByte === 0) {
        // End of button characters - consume the zero byte
        reader.readUint8();
        break;
      }
      
      // Check if we have enough bytes for a button character record
      // Minimum: flags (1) + characterId (2) + depth (2) = 5 bytes
      if (reader.remaining < 5) {
        break;
      }
      
      const flags = reader.readUint8();
      if (flags === 0) break; // End of button characters
      
      const characterId = reader.readUint16();
      const depth = reader.readUint16();
      
      // Check if we have enough bytes for matrix
      if (reader.remaining < 1) {
        break;
      }
      
      const matrix = this.parseMatrix(reader);
      
      // Read color transform (only for DefineButton2)
      // For DefineButton2, color transform is always present after matrix
      if (tag.code === 33 && reader.remaining > 0) {
        // Color transform is a CXFORMWITHALPHA structure
        // It starts with bit flags, so we need to check if we have enough bits
        // Minimum size is 1 byte (6 bits for flags)
        if (reader.remaining >= 1) {
          try {
            this.parseColorTransform(reader);
          } catch (e) {
            // If parsing fails, we've likely reached the end of button characters
            // Reset reader position and break
            break;
          }
        }
      }
      
      // Store button state based on flags
      if (flags & 0x01) {
        // Hit state
        button.states.hitTest.push({ characterId, depth, matrix });
      }
      if (flags & 0x02) {
        // Down state
        button.states.down.push({ characterId, depth, matrix });
      }
      if (flags & 0x04) {
        // Over state
        button.states.over.push({ characterId, depth, matrix });
      }
      if (flags & 0x08) {
        // Up state
        button.states.up.push({ characterId, depth, matrix });
      }
    }
    
    // Read button actions
    // Actions start after the zero byte that ends button characters
    if (tag.code === 33) {
      // DefineButton2 has action records
      // Each action record: actionOffset (UI16), actionFlags (UI16), actionLength (UI32), actionData (variable)
      while (reader.remaining >= 8) { // Minimum: actionOffset (2) + actionFlags (2) + actionLength (4) = 8 bytes
        const actionOffset = reader.readUint16();
        if (actionOffset === 0) break;
        
        if (reader.remaining < 6) break; // Need actionFlags (2) + actionLength (4)
        
        const actionFlags = reader.readUint16();
        const actionLength = reader.readUint32();
        
        // Validate action length - must be reasonable and not exceed remaining bytes
        // Also check if actionLength is suspiciously large (likely reading wrong data)
        if (actionLength > reader.remaining || actionLength > 1000000 || actionLength < 0) {
          // Invalid action length - likely we're reading wrong data
          // This happens when button characters section wasn't parsed correctly
          // Skip this button's actions silently
          break;
        }
        
        const actionData = actionLength > 0 ? reader.readBytes(actionLength) : new Uint8Array(0);
        
        button.actions.push({
          offset: actionOffset,
          flags: actionFlags,
          data: actionData,
        });
      }
    } else if (tag.code === 7) {
      // DefineButton (v1) - parse actions differently
      // Each action record: actionOffset (UI16), actionLength (UI16), actionCode (UI8), actionData (variable)
      while (reader.remaining >= 5) { // Minimum: actionOffset (2) + actionLength (2) + actionCode (1) = 5 bytes
        const actionOffset = reader.readUint16();
        if (actionOffset === 0) break;
        
        if (reader.remaining < 3) break; // Need actionLength (2) + actionCode (1)
        
        const actionLength = reader.readUint16();
        if (actionLength === 0) break;
        
        // Validate action length - must be reasonable and not exceed remaining bytes
        // Also check if actionLength is suspiciously large (likely reading wrong data)
        if (actionLength > reader.remaining + 1 || actionLength > 1000000 || actionLength < 0) {
          // Invalid action length - likely we're reading wrong data
          // This happens when button characters section wasn't parsed correctly
          // Skip this button's actions silently
          break;
        }
        
        const actionCode = reader.readUint8();
        const actionDataLength = Math.max(0, actionLength - 1);
        const actionData = actionDataLength > 0 ? reader.readBytes(actionDataLength) : new Uint8Array(0);
        
        // Map action codes to flags
        let flags = 0;
        if (actionCode === 0x06) flags = 0x0004; // Press
        if (actionCode === 0x07) flags = 0x0008; // Release
        if (actionCode === 0x08) flags = 0x0002; // RollOver
        if (actionCode === 0x09) flags = 0x0001; // RollOut
        
        button.actions.push({
          offset: actionOffset,
          flags,
          data: actionData,
        });
      }
    }
    
    this.buttons.set(buttonId, button);
  }

  private parseDefineSprite(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const spriteId = reader.readUint16();
    const frameCount = reader.readUint16();
    
    // Parse sprite tags
    const sprite: SWFSprite = {
      id: spriteId,
      frameCount,
      tags: [],
    };
    
    // Read tags until End tag
    while (reader.remaining > 0) {
      // Check if we have enough bytes for tag header (at least 2 bytes)
      if (reader.remaining < 2) {
        break;
      }
      
      const tagCodeAndLength = reader.readUint16();
      const tagCode = tagCodeAndLength >> 6;
      let tagLength = tagCodeAndLength & 0x3f;
      
      if (tagLength === 0x3f) {
        // Extended length - need 4 more bytes
        if (reader.remaining < 4) {
          break;
        }
        tagLength = reader.readUint32();
      }
      
      if (tagCode === 0) break; // End tag
      
      // Validate tag length - must be reasonable and not exceed remaining bytes
      if (tagLength < 0 || tagLength > reader.remaining || tagLength > 1000000) {
        console.warn(`[SWFEngine] parseDefineSprite: Invalid tag length ${tagLength}, remaining: ${reader.remaining}, skipping sprite ${spriteId}`);
        break;
      }
      
      const tagData = reader.readBytes(tagLength);
      sprite.tags.push({
        code: tagCode,
        length: tagLength,
        data: tagData,
        name: `Tag_${tagCode}`,
      });
    }
    
    this.sprites.set(spriteId, sprite);
    
    // Build frame structure for sprite
    this.buildSpriteFrameStructure(spriteId);
  }

  /**
   * Build frame structure for a sprite
   */
  private buildSpriteFrameStructure(spriteId: number): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) return;

    let currentFrameIndex = 0;
    const frameTags: SWFTag[] = [];
    const spriteFrameTags = new Map<number, SWFTag[]>();

    for (const tag of sprite.tags) {
      if (tag.code === 1) {
        // ShowFrame - frame boundary
        if (frameTags.length > 0) {
          spriteFrameTags.set(currentFrameIndex, [...frameTags]);
        }
        currentFrameIndex++;
        frameTags.length = 0; // Clear for next frame
      } else {
        // Add tag to current frame
        frameTags.push(tag);
      }
    }

    // Handle last frame if no ShowFrame at end
    if (frameTags.length > 0) {
      spriteFrameTags.set(currentFrameIndex, [...frameTags]);
    }

    // Store sprite frame structure
    (sprite as any).frameTags = spriteFrameTags;
  }

  /**
   * Execute sprite timeline
   */
  private executeSprite(spriteId: number, instanceId: number): void {
    const sprite = this.sprites.get(spriteId);
    if (!sprite) return;

    let instance = this.spriteInstances.get(instanceId);
    if (!instance) {
      instance = {
        id: instanceId,
        spriteId,
        currentFrame: 0,
        displayList: [],
      };
      this.spriteInstances.set(instanceId, instance);
    }

    const spriteFrameTags = (sprite as any).frameTags as Map<number, SWFTag[]>;
    if (!spriteFrameTags) return;

    const frameTags = spriteFrameTags.get(instance.currentFrame) || [];
    
    // Process sprite frame tags
    for (const tag of frameTags) {
      switch (tag.code) {
        case 12: // DoAction
          this.parseDoAction(tag);
          break;
        case 26: // PlaceObject
        case 70: // PlaceObject3
          this.parsePlaceObjectForSprite(tag, instance);
          break;
        case 27: // RemoveObject
        case 28: // RemoveObject2
          this.parseRemoveObjectForSprite(tag, instance);
          break;
      }
    }

    // Move to next frame
    instance.currentFrame++;
    if (instance.currentFrame >= sprite.frameCount) {
      instance.currentFrame = 0; // Loop
      instance.displayList = []; // Reset display list
    }
  }

  /**
   * Parse PlaceObject for sprite
   */
  private parsePlaceObjectForSprite(tag: SWFTag, instance: SpriteInstance): void {
    const reader = this.createTagReader(tag);
    const depth = reader.readUint16();
    const characterId = reader.readUint16();
    
    // Parse matrix (transform)
    const matrix = this.parseMatrix(reader);
    
    // Parse color transform (optional)
    let colorTransform = null;
    if (reader.remaining > 0) {
      colorTransform = this.parseColorTransform(reader);
    }
    
    const displayObject: DisplayObject = {
      depth,
      characterId,
      matrix,
      colorTransform,
    };
    
    // Check if object already exists at this depth
    const existingIndex = instance.displayList.findIndex((obj) => obj.depth === depth);
    if (existingIndex >= 0) {
      instance.displayList[existingIndex] = displayObject;
    } else {
      instance.displayList.push(displayObject);
    }
  }

  /**
   * Parse RemoveObject for sprite
   */
  private parseRemoveObjectForSprite(tag: SWFTag, instance: SpriteInstance): void {
    const reader = this.createTagReader(tag);
    const depth = reader.readUint16();
    
    // Remove object from sprite display list
    const index = instance.displayList.findIndex((obj) => obj.depth === depth);
    if (index >= 0) {
      instance.displayList.splice(index, 1);
    }
  }

  private backgroundColor: string = "#000000";
  
  private parseSetBackgroundColor(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const r = reader.readUint8();
    const g = reader.readUint8();
    const b = reader.readUint8();
    
    this.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    // Background will be set in render() method
  }

  private parsePlaceObject(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    
    let depth: number;
    let characterId: number;
    
    // PlaceObject (tag 4) has different field order than PlaceObject2/3
    if (tag.code === 4) {
      // Old PlaceObject format: CharacterID, Depth, Matrix, ColorTransform
      characterId = reader.readUint16();
      depth = reader.readUint16();
    } else {
      // PlaceObject2/3 format: Depth, CharacterID, ...
      depth = reader.readUint16();
      characterId = reader.readUint16();
    }
    
    // Parse matrix (transform)
    const matrix = this.parseMatrix(reader);
    
    // Parse color transform (optional)
    let colorTransform = null;
    if (reader.remaining > 0) {
      colorTransform = this.parseColorTransform(reader);
    }
    
    const displayObject: DisplayObject = {
      depth,
      characterId,
      matrix,
      colorTransform,
    };
    
    // Check if this is a video stream
    const streamId = this.videoStreams.get(characterId);
    if (streamId !== undefined) {
      // Place video instance
      this.videoManager.placeVideo(
        streamId,
        depth,
        {
          scaleX: matrix.scaleX,
          scaleY: matrix.scaleY,
          rotateSkew0: matrix.skewX,
          rotateSkew1: matrix.skewY,
          translateX: matrix.translateX,
          translateY: matrix.translateY,
        },
        colorTransform ? {
          redMultiplier: colorTransform.multR,
          greenMultiplier: colorTransform.multG,
          blueMultiplier: colorTransform.multB,
          alphaMultiplier: colorTransform.multA,
          redOffset: colorTransform.addR,
          greenOffset: colorTransform.addG,
          blueOffset: colorTransform.addB,
          alphaOffset: colorTransform.addA,
        } : undefined
      );
    }
    
    this.displayList.push(displayObject);
    
    if (this.currentFrame === 0) {
      // Object added to display list
    }
  }

  private parseRemoveObject(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const depth = reader.readUint16();
    
    // Remove video instance if present
    this.videoManager.removeVideo(depth);
    
    // Remove object from display list
    const index = this.displayList.findIndex((obj) => obj.depth === depth);
    if (index >= 0) {
      this.displayList.splice(index, 1);
    }
  }

  private parseDoAction(tag: SWFTag): void {
    // Execute ActionScript bytecode
    if (this.actionScript) {
      this.actionScript.execute(tag.data);
    }
  }

  private parseMatrix(reader: BinaryReader): TransformMatrix {
    const hasScale = reader.readBits(1) === 1;
    let scaleX = 1;
    let scaleY = 1;
    
    if (hasScale) {
      const nScaleBits = reader.readBits(5);
      scaleX = reader.readSignedBits(nScaleBits) / 65536;
      scaleY = reader.readSignedBits(nScaleBits) / 65536;
    }
    
    const hasRotate = reader.readBits(1) === 1;
    let skewX = 0;
    let skewY = 0;
    
    if (hasRotate) {
      const nRotateBits = reader.readBits(5);
      skewX = reader.readSignedBits(nRotateBits) / 65536;
      skewY = reader.readSignedBits(nRotateBits) / 65536;
    }
    
    const nTranslateBits = reader.readBits(5);
    const translateX = reader.readSignedBits(nTranslateBits) / 20;
    const translateY = reader.readSignedBits(nTranslateBits) / 20;
    reader.alignToByte();
    
    return {
      scaleX,
      scaleY,
      skewX,
      skewY,
      translateX,
      translateY,
    };
  }

  private parseColorTransform(reader: BinaryReader): ColorTransform {
    const hasAddTerms = reader.readBits(1) === 1;
    const hasMultTerms = reader.readBits(1) === 1;
    const nBits = reader.readBits(4);
    
    let multR = 1;
    let multG = 1;
    let multB = 1;
    let multA = 1;
    let addR = 0;
    let addG = 0;
    let addB = 0;
    let addA = 0;
    
    if (hasMultTerms) {
      multR = reader.readBits(nBits) / 256;
      multG = reader.readBits(nBits) / 256;
      multB = reader.readBits(nBits) / 256;
      multA = reader.readBits(nBits) / 256;
    }
    
    if (hasAddTerms) {
      addR = reader.readSignedBits(nBits);
      addG = reader.readSignedBits(nBits);
      addB = reader.readSignedBits(nBits);
      addA = reader.readSignedBits(nBits);
    }
    
    reader.alignToByte();
    
    return {
      multR,
      multG,
      multB,
      multA,
      addR,
      addG,
      addB,
      addA,
    };
  }

  render(): void {
    // Clear with background color
    const ctx = this.renderer.ctx;
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.renderer.canvasElement.width, this.renderer.canvasElement.height);
    
    // Update ActionScript context
    this.actionScriptContext.timeline.currentFrame = this.currentFrame;
    
    // Sync audio to timeline
    this.syncAudio();
    
    // Sync video to timeline
    this.videoManager.syncToTimeline(this.currentFrame, this.frameRate);
    
    // Execute all active sprites
    for (const [instanceId, instance] of this.spriteInstances) {
      this.executeSprite(instance.spriteId, instanceId);
    }
    
    // Display list status (logged only once on first frame)
    if (this.currentFrame === 0 && !this.hasLoggedFrame0) {
      console.log(`[SWFEngine] Frame ${this.currentFrame}: displayList size=${this.displayList.length}, shapes=${this.shapes.size}, sprites=${this.sprites.size}, buttons=${this.buttons.size}, textFields=${this.textFields.size}`);
      this.hasLoggedFrame0 = true;
      this.hasLoggedRendering = false; // Reset rendering log flag so we can log rendering details
    }
    
    // Sort display list by depth
    const sorted = [...this.displayList].sort((a, b) => a.depth - b.depth);
    
    if (sorted.length === 0 && this.currentFrame === 0) {
      console.warn("[SWFEngine] Display list is empty on first frame! No objects to render.");
    }
    
    for (const obj of sorted) {
      this.renderer.setTransform(obj.matrix);
      
      // Render based on character type
      const shape = this.shapes.get(obj.characterId);
      const button = this.buttons.get(obj.characterId);
      const sprite = this.sprites.get(obj.characterId);
      const textField = this.textFields.get(obj.characterId);
      const bitmap = this.bitmaps.get(obj.characterId);
      const streamId = this.videoStreams.get(obj.characterId);
      
      // Debug logging for first frame only (use separate flag for rendering logs)
      if (this.currentFrame === 0 && !this.hasLoggedRendering) {
        console.log(`[SWFEngine] Rendering object: characterId=${obj.characterId}, depth=${obj.depth}, transform=(${obj.matrix.translateX},${obj.matrix.translateY},${obj.matrix.scaleX},${obj.matrix.scaleY})`);
        if (shape) {
          console.log(`  -> Shape: ${shape.paths.length} paths, fillStyle=${shape.fillStyle ? 'yes' : 'no'}, lineStyle=${shape.lineStyle ? 'yes' : 'no'}`);
          if (shape.paths.length > 0) {
            const firstPath = shape.paths[0];
            console.log(`    First path: start=(${firstPath.startX},${firstPath.startY}), segments=${firstPath.segments.length}`);
          }
        }
        if (button) {
          console.log(`  -> Button: ${button.states.up.length} up, ${button.states.over.length} over, ${button.states.down.length} down, ${button.states.hitTest.length} hit`);
        }
        if (sprite) {
          console.log(`  -> Sprite: ${sprite.frameCount} frames`);
        }
        if (textField) {
          console.log(`  -> TextField: "${textField.initialText || ''}"`);
        }
        // Set flag after logging first object
        if (sorted.indexOf(obj) === 0) {
          this.hasLoggedRendering = true;
        }
      }
      
      if (streamId !== undefined) {
        // Render video - video manager handles its own rendering
        // We just need to ensure it's synced
      } else if (shape) {
        this.renderer.drawShape(shape);
      } else if (bitmap) {
        // Render bitmap (simplified - just log for now)
        // TODO: Implement bitmap rendering
        if (!this.missingCharacters.has(obj.characterId)) {
          console.log(`[SWFEngine] Bitmap character ${obj.characterId} found but rendering not yet implemented`);
        }
      } else if (button) {
        // Render button in current state
        this.renderButton(button, obj);
      } else if (sprite) {
        // Render sprite instance
        this.renderSprite(sprite, obj);
      } else if (textField) {
        // Render text field
        this.renderTextField(textField, obj);
      } else {
        // Character not found - log only once per character ID
        if (!this.missingCharacters.has(obj.characterId)) {
          this.missingCharacters.add(obj.characterId);
          console.warn(`[SWFEngine] Character ${obj.characterId} not found in any registry! (shapes: ${this.shapes.size}, sprites: ${this.sprites.size}, buttons: ${this.buttons.size}, textFields: ${this.textFields.size}, bitmaps: ${this.bitmaps.size})`);
        }
      }
      
      this.renderer.resetTransform();
    }
    
    // Render all video instances
    this.videoManager.render();
  }

  /**
   * Render sprite instance
   */
  private renderSprite(sprite: SWFSprite, obj: DisplayObject): void {
    // Find or create sprite instance
    let instance = Array.from(this.spriteInstances.values()).find(
      (inst) => inst.spriteId === sprite.id
    );
    
    if (!instance) {
      const instanceId = Date.now(); // Simple ID generation
      instance = {
        id: instanceId,
        spriteId: sprite.id,
        currentFrame: 0,
        displayList: [],
      };
      this.spriteInstances.set(instanceId, instance);
    }

    // Render sprite's display list
    const sorted = [...instance.displayList].sort((a, b) => a.depth - b.depth);
    
    for (const spriteObj of sorted) {
      this.renderer.setTransform({
        scaleX: obj.matrix.scaleX * spriteObj.matrix.scaleX,
        scaleY: obj.matrix.scaleY * spriteObj.matrix.scaleY,
        skewX: obj.matrix.skewX + spriteObj.matrix.skewX,
        skewY: obj.matrix.skewY + spriteObj.matrix.skewY,
        translateX: obj.matrix.translateX + spriteObj.matrix.translateX,
        translateY: obj.matrix.translateY + spriteObj.matrix.translateY,
      });
      
      const shape = this.shapes.get(spriteObj.characterId);
      if (shape) {
        this.renderer.drawShape(shape);
      }
      
      this.renderer.resetTransform();
    }
  }

  private renderButton(button: SWFButton, obj: DisplayObject): void {
    // Determine button state based on mouse position
    let state = button.states.up; // Default to up state
    
    // Check if mouse is over button (simplified)
    const isOver = this.isPointInButton(this.mouseState.x, this.mouseState.y, button, obj);
    const isDown = this.mouseState.down && isOver;
    
    if (isDown && button.states.down.length > 0) {
      state = button.states.down;
    } else if (isOver && button.states.over.length > 0) {
      state = button.states.over;
    }
    
    for (const item of state) {
      const shape = this.shapes.get(item.characterId);
      if (shape) {
        // Combine object matrix with button state matrix
        this.renderer.setTransform({
          scaleX: obj.matrix.scaleX * item.matrix.scaleX,
          scaleY: obj.matrix.scaleY * item.matrix.scaleY,
          skewX: obj.matrix.skewX + item.matrix.skewX,
          skewY: obj.matrix.skewY + item.matrix.skewY,
          translateX: obj.matrix.translateX + item.matrix.translateX,
          translateY: obj.matrix.translateY + item.matrix.translateY,
        });
        this.renderer.drawShape(shape);
        this.renderer.resetTransform();
      }
    }
  }

  play(): void {
    if (this.animationId) return; // Already playing
    
    const frameTime = 1000 / this.frameRate;
    
    const animate = () => {
      // Process frame tags before rendering
      this.processFrameTags(this.currentFrame);
      
      // Render current frame
      this.render();
      
      // Move to next frame
      this.currentFrame++;
      this.actionScriptContext.timeline.currentFrame = this.currentFrame;
      
      if (this.currentFrame < this.swf.header.frameCount) {
        this.animationId = window.setTimeout(animate, frameTime);
      } else {
        // Loop back to beginning
        this.currentFrame = 0;
        this.actionScriptContext.timeline.currentFrame = 0;
        // Clear display list for new loop
        this.displayList = [];
        this.animationId = window.setTimeout(animate, frameTime);
      }
    };
    
    // Process first frame
    this.processFrameTags(0);
    animate();
  }

  stop(): void {
    if (this.animationId) {
      clearTimeout(this.animationId);
      this.animationId = undefined;
    }
  }

  gotoFrame(frame: number): void {
    const targetFrame = Math.max(0, Math.min(frame, this.swf.header.frameCount - 1));
    
    // If jumping backwards, reset display list
    if (targetFrame < this.currentFrame) {
      this.displayList = [];
    }
    
    // Process all frames up to target
    for (let i = 0; i <= targetFrame; i++) {
      this.processFrameTags(i);
    }
    
    this.currentFrame = targetFrame;
    this.actionScriptContext.timeline.currentFrame = this.currentFrame;
    this.render();
  }

  handleMouseEvent(event: MouseEvent, canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update mouse state
    this.mouseState.x = x;
    this.mouseState.y = y;
    this.mouseState.down = event.type === "mousedown" || (event.type === "mousemove" && event.buttons > 0);
    
    // Handle dragging
    if (this.draggingObject) {
      const obj = this.findDisplayObject(this.draggingObject.depth);
      if (obj) {
        if (this.draggingObject.lockCenter) {
          // Lock center - adjust position relative to center
          obj.matrix.translateX = x;
          obj.matrix.translateY = y;
        } else {
          // Update position based on mouse movement
          obj.matrix.translateX = x;
          obj.matrix.translateY = y;
        }
        
        // Apply bounds if specified
        if (this.draggingObject.bounds) {
          const bounds = this.draggingObject.bounds;
          if (bounds.left !== undefined) obj.matrix.translateX = Math.max(obj.matrix.translateX, bounds.left);
          if (bounds.right !== undefined) obj.matrix.translateX = Math.min(obj.matrix.translateX, bounds.right);
          if (bounds.top !== undefined) obj.matrix.translateY = Math.max(obj.matrix.translateY, bounds.top);
          if (bounds.bottom !== undefined) obj.matrix.translateY = Math.min(obj.matrix.translateY, bounds.bottom);
        }
      }
      
      if (event.type === "mouseup") {
        this.stopDrag();
      }
    }
    
    // Check button interactions (check in reverse depth order for proper hit testing)
    const sorted = [...this.displayList].sort((a, b) => b.depth - a.depth);
    
    for (const obj of sorted) {
      const button = this.buttons.get(obj.characterId);
      if (button) {
        // Check if point is in button bounds
        if (this.isPointInButton(x, y, button, obj)) {
          this.handleButtonEvent(button, event.type);
          break; // Only handle first button hit
        }
      }
    }
  }

  handleKeyboardEvent(event: KeyboardEvent): void {
    // Handle keyboard input for ActionScript
    this.actionScriptContext.variables["_keycode"] = event.keyCode;
    this.actionScriptContext.variables["_key"] = event.key;
  }

  private isPointInButton(x: number, y: number, button: SWFButton, obj: DisplayObject): boolean {
    // Transform point to button's local coordinate space
    const localX = (x - obj.matrix.translateX) / obj.matrix.scaleX;
    const localY = (y - obj.matrix.translateY) / obj.matrix.scaleY;
    
    // Use hit test state for accurate collision detection
    if (button.states.hitTest.length > 0) {
      for (const item of button.states.hitTest) {
        const shape = this.shapes.get(item.characterId);
        if (shape) {
          // Transform point to shape's local space
          const shapeX = (localX - item.matrix.translateX) / item.matrix.scaleX;
          const shapeY = (localY - item.matrix.translateY) / item.matrix.scaleY;
          
          // Check if point is in shape bounds (simplified - would need proper path hit testing)
          if (this.isPointInShape(shapeX, shapeY, shape)) {
            return true;
          }
        }
      }
    }
    
    // Fallback: check against up state
    for (const item of button.states.up) {
      const shape = this.shapes.get(item.characterId);
      if (shape) {
        const shapeX = (localX - item.matrix.translateX) / item.matrix.scaleX;
        const shapeY = (localY - item.matrix.translateY) / item.matrix.scaleY;
        
        if (this.isPointInShape(shapeX, shapeY, shape)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Check if point is inside shape using ray casting algorithm
   * Uses proper path hit testing for accurate collision detection
   */
  private isPointInShape(x: number, y: number, shape: SWFShape): boolean {
    // First check bounding box for quick rejection
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const path of shape.paths) {
      minX = Math.min(minX, path.startX);
      maxX = Math.max(maxX, path.startX);
      minY = Math.min(minY, path.startY);
      maxY = Math.max(maxY, path.startY);
      
      for (const segment of path.segments) {
        minX = Math.min(minX, segment.x);
        maxX = Math.max(maxX, segment.x);
        minY = Math.min(minY, segment.y);
        maxY = Math.max(maxY, segment.y);
      }
    }
    
    // Quick bounding box check
    if (x < minX || x > maxX || y < minY || y > maxY) {
      return false;
    }
    
    // Ray casting algorithm for point-in-polygon test
    // Cast a ray from point to the right and count intersections
    let inside = false;
    
    for (const path of shape.paths) {
      if (this.isPointInPath(x, y, path)) {
        inside = !inside; // Toggle for each path (handles holes)
      }
    }
    
    return inside;
  }

  /**
   * Check if point is inside a path using ray casting
   */
  private isPointInPath(x: number, y: number, path: SWFShape["paths"][0]): boolean {
    let inside = false;
    let prevX = path.startX;
    let prevY = path.startY;
    
    for (const segment of path.segments) {
      const x1 = prevX;
      const y1 = prevY;
      const x2 = segment.x;
      const y2 = segment.y;
      
      // Check if ray intersects this edge
      if (segment.type === "line") {
        // Ray casting for line segment
        if (((y1 > y) !== (y2 > y)) && (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1)) {
          inside = !inside;
        }
      } else if (segment.type === "curve" && segment.controlX !== undefined && segment.controlY !== undefined) {
        // Ray casting for quadratic curve (simplified - sample curve)
        const samples = 10;
        for (let i = 0; i < samples; i++) {
          const t = i / samples;
          const t2 = (i + 1) / samples;
          
          // Sample curve points
          const cx1 = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * segment.controlX + t * t * x2;
          const cy1 = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * segment.controlY + t * t * y2;
          const cx2 = (1 - t2) * (1 - t2) * x1 + 2 * (1 - t2) * t2 * segment.controlX + t2 * t2 * x2;
          const cy2 = (1 - t2) * (1 - t2) * y1 + 2 * (1 - t2) * t2 * segment.controlY + t2 * t2 * y2;
          
          // Check intersection with sampled curve segment
          if (((cy1 > y) !== (cy2 > y)) && (x < (cx2 - cx1) * (y - cy1) / (cy2 - cy1) + cx1)) {
            inside = !inside;
          }
        }
      }
      
      prevX = segment.x;
      prevY = segment.y;
    }
    
    // Check closing edge (from last point to start)
    if (path.segments.length > 0) {
      const lastSegment = path.segments[path.segments.length - 1];
      const x1 = lastSegment.x;
      const y1 = lastSegment.y;
      const x2 = path.startX;
      const y2 = path.startY;
      
      if (((y1 > y) !== (y2 > y)) && (x < (x2 - x1) * (y - y1) / (y2 - y1) + x1)) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  private handleButtonEvent(button: SWFButton, eventType: string): void {
    // Execute button actions based on event
    for (const action of button.actions) {
      if (this.shouldExecuteAction(action, eventType)) {
        try {
          this.actionScript.execute(action.data);
        } catch (error) {
          console.error("Button action execution error:", error);
        }
      }
    }
  }

  private shouldExecuteAction(action: ButtonAction, eventType: string): boolean {
    // Check if action should execute based on flags and event type
    const flags = action.flags;
    
    // Button action flags (simplified)
    if (eventType === "click" && (flags & 0x0008)) return true; // Release
    if (eventType === "mousedown" && (flags & 0x0004)) return true; // Press
    if (eventType === "mouseover" && (flags & 0x0002)) return true; // RollOver
    if (eventType === "mouseout" && (flags & 0x0001)) return true; // RollOut
    if (eventType === "mousemove" && (flags & 0x0010)) return true; // DragOver
    if (eventType === "mousemove" && (flags & 0x0020)) return true; // DragOut
    
    return false;
  }

  /**
   * Get display object property
   */
  private getDisplayObjectProperty(target: string | number, property: number): any {
    const obj = this.findDisplayObject(target);
    if (!obj) return 0;

    // Flash property constants
    switch (property) {
      case 0x00: // X
        return obj.matrix.translateX;
      case 0x01: // Y
        return obj.matrix.translateY;
      case 0x02: // XScale
        return obj.matrix.scaleX * 100;
      case 0x03: // YScale
        return obj.matrix.scaleY * 100;
      case 0x04: // CurrentFrame
        return this.currentFrame;
      case 0x05: // TotalFrames
        return this.swf.header.frameCount;
      case 0x06: // Alpha
        return obj.colorTransform ? obj.colorTransform.multA * 100 : 100;
      case 0x07: // Visible
        return 1; // Always visible for now
      case 0x08: // Width
        {
          const shape = this.shapes.get(obj.characterId);
          if (shape) {
            // Calculate shape bounds
            let minX = Infinity, maxX = -Infinity;
            for (const path of shape.paths) {
              for (const segment of path.segments) {
                minX = Math.min(minX, segment.x);
                maxX = Math.max(maxX, segment.x);
              }
            }
            return (maxX - minX) * obj.matrix.scaleX;
          }
          return 0;
        }
      case 0x09: // Height
        {
          const shape = this.shapes.get(obj.characterId);
          if (shape) {
            // Calculate shape bounds
            let minY = Infinity, maxY = -Infinity;
            for (const path of shape.paths) {
              for (const segment of path.segments) {
                minY = Math.min(minY, segment.y);
                maxY = Math.max(maxY, segment.y);
              }
            }
            return (maxY - minY) * obj.matrix.scaleY;
          }
          return 0;
        }
      case 0x0a: // Rotation
        // Calculate rotation from skew
        return Math.atan2(obj.matrix.skewY, obj.matrix.scaleX) * (180 / Math.PI);
      default:
        return 0;
    }
  }

  /**
   * Set display object property
   */
  private setDisplayObjectProperty(target: string | number, property: number, value: any): void {
    const obj = this.findDisplayObject(target);
    if (!obj) return;

    // Flash property constants
    switch (property) {
      case 0x00: // X
        obj.matrix.translateX = value;
        break;
      case 0x01: // Y
        obj.matrix.translateY = value;
        break;
      case 0x02: // XScale
        obj.matrix.scaleX = value / 100;
        break;
      case 0x03: // YScale
        obj.matrix.scaleY = value / 100;
        break;
      case 0x06: // Alpha
        if (!obj.colorTransform) {
          obj.colorTransform = {
            multR: 1, multG: 1, multB: 1, multA: 1,
            addR: 0, addG: 0, addB: 0, addA: 0,
          };
        }
        obj.colorTransform.multA = Math.max(0, Math.min(1, value / 100));
        break;
      case 0x07: // Visible
        // Store visibility in a custom property
        (obj as any).visible = value ? 1 : 0;
        break;
      case 0x0a: // Rotation
        {
          const rotation = (value * Math.PI) / 180;
          obj.matrix.scaleX = Math.cos(rotation);
          obj.matrix.skewY = Math.sin(rotation);
          obj.matrix.skewX = -Math.sin(rotation);
          obj.matrix.scaleY = Math.cos(rotation);
        }
        break;
    }
  }

  /**
   * Find display object by target (depth or name)
   */
  private findDisplayObject(target: string | number): DisplayObject | null {
    if (typeof target === "number") {
      // Find by depth
      return this.displayList.find((obj) => obj.depth === target) || null;
    } else {
      // Find by name (would need name tracking)
      return null;
    }
  }

  /**
   * Clone sprite at depth to new depth
   */
  private cloneSprite(depth: number, newDepth: number): void {
    const obj = this.findDisplayObject(depth);
    if (!obj) return;

    // Create a copy of the display object
    const cloned: DisplayObject = {
      depth: newDepth,
      characterId: obj.characterId,
      matrix: {
        scaleX: obj.matrix.scaleX,
        scaleY: obj.matrix.scaleY,
        skewX: obj.matrix.skewX,
        skewY: obj.matrix.skewY,
        translateX: obj.matrix.translateX,
        translateY: obj.matrix.translateY,
      },
      colorTransform: obj.colorTransform ? { ...obj.colorTransform } : null,
    };

    // Remove existing object at new depth if any
    const existingIndex = this.displayList.findIndex((obj) => obj.depth === newDepth);
    if (existingIndex >= 0) {
      this.displayList[existingIndex] = cloned;
    } else {
      this.displayList.push(cloned);
    }
  }

  /**
   * Remove sprite at depth
   */
  private removeSprite(depth: number): void {
    const index = this.displayList.findIndex((obj) => obj.depth === depth);
    if (index >= 0) {
      this.displayList.splice(index, 1);
    }
  }

  /**
   * Start dragging a display object
   */
  private startDrag(target: string | number, lockCenter: boolean, left?: number, top?: number, right?: number, bottom?: number): void {
    const obj = this.findDisplayObject(target);
    if (!obj) return;

    this.draggingObject = {
      depth: obj.depth,
      lockCenter,
      bounds: left !== undefined || top !== undefined || right !== undefined || bottom !== undefined
        ? { left, top, right, bottom }
        : undefined,
    };
  }

  /**
   * Stop dragging
   */
  private stopDrag(): void {
    this.draggingObject = null;
  }

  /**
   * Parse DefineSound tag
   */
  private parseDefineSound(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const soundId = reader.readUint16();
    const formatAndRate = reader.readUint8();
    const format = (formatAndRate >> 4) & 0x0f;
    const sampleRate = [5512.5, 11025, 22050, 44100][(formatAndRate >> 2) & 0x03];
    const channels = (formatAndRate & 0x01) === 0 ? 1 : 2;
    const sampleCount = reader.readUint32();
    const data = reader.readBytes(tag.data.byteLength - reader.offset);

    this.sounds.set(soundId, {
      format,
      sampleRate,
      channels,
      sampleCount,
      data: data.buffer,
    });

    // Load sound into audio manager
    if (format === 2) {
      // MP3
      this.audioManager.loadMP3(soundId, data.buffer).catch(console.error);
    } else if (format === 1) {
      // ADPCM
      this.audioManager.loadADPCM(soundId, data.buffer, sampleRate).catch(console.error);
    }
  }

  /**
   * Parse StartSound tag
   */
  private parseStartSound(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const soundId = reader.readUint16();
    
    // Parse sound info (if present in StartSound2)
    let loop = false;
    let volume = 1.0;
    let pan = 0.0;
    
    if (tag.code === 89) {
      // StartSound2 has sound info
      const soundInfo = reader.readUint8();
      if (soundInfo & 0x01) {
        // Has in point
        reader.readUint32();
      }
      if (soundInfo & 0x02) {
        // Has out point
        reader.readUint32();
      }
      if (soundInfo & 0x04) {
        // Has loops
        const loops = reader.readUint16();
        loop = loops > 1;
      }
      if (soundInfo & 0x08) {
        // Has envelope
        const envelopeCount = reader.readUint8();
        for (let i = 0; i < envelopeCount; i++) {
          reader.readUint32(); // pos44
          reader.readUint16(); // left level
          reader.readUint16(); // right level
        }
      }
      if (soundInfo & 0x10) {
        // Has sync stop
        // No additional data
      }
    }

    // Play sound
    this.audioManager.playSound(soundId, loop, volume, pan);
  }

  /**
   * Sync audio to timeline
   */
  private syncAudio(): void {
    this.audioManager.syncToTimeline(this.currentFrame, this.frameRate);
  }

  /**
   * Parse DefineBits tags (6, 20, 21, 34, 35)
   */
  private parseDefineBits(tag: SWFTag): void {
    try {
      const reader = this.createTagReader(tag);
      
      // All DefineBits variants start with characterId
      if (reader.remaining < 2) {
        console.warn(`[SWFEngine] parseDefineBits: Not enough data for characterId, remaining: ${reader.remaining}`);
        return;
      }
      
      const characterId = reader.readUint16();
      
      // Read the bitmap data (rest of the tag)
      const bitmapData = reader.readBytes(reader.remaining);
      
      // Store bitmap
      this.bitmaps.set(characterId, {
        characterId,
        data: bitmapData,
      });
      
      console.log(`[SWFEngine] parseDefineBits: Registered bitmap character ${characterId}, size: ${bitmapData.length} bytes`);
    } catch (error) {
      console.error(`[SWFEngine] parseDefineBits: Error parsing bitmap:`, error);
    }
  }

  /**
   * Parse DefineVideoStream tag (tag 60)
   */
  private parseDefineVideoStream(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const streamId = reader.readUint16();
    const numFrames = reader.readUint16();
    const width = reader.readUint16();
    const height = reader.readUint16();
    
    // Read video flags
    const videoFlags = reader.readUint8();
    const codec = videoFlags & 0x07; // Lower 3 bits: codec (2=H.264, 4=VP6, 3=Sorenson Spark)
    const deblocking = (videoFlags >> 3) & 0x01;
    const smoothing = (videoFlags >> 4) & 0x01;
    
    // Read frame rate (if present)
    let frameRate = this.frameRate;
    if (reader.remaining >= 2) {
      frameRate = reader.readUint16() / 256; // Fixed point 8.8
    }

    // Load video stream
    this.videoManager.loadVideoStream(streamId, codec, width, height, frameRate, numFrames).catch(console.error);
    
    // Map streamId to characterId (in SWF, video streams are referenced by characterId)
    // For now, we'll use streamId as characterId
    this.videoStreams.set(streamId, streamId);
  }

  /**
   * Parse VideoFrame tag (tag 61)
   */
  private parseVideoFrame(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const streamId = reader.readUint16();
    const frameNumber = reader.readUint16();
    
    // Read video frame data
    const frameData = reader.readBytes(reader.remaining);
    
    // Add video frame to stream
    this.videoManager.addVideoFrame(streamId, frameNumber, frameData.buffer);
  }

  /**
   * Parse DefineEditText tag (tag 36)
   */
  private parseDefineEditText(tag: SWFTag): void {
    const reader = this.createTagReader(tag);
    const characterId = reader.readUint16();
    
    // Parsing DefineEditText
    
    // Read bounds (RECT)
    const nBits = reader.readBits(5);
    const xMin = reader.readSignedBits(nBits) / 20;
    const xMax = reader.readSignedBits(nBits) / 20;
    const yMin = reader.readSignedBits(nBits) / 20;
    const yMax = reader.readSignedBits(nBits) / 20;
    reader.alignToByte();
    
    // Read flags
    const flags = reader.readUint8();
    const hasText = (flags & 0x01) !== 0;
    const wordWrap = (flags & 0x02) !== 0;
    const multiline = (flags & 0x04) !== 0;
    const password = (flags & 0x08) !== 0;
    const readOnly = (flags & 0x10) !== 0;
    const hasTextColor = (flags & 0x20) !== 0;
    const hasMaxLength = (flags & 0x40) !== 0;
    const hasFont = (flags & 0x80) !== 0;
    
    const flags2 = reader.readUint8();
    const hasFontClass = (flags2 & 0x01) !== 0;
    const autoSize = (flags2 & 0x02) !== 0;
    const hasLayout = (flags2 & 0x04) !== 0;
    const noSelect = (flags2 & 0x08) !== 0;
    const border = (flags2 & 0x10) !== 0;
    const wasStatic = (flags2 & 0x20) !== 0;
    const html = (flags2 & 0x40) !== 0;
    const useOutlines = (flags2 & 0x80) !== 0;
    
    // Read font ID and height (if hasFont)
    let fontId: number | null = null;
    let fontHeight: number = 12;
    if (hasFont) {
      fontId = reader.readUint16();
      fontHeight = reader.readUint16() / 20; // Convert from twips to pixels
    }
    
    // Read text color (if hasTextColor)
    let textColor = "#000000";
    if (hasTextColor) {
      const r = reader.readUint8();
      const g = reader.readUint8();
      const b = reader.readUint8();
      const a = reader.readUint8();
      // If alpha is 0, use default black color (alpha 1)
      if (a === 0) {
        textColor = `rgb(${r}, ${g}, ${b})`;
      } else {
        textColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      }
    }
    
    // Read max length (if hasMaxLength)
    let maxLength: number | null = null;
    if (hasMaxLength) {
      maxLength = reader.readUint16();
    }
    
    // Read layout (if hasLayout)
    let align = "left";
    let leftMargin = 0;
    let rightMargin = 0;
    let indent = 0;
    let leading = 0;
    if (hasLayout) {
      align = ["left", "right", "center", "justify"][reader.readUint8()] || "left";
      leftMargin = reader.readUint16() / 20;
      rightMargin = reader.readUint16() / 20;
      indent = reader.readInt16() / 20;
      leading = reader.readInt16() / 20;
    }
    
    // Read variable name (string)
    const variableName = reader.readNullTerminatedString();
    
    // Read initial text (if hasText)
    let initialText = "";
    if (hasText) {
      initialText = reader.readNullTerminatedString();
    }
    
    // DefineEditText parsed
    
    const textField: SWFTextField = {
      id: characterId,
      bounds: { xMin, xMax, yMin, yMax },
      flags: {
        hasText,
        wordWrap,
        multiline,
        password,
        readOnly,
        hasTextColor,
        hasMaxLength,
        hasFont,
        hasFontClass,
        autoSize,
        hasLayout,
        noSelect,
        border,
        wasStatic,
        html,
        useOutlines,
      },
      fontId,
      fontHeight,
      textColor,
      maxLength,
      align,
      leftMargin,
      rightMargin,
      indent,
      leading,
      variableName,
      initialText,
    };
    
    this.textFields.set(characterId, textField);
  }
  
  /**
   * Render text field
   */
  private renderTextField(textField: SWFTextField, obj: DisplayObject): void {
    const ctx = this.renderer.ctx;
    
    // Transform is already applied by setTransform in render loop
    // Calculate text field bounds (in pixels)
    // Ensure min < max (swap if needed)
    const xMin = Math.min(textField.bounds.xMin, textField.bounds.xMax);
    const xMax = Math.max(textField.bounds.xMin, textField.bounds.xMax);
    const yMin = Math.min(textField.bounds.yMin, textField.bounds.yMax);
    const yMax = Math.max(textField.bounds.yMin, textField.bounds.yMax);
    
    const x = xMin;
    const y = yMin;
    const width = xMax - xMin;
    const height = yMax - yMin;
    
    // Skip if bounds are invalid
    if (width <= 0 || height <= 0) {
      return;
    }
    
    // Render text field
    
    // Draw text field background if border is enabled
    if (textField.flags.border) {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    }
    
    // Set text style
    // Ensure text color is visible (if alpha is 0, use black)
    let textColor = textField.textColor || "#000000";
    if (textColor.includes("rgba") && textColor.endsWith(", 0)")) {
      // Alpha is 0, use RGB instead
      const match = textColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        textColor = `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
      } else {
        textColor = "#000000";
      }
    }
    
    ctx.fillStyle = textColor;
    ctx.font = `${textField.fontHeight}px Arial`;
    ctx.textAlign = (textField.align as CanvasTextAlign) || "left";
    ctx.textBaseline = "top";
    
    // Draw text
    const text = textField.initialText || "";
    if (text && text.trim()) {
      const lines = text.split("\n");
      let textY = y + textField.leftMargin;
      
      for (const line of lines) {
        if (line.trim()) {
          ctx.fillText(line, x + textField.leftMargin, textY);
        }
        textY += textField.fontHeight + textField.leading;
      }
    } else {
      // Always draw placeholder if no text (for debugging)
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `${Math.max(12, textField.fontHeight)}px Arial`;
      ctx.fillText("(text field)", x + textField.leftMargin, y + textField.leftMargin);
    }
    
    // Note: Don't restore context here - resetTransform is called in render loop
  }

  /**
   * Cleanup audio and video
   */
  dispose(): void {
    this.audioManager.dispose();
    this.videoManager.dispose();
  }
}

interface DisplayObject {
  depth: number;
  characterId: number;
  matrix: TransformMatrix;
  colorTransform: ColorTransform | null;
}

interface SWFSprite {
  id: number;
  frameCount: number;
  tags: SWFTag[];
}

interface SWFButton {
  id: number;
  states: {
    up: ButtonStateItem[];
    over: ButtonStateItem[];
    down: ButtonStateItem[];
    hitTest: ButtonStateItem[];
  };
  actions: ButtonAction[];
}

interface ButtonStateItem {
  characterId: number;
  depth: number;
  matrix: TransformMatrix;
}

interface ButtonAction {
  offset: number;
  flags: number;
  data: Uint8Array;
}

interface TransformMatrix {
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
  translateX: number;
  translateY: number;
}

interface ColorTransform {
  multR: number;
  multG: number;
  multB: number;
  multA: number;
  addR: number;
  addG: number;
  addB: number;
  addA: number;
}

interface SpriteInstance {
  id: number;
  spriteId: number;
  currentFrame: number;
  displayList: DisplayObject[];
}

interface SWFTextField {
  id: number;
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  flags: {
    hasText: boolean;
    wordWrap: boolean;
    multiline: boolean;
    password: boolean;
    readOnly: boolean;
    hasTextColor: boolean;
    hasMaxLength: boolean;
    hasFont: boolean;
    hasFontClass: boolean;
    autoSize: boolean;
    hasLayout: boolean;
    noSelect: boolean;
    border: boolean;
    wasStatic: boolean;
    html: boolean;
    useOutlines: boolean;
  };
  fontId: number | null;
  fontHeight: number;
  textColor: string;
  maxLength: number | null;
  align: string;
  leftMargin: number;
  rightMargin: number;
  indent: number;
  leading: number;
  variableName: string;
  initialText: string;
}



