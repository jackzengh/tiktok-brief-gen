import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFile } from "fs/promises";
import { AdCopy } from "./claude";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface VideoAnalysisResult {
  transcript: string;
  description: string;
  scenes: string[];
  claudeAdCopy?: AdCopy;
}

export interface ImageAnalysisResult {
  description: string;
  adCopy: string[];
  visualElements: string[];
  claudeAdCopy?: AdCopy;
}

export type MediaAnalysisResult =
  | { type: "video"; data: VideoAnalysisResult }
  | { type: "image"; data: ImageAnalysisResult };

export async function analyzeVideo(
  filePath: string,
  mimeType: string
): Promise<VideoAnalysisResult> {
  try {
    // Read the video file
    const videoData = await readFile(filePath);
    const base64Video = videoData.toString("base64");

    // Use Gemini 1.5 Pro for video analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Please analyze this video and provide:

1. A complete transcript of all spoken dialogue and audio content in the video
2. A detailed description of the video including:
   - The overall setting and environment
   - Key visual elements and props
   - Lighting and atmosphere
   - Any notable actions or movements
3. A breakdown of distinct scenes or segments

Please format your response as JSON with the following structure:
{
  "transcript": "Full transcript of the video...",
  "description": "Detailed description of the setting and visuals...",
  "scenes": ["Scene 1 description", "Scene 2 description", ...]
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Video,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    console.log(response);
    const text = response.text();

    // Try to parse JSON from the response
    let parsedResult: VideoAnalysisResult;

    try {
      // Remove markdown code blocks if present
      const jsonText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(jsonText);
      console.log(parsedResult, "parsedResult");
    } catch {
      // If JSON parsing fails, try to extract information from plain text
      console.warn("Failed to parse JSON, extracting from plain text");

      parsedResult = {
        transcript:
          extractSection(text, "transcript") || "No transcript available",
        description: extractSection(text, "description") || text,
        scenes: extractScenes(text),
      };
    }

    return parsedResult;
  } catch (error) {
    console.error("Error analyzing video with Gemini:", error);
    throw new Error(
      `Failed to analyze video: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function extractSection(text: string, section: string): string | null {
  const patterns = [
    new RegExp(`"${section}":\\s*"([^"]*)"`, "i"),
    new RegExp(`${section}:\\s*([^\\n]+)`, "i"),
    new RegExp(`##?\\s*${section}[:\\s]+([^#]+)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractScenes(text: string): string[] {
  const scenesMatch = text.match(/"scenes":\s*\[([\s\S]*?)\]/);
  if (scenesMatch) {
    try {
      return JSON.parse(`[${scenesMatch[1]}]`);
    } catch {
      // Fall through to alternative extraction
    }
  }

  // Try to find numbered scenes
  const scenePattern = /(?:Scene|Segment)\s+\d+[:\s]+([^\n]+)/gi;
  const scenes: string[] = [];
  let match;

  while ((match = scenePattern.exec(text)) !== null) {
    scenes.push(match[1].trim());
  }

  return scenes.length > 0 ? scenes : ["Main scene: " + text.substring(0, 200)];
}

export async function analyzeImage(
  filePath: string,
  mimeType: string
): Promise<ImageAnalysisResult> {
  try {
    // Read the image file
    const imageData = await readFile(filePath);
    const base64Image = imageData.toString("base64");

    // Use Gemini for image analysis
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Please analyze this image for advertising and marketing purposes. Provide:

1. A detailed description of the image including:
   - The overall setting and environment
   - Key visual elements, objects, and subjects
   - Colors, lighting, and mood
   - Composition and style

2. Ad copy on the ad (the text that is currently displayed on the ad image)

3. A list of key visual elements that make this image effective for marketing

Please format your response as JSON with the following structure:
{
  "description": "Detailed description of the image...",
  "adCopy": ["Ad copy option 1", "Ad copy option 2", "Ad copy option 3"],
  "visualElements": ["Element 1", "Element 2", "Element 3"],
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // Try to parse JSON from the response
    let parsedResult: ImageAnalysisResult;

    try {
      // Remove markdown code blocks if present
      const jsonText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedResult = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, try to extract information from plain text
      console.warn("Failed to parse JSON, extracting from plain text");

      parsedResult = {
        description: extractSection(text, "description") || text,
        adCopy: extractArraySection(text, "adCopy") || [
          "Professional marketing copy for your brand",
        ],
        visualElements: extractArraySection(text, "visualElements") || [
          "Key visual elements identified",
        ],
      };
    }

    return parsedResult;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error(
      `Failed to analyze image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

function extractArraySection(text: string, section: string): string[] | null {
  // Try to extract JSON array
  const arrayMatch = text.match(
    new RegExp(`"${section}":\\s*\\[([\s\S]*?)\\]`, "i")
  );
  if (arrayMatch) {
    try {
      return JSON.parse(`[${arrayMatch[1]}]`);
    } catch {
      // Fall through to alternative extraction
    }
  }

  // Try to find bulleted or numbered list
  const listPattern = new RegExp(
    `${section}[:\\s]+([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`,
    "i"
  );
  const listMatch = text.match(listPattern);
  if (listMatch) {
    const items = listMatch[1]
      .split(/\n/)
      .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter((line) => line.length > 0);
    if (items.length > 0) {
      return items;
    }
  }

  return null;
}
