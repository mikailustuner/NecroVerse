import { FileMetadata, ConversionResult } from "../types";
import JSZip from "jszip";

export async function convertXAP(
  file: File,
  uploadUrl: string
): Promise<ConversionResult> {
  try {
    const metadata: FileMetadata = {
      name: file.name,
      type: "xap",
      size: file.size,
      converted: false,
      conversionUrl: uploadUrl,
    };

    // XAP files are ZIP archives containing Silverlight content
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Look for AppManifest.xaml
    const manifestFile = zip.file("AppManifest.xaml");
    if (manifestFile) {
      const manifestText = await manifestFile.async("string");
      
      // Extract basic info from manifest
      const manifest: Record<string, unknown> = {
        manifest: manifestText,
      };

      // Try to find XAML files
      const xamlFiles = Object.keys(zip.files).filter(
        (name) => name.endsWith(".xaml")
      );
      manifest.xamlFiles = xamlFiles;

      // Extract and convert XAML files to HTML
      const htmlFiles: Record<string, string> = {};
      for (const xamlFile of xamlFiles) {
        const xamlContent = await zip.file(xamlFile)?.async("string");
        if (xamlContent) {
          // Convert XAML to HTML
          const htmlContent = convertXAMLToHTML(xamlContent);
          htmlFiles[xamlFile.replace(".xaml", ".html")] = htmlContent;
        }
      }
      manifest.htmlFiles = htmlFiles;

      metadata.manifest = manifest;
    }

    // Mark as converted - will use HTML5 polyfill
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
        type: "xap",
        size: file.size,
        converted: false,
      },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert XAML to HTML
 */
function convertXAMLToHTML(xaml: string): string {
  // Basic XAML to HTML conversion
  // In a full implementation, this would properly parse XAML and convert to semantic HTML
  
  let html = xaml;
  
  // Replace common XAML elements with HTML equivalents
  html = html.replace(/<Canvas/gi, "<div class='xaml-canvas'");
  html = html.replace(/<\/Canvas>/gi, "</div>");
  html = html.replace(/<Rectangle/gi, "<div class='xaml-rectangle'");
  html = html.replace(/<\/Rectangle>/gi, "</div>");
  html = html.replace(/<Ellipse/gi, "<div class='xaml-ellipse'");
  html = html.replace(/<\/Ellipse>/gi, "</div>");
  html = html.replace(/<TextBlock/gi, "<div class='xaml-textblock'");
  html = html.replace(/<\/TextBlock>/gi, "</div>");
  html = html.replace(/<Button/gi, "<button class='xaml-button'");
  html = html.replace(/<\/Button>/gi, "</button>");
  
  // Convert attributes
  html = html.replace(/Canvas\.Left="([^"]+)"/gi, 'style="left: $1px"');
  html = html.replace(/Canvas\.Top="([^"]+)"/gi, (match, value) => {
    const existing = html.match(/style="([^"]*)"/);
    if (existing) {
      return `style="${existing[1]}; top: ${value}px"`;
    }
    return `style="top: ${value}px"`;
  });
  html = html.replace(/Width="([^"]+)"/gi, (match, value) => {
    const existing = html.match(/style="([^"]*)"/);
    if (existing) {
      return `style="${existing[1]}; width: ${value}px"`;
    }
    return `style="width: ${value}px"`;
  });
  html = html.replace(/Height="([^"]+)"/gi, (match, value) => {
    const existing = html.match(/style="([^"]*)"/);
    if (existing) {
      return `style="${existing[1]}; height: ${value}px"`;
    }
    return `style="height: ${value}px"`;
  });
  html = html.replace(/Fill="([^"]+)"/gi, (match, value) => {
    const existing = html.match(/style="([^"]*)"/);
    if (existing) {
      return `style="${existing[1]}; background-color: ${value}"`;
    }
    return `style="background-color: ${value}"`;
  });
  
  return html;
}

