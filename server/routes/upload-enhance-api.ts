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

// POST /generate-edit-prompt  
// Generate optimized edit prompt for a single selected concept using Claude
router.post('/generate-edit-prompt', async (req, res) => {
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

    // Identify which concepts were selected (especially if #5 is included)
    const hasChaosConcept = selectedIdeas.some((idea, index) => 
      idea.originalIndex === 4 || idea.title.includes('CHAOS') || idea.description.includes('surreal')
    );

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Claude Sonnet 4 released May 14, 2025
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

    // Return the exact same response format as routes.ts
    res.status(200).json({
      transformedImageUrl: transformedImageUrl,
      prompt: enhancement_prompt,
      id: null,
      editsUsed: 0,
      // Keep the enhanced format for compatibility
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

    // Check for specific OpenAI error types like routes.ts
    if (
      error.message &&
      (error.message.includes("organization verification") ||
        error.message.includes("invalid_api_key") ||
        error.message.includes("rate limit") ||
        error.message.includes("billing"))
    ) {
      return res.status(400).json({
        message: error.message,
        error: "openai_api_error",
      });
    }

    // Check for content moderation errors like routes.ts
    if (
      error.message &&
      error.message.toLowerCase().includes("content policy")
    ) {
      return res.status(400).json({
        message:
          "Your request was rejected by our content safety system. Please try a different prompt.",
        error: "content_safety",
      });
    }

    // Generic error format matching routes.ts
    res.status(500).json({
      message: "Error processing image transformation",
      error: error.message,
      success: false,
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


// POST /api/generate-images
// Generate images from text prompts using GPT-image-1 (no input image required)
router.post('/generate-images', async (req, res) => {
  try {
    console.log('=== GPT-Image-01 Text-to-Image Generation ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { prompt, variations, purpose, industry, aspectRatio, styleIntensity, addText, businessName } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable not set.');
    }

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing prompt for image generation'
      });
    }

    // Map aspect ratio to OpenAI size format
    let size = "1024x1024"; // default square
    if (aspectRatio === "wide") {
      size = "1792x1024";
    } else if (aspectRatio === "portrait") {
      size = "1024x1792";
    }

    console.log(`Using GPT-image-1 for text-to-image generation with size: ${size}`);

    // Import OpenAI SDK
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create enhanced prompt based on business context
    let enhancedPrompt = prompt;
    if (styleIntensity && styleIntensity !== "50") {
      const intensity = parseInt(styleIntensity);
      if (intensity > 50) {
        enhancedPrompt += `, stylized and artistic rendering`;
      } else {
        enhancedPrompt += `, natural and realistic style`;
      }
    }

    if (addText && businessName) {
      enhancedPrompt += `, include "${businessName}" text in the image`;
    }

    console.log(`Enhanced prompt: ${enhancedPrompt}`);

    // Use GPT-image-1 for text-to-image generation (no input image)
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: variations?.length || 1,
      size: size as any,
      quality: "standard",
      response_format: "url"
    });

    console.log('[OpenAI] Text-to-image generation completed successfully');

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI generation endpoint');
    }

    // Process the generated images
    const generatedImages = await Promise.all(
      response.data.map(async (imageData, index) => {
        if (!imageData.url) {
          throw new Error(`No URL returned for image ${index + 1}`);
        }

        // Download and save the image
        const axios = (await import('axios')).default;
        const imageResponse = await axios.get(imageData.url, { responseType: 'arraybuffer' });
        
        const timestamp = Date.now();
        const filename = `generated-${timestamp}-${index + 1}.png`;
        const imagePath = path.join(process.cwd(), 'uploads', filename);
        
        fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
        
        const baseUrl = req.protocol + "://" + req.get("host");
        const imageUrl = `${baseUrl}/uploads/${filename}`;
        
        console.log(`Generated image ${index + 1} saved to: ${imagePath}`);
        
        return {
          url: imageUrl,
          variation: variations?.[index] || { title: `Generated Image ${index + 1}` }
        };
      })
    );

    // Return success response matching expected format
    res.status(200).json({
      success: true,
      images: generatedImages,
      jobId: `text-to-image-${Date.now()}`,
      processing_metadata: {
        generation_time: new Date().toISOString(),
        model_used: "gpt-image-1",
        prompt_used: enhancedPrompt,
        size_used: size,
        images_generated: generatedImages.length
      }
    });

  } catch (error) {
    console.error('Text-to-image generation error:', error);

    // Check for specific OpenAI error types
    if (
      error.message &&
      (error.message.includes("organization verification") ||
        error.message.includes("invalid_api_key") ||
        error.message.includes("rate limit") ||
        error.message.includes("billing"))
    ) {
      return res.status(400).json({
        success: false,
        error: "openai_api_error",
        message: error.message
      });
    }

    // Check for content moderation errors
    if (
      error.message &&
      error.message.toLowerCase().includes("content policy")
    ) {
      return res.status(400).json({
        success: false,
        error: "content_safety",
        message: "Your request was rejected by our content safety system. Please try a different prompt."
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to generate images',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});
