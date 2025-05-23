import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { analyzeProductImage, generateEnhancementIdeas } from '../ai-vision-service';

const router = Router();

// Debug API keys on startup
console.log('🔑 API Keys Check:', {
  hasOpenAI: !!process.env.OPENAI_API_KEY,
  hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
  openAILength: process.env.OPENAI_API_KEY?.length || 0,
  anthropicLength: process.env.ANTHROPIC_API_KEY?.length || 0
});

// Configure multer for file uploads and disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  }
});

// POST /api/upload-images
// Accept FormData with images and return mock URLs
router.post('/upload-images', upload.array('images', 5), (req, res) => {
  try {
    console.log('=== Upload Images Endpoint ===');
    console.log('Files received:', req.files?.length || 0);
    console.log('Form data:', {
      industries: req.body.industries,
      productType: req.body.productType,
      brandDescription: req.body.brandDescription,
      imageCount: req.body.imageCount
    });

    const files = req.files as Express.Multer.File[] | undefined;
    const fileCount = files?.length || 0;
    
    if (fileCount === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('📁 Processing uploaded files...');
    
    // Create real file URLs for AI analysis
    const realUrls = files!.map(file => {
      console.log(`✅ File saved: ${file.filename}`);
      return `/uploads/${file.filename}`;
    });

    const response = {
      success: true,
      urls: realUrls,
      message: `Successfully uploaded ${fileCount} images`,
      metadata: {
        uploadTime: new Date().toISOString(),
        imageCount: fileCount
      }
    };

    console.log('📤 Upload response:', response);
    res.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/analyze-products
// Accept JSON with image_urls and industry_context, return live AI analysis
router.post('/analyze-products', async (req, res) => {
  console.log('🔍 Analyze request received:', req.body);
  
  try {
    // Check if we have API keys
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }
    
    console.log('✅ API keys verified');
    console.log('=== Live AI Product Analysis ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { image_urls, industry_context, image_purposes, product_type, brand_description } = req.body;

    // Log what we're processing
    console.log('📊 Processing images:', image_urls?.length || 0);
    console.log('🏢 Industry context:', industry_context);

    if (!image_urls || image_urls.length === 0) {
      return res.status(400).json({ error: 'No images provided for analysis' });
    }

    // Process each image with OpenAI Vision analysis
    const analysisPromises = image_urls.map(async (url: string, index: number) => {
      try {
        // Convert URL to file path for local analysis
        const filename = url.replace('/uploads/', '');
        const imagePath = path.join(process.cwd(), 'uploads', filename);
        
        console.log(`🔍 Looking for image at: ${imagePath}`);
        
        if (!fs.existsSync(imagePath)) {
          console.warn(`❌ Image not found: ${imagePath}`);
          console.log(`📂 Checking uploads directory...`);
          
          // List what's actually in the uploads folder
          try {
            const uploadDir = path.join(process.cwd(), 'uploads');
            const files = fs.readdirSync(uploadDir);
            console.log(`📁 Files in uploads: ${files.join(', ')}`);
          } catch (dirError) {
            console.log(`📁 Uploads directory issue: ${dirError}`);
          }
          
          return null;
        }
        
        console.log(`✅ Image found: ${imagePath}`);

        console.log(`[AI Analysis] Analyzing image ${index + 1}: ${imagePath}`);
        
        // Use your live OpenAI GPT-4 Vision API with enhanced error handling
        try {
          const visionAnalysis = await analyzeProductImage(
            imagePath,
            Array.isArray(industry_context) ? industry_context.join(', ') : 'general',
            product_type
          );
          
          console.log(`[AI Analysis] Vision analysis complete for image ${index + 1}`);
          console.log(`[AI Analysis] Results: ${JSON.stringify(visionAnalysis, null, 2)}`);
          
          return {
            url: url,
            index: index,
            ...visionAnalysis
          };
        } catch (visionError) {
          console.error(`[AI Analysis] Vision API error for image ${index + 1}:`, visionError);
          const errorMessage = visionError instanceof Error ? visionError.message : 'Unknown vision error';
          throw new Error(`Vision analysis failed: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`[AI Analysis] Error analyzing image ${index + 1}:`, error);
        return null;
      }
    });

    const analysisResults = await Promise.all(analysisPromises);
    const validResults = analysisResults.filter(result => result !== null);

    if (validResults.length === 0) {
      return res.status(500).json({ error: 'Failed to analyze any images' });
    }

    const liveAnalysis = {
      success: true,
      analysis: {
        images: validResults,
        overall_assessment: {
          average_quality: validResults.reduce((sum, img) => sum + img.quality_score, 0) / validResults.length,
          industry_fit: `Good match for ${Array.isArray(industry_context) ? industry_context.join(', ') : industry_context}`,
          enhancement_potential: "High - significant improvement opportunities identified"
        }
      },
      processing_metadata: {
        analysis_time: new Date().toISOString(),
        model_used: "GPT-4o Vision",
        confidence_score: 0.92,
        images_processed: validResults.length
      }
    };

    console.log(`[AI Analysis] Live analysis complete for ${validResults.length} images`);
    res.json(liveAnalysis);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze products',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/generate-edit-prompt  
// Generate optimized edit prompt for a single selected concept using Claude
router.post('/api/generate-edit-prompt', async (req, res) => {
  try {
    console.log('=== Single Claude Edit Prompt Generation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { idea_title, idea_description, product_info, is_chaos_concept } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 800,
      temperature: is_chaos_concept ? 1.0 : 0.8,
      messages: [{
        role: "user",
        content: `Transform this creative concept into a detailed GPT-image-01 edit prompt:

Title: ${idea_title}
Description: ${idea_description}
Product: ${product_info || 'beverage product'}
Is Chaos Concept: ${is_chaos_concept}

${is_chaos_concept ? 
  `**CHAOS MODE ACTIVATED - GO ABSOLUTELY WILD:**
   Create a 100-120 word prompt of pure creative insanity:
   - Start with product accuracy THEN EXPLODE INTO MADNESS
   - Layer impossible elements, defy physics and logic
   - Mix artistic movements: "Dalí meets Banksy meets Studio Ghibli"
   - Use words like: "surreal," "gravity-defying," "metamorphosing," "transcendent"
   - Push every boundary while keeping product as hero` :
  `**PROFESSIONAL MODE:**
   Create a polished 80-100 word prompt focusing on:
   - Realistic product placement and natural lighting
   - Authentic environments and lifestyle storytelling
   - Professional photography terminology`}

Return ONLY the edit prompt text, no JSON formatting.`
      }]
    });
    
    const editPrompt = message.content[0].text.trim();
    
    console.log(`[Single Edit Prompt] Generated for "${idea_title}"`);
    res.json({
      success: true,
      edit_prompt: editPrompt,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "claude-3-7-sonnet-20250219",
        chaos_mode: is_chaos_concept
      }
    });
    
  } catch (error) {
    console.error('Single edit prompt error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate edit prompt',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/generate-edit-prompts
// Generate optimized edit prompts for selected concepts using Claude
router.post('/generate-edit-prompts', async (req, res) => {
  try {
    console.log('=== Claude Edit Prompt Generation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { selectedIdeas, productAnalysis } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    // Import Anthropic SDK
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Identify which concepts were selected (especially if #5 is included)
    const hasChaosConcept = selectedIdeas.some((idea, index) => 
      idea.originalIndex === 4 || idea.title.includes('CHAOS') || idea.description.includes('surreal')
    );
    
    const message = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219", // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      max_tokens: 1500,
      temperature: hasChaosConcept ? 1.0 : 0.8,
      messages: [{
        role: "user",
        content: `Transform the selected photography concepts into detailed image generation prompts optimized for GPT Image 01:

Selected concepts: ${JSON.stringify(selectedIdeas.map(i => ({ title: i.title, description: i.description })))}
Original product: ${productAnalysis.product_identification}

FIRST: Identify which concepts were selected and adapt your approach:
- If Concepts 1-4: Create polished, professional prompts
- If Concept 5: UNLEASH ABSOLUTE CREATIVE CHAOS
- If multiple selected: Generate separate prompts for each

**FOR CONCEPTS 1-4 (Professional/Lifestyle):**
Create concise 80-100 word prompts focusing on:
- Realistic product placement
- Authentic environments
- Natural lighting
- Lifestyle storytelling
- Professional photography terminology

**FOR CONCEPT 5 (The Unhinged One):**
GO ABSOLUTELY WILD - 100-120 words of pure creative insanity:
- Start with product accuracy THEN EXPLODE INTO MADNESS
- Layer impossible elements
- Defy physics, logic, and reason
- Mix artistic movements, pop culture, and fever dreams
- Use words like: "surreal," "impossible," "gravity-defying," "metamorphosing," "transcendent"
- Reference art styles: "Dalí meets Banksy meets Studio Ghibli"
- Push every boundary while keeping product as hero

**OUTPUT FORMAT:**
Return a JSON array with one edit_prompt for each selected concept:
[
  {
    "concept_title": "original concept title",
    "edit_prompt": "the detailed prompt for GPT-image-01"
  }
]

For each selected concept, create one prompt that:
1. Maintains exact product appearance
2. Matches the ambition level of the original idea
3. For #5: Goes even harder than the original concept suggested`
      }]
    });
    
    const responseText = message.content[0].text;
    
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude edit prompt response');
    }

    const editPrompts = JSON.parse(jsonMatch[0]);
    
    console.log(`[Claude Edit Prompts] Generated ${editPrompts.length} optimized prompts`);
    res.json({
      success: true,
      edit_prompts: editPrompts,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "claude-3-7-sonnet-20250219",
        has_chaos_concept: hasChaosConcept,
        concepts_processed: selectedIdeas.length
      }
    });
    
  } catch (error) {
    console.error('Edit prompt generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate edit prompts',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/generate-enhancement
// Generate enhanced images using GPT-image-01 based on selected concepts
router.post('/generate-enhancement', async (req, res) => {
  try {
    console.log('=== GPT-Image-01 Enhancement Generation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { original_image_url, enhancement_prompt, enhancement_title } = req.body;
    
    console.log('Generating image for:', enhancement_title);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Import OpenAI SDK
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Fetch and prepare the original image
    let imageBuffer;
    if (original_image_url.startsWith('data:')) {
      // Handle base64
      const base64Data = original_image_url.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Fetch from URL
      const response = await fetch(original_image_url);
      imageBuffer = await response.buffer();
    }
    
    // Import sharp for image processing
    const sharp = require('sharp');
    
    // Ensure image is square and proper size for GPT-image-01
    const processedImage = await sharp(imageBuffer)
      .resize(1024, 1024, { 
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toBuffer();
    
    // Call GPT-image-01 edit endpoint
    const enhancementResponse = await openai.images.edit({
      model: "gpt-image-01",
      image: processedImage,
      prompt: enhancement_prompt,
      n: 1,
      size: "1024x1024"
    });
    
    console.log('Image generated successfully with GPT-image-01');
    
    res.json({
      success: true,
      enhanced_image_url: enhancementResponse.data[0].url,
      title: enhancement_title,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "GPT-image-01",
        prompt_used: enhancement_prompt
      }
    });
    
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhanced image',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// POST /api/generate-ideas
// Accept JSON with vision_analysis and industry_context, return live AI-generated ideas
router.post('/generate-ideas', async (req, res) => {
  try {
    console.log('=== Live Claude Enhancement Ideas Generation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { vision_analysis, industry_context, ideas_per_image } = req.body;

    if (!vision_analysis || !vision_analysis.images || vision_analysis.images.length === 0) {
      return res.status(400).json({ error: 'No vision analysis provided' });
    }

    // Generate enhancement ideas using your live Claude API
    const ideaPromises = vision_analysis.images.map(async (imageAnalysis: any, index: number) => {
      try {
        console.log(`[Claude Ideas] Generating ideas for image ${index + 1}`);
        
        const enhancementIdeas = await generateEnhancementIdeas(
          {
            productType: imageAnalysis.product_type || 'Product',
            strengths: imageAnalysis.strengths || [],
            improvements: imageAnalysis.improvements || [],
            audienceAppeal: imageAnalysis.audience_appeal || '',
            qualityScore: imageAnalysis.quality_score || 7,
            brandAlignment: imageAnalysis.brand_alignment || '',
            technicalDetails: imageAnalysis.technical_details || {},
            enhancementOpportunities: imageAnalysis.enhancement_opportunities || []
          },
          industry_context.industries || ['general'],
          industry_context.productType
        );

        console.log(`[Claude Ideas] Generated ${enhancementIdeas.length} ideas for image ${index + 1}`);
        return enhancementIdeas;
      } catch (error) {
        console.error(`[Claude Ideas] Error generating ideas for image ${index + 1}:`, error);
        return [];
      }
    });

    const allIdeas = await Promise.all(ideaPromises);
    const flattenedIdeas = allIdeas.flat();

    if (flattenedIdeas.length === 0) {
      return res.status(500).json({ error: 'Failed to generate enhancement ideas' });
    }

    const liveIdeasResponse = {
      success: true,
      ideas: flattenedIdeas,
      total_ideas: flattenedIdeas.length,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "Claude-3.7-Sonnet",
        images_processed: vision_analysis.images.length
      }
    };

    console.log(`[Claude Ideas] Generated ${flattenedIdeas.length} total enhancement ideas`);
    res.json(liveIdeasResponse);

  } catch (error) {
    console.error('Ideas generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate enhancement ideas',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;