import { BinaryReader } from "../utils/binary-reader";
import { decompressZlib } from "../utils/deflate";

export interface SWFHeader {
  signature: string; // "FWS" or "CWS"
  version: number;
  fileLength: number;
  frameSize: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  frameRate: number;
  frameCount: number;
  compressed: boolean;
}

export interface SWFTag {
  code: number;
  length: number;
  data: Uint8Array;
  name: string;
}

export interface SWFFile {
  header: SWFHeader;
  tags: SWFTag[];
}

/**
 * Parse SWF file format
 */
export class SWFParser {
  private reader: BinaryReader;
  private tags: SWFTag[] = [];

  constructor(buffer: ArrayBuffer) {
    // SWF format uses little-endian byte order
    this.reader = new BinaryReader(buffer, true);
  }

  async parse(): Promise<SWFFile> {
    const header = await this.parseHeader();
    
    console.log("🔍 Starting to parse tags...");
    await this.parseTags();
    
    console.log(`✅✅✅ [SWFParser] ✅ Parsed ${this.tags.length} tags, ${this.reader.remaining} bytes remaining ✅✅✅`);

    return {
      header,
      tags: this.tags,
    };
  }

  private async parseHeader(): Promise<SWFHeader> {
    // Read signature (3 bytes)
    const signature = this.reader.readString(3);
    const compressed = signature === "CWS";

    // Read version (1 byte)
    const version = this.reader.readUint8();

    // Read file length (4 bytes)
    let fileLength = this.reader.readUint32();

    if (compressed) {
      // Read compressed data (everything after header)
      const compressedData = this.reader.readBytes(this.reader.remaining);
      const decompressed = await decompressZlib(compressedData);
      
      // Reconstruct header + decompressed data
      const headerBytes = new Uint8Array(8);
      const headerView = new DataView(headerBytes.buffer);
      headerView.setUint8(0, signature.charCodeAt(0));
      headerView.setUint8(1, signature.charCodeAt(1));
      headerView.setUint8(2, signature.charCodeAt(2));
      headerView.setUint8(3, version);
      headerView.setUint32(4, decompressed.length + 8, false);
      
      const data = new Uint8Array(headerBytes.length + decompressed.length);
      data.set(headerBytes, 0);
      data.set(decompressed, headerBytes.length);
      
      // Update reader with decompressed data (SWF uses little-endian)
      this.reader = new BinaryReader(data.buffer, true);
      this.reader.position = 8 * 8; // Skip header (8 bytes = 64 bits)
      fileLength = decompressed.length + 8;
    }

    // Read frame size (RECT structure - variable bit length)
    const frameSize = this.readRECT();
    
    // Read frame rate (2 bytes, but stored as fixed point 8.8)
    const frameRateRaw = this.reader.readUint16();
    const frameRate = frameRateRaw / 256;

    // Read frame count (2 bytes)
    const frameCount = this.reader.readUint16();

    return {
      signature,
      version,
      fileLength,
      frameSize,
      frameRate,
      frameCount,
      compressed,
    };
  }

  private readRECT(): { xMin: number; xMax: number; yMin: number; yMax: number } {
    const startPosition = this.reader.position;
    
    // RECT is stored with variable bit length
    // First 5 bits: nBits (number of bits per coordinate)
    const nBits = this.reader.readBits(5);
    
    // Read 4 coordinates, each nBits long (signed values in TWIPS)
    // RECT coordinates are signed integers stored in TWIPS (1/20 pixel)
    const xMin = this.reader.readSignedBits(nBits) / 20; // Convert from twips to pixels
    const xMax = this.reader.readSignedBits(nBits) / 20;
    const yMin = this.reader.readSignedBits(nBits) / 20;
    const yMax = this.reader.readSignedBits(nBits) / 20;
    
    // Align to byte boundary
    this.reader.alignToByte();
    
    // RECT parsed

    return { xMin, xMax, yMin, yMax };
  }

  private async parseTags(): Promise<void> {
    const tagNames: Record<number, string> = {
      0: "End",
      1: "ShowFrame",
      2: "DefineShape",
      4: "PlaceObject",
      6: "DefineBits",
      7: "DefineButton",
      8: "JPEGTables",
      9: "SetBackgroundColor",
      10: "DefineFont",
      11: "DefineText",
      12: "DoAction",
      13: "DefineFontInfo",
      14: "DefineSound",
      15: "StartSound",
      17: "DefineButtonSound",
      18: "SoundStreamHead",
      19: "SoundStreamBlock",
      20: "DefineBitsLossless",
      21: "DefineBitsJPEG2",
      22: "DefineShape2",
      23: "DefineButtonCxform",
      24: "Protect",
      26: "PlaceObject2",
      42: "DefineScalingGrid",
      45: "DefineBinaryData",
      27: "RemoveObject",
      28: "DefineShape3",
      32: "DefineText2",
      33: "DefineButton2",
      34: "DefineBitsJPEG3",
      35: "DefineBitsLossless2",
      36: "DefineEditText",
      37: "DefineSprite",
      39: "FrameLabel",
      43: "DefineShape4",
      46: "DefineMorphShape",
      48: "DefineFont2",
      56: "ExportAssets",
      57: "ImportAssets",
      58: "EnableDebugger",
      59: "DoInitAction",
      60: "DefineVideoStream",
      61: "VideoFrame",
      62: "DefineFontInfo2",
      64: "EnableDebugger2",
      65: "ScriptLimits",
      66: "SetTabIndex",
      69: "FileAttributes",
      70: "PlaceObject3",
      71: "ImportAssets2",
      73: "DefineFontAlignZones",
      74: "CSMTextSettings",
      75: "DefineFont3",
      76: "SymbolClass",
      77: "Metadata",
      78: "DefineScalingGrid",
      82: "DoABC",
      83: "DefineShape4",
      84: "DefineMorphShape2",
      86: "DefineSceneAndFrameLabelData",
      87: "DefineBinaryData",
      88: "DefineFontName",
      89: "StartSound2",
    };

    let tagCount = 0;
    while (this.reader.remaining > 0) {
      const startPosition = this.reader.position;
      
      if (this.reader.remaining < 2) {
        console.warn(`[SWFParser] Not enough bytes for tag header: remaining=${this.reader.remaining}`);
        break;
      }
      
      const tagCodeAndLength = this.reader.readUint16();
      // SWF tag format: bits 0-5 = code, bits 6-15 = length
      const tagCode = tagCodeAndLength & 0x3f; // Bits 0-5 (last 6 bits)
      let tagLength = (tagCodeAndLength >> 6) & 0x3ff; // Bits 6-15 (first 10 bits)

      // If tagLength is 0x3f, it means extended length (4 bytes)
      if (tagLength === 0x3f) {
        if (this.reader.remaining < 4) {
          console.warn(`[SWFParser] Not enough bytes for extended tag length: remaining=${this.reader.remaining}`);
          break;
        }
        tagLength = this.reader.readUint32();
      }

      if (this.reader.remaining < tagLength) {
        console.warn(`[SWFParser] Not enough bytes for tag data: tagCode=${tagCode}, tagLength=${tagLength}, remaining=${this.reader.remaining}`);
        break;
      }

      const tagData = this.reader.readBytes(tagLength);
      const tagName = tagNames[tagCode] || `Unknown_${tagCode}`;

      this.tags.push({
        code: tagCode,
        length: tagLength,
        data: tagData,
        name: tagName,
      });

      tagCount++;
      
      // Log only first few tags
      if (tagCount <= 5) {
        console.log(`[SWFParser] Tag ${tagCount}: code=${tagCode} (${tagName}), length=${tagLength}`);
      }

      // Stop at End tag (but only if we've read enough tags)
      // Some SWF files have End tag early, then more content
      // Only stop if we've read at least 10 tags or if remaining bytes are very small
      if (tagCode === 0) {
        if (tagCount < 10 && this.reader.remaining > 1000) {
          console.warn(`[SWFParser] Found End tag early (tag ${tagCount}), but ${this.reader.remaining} bytes remaining. Continuing...`);
          // Don't break, continue parsing
        } else {
          console.log(`[SWFParser] Found End tag, stopping tag parsing. Total tags: ${tagCount}, remaining bytes: ${this.reader.remaining}`);
          break;
        }
      }
    }
    
    if (tagCount === 0) {
      console.error(`[SWFParser] No tags parsed! Position=${this.reader.position}, remaining=${this.reader.remaining}, total length=${this.reader.length}`);
    }
  }

  getTags(): SWFTag[] {
    return this.tags;
  }
}

/**
 * Parse SWF file from ArrayBuffer
 */
export async function parseSWF(buffer: ArrayBuffer): Promise<SWFFile> {
  const parser = new SWFParser(buffer);
  return parser.parse();
}

