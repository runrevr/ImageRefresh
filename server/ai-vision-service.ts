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
 * Analyze product image using OpenAI GPT-4 Vision for superior image analysis
 */
export async function analyzeProductImage(imagePath: string, industryContext?: string, productType?: string): Promise<VisionAnalysis> {
  try {
    console.log('[GPT-4 Vision] Starting product image analysis...');
    
    // Convert image to base64 for GPT-4 Vision
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
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
              text: `Analyze this product image for a ${industryContext || 'general'} business.
                     Product type: ${productType || 'Not specified'}
                     
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
                     }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    const analysisText = response.choices[0].message.content || '';
    
    // Parse GPT-4 Vision's JSON response
    let parsedAnalysis;
    try {
      // Extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
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

    console.log('[GPT-4 Vision] Analysis complete');
    return analysis;
    
  } catch (error) {
    console.error('[GPT-4 Vision] Error analyzing image:', error);
    throw new Error(`Vision analysis failed: ${error}`);
  }
}

/**
 * Generate enhancement ideas using Claude 4 Sonnet based on vision analysis
 */
export async function generateEnhancementIdeas(
  visionAnalysis: VisionAnalysis,
  industryContext: string[],
  productType?: string
): Promise<EnhancementIdea[]> {
  try {
    console.log('[Claude 4 Ideas] Generating enhancement ideas with latest model...');
    
    // Use Claude 4 Sonnet - the most advanced model for idea generation
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: `Based on this product image analysis:
                 ${JSON.stringify({
                   productType: visionAnalysis.productType,
                   strengths: visionAnalysis.strengths,
                   improvements: visionAnalysis.improvements,
                   qualityScore: visionAnalysis.qualityScore,
                   technicalDetails: visionAnalysis.technicalDetails,
                   enhancementOpportunities: visionAnalysis.enhancementOpportunities
                 }, null, 2)}
                 
                 Industry: ${industryContext.join(', ')}
                 Product Type: ${productType || 'General Product'}
                 
                 Generate exactly 5 enhancement ideas for GPT-image-01 /edit endpoint.
                 
                 Return as JSON array:
                 [
                   {
                     "id": "unique_id_1",
                     "title": "Enhancement Title (max 50 chars)",
                     "description": "What this enhancement does (max 200 chars)",
                     "impact": "high",
                     "difficulty": "easy",
                     "category": "background",
                     "estimatedTime": "15-30 min",
                     "toolsNeeded": ["GPT-image-01"],
                     "industryRelevance": 9.0,
                     "editPrompt": "Edit this product photo: [specific prompt for GPT-image-01 edit endpoint]"
                   }
                 ]
                 
                 Make each idea specific, actionable, and appropriate for image editing that maintains the original product.`
      }]
    });

    const responseText = (response.content[0] as any).text || '';
    
    // Extract JSON from Claude 4's response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude 4 response');
    }

    const ideas: EnhancementIdea[] = JSON.parse(jsonMatch[0]);
    
    console.log(`[Claude 4 Ideas] Generated ${ideas.length} enhancement ideas`);
    return ideas;
    
  } catch (error) {
    console.error('[Claude 4 Ideas] Error generating ideas:', error);
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