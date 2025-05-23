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