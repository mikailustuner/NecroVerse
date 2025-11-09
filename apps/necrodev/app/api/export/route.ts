import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Export file as PNG, GIF, or MP4
 */
export async function POST(request: NextRequest) {
  try {
    const { fileId, format, frames } = await request.json();

    if (!fileId || !format) {
      return NextResponse.json(
        { error: "Missing fileId or format" },
        { status: 400 }
      );
    }

    // Get file from database
    const { data: file, error: fileError } = await supabase
      .from("graveyard_files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Get file URL
    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(file.storage_path);

    const fileUrl = urlData.publicUrl;

    // Export based on format
    let exportData: Blob | null = null;

    switch (format) {
      case "png":
        exportData = await exportAsPNG(fileUrl);
        break;
      case "gif":
        exportData = await exportAsGIF(fileUrl, frames);
        break;
      case "mp4":
        exportData = await exportAsMP4(fileUrl, frames);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    if (!exportData) {
      return NextResponse.json(
        { error: "Export failed" },
        { status: 500 }
      );
    }

    // Upload exported file
    const exportPath = `exports/${fileId}.${format}`;
    const { error: uploadError } = await supabase.storage
      .from("converted")
      .upload(exportPath, exportData, {
        contentType: `image/${format}`,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload export" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: exportUrlData } = supabase.storage
      .from("converted")
      .getPublicUrl(exportPath);

    return NextResponse.json({
      success: true,
      url: exportUrlData.publicUrl,
      format,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Export as PNG
 */
async function exportAsPNG(fileUrl: string): Promise<Blob | null> {
  try {
    // In a real implementation, this would render the file to canvas and export as PNG
    // For now, return a placeholder
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("PNG export error:", error);
    return null;
  }
}

/**
 * Export as GIF
 */
async function exportAsGIF(fileUrl: string, frames?: number[]): Promise<Blob | null> {
  try {
    // In a real implementation, this would render frames and create animated GIF
    // For now, return a placeholder
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("GIF export error:", error);
    return null;
  }
}

/**
 * Export as MP4
 */
async function exportAsMP4(fileUrl: string, frames?: number[]): Promise<Blob | null> {
  try {
    // In a real implementation, this would render frames and create MP4 video
    // For now, return a placeholder
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error("MP4 export error:", error);
    return null;
  }
}

