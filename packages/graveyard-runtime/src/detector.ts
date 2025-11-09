import { FileType } from "./types";

export function detectFileType(fileName: string, mimeType?: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "swf":
      return "swf";
    case "jar":
      return "jar";
    case "xap":
      return "xap";
    case "dcr":
      return "dcr";
    case "exe":
      return "exe";
    case "dll":
      return "dll";
    case "ocx":
      return "ocx";
    default:
      return "unknown";
  }
}

export function getMimeType(fileType: FileType): string {
  switch (fileType) {
    case "swf":
      return "application/x-shockwave-flash";
    case "jar":
      return "application/java-archive";
    case "xap":
      return "application/x-silverlight-app";
    case "dcr":
      return "application/x-director";
    case "exe":
      return "application/x-msdownload";
    case "dll":
      return "application/x-msdownload";
    case "ocx":
      return "application/x-oleobject";
    default:
      return "application/octet-stream";
  }
}

