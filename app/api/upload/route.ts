import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check if BLOB_READ_WRITE_TOKEN is set
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN environment variable is not set");
    return NextResponse.json(
      {
        error:
          "Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN environment variable in Vercel settings.",
      },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Validate file type and size on the server
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "image/jpeg",
            "image/png",
            "image/webp",
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB max
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional: Log or process completed uploads
        console.log("Upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed. Please check server logs.",
      },
      { status: 400 }
    );
  }
}
