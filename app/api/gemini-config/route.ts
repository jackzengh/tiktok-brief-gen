import { NextResponse } from "next/server";

export async function GET() {
  // Return the Gemini API key for client-side uploads
  // Note: Consider implementing additional security measures like:
  // - Rate limiting
  // - Domain restrictions in Google Cloud Console
  // - Separate upload-only API key with restricted permissions

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    apiKey: process.env.GEMINI_API_KEY,
  });
}
