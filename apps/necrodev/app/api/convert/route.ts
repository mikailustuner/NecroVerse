import { NextRequest, NextResponse } from "next/server";
import { convertFile } from "@graveyard-runtime/converters";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { fileId, fileUrl, fileName } = await request.json();

    if (!fileId || !fileUrl) {
      return NextResponse.json(
        { error: "Missing fileId or fileUrl" },
        { status: 400 }
      );
    }

    // Fetch file from storage
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer]);
    const file = new File([blob], fileName || "file", {
      type: "application/octet-stream",
    });

    // Convert file
    const result = await convertFile(file, fileUrl);

    // Update file record
    await supabase
      .from("files")
      .update({
        status: result.success ? "ready" : "failed",
        conversion_url: result.outputUrl,
        metadata: result.metadata,
      })
      .eq("id", fileId);

    // Create log entry
    await supabase.from("graveyard_logs").insert({
      file_id: fileId,
      message: result.success
        ? `[resurrection successful] ${fileName}`
        : `[resurrection failed] ${fileName}: ${result.error}`,
      level: result.success ? "success" : "error",
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

