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
 * @returns Promise<AdCopy> - The generated headline and description
 */
export async function generateAdCopy(adDescription: string): Promise<AdCopy> {
  const tools = [
    {
      type: "web_search_20250305",
      name: "web_search",
      max_uses: 5,
    },
    {
      name: "ad_copy",
      description: "Write ad copy",
      input_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          description: { type: "string" },
        },
        required: ["headline", "description"],
      },
    },
  ];
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a professional ad copywriter. Using Eugene Schwartz's Problem-Solution Framework write ad copy.

Ad Description:
${adDescription}

Generate ad copy with:
1. A headline (maximum 50 characters) - should be attention-grabbing and concise
2. A longer ad description - should be persuasive and based on the Problem-Solution Framework

You will be advertising the company Superpower 

Return the response in the following JSON format without any additional text:
{
  "headline": "your headline here",
  "description": "your longer ad description here"
}`,
        },
      ],
      tools: tools,
    });

    console.log(message.content, "message.content");

    // Extract the text content from Claude's response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Try to parse as JSON
    try {
      const adCopy = JSON.parse(responseText);
      console.log(adCopy, "adCopy");
      return {
        headline: adCopy.headline || "",
        description: adCopy.description || "",
      };
    } catch (parseError) {
      // Fallback: extract headline and description from text
      console.error("Failed to parse Claude response as JSON:", parseError);

      // Try to extract headline and description from the text
      const headlineMatch = responseText.match(/"headline":\s*"([^"]+)"/);
      const descriptionMatch = responseText.match(/"description":\s*"([^"]+)"/);

      return {
        headline: headlineMatch
          ? headlineMatch[1]
          : "Discover Something Amazing",
        description: descriptionMatch
          ? descriptionMatch[1]
          : "Check out this incredible ad that will capture your attention.",
      };
    }
  } catch (error) {
    console.error("Error generating ad copy with Claude:", error);
    throw new Error(
      `Failed to generate ad copy: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
