import { NextRequest, NextResponse } from "next/server";
import { AIFormatDetector } from "@graveyard-runtime/ai/format-detector";

/**
 * AI Analysis API Route
 * Analyzes files using AI-powered format detection
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const detector = new AIFormatDetector();
    
    // Detect format
    const detection = await detector.detectFormat(file);
    
    // Analyze file
    const analysis = await detector.analyzeFile(file);
    
    // Get enhancement suggestions
    const suggestions = await detector.getEnhancementSuggestions(file, analysis);

    return NextResponse.json({
      success: true,
      detection,
      analysis,
      suggestions,
    });
  } catch (error) {
    console.error("[AI Analyze] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "fileId required" }, { status: 400 });
  }

  // In a full implementation, this would:
  // 1. Get file from storage
  // 2. Analyze file
  // 3. Return analysis results

  return NextResponse.json({
    success: true,
    message: "Analysis endpoint - provide file via POST for analysis",
  });
}

