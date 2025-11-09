import { FileMetadata, ConversionResult } from "../types";
import { parseSWF } from "../parsers/swf";

export async function convertSWF(
  file: File,
  uploadUrl: string
): Promise<ConversionResult> {
  try {
    // Extract basic metadata from SWF file
    const metadata: FileMetadata = {
      name: file.name,
      type: "swf",
      size: file.size,
      converted: true,
      conversionUrl: uploadUrl,
    };

    // Parse SWF file for better metadata extraction
    const arrayBuffer = await file.arrayBuffer();
    const swfFile = await parseSWF(arrayBuffer);

    // Extract dimensions from header
    if (swfFile.header.frameSize) {
      metadata.dimensions = {
        width: swfFile.header.frameSize.xMax - swfFile.header.frameSize.xMin,
        height: swfFile.header.frameSize.yMax - swfFile.header.frameSize.yMin,
      };
    }

    // Extract tag information
    const tagInfo: Record<string, number> = {};
    for (const tag of swfFile.tags) {
      const tagName = tag.name || `Tag${tag.code}`;
      tagInfo[tagName] = (tagInfo[tagName] || 0) + 1;
    }

    metadata.manifest = {
      version: swfFile.header.version,
      frameRate: swfFile.header.frameRate,
      frameCount: swfFile.header.frameCount,
      compressed: swfFile.header.compressed,
      tagCount: swfFile.tags.length,
      tagInfo,
    };

    return {
      success: true,
      metadata,
      outputUrl: uploadUrl,
    };
  } catch (error) {
    return {
      success: false,
      metadata: {
        name: file.name,
        type: "swf",
        size: file.size,
        converted: false,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

