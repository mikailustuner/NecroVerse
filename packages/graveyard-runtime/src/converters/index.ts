import { File, ConversionResult } from "../types";
import { convertSWF } from "./swf";
import { convertJAR } from "./jar";
import { convertXAP } from "./xap";
import { convertDCR } from "./dcr";
import { convertEXE } from "./exe";
import { convertDLL } from "./dll";
import { convertOCX } from "./ocx";
import { exportToWebAssembly } from "./webassembly";
import { exportToWebGL } from "./webgl";
import { exportToWebM } from "./webm";
import { exportToAV1 } from "./av1";
import { exportToHLS } from "./hls";
import { exportToDASH } from "./dash";
import { detectFileType } from "../detector";

export async function convertFile(
  file: File,
  uploadUrl: string
): Promise<ConversionResult> {
  const fileType = detectFileType(file.name);

  switch (fileType) {
    case "swf":
      return convertSWF(file, uploadUrl);
    case "jar":
      return convertJAR(file, uploadUrl);
    case "xap":
      return convertXAP(file, uploadUrl);
    case "dcr":
      return convertDCR(file, uploadUrl);
    case "exe":
      return convertEXE(file, uploadUrl);
    case "dll":
      return convertDLL(file, uploadUrl);
    case "ocx":
      return convertOCX(file, uploadUrl);
    default:
      return {
        success: false,
        metadata: {
          name: file.name,
          type: "unknown",
          size: file.size,
          converted: false,
        },
        error: "Unsupported file type",
      };
  }
}

/**
 * Export file to modern format
 */
export async function exportToModernFormat(
  file: File,
  uploadUrl: string,
  format: "wasm" | "webgl" | "webm" | "av1" | "hls" | "dash",
  options?: any
): Promise<ConversionResult> {
  switch (format) {
    case "wasm":
      return exportToWebAssembly(file, uploadUrl, options);
    case "webgl":
      return exportToWebGL(file, uploadUrl, options);
    case "webm":
      return exportToWebM(file, uploadUrl, options);
    case "av1":
      return exportToAV1(file, uploadUrl, options);
    case "hls":
      return exportToHLS(file, uploadUrl, options);
    case "dash":
      return exportToDASH(file, uploadUrl, options);
    default:
      return {
        success: false,
        metadata: {
          name: file.name,
          type: format,
          size: file.size,
          converted: false,
        },
        error: "Unsupported export format",
      };
  }
}

// Export all converters
export * from "./webm";
export * from "./av1";
export * from "./hls";
export * from "./dash";

