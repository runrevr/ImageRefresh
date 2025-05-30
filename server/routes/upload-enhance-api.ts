import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import { promises as fsPromises } from 'fs';
import FormData from 'form-data';
import OpenAI from 'openai';
import * as fs from 'fs';
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

    // Import Anthropic SDK
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Simpler prompt that just asks for the text
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: is_chaos_concept ? 1.0 : 0.8,
      messages: [{
        role: "user",
        content: `Create an edit prompt for GPT-image-01 based on this concept:

Title: ${idea_title}
Description: ${idea_description}
Type: ${is_chaos_concept ? 'CHAOS CONCEPT - GO WILD!' : 'Professional/Lifestyle'}

Generate ${is_chaos_concept ? '100-120' : '80-100'} words describing exactly how to edit the product image.

${is_chaos_concept ? 
  'UNLEASH CREATIVE CHAOS! Start with product accuracy then EXPLODE into impossible surreal madness!' : 
  'Create a professional, realistic scene with natural lighting and authentic environments.'}

Respond with ONLY the edit prompt text, no formatting, no JSON, no explanation.`
      }]
    });

    // LOG THE RAW RESPONSE
    console.log('Claude raw response:', JSON.stringify(message));
    console.log('Content type:', typeof message.content);
    console.log('Content:', message.content);
    console.log('First content item:', message.content[0]);

    // Try different ways to get the text
    let editPrompt;
    if (message.content && message.content[0]) {
      if (typeof message.content[0] === 'string') {
        editPrompt = message.content[0];
      } else if (message.content[0].text) {
        editPrompt = message.content[0].text;
      } else {
        console.error('Unexpected content structure:', message.content[0]);
        editPrompt = JSON.stringify(message.content[0]);
      }
    } else {
      console.error('No content found in Claude response');
      editPrompt = 'Failed to extract content from Claude response';
    }

    console.log('=== CLAUDE EDIT PROMPT RESPONSE ===');
    console.log('Raw prompt:', editPrompt);
    console.log('Prompt length:', editPrompt.length);
    console.log('First 200 chars:', editPrompt.substring(0, 200));
    console.log(`[Single Edit Prompt] Generated for "${idea_title}"`);

    // Return it wrapped in our JSON
    res.json({
      success: true,
      edit_prompt: editPrompt.trim(),
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "claude-sonnet-4-20250514",
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
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Identify which concepts were selected
    const hasChaosConcept = selectedIdeas.some((idea, index) => 
      idea.originalIndex === 4 || idea.title.includes('MULTIVERSE') || idea.title.includes('MADNESS')
    );

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: hasChaosConcept ? 0.9 : 0.7,
      messages: [{
        role: "user",
        content: `Transform these SPECIFIC concepts into GPT-Image-01 prompts for THIS EXACT PRODUCT:

    PRODUCT ANALYSIS: ${JSON.stringify(productAnalysis)}
    SELECTED CONCEPTS TO TRANSFORM: ${JSON.stringify(selectedIdeas.map(i => ({ 
      title: i.title, 
      description: i.description,
      original_index: i.originalIndex 
    })))}

    YOUR TASK: Create prompts ONLY for the ${selectedIdeas.length} concept(s) selected above. Each prompt must:
    1. Reference THIS SPECIFIC PRODUCT: "${productAnalysis.product_identification}"
    2. Implement THE EXACT CONCEPT DESCRIPTION provided
    3. Start with: "The ${productAnalysis.product_identification} remains perfectly intact with all original colors, labels, branding, and details unchanged as the central focus"

    **ANALYZE THE PRODUCT FIRST:**
    - What are its key visual features? (from productAnalysis)
    - What technical issues need fixing? (if Idea 1 selected)
    - What's its natural context? (if Idea 2 selected)
    - How can it be elevated? (if Idea 3 selected)

    **THEN CREATE PROMPTS BASED ON WHICH IDEAS WERE SELECTED:**

    IF "TECHNICAL PERFECTION" SELECTED: 75-90 words
    - Fix the SPECIFIC issues identified in productAnalysis
    - Mention exact product features that need highlighting

    IF "LIFESTYLE STORYTELLING" SELECTED: 80-100 words
    - Use context relevant to THIS product's actual use
    - Props that make sense for THIS product category

    IF "MODERN ARTISTRY" SELECTED: 80-100 words
    - Artistic treatment that suits THIS product's aesthetic
    - Style that enhances THIS product's appeal

    IF "PATTERN INTERRUPT" SELECTED: 90-110 words
    - Surreal concept that works with THIS product's nature
    - Impossible scenario specific to what THIS product is

    IF "MULTIVERSE MADNESS" SELECTED: 100-130 words
    CRITICAL: The PRODUCT stays as hero - create INSANE ENVIRONMENTS AROUND IT
    - Product remains central, prominent, and completely unchanged
    - Focus on creating EXTRAORDINARY BACKGROUNDS AND ENVIRONMENTS
    - NO characters, aliens, or creatures - pure environmental/atmospheric chaos
    - BE WILDLY CREATIVE - these are just examples to inspire, NOT a limited list:
      * Cosmic/space themes (nebulas, galaxies, stellar explosions)
      * Abstract art explosions (paint splatters, color storms, living graffiti)
      * Impossible physics (gravity wells, time distortions, dimensional rifts)
      * Natural phenomena gone wild (aurora tornadoes, crystal forests, lava waterfalls)
      * Surreal landscapes (floating islands, inverted cities, fractal mountains)
      * Energy manifestations (lightning symphonies, plasma rivers, light sculptures)
    - Mix and match concepts freely - the wilder the combination, the better
    - Think: "What's the most visually insane environment possible?"

    **OUTPUT FORMAT:**
    Create ${selectedIdeas.length} prompt(s) - ONE for each selected concept:
    [
      {
        "concept_title": "[exact title from selected concept]",
        "edit_prompt": "[prompt specifically crafted for this product and concept]"
      }
    ]

    DO NOT create prompts for unselected concepts. ONLY transform the concepts that were actually chosen.`
      }]
    });

    const responseText = message.content[0]?.text || '';

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
        model_used: "claude-sonnet-4-20250514",
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
    console.log('Received image URL:', req.body.original_image_url);
    console.log('Generate image request:', {
      hasImage: !!req.body.original_image_url,
      promptLength: req.body.enhancement_prompt?.length,
      title: req.body.enhancement_title
    });

    const { original_image_url, enhancement_prompt, enhancement_title } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not set.');
    }

    // Handle URL vs file path exactly like routes.ts
    let imageSrcPath;
    const isUrl = original_image_url.startsWith('http');

    if (isUrl) {
      console.log(`Original image is a URL, downloading first`);
      try {
        const tempFile = path.join(process.cwd(), 'temp', `downloaded-${Date.now()}.png`);
        const tempDir = path.dirname(tempFile);
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const imgResponse = await axios.get(original_image_url, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempFile, Buffer.from(imgResponse.data));
        imageSrcPath = tempFile;
        console.log(`Downloaded image to ${imageSrcPath}`);
      } catch (downloadError) {
        console.error(`Error downloading image from URL: ${downloadError.message}`);
        return res.status(404).json({ message: "Failed to download image from URL" });
      }
    } else {
      // Handle relative path like routes.ts
      const filename = original_image_url.replace('/uploads/', '');
      imageSrcPath = path.join(process.cwd(), 'uploads', filename);
    }

    // Determine full path to image exactly like routes.ts
    const fullImagePath = path.isAbsolute(imageSrcPath) ? imageSrcPath : path.join(process.cwd(), imageSrcPath);

    console.log('Reading local file:', fullImagePath);

    if (!fs.existsSync(fullImagePath)) {
      throw new Error(`Image file not found: ${fullImagePath}`);
    }

    // Import the EXACT same transformImage function used in working routes.ts
    const { transformImage } = await import('../openai-final.js');

    console.log('Using the same transformImage function as working routes.ts');
    console.log('Prompt:', enhancement_prompt);

    // Use EXACT same transformation approach as routes.ts with size parameter
    const result = await transformImage(fullImagePath, enhancement_prompt, "1024x1024");

    console.log('[OpenAI] Transformation completed successfully');

    // Create server-relative path for the transformed image like routes.ts
    const baseUrl = req.protocol + "://" + req.get("host");
    const transformedImagePath = result.transformedPath
      .replace(process.cwd(), "")
      .replace(/^\//, "");
    const transformedImageUrl = `${baseUrl}/${transformedImagePath}`;

    console.log('Image generated successfully with gpt-image-1');

    res.json({
      success: true,
      enhanced_image_url: transformedImageUrl,
      title: enhancement_title,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "gpt-image-1",
        prompt_used: enhancement_prompt
      }
    });

  } catch (error) {
    console.error('Detailed image generation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    // Provide clear error messages for different failure types
    let errorMessage = error.message;
    let errorType = 'unknown';

    if (error.message.includes('Connection error') || error.message.includes('connection failed')) {
      errorMessage = 'Unable to connect to OpenAI. Please check your internet connection and try again.';
      errorType = 'connection';
    } else if (error.message.includes('safety system') || error.message.includes('content policy')) {
      errorMessage = 'Your request was rejected by OpenAI\'s safety system. Please try a different prompt or image.';
      errorType = 'safety';
    } else if (error.response?.status === 429) {
      errorMessage = 'OpenAI API rate limit exceeded. Please wait a moment and try again.';
      errorType = 'rate_limit';
    } else if (error.response?.status === 401) {
      errorMessage = 'OpenAI API authentication failed. Please contact support.';
      errorType = 'auth';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      error_type: errorType,
      details: error.response?.data
    });
  }
});

// GET /api/test-openai - Test OpenAI connection
router.get('/test-openai', async (req, res) => {
  try {
    console.log('=== TESTING OPENAI CONNECTION ===');
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test with a simple completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Say hello" }],
      max_tokens: 10
    });

    console.log('OpenAI test successful:', completion.choices[0].message.content);

    res.json({ 
      success: true, 
      message: 'OpenAI connection working',
      response: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI connection error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      details: error
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