import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo, analyzeImage } from "@/lib/gemini";
import { generateAdCopy } from "@/lib/claude";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No media file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "File must be a video or image" },
        { status: 400 }
      );
    }

    // // Validate file size (50MB limit)
    // const maxSize = 100 * 1024 * 1024; // 50MB
    // if (file.size > maxSize) {
    //   return NextResponse.json(
    //     { error: "File size must be less than 100MB" },
    //     { status: 400 }
    //   );
    // }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file path
    const tmpDir = join(process.cwd(), "tmp");
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = join(tmpDir, fileName);

    // Ensure tmp directory exists
    try {
      const fs = await import("fs/promises");
      await fs.mkdir(tmpDir, { recursive: true });
    } catch (err) {
      console.error("Error creating tmp directory:", err);
    }

    // Write file temporarily
    await writeFile(filePath, buffer);

    try {
      // Analyze media with Gemini based on type
      let result;
      if (isVideo) {
        const videoResult = await analyzeVideo(filePath, file.type);

        // Generate ad copy with Claude using the description
        try {
          const claudeAdCopy = await generateAdCopy(
            videoResult.description,
            videoResult.transcript,
            videoResult.scenes
          );
          videoResult.claudeAdCopy = claudeAdCopy;
        } catch (claudeError) {
          console.error("Error generating ad copy with Claude:", claudeError);
          // Continue without Claude ad copy if it fails
        }

        result = { type: "video" as const, data: videoResult };
      } else {
        const imageResult = await analyzeImage(filePath, file.type);

        // Generate ad copy with Claude using the description
        try {
          const claudeAdCopy = await generateAdCopy(imageResult.description);
          imageResult.claudeAdCopy = claudeAdCopy;
        } catch (claudeError) {
          console.error("Error generating ad copy with Claude:", claudeError);
          // Continue without Claude ad copy if it fails
        }

        result = { type: "image" as const, data: imageResult };
      }

      // Clean up temporary file
      await unlink(filePath);

      return NextResponse.json(result);
    } catch (analysisError) {
      // Clean up temporary file even on error
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error("Error deleting temp file:", unlinkError);
      }

      throw analysisError;
    }
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
