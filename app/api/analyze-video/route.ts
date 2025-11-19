import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo, analyzeImage } from "@/lib/gemini";
import { generateAdCopy } from "@/lib/claude";
import { VideoAnalysisResult, ImageAnalysisResult } from "@/lib/gemini";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

// Configure route segment for video processing
export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes for video processing

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Parse JSON body containing Blob URL
    const body = await request.json();
    const { blobUrl, mimeType, fileName } = body;

    if (!blobUrl || !mimeType) {
      return NextResponse.json(
        { error: "Missing blob URL or mime type" },
        { status: 400 }
      );
    }

    // Download file from Vercel Blob to temp storage (with retry for race conditions)
    console.log("Downloading file from Blob:", blobUrl);

    let fileResponse: Response | null = null;
    try {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      fileResponse = await fetch(blobUrl);
    } catch (error) {
      console.error("Error downloading file from Blob:", error);
      throw new Error("Failed to download file from Blob");
    }

    if (!fileResponse || !fileResponse.ok) {
      throw new Error("Failed to download file from Blob");
    }

    console.log(
      "Blob download successful. Size:",
      fileResponse.headers.get("content-length")
    );

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Downloaded buffer size:", buffer.length, "bytes");

    // Save to temp directory
    const tmpDir = process.env.VERCEL ? "/tmp" : join(process.cwd(), "tmp");
    const tempFileName = `${Date.now()}-${fileName || "upload"}`;
    tempFilePath = join(tmpDir, tempFileName);

    await writeFile(tempFilePath, buffer);
    console.log("File saved to temp:", tempFilePath);

    // Validate file type
    const isVideo = mimeType.startsWith("video/");
    const isImage = mimeType.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "File must be a video or image" },
        { status: 400 }
      );
    }

    // Analyze media with Gemini (this will upload to Gemini internally)
    let result: VideoAnalysisResult | ImageAnalysisResult;
    if (isVideo) {
      result = await analyzeVideo(tempFilePath, mimeType);

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
      result = await analyzeImage(tempFilePath, mimeType);

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

    // Clean up temp file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log("Temp file cleaned up:", tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
        // Don't fail the request if cleanup fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing media:", error);

    // Clean up temp file on error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process media",
      },
      { status: 500 }
    );
  }
}
