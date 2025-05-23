import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

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
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedTime: string;
  toolsNeeded: string[];
  industryRelevance: number;
  editPrompt: string;
}

/**
 * Analyze product image using Claude Vision with optimized image processing
 */
export async function analyzeProductImage(imagePath: string): Promise<VisionAnalysis> {
  try {
    console.log('[Claude Vision] Starting product image analysis...');
    
    // Read and optimize image for Claude Vision
    const sharp = require('sharp');
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Resize if too large (Claude has limits)
    const resized = await sharp(imageBuffer)
      .resize(1500, 1500, { fit: 'inside' })
      .jpeg({ quality: 85 })
      .toBuffer();
      
    const base64Image = resized.toString('base64');
    
    // Use Claude Vision for detailed analysis
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", 
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          },
          {
            type: "text",
            text: `Analyze this product image in detail. Provide a comprehensive assessment in JSON format:

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
}`
          }
        ]
      }]
    });

    const analysisText = (response.content[0] as any).text || '';
    
    // Parse Claude's JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisText);
    } catch {
      // Fallback parsing if JSON is malformed
      parsedAnalysis = {
        product_identification: extractProductType(analysisText),
        current_quality: {
          lighting: extractTechnicalDetail(analysisText, 'lighting'),
          background: extractTechnicalDetail(analysisText, 'background'),
          composition: extractTechnicalDetail(analysisText, 'composition'),
          technical: extractTechnicalDetail(analysisText, 'technical')
        },
        strengths: extractStrengths(analysisText),
        improvements_needed: extractImprovements(analysisText),
        audience_appeal: extractAudienceAppeal(analysisText),
        quality_score: extractQualityScore(analysisText),
        brand_alignment: extractBrandAlignment(analysisText),
        enhancement_opportunities: extractEnhancementOpportunities(analysisText)
      };
    }
    
    // Convert to our interface format
    const analysis: VisionAnalysis = {
      productType: parsedAnalysis.product_identification || 'Product',
      strengths: parsedAnalysis.strengths || [],
      improvements: parsedAnalysis.improvements_needed || [],
      audienceAppeal: parsedAnalysis.audience_appeal || 'Appeals to general audience',
      qualityScore: parsedAnalysis.quality_score || 7.5,
      brandAlignment: parsedAnalysis.brand_alignment || 'Good brand representation',
      technicalDetails: {
        composition: parsedAnalysis.current_quality?.composition || 'Well-centered placement',
        lighting: parsedAnalysis.current_quality?.lighting || 'Adequate lighting',
        background: parsedAnalysis.current_quality?.background || 'Clean background',
        colorBalance: parsedAnalysis.current_quality?.technical || 'Good color accuracy'
      },
      enhancementOpportunities: parsedAnalysis.enhancement_opportunities || []
    };

    console.log('[Claude Vision] Analysis complete');
    return analysis;
    
  } catch (error) {
    console.error('[Claude Vision] Error analyzing image:', error);
    throw new Error(`Vision analysis failed: ${error}`);
  }
}

/**
 * Generate enhancement ideas using Claude based on vision analysis
 */
export async function generateEnhancementIdeas(
  visionAnalysis: VisionAnalysis,
  industryContext: string[],
  productType?: string
): Promise<EnhancementIdea[]> {
  try {
    console.log('[Claude Ideas] Generating enhancement ideas...');
    
    // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      system: `You are an expert product photography and e-commerce optimization consultant. Generate creative, actionable enhancement ideas based on image analysis.

Create 5 unique enhancement ideas that:
- Use edit-focused language (maintain original product while enhancing)
- Are specific to the product type and industry
- Provide clear implementation guidance
- Include realistic difficulty and impact assessments

Each idea should be practical for the GPT-image-01 edit endpoint.`,
      messages: [
        {
          role: "user",
          content: `Based on this product image analysis, generate 5 specific enhancement ideas:

**Product Analysis:**
- Type: ${visionAnalysis.productType}
- Current Strengths: ${visionAnalysis.strengths.join(', ')}
- Areas for Improvement: ${visionAnalysis.improvements.join(', ')}
- Quality Score: ${visionAnalysis.qualityScore}/10
- Technical Issues: Lighting: ${visionAnalysis.technicalDetails.lighting}, Background: ${visionAnalysis.technicalDetails.background}

**Industry Context:** ${industryContext.join(', ')}
**Product Category:** ${productType || 'General Product'}

Generate 5 enhancement ideas in this exact JSON format:
[
  {
    "id": "unique_id",
    "title": "Enhancement Title",
    "description": "Clear description of what this enhancement does",
    "impact": "high|medium|low",
    "difficulty": "easy|medium|hard", 
    "category": "background|lighting|lifestyle|commercial|luxury",
    "estimatedTime": "15-30 min",
    "toolsNeeded": ["Photo editing software"],
    "industryRelevance": 8.5,
    "editPrompt": "Edit this product photo: [specific edit instructions that maintain original product]"
  }
]

Focus on realistic enhancements that preserve the original product while improving its commercial appeal.`
        }
      ]
    });

    const responseText = (response.content[0] as any).text || '';
    
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }

    const ideas: EnhancementIdea[] = JSON.parse(jsonMatch[0]);
    
    console.log(`[Claude Ideas] Generated ${ideas.length} enhancement ideas`);
    return ideas;
    
  } catch (error) {
    console.error('[Claude Ideas] Error generating ideas:', error);
    throw new Error(`Idea generation failed: ${error}`);
  }
}

// Helper functions for parsing vision analysis
function extractProductType(text: string): string {
  const patterns = [
    /product type?:?\s*([^.\n]+)/i,
    /this is (?:a|an)\s*([^.\n]+)/i,
    /appears to be (?:a|an)\s*([^.\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  
  return 'Product';
}

function extractStrengths(text: string): string[] {
  const strengthsSection = text.match(/strengths?:?\s*([^.]*(?:\.|$))/i);
  if (strengthsSection) {
    return strengthsSection[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return ['Good product visibility', 'Clear focus and sharpness', 'Adequate lighting exposure'];
}

function extractImprovements(text: string): string[] {
  const improvementsSection = text.match(/(?:improvements?|weaknesses?|issues?):?\s*([^.]*(?:\.|$))/i);
  if (improvementsSection) {
    return improvementsSection[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return ['Could benefit from lifestyle context', 'Background could be more engaging', 'Add complementary props'];
}

function extractAudienceAppeal(text: string): string {
  const audienceMatch = text.match(/(?:audience|appeal|target):?\s*([^.\n]+)/i);
  return audienceMatch ? audienceMatch[1].trim() : 'Appeals to general consumer audience';
}

function extractQualityScore(text: string): number {
  const scoreMatch = text.match(/(?:quality|score):?\s*(\d+(?:\.\d+)?)/i);
  return scoreMatch ? parseFloat(scoreMatch[1]) : 7.5;
}

function extractBrandAlignment(text: string): string {
  const brandMatch = text.match(/(?:brand|alignment):?\s*([^.\n]+)/i);
  return brandMatch ? brandMatch[1].trim() : 'Good brand representation';
}

function extractTechnicalDetail(text: string, type: string): string {
  const pattern = new RegExp(`${type}:?\\s*([^.\\n]+)`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : `${type} appears adequate`;
}

function extractEnhancementOpportunities(text: string): string[] {
  const opportunitiesSection = text.match(/(?:opportunities?|enhancements?):?\s*([^.]*(?:\.|$))/i);
  if (opportunitiesSection) {
    return opportunitiesSection[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
  }
  return ['Professional studio lighting setup', 'Brand-specific background styling', 'Industry-appropriate prop integration'];
}