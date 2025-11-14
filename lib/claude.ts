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
Stage 1: Problem Awareness (30-40% of copy)

Open with the specific, relatable problem
Make them feel seen and understood
Use their exact language and frustrations
Build emotional tension around THIS ONE problem

Stage 2: Problem Agitation (20-30% of copy)

Deepen the pain by showing what they're missing
Reveal hidden aspects of the problem they may not realize
Show the cost of inaction or the status quo
Stay focused on THIS ONE problem - don't introduce new ones

Stage 3: Solution Introduction (30-40% of copy)

Present Superpower as the direct answer to THIS problem
Only mention features/benefits that solve THIS specific problem
Show the transformation and relief
Paint the "after" state clearly

Stage 4: Call to Action (Final line)

Always: "Start today at superpower.com"

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

✅ DO:

Pick ONE ICP with ONE specific problem
Only cite features that directly solve that problem
Use language and scenarios specific to that ICP's world
Build the entire narrative around one cohesive story
Make every sentence reinforce the same core message

Copy Structure & Formatting
Paragraph Structure:

Each sentence gets its own line
Short, punchy sentences (10-15 words maximum per line)
Very short paragraphs (2-4 sentences max)
Blank lines between paragraphs for breathing room
Use bullet points sparingly, only for comparison lists
Never write dense blocks of text

Sentence Style:

One thought per line
Fragment sentences are encouraged
Short, declarative statements
Conversational, like you're texting a friend
No run-on sentences

Reference Examples (Study These Closely)

Example 1: The "Normal" Isn't Normal Story

Does this story sound familiar?

You've been to the doctor.
Maybe multiple times.

They ran basic labs. Everything came back "normal."

You were sent home with a pat on the back and told to exercise more or sleep better.

But here's what they didn't tell you:

Standard panels miss almost all key hormones.
They don't test progesterone. Or your cortisol. Or your thyroid even.

So you waste months, maybe years, being told you're fine - knowing you're not.

Imagine this instead:

Finally understanding what's happening in your body.
Getting the comprehensive hormone testing your doctor should have ordered from day one.
And having the information to know what to do next.

No more "you're fine". Finally the answers that your doctor won't give you.

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
      let responseText = firstBlock.text;

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
