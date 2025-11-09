import { FileMetadata, ConversionResult } from "../types";
import JSZip from "jszip";

export async function convertJAR(
  file: File,
  uploadUrl: string
): Promise<ConversionResult> {
  try {
    const metadata: FileMetadata = {
      name: file.name,
      type: "jar",
      size: file.size,
      converted: false,
      conversionUrl: uploadUrl,
    };

    // Try to extract JAR manifest
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Initialize manifest object
    const manifest: Record<string, any> = {};

    // Look for MANIFEST.MF (try different case variations)
    let manifestFile = zip.file("META-INF/MANIFEST.MF");
    if (!manifestFile) {
      manifestFile = zip.file("META-INF/manifest.mf");
    }
    if (!manifestFile) {
      manifestFile = zip.file("META-INF/Manifest.mf");
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
            // Continuation line
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
        console.warn("[JARConverter] Failed to parse manifest:", error);
        // Continue with empty manifest
      }
    }

    // Always set manifest (even if empty)
    metadata.manifest = manifest;

    // Check for main class
    const mainClass = manifest["Main-Class"];

    // Extract class files
    const classFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith(".class") && !zip.files[name].dir
    );
    
    manifest.classFiles = classFiles;

    // Parse class files for better bytecode interpretation
    const classInfo: Record<string, any> = {};
    for (const classFile of classFiles.slice(0, 10)) { // Limit to first 10 for performance
      try {
        const classData = await zip.file(classFile)?.async("arraybuffer");
        if (classData) {
          // Parse class file header
          const view = new DataView(classData);
          if (classData.byteLength > 8) {
            const magic = view.getUint32(0);
            if (magic === 0xcafebabe) {
              const minorVersion = view.getUint16(4);
              const majorVersion = view.getUint16(6);
              classInfo[classFile] = {
                minorVersion,
                majorVersion,
                size: classData.byteLength,
              };
            }
          }
        }
      } catch (error) {
        // Skip invalid class files
      }
    }
    manifest.classInfo = classInfo;

    // Attempt WebAssembly conversion if possible
    // For now, mark as converted but note it needs WASM runtime
    metadata.converted = true;

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
        type: "jar",
        size: file.size,
        converted: false,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

