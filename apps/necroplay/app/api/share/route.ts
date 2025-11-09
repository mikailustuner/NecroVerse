import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Generate share link for file
 */
export async function POST(request: NextRequest) {
  try {
    const { fileId, isPublic } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId" },
        { status: 400 }
      );
    }

    // Update file visibility
    const { error: updateError } = await supabase
      .from("files")
      .update({ is_public: isPublic })
      .eq("id", fileId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update visibility" },
        { status: 500 }
      );
    }

    // Generate share link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const shareLink = `${baseUrl}/play/${fileId}`;

    // Generate embed code
    const embedCode = `<iframe src="${shareLink}" width="800" height="600" frameborder="0"></iframe>`;

    return NextResponse.json({
      success: true,
      shareLink,
      embedCode,
      isPublic,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get share information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "Missing fileId" },
        { status: 400 }
      );
    }

    // Get file
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("id, is_public")
      .eq("id", fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const shareLink = `${baseUrl}/play/${fileId}`;
    const embedCode = `<iframe src="${shareLink}" width="800" height="600" frameborder="0"></iframe>`;

    return NextResponse.json({
      success: true,
      shareLink,
      embedCode,
      isPublic: file.is_public || false,
    });
  } catch (error) {
    console.error("Get share error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

