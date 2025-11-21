import { prompt1 } from "@/prompt";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AdCopy {
  headline: string;
  description: string;
}

/**
 * Generates ad copy (headline and description) from an ad description using Claude
 * @param adDescription - The description of the ad from Gemini analysis
 * @param adTranscript - Optional transcript from video analysis
 * @param adScenes - Optional scene breakdown from video analysis
 * @returns Promise<AdCopy> - The generated headline and description
 */
export async function generateAdCopy(
  adDescription: string,
  adTranscript?: string,
  adScenes?: string[]
): Promise<AdCopy> {
  const content = `
  ${adDescription}
  ${
    adTranscript
      ? `
  Transcript:
  ${adTranscript}
  `
      : ""
  }
  ${
    adScenes && adScenes.length > 0
      ? `
  Scenes:
  ${adScenes.join("\n")}
  `
      : ""
  }
  `;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tool_choice: { type: "tool", name: "ad_copy" },
      messages: [
        {
          role: "user",
          content: `IMPORTANT: You MUST use the ad_copy tool to respond. Do not return plain text.

You are a professional ad copywriter. Using the Eugene Schwartz's Problem-Solution Framework write ad copy.

The ad you're writing content for is:
${content}

${prompt1}`,
        },
      ],
      tools: [
        {
          name: "ad_copy",
          description: "Write ad copy with headline and description",
          input_schema: {
            type: "object",
            properties: {
              headline: {
                type: "string",
                description:
                  "A headline (maximum 50 characters) - should be attention-grabbing and concise",
              },
              description: {
                type: "string",
                description:
                  "A longer ad description - should be persuasive and based on the Problem-Solution Framework",
              },
            },
            required: ["headline", "description"],
          },
        } as const,
      ],
    });

    console.log(message.content, "message.content");

    // Check if Claude used the tool (tool_use) or returned text
    if (!message.content || message.content.length === 0) {
      throw new Error("Claude returned an empty response");
    }

    const firstBlock = message.content[0];

    // Handle tool_use response (structured tool output)
    if (firstBlock.type === "tool_use" && firstBlock.name === "ad_copy") {
      const adCopy = firstBlock.input as AdCopy;
      console.log("Extracted adCopy from tool_use:", adCopy);

      return {
        headline: adCopy.headline || "",
        description: adCopy.description || "",
      };
    }

    // Handle text response (fallback if tool wasn't used)
    if (firstBlock.type === "text") {
      const responseText = firstBlock.text;
      console.log(
        "[Claude] Returned text response. First 200 chars:",
        responseText.substring(0, 200)
      );

      // Try multiple JSON extraction methods
      let parsedAdCopy: AdCopy | null = null;

      // Method 1: Direct JSON parse (for clean JSON responses)
      if (!parsedAdCopy) {
        try {
          let cleanedText = responseText.trim();
          cleanedText = cleanedText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "");

          parsedAdCopy = JSON.parse(cleanedText);
          console.log("[Claude] ✓ Parsed using direct JSON");
        } catch {
          // Continue to next method
        }
      }

      // Final fallback: Claude didn't return valid format
      console.warn(
        "[Claude] ⚠ No valid ad copy found. Using fallback defaults."
      );
      return {
        headline: "Comprehensive Health Testing",
        description:
          "Get 100+ biomarkers tested for just $199/year. Screen for 1,000+ diseases before symptoms appear. Start today at superpower.com",
      };
    }

    // If we get here, the response format is unexpected
    throw new Error(
      `Unexpected Claude response format: ${JSON.stringify(message.content)}`
    );
  } catch (error) {
    console.error("Error generating ad copy with Claude:", error);
    throw new Error(
      `Failed to generate ad copy: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
