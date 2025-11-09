export type FileType = "swf" | "jar" | "xap" | "dcr" | "exe" | "dll" | "ocx" | "wasm" | "webgl" | "unknown";

export interface FileMetadata {
  name: string;
  type: FileType;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  frameCount?: number;
  manifest?: Record<string, unknown>;
  converted: boolean;
  conversionUrl?: string;
}

export interface ConversionResult {
  success: boolean;
  metadata: FileMetadata;
  error?: string;
  outputUrl?: string;
}

export interface RuntimeConfig {
  type: FileType;
  url: string;
  metadata: FileMetadata;
}

