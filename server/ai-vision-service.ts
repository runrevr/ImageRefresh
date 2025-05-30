import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface VisionAnalysis {
  productType: string;
  strengths: string[];
  improvements: string[];
  audienceAppeal: string;
  qualityScore: number;
  brandAlignment: string;
  technicalDetails: {
    composition: string;
    lighting: string;
    background: string;
    colorBalance: string;
  };
  enhancementOpportunities: string[];
}

interface EnhancementIdea {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  estimatedTime: string;
  toolsNeeded: string[];
  industryRelevance: number;
  editPrompt: string;
}

/**
 * Analyze product image using OpenAI GPT-4 Vision for superior image analysis
 */
export async function analyzeProductImage(
  imagePath: string,
  industryContext?: string,
  productType?: string,
): Promise<VisionAnalysis> {
  try {
    console.log("[GPT-4 Vision] Starting product image analysis...");

    // Convert image to base64 for GPT-4 Vision
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Use GPT-4 Vision for detailed analysis
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this product image for a ${industryContext || "general"} business.
                     Product type: ${productType || "Not specified"}

                     Provide analysis in JSON format:
                     {
                       "product_identification": "what product is this",
                       "current_quality": {
                         "lighting": "detailed lighting assessment",
                         "background": "background evaluation",
                         "composition": "composition analysis", 
                         "technical": "technical quality notes"
                       },
                       "strengths": ["strength1", "strength2", "strength3"],
                       "improvements_needed": ["improvement1", "improvement2", "improvement3"],
                       "audience_appeal": "description of target audience appeal",
                       "quality_score": 8.5,
                       "brand_alignment": "assessment of brand representation",
                       "enhancement_opportunities": ["opportunity1", "opportunity2", "opportunity3"]
                     }`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysisText = response.choices[0].message.content || "";

    // Parse GPT-4 Vision's JSON response
    let parsedAnalysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // Fallback parsing if JSON is malformed
      parsedAnalysis = {
        product_identification: extractProductType(analysisText),
        current_quality: {
          lighting: extractTechnicalDetail(analysisText, "lighting"),
          background: extractTechnicalDetail(analysisText, "background"),
          composition: extractTechnicalDetail(analysisText, "composition"),
          technical: extractTechnicalDetail(analysisText, "technical"),
        },
        strengths: extractStrengths(analysisText),
        improvements_needed: extractImprovements(analysisText),
        audience_appeal: extractAudienceAppeal(analysisText),
        quality_score: extractQualityScore(analysisText),
        brand_alignment: extractBrandAlignment(analysisText),
        enhancement_opportunities:
          extractEnhancementOpportunities(analysisText),
      };
    }

    // Convert to our interface format
    const analysis: VisionAnalysis = {
      productType: parsedAnalysis.product_identification || "Product",
      strengths: parsedAnalysis.strengths || [],
      improvements: parsedAnalysis.improvements_needed || [],
      audienceAppeal:
        parsedAnalysis.audience_appeal || "Appeals to general audience",
      qualityScore: parsedAnalysis.quality_score || 7.5,
      brandAlignment:
        parsedAnalysis.brand_alignment || "Good brand representation",
      technicalDetails: {
        composition:
          parsedAnalysis.current_quality?.composition ||
          "Well-centered placement",
        lighting:
          parsedAnalysis.current_quality?.lighting || "Adequate lighting",
        background:
          parsedAnalysis.current_quality?.background || "Clean background",
        colorBalance:
          parsedAnalysis.current_quality?.technical || "Good color accuracy",
      },
      enhancementOpportunities: parsedAnalysis.enhancement_opportunities || [],
    };

    console.log("[GPT-4 Vision] Analysis complete");
    return analysis;
  } catch (error) {
    console.error("[GPT-4 Vision] Error analyzing image:", error);
    throw new Error(`Vision analysis failed: ${error}`);
  }
}

/**
 * Generate enhancement ideas using Claude 4 Sonnet based on vision analysis
 */
export async function generateEnhancementIdeas(
  visionAnalysis: VisionAnalysis,
  industryContext: string[],
  productType?: string,
): Promise<EnhancementIdea[]> {
  try {
    console.log(
      "[Claude 4 Ideas] Generating enhancement ideas with latest model...",
    );

    // Use Claude Sonnet 4 with enhanced creative prompt for scroll-stopping concepts
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0.9, // Increase creativity
      messages: [
        {
          role: "user",
          content: `You are a visionary product photographer creating scroll-stopping concepts for small business owners.

Product info: 
- Product: ${visionAnalysis.productType || "Product"}
- Current image analysis: ${JSON.stringify(
            {
              productType: visionAnalysis.productType,
              strengths: visionAnalysis.strengths,
              improvements: visionAnalysis.improvements,
              qualityScore: visionAnalysis.qualityScore,
              technicalDetails: visionAnalysis.technicalDetails,
              enhancementOpportunities: visionAnalysis.enhancementOpportunities,
            },
            null,
            2,
          )}
- Business context: ${industryContext.join(", ")}
- Product type: ${productType || "General Product"}

Based on the specific analysis above, generate exactly 5 unique enhancement concepts tailored to THIS image's needs:

IDEA 1: TECHNICAL PERFECTION - Analyze the original image's weaknesses and create a technically flawless version. Address specific issues: harsh shadows → soft diffused lighting, cluttered background → clean minimalist backdrop, poor angles → hero angle showcasing best features, bad color → color-accurate reproduction

IDEA 2: LIFESTYLE STORYTELLING - Build a complete scene showing the product in its moment of peak value. Consider: who uses this, when do they need it most, what problem does it solve? Create authentic environmental context with supporting elements that tell that story

IDEA 3: MODERN ARTISTRY - Elevate the product through sophisticated visual treatment. Consider: dramatic black & white photography with rich tonal range, ultra-minimalist composition with bold negative space, high-contrast monochrome, sleek contemporary styling with geometric elements, museum-quality presentation, or editorial elegance if appropriate for the product

IDEA 4: PATTERN INTERRUPT - Create cognitive dissonance that forces a double-take. Consider: impossible physics (floating, melting upward), surreal scale relationships, product doing something it shouldn't, environments that don't match but somehow work

IDEA 5: MULTIVERSE MADNESS - Product as hero in impossible realities. Focus on INSANE ENVIRONMENTS around the unchanged product: cosmic explosions, abstract art storms, gravity-defying landscapes, dimensional rifts, liquid light oceans, fractal forests, time distortions, aurora tornadoes, floating in void with reality glitching, paint splatter universes, crystalline dimensions. NO characters/creatures - pure environmental chaos making viewers say "how is this even possible?!"

For each concept, return a JSON object with:
- id: unique identifier based on what this image specifically needs
- title: descriptive 2-4 word title reflecting the specific enhancement
- description: brief explanation (leave empty for now)  
- impact: "high"
- difficulty: "medium"
- category: "AI Generated"
- estimatedTime: "30-60 minutes"
- toolsNeeded: ["Camera", "Lighting", "Props"]
- industryRelevance: 9
- editPrompt: detailed prompt for GPT-image-01 that addresses THIS image's specific needs

CRITICAL: The editPrompt must be tailored to the specific product and analysis above. Each idea should follow its designated concept type:
- Idea 1: Technical perfection addressing specific image flaws
- Idea 2: Authentic lifestyle storytelling with environmental context
- Idea 3: Modern artistic treatment with sophisticated visual style
- Idea 4: Pattern interrupt with impossible/surreal elements
- Idea 5: Multiverse madness with fantastical scenarios

Return as JSON array:
${`[
  {
    "id": "unique_id",
    "title": "Short Catchy Title (max 5 words)",
    "description": "Full 2-3 sentence scene description with specific visual details",
    "edit_prompt": "Specific prompt for image generation"
  }
]`}`,
        },
      ],
    });

    const responseText = (response.content[0] as any).text || "";

    // Extract JSON from Claude 4's response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in Claude 4 response");
    }

    const rawIdeas = JSON.parse(jsonMatch[0]);

    // Map the raw ideas to our EnhancementIdea interface
    const ideas: EnhancementIdea[] = rawIdeas.map(
      (idea: any, index: number) => ({
        id: idea.id || `idea_${index + 1}`,
        title: idea.title || "Enhancement Concept",
        description: idea.description || "",
        impact: "high" as const, // All AI-generated ideas are high impact
        difficulty: "medium" as const, // Default to medium difficulty
        category: "AI Generated",
        estimatedTime: "30-60 minutes",
        toolsNeeded: ["Camera", "Lighting", "Props"],
        industryRelevance: 9, // High relevance score for AI suggestions
        editPrompt: idea.edit_prompt || idea.description,
      }),
    );

    console.log(`[Claude 4 Ideas] Generated ${ideas.length} enhancement ideas`);
    return ideas;
  } catch (error) {
    console.error("[Claude 4 Ideas] Error generating ideas:", error);
    throw new Error(`Idea generation failed: ${error}`);
  }
}

// Helper functions for parsing vision analysis
function extractProductType(text: string): string {
  const patterns = [
    /product type?:?\s*([^.\n]+)/i,
    /this is (?:a|an)\s*([^.\n]+)/i,
    /appears to be (?:a|an)\s*([^.\n]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return "Product";
}

function extractStrengths(text: string): string[] {
  const strengthsSection = text.match(/strengths?:?\s*([^.]*(?:\.|$))/i);
  if (strengthsSection) {
    return strengthsSection[1]
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [
    "Good product visibility",
    "Clear focus and sharpness",
    "Adequate lighting exposure",
  ];
}

function extractImprovements(text: string): string[] {
  const improvementsSection = text.match(
    /(?:improvements?|weaknesses?|issues?):?\s*([^.]*(?:\.|$))/i,
  );
  if (improvementsSection) {
    return improvementsSection[1]
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [
    "Could benefit from lifestyle context",
    "Background could be more engaging",
    "Add complementary props",
  ];
}

function extractAudienceAppeal(text: string): string {
  const audienceMatch = text.match(/(?:audience|appeal|target):?\s*([^.\n]+)/i);
  return audienceMatch
    ? audienceMatch[1].trim()
    : "Appeals to general consumer audience";
}

function extractQualityScore(text: string): number {
  const scoreMatch = text.match(/(?:quality|score):?\s*(\d+(?:\.\d+)?)/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;
}

function extractBrandAlignment(text: string): string {
  const brandMatch = text.match(/(?:brand|alignment):?\s*([^.\n]+)/i);
  return brandMatch ? brandMatch[1].trim() : "Good brand representation";
}

function extractTechnicalDetail(text: string, type: string): string {
  const pattern = new RegExp(`${type}:?\\s*([^.\\n]+)`, "i");
  const match = text.match(pattern);
  return match ? match[1].trim() : `${type} appears adequate`;
}

function extractEnhancementOpportunities(text: string): string[] {
  const opportunitiesSection = text.match(
    /(?:opportunities?|enhancements?):?\s*([^.]*(?:\.|$))/i,
  );
  if (opportunitiesSection) {
    return opportunitiesSection[1]
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [
    "Professional studio lighting setup",
    "Brand-specific background styling",
    "Industry-appropriate prop integration",
  ];
}