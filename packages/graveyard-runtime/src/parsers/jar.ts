import JSZip from "jszip";
import { BinaryReader } from "../utils/binary-reader";

export interface JARManifest {
  "Manifest-Version"?: string;
  "Main-Class"?: string;
  "Class-Path"?: string;
  [key: string]: string | undefined;
}

export interface JARClass {
  name: string;
  data: Uint8Array;
}

export interface JARFile {
  manifest: JARManifest;
  mainClass?: string;
  classes: JARClass[];
  resources: Array<{ path: string; data: Uint8Array }>;
}

/**
 * Parse JAR file format
 */
export class JARParser {
  private zip: JSZip;

  constructor(zip: JSZip) {
    this.zip = zip;
  }

  async parse(): Promise<JARFile> {
    const manifest = await this.parseManifest();
    const classes = await this.parseClasses();
    const resources = await this.parseResources();

    // Try to find main class from manifest first
    let mainClass = manifest["Main-Class"];
    
    // If no main class in manifest, try to find it from class files
    if (!mainClass && classes.length > 0) {
      mainClass = await this.findMainClass(classes);
    }

    return {
      manifest,
      mainClass,
      classes,
      resources,
    };
  }

  /**
   * Try to find main class by looking for classes with main method
   */
  private async findMainClass(classes: JARClass[]): Promise<string | undefined> {
    // Look for classes with "main" in the name (common pattern)
    const mainCandidates = classes.filter(c => 
      c.name.toLowerCase().includes("main") || 
      c.name.toLowerCase().endsWith("app") ||
      c.name.toLowerCase().endsWith("application")
    );

    if (mainCandidates.length > 0) {
      // Return the first candidate
      return mainCandidates[0].name;
    }

    // If no obvious candidates, return the first class
    if (classes.length > 0) {
      return classes[0].name;
    }

    return undefined;
  }

  private async parseManifest(): Promise<JARManifest> {
    const manifest: JARManifest = {};
    
    // Try to find manifest file (case-insensitive search)
    let manifestFile = this.zip.file("META-INF/MANIFEST.MF");
    
    // Also try lowercase and other common variations
    if (!manifestFile) {
      manifestFile = this.zip.file("META-INF/manifest.mf");
    }
    if (!manifestFile) {
      manifestFile = this.zip.file("META-INF/Manifest.mf");
    }

    if (manifestFile) {
      try {
        const manifestText = await manifestFile.async("string");
        const lines = manifestText.split(/\r?\n/);

        let currentKey = "";
        let currentValue = "";

        for (const line of lines) {
          if (line.trim() === "") {
            // Empty line - save current key-value if exists
            if (currentKey) {
              manifest[currentKey] = currentValue.trim();
              currentKey = "";
              currentValue = "";
            }
            continue;
          }

          if (line.startsWith(" ") || line.startsWith("\t")) {
            // Continuation line (starts with space or tab)
            currentValue += " " + line.trim();
          } else {
            // New key-value pair
            if (currentKey) {
              manifest[currentKey] = currentValue.trim();
            }

            const colonIndex = line.indexOf(":");
            if (colonIndex > 0) {
              currentKey = line.substring(0, colonIndex).trim();
              currentValue = line.substring(colonIndex + 1).trim();
            }
          }
        }

        // Save last key-value pair
        if (currentKey) {
          manifest[currentKey] = currentValue.trim();
        }
      } catch (error) {
        console.warn("[JARParser] Failed to parse manifest file:", error);
        // Return empty manifest if parsing fails
      }
    } else {
      console.warn("[JARParser] No manifest file found in JAR");
    }

    return manifest;
  }

  private async parseClasses(): Promise<JARClass[]> {
    const classes: JARClass[] = [];

    for (const [path, file] of Object.entries(this.zip.files)) {
      if (path.endsWith(".class") && !file.dir) {
        const data = await file.async("uint8array");
        const name = path.replace(/\//g, ".").replace(/\.class$/, "");

        classes.push({
          name,
          data,
        });
      }
    }

    return classes;
  }

  private async parseResources(): Promise<Array<{ path: string; data: Uint8Array }>> {
    const resources: Array<{ path: string; data: Uint8Array }> = [];

    for (const [path, file] of Object.entries(this.zip.files)) {
      if (!path.endsWith(".class") && !file.dir && !path.startsWith("META-INF/")) {
        const data = await file.async("uint8array");
        resources.push({
          path,
          data,
        });
      }
    }

    return resources;
  }
}

/**
 * Parse JAR file from ArrayBuffer
 */
export async function parseJAR(buffer: ArrayBuffer): Promise<JARFile> {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new JARParser(zip);
  return parser.parse();
}
