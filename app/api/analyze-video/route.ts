import { NextRequest, NextResponse } from "next/server";
import { analyzeVideoByUri, analyzeImageByUri } from "@/lib/gemini";
import { generateAdCopy } from "@/lib/claude";

// Configure route segment for video processing
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body containing Gemini file info
    const body = await request.json();
    const { fileUri, mimeType } = body;

    if (!fileUri || !mimeType) {
      return NextResponse.json(
        { error: "Missing file URI or mime type" },
        { status: 400 }
      );
    }

    // Validate file type
    const isVideo = mimeType.startsWith("video/");
    const isImage = mimeType.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "File must be a video or image" },
        { status: 400 }
      );
    }

    // Analyze media with Gemini using the already-uploaded file URI
    let result;
    if (isVideo) {
      result = await analyzeVideoByUri(fileUri, mimeType);

      // Generate ad copy with Claude using the description
      try {
        const claudeAdCopy = await generateAdCopy(
          result.description,
          result.transcript,
          result.scenes
        );
        result.claudeAdCopy = claudeAdCopy;
      } catch (claudeError) {
        console.error("Error generating ad copy with Claude:", claudeError);
        // Continue without Claude ad copy if it fails
      }
    } else if (isImage) {
      result = await analyzeImageByUri(fileUri, mimeType);

      // Generate ad copy with Claude using the description
      try {
        const claudeAdCopy = await generateAdCopy(result.description);
        result.claudeAdCopy = claudeAdCopy;
      } catch (claudeError) {
        console.error("Error generating ad copy with Claude:", claudeError);
        // Continue without Claude ad copy if it fails
      }
    } else {
      return NextResponse.json(
        { error: "File must be a video or image" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process media",
      },
      { status: 500 }
    );
  }
}
