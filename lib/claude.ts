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
      messages: [
        {
          role: "user",
          content: `You are a professional ad copywriter. Using the Eugene Schwartz's Problem-Solution Framework write ad copy.

The ad you're writing content for is:
${content}

You are an expert Meta ads copywriter specializing in health tech and DTC healthcare. Your task is to write a compelling ad headline and ad description (primary text) for Superpower's preventive health testing service.

About Superpower
Core Offering:

Comprehensive blood testing: 100+ biomarkers (view full list at superpower.com/biomarkers)
Price: $199/year (vs competitors like Function Health at $499)
Screens for 1,000+ diseases years before symptoms appear
Quarterly testing available at 2,000+ locations nationwide
Personalized health protocols based on individual data
24/7 SMS concierge access to clinicians from Harvard, UCLA, and Stanford
Curated supplement marketplace (20% cheaper than Amazon, clinically vetted)
150,000+ active members

Key Differentiators:

Most comprehensive testing at the lowest price point
Not just a PDF report - includes actionable health plan + clinical support
Early detection capabilities far beyond standard annual physicals (which test only 20-30 markers)
Year-round clinical team support, not just test results

Target ICPs & Their Pain Points
Performance Optimizers: "Why am I tired/underperforming despite doing everything right?"
Worried Well: "What if something's wrong and I don't know it yet?"
Data-Driven Professionals: "My doctor only tests 20 markers - what critical data am I missing?"
Parents/Family-Focused: "I need to be healthy and present for my family's future"
Biohackers: "I need precise, comprehensive data to truly optimize my protocols"

Your Task
Write:

Ad Headline (40 characters max) - A punchy, scroll-stopping hook
Ad Description/Primary Text (Full primary text for Meta ad) - The main ad copy

CRITICAL: Single-Concept Framework (Eugene Schwartz Problem-Solution)
Each ad MUST focus on ONE specific concept only. Do not mix multiple angles or ICPs.
Follow this structure:

Stage 1: Problem Awareness (20-25% of copy)

Open with the specific, relatable problem
Make them feel seen and understood
Use their exact language and frustrations
Build emotional tension around THIS ONE problem
KEEP THIS SECTION BRIEF - 2-3 short sentences maximum

Stage 2: Problem Agitation (15-20% of copy)

Deepen the pain by showing what they're missing
Reveal hidden aspects of the problem they may not realize
Show the cost of inaction or the status quo
Stay focused on THIS ONE problem - don't introduce new ones
KEEP THIS SECTION BRIEF - 2-3 short sentences maximum

Stage 3: Solution Introduction (50-60% of copy)

Present Superpower as the direct answer to THIS problem
Only mention features/benefits that solve THIS specific problem
Show the transformation and relief
Paint the "after" state clearly
THIS IS YOUR MAIN SECTION - spend most of your words here

Stage 4: Call to Action (Final line)

Always: "Start today at superpower.com"

Copy Length Guidelines
CRITICAL: Keep copy MUCH shorter than previous versions

Total ad description: 400-600 characters maximum (approximately 60-90 words)
Problem + Agitation combined: 150-200 characters (3-5 short sentences)
Solution section: 200-350 characters (the bulk of your copy)
Each sentence: 8-12 words maximum
Each paragraph: 1-3 sentences maximum

Single-Concept Examples

Concept: Menopausal women feeling dismissed by doctors

Problem: Doctor says "it's just menopause" and dismisses real symptoms
Features to mention: Hormone testing (progesterone, cortisol, thyroid), personalized protocols, clinical support
DON'T mention: Price comparisons to Function Health, biohacker optimization, disease screening breadth

Concept: Healthy people confused by "normal" test results despite feeling off

Problem: Everything tests "normal" but they know something's wrong
Features to mention: 100+ biomarkers vs standard 20-30, early detection, comprehensive testing
DON'T mention: Specific hormone details unless relevant, supplement marketplace unless testing reveals deficiencies

Concept: Price-conscious consumers comparing to Function Health

Problem: Paying too much for just a PDF and no support
Features to mention: $199 vs $499, clinical SMS concierge, personalized plan, supplement marketplace
DON'T mention: Generic "feeling dismissed by doctors" unless tied to price/value angle

Concept: Parents worried about being there for their kids' future

Problem: Fear of missing something serious that could take them away from family
Features to mention: Screen 1,000+ diseases early, quarterly tracking, early detection
DON'T mention: Performance optimization, biohacking, price comparisons

CRITICAL: Stay On-Concept Rules
❌ DON'T:

Mix multiple ICPs in one ad (e.g., biohackers + worried parents)
List all features/benefits - only those relevant to your ONE concept
Mention competitors unless the concept is specifically about price/value comparison
Reference price if the concept is about medical dismissal or symptom validation
Kitchen-sink every benefit - laser focus on what solves THIS problem
Write long paragraphs or dense copy blocks

✅ DO:

Pick ONE ICP with ONE specific problem
Only cite features that directly solve that problem
Use language and scenarios specific to that ICP's world
Build the entire narrative around one cohesive story
Make every sentence reinforce the same core message
Keep it punchy and scannable
When listing items, use the ✅ emoji to precede each item

Copy Structure & Formatting
Paragraph Structure:

Each sentence gets its own line
Short, punchy sentences (8-12 words maximum per line)
Very short paragraphs (1-3 sentences max)
Blank lines between paragraphs for breathing room
Use the ✅ emoji for lists - precede each listed item with ✅
Never write dense blocks of text

Sentence Style:

One thought per line
Fragment sentences are encouraged
Short, declarative statements
Conversational, like you're texting a friend
No run-on sentences

List Formatting:
When listing items, always use this format:

✅ heart health
✅ thyroid health
✅ metabolism

Reference Examples (Study These Closely)

Example 1: The "Normal" Isn't Normal Story (IMPROVED - SHORTER VERSION)

Your doctor says "everything's normal."
But you still feel terrible.

Here's why:

They only tested 20-30 basic markers.
They missed your hormones entirely.

Get the full picture:

✅ 100+ biomarkers tested
✅ Complete hormone panel
✅ Harvard-trained clinical team
✅ Personalized health plan

No more being dismissed.
Finally, the answers you deserve.

Start today at superpower.com


{
  "headline": "your headline here",
  "description": "your longer ad description here"
}`,
        },
      ],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
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

      // Try to parse as JSON
      try {
        // Clean up markdown code blocks if present
        let cleanedText = responseText.trim();
        cleanedText = cleanedText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "");

        const adCopy = JSON.parse(cleanedText);
        console.log("Parsed adCopy from text:", adCopy);
        return {
          headline: adCopy.headline || "",
          description: adCopy.description || "",
        };
      } catch (parseError) {
        console.error(
          "Failed to parse Claude text response as JSON:",
          parseError
        );

        // Try to extract JSON from markdown code blocks
        const jsonMatch = responseText.match(
          /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
        );
        if (jsonMatch) {
          try {
            const adCopy = JSON.parse(jsonMatch[1]);
            return {
              headline: adCopy.headline || "",
              description: adCopy.description || "",
            };
          } catch (e) {
            console.error("Failed to parse extracted JSON:", e);
          }
        }

        // Fallback: extract headline and description using regex
        const headlineMatch = responseText.match(/"headline":\s*"([^"]+)"/);
        const descriptionMatch = responseText.match(
          /"description":\s*"([^"]+)"/
        );

        return {
          headline: headlineMatch
            ? headlineMatch[1]
            : "Discover Something Amazing",
          description: descriptionMatch
            ? descriptionMatch[1]
            : "Check out this incredible ad that will capture your attention.",
        };
      }
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
