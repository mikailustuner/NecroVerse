import JSZip from "jszip";

export interface XAPManifest {
  EntryPointAssembly?: string;
  EntryPointType?: string;
  RuntimeVersion?: string;
  [key: string]: string | undefined;
}

export interface XAPFile {
  manifest: XAPManifest;
  entryPoint?: string;
  xamlFiles: Array<{ path: string; content: string }>;
  resources: Array<{ path: string; data: Uint8Array }>;
}

/**
 * Parse XAP file format (Silverlight)
 */
export class XAPParser {
  private zip: JSZip;

  constructor(zip: JSZip) {
    this.zip = zip;
  }

  async parse(): Promise<XAPFile> {
    const manifest = await this.parseManifest();
    const entryPoint = manifest.EntryPointType
      ? `${manifest.EntryPointAssembly}.${manifest.EntryPointType}`
      : undefined;
    const xamlFiles = await this.parseXAML();
    const resources = await this.parseResources();

    return {
      manifest,
      entryPoint,
      xamlFiles,
      resources,
    };
  }

  private async parseManifest(): Promise<XAPManifest> {
    const manifestFile = this.zip.file("AppManifest.xaml");
    const manifest: XAPManifest = {};

    if (manifestFile) {
      const manifestText = await manifestFile.async("string");
      
      // Parse XAML manifest (simplified)
      const entryPointMatch = manifestText.match(/EntryPointAssembly="([^"]+)"/);
      if (entryPointMatch) {
        manifest.EntryPointAssembly = entryPointMatch[1];
      }

      const entryTypeMatch = manifestText.match(/EntryPointType="([^"]+)"/);
      if (entryTypeMatch) {
        manifest.EntryPointType = entryTypeMatch[1];
      }

      const runtimeMatch = manifestText.match(/RuntimeVersion="([^"]+)"/);
      if (runtimeMatch) {
        manifest.RuntimeVersion = runtimeMatch[1];
      }
    }

    return manifest;
  }

  private async parseXAML(): Promise<Array<{ path: string; content: string }>> {
    const xamlFiles: Array<{ path: string; content: string }> = [];

    for (const [path, file] of Object.entries(this.zip.files)) {
      if (path.endsWith(".xaml") && !file.dir) {
        const content = await file.async("string");
        xamlFiles.push({ path, content });
      }
    }

    return xamlFiles;
  }

  private async parseResources(): Promise<Array<{ path: string; data: Uint8Array }>> {
    const resources: Array<{ path: string; data: Uint8Array }> = [];

    for (const [path, file] of Object.entries(this.zip.files)) {
      if (!path.endsWith(".xaml") && !file.dir && path !== "AppManifest.xaml") {
        const data = await file.async("uint8array");
        resources.push({ path, data });
      }
    }

    return resources;
  }
}

/**
 * Parse XAP file from ArrayBuffer
 */
export async function parseXAP(buffer: ArrayBuffer): Promise<XAPFile> {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new XAPParser(zip);
  return parser.parse();
}

