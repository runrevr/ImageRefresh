// server/product-ai-studio.ts
/**
 * Product AI Studio - A completely separate module for GPT-image-01 transformations
 * This module handles all server-side logic for the Product AI Studio feature.
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Router } from 'express';
import FormData from 'form-data';
import axios from 'axios';

// Global configuration with unique naming to avoid conflicts
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'product-ai-studio');
const RESULTS_DIR = path.join(process.cwd(), 'uploads', 'product-ai-studio-results');
const MAX_IMAGES = 5;

// Ensure directories exist
for (const dir of [UPLOADS_DIR, RESULTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a unique folder for each session to keep related images together
    const sessionId = req.body.sessionId || uuid();
    const sessionDir = path.join(UPLOADS_DIR, sessionId);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    req.body.sessionId = sessionId; // Ensure sessionId is available in subsequent middleware
    cb(null, sessionDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename while preserving the extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, safeName);
  }
});

// Configure upload limits and file filtering
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
    files: MAX_IMAGES
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are accepted'));
    }
  }
});

// Create router instance
const router = Router();

// Predefined enhancement idea templates
// These will be presented to users for selection
const ENHANCEMENT_IDEAS = [
  {
    id: 'clean_background',
    title: 'Clean White Background',
    description: 'Remove the background and place your product on a clean white surface',
    icon: 'background_remove',
    prompt: 'Transform this product image to have a pure white background, maintaining perfect product detail and accurate colors. Remove all other elements and shadows.'
  },
  {
    id: 'shadow_effect',
    title: 'Professional Shadow',
    description: 'Add a subtle, professional shadow effect for depth',
    icon: 'shadow',
    prompt: 'Add a subtle, professional drop shadow beneath this product against a clean white background. The shadow should be soft, realistic, and add depth without being distracting.'
  },
  {
    id: 'lifestyle_context',
    title: 'Lifestyle Setting',
    description: 'Place your product in a natural, lifestyle context',
    icon: 'lifestyle',
    prompt: 'Place this product in a natural lifestyle context that showcases its use. Create a warm, inviting scene that helps customers visualize the product in their lives. Maintain product accuracy while enhancing appeal.'
  },
  {
    id: 'detail_highlight',
    title: 'Detail Focus',
    description: 'Highlight specific product features or textures',
    icon: 'detail',
    prompt: 'Enhance this product image to highlight its key details, textures, and features. Improve clarity and lighting to showcase craftsmanship and quality while maintaining complete accuracy.'
  },
  {
    id: 'color_variants',
    title: 'Color Variations',
    description: 'Create color variations of your product',
    icon: 'color',
    prompt: 'Create professional color variations of this product while maintaining the exact same position, lighting, and details. Produce realistic alternative color options that look factory-made.'
  },
  {
    id: 'seasonal_theme',
    title: 'Seasonal Theme',
    description: 'Apply a seasonal theme appropriate for marketing',
    icon: 'seasonal',
    prompt: 'Place this product in a seasonal themed setting appropriate for marketing. Create a professional composition that highlights the product while adding seasonal context that would appeal to customers.'
  },
  {
    id: 'premium_packaging',
    title: 'Premium Packaging',
    description: 'Showcase your product with premium packaging',
    icon: 'packaging',
    prompt: 'Transform this product image to include premium, upscale packaging. Create a professional product presentation that communicates quality and luxury while keeping the product as the main focus.'
  },
  {
    id: 'scale_visualization',
    title: 'Size Perspective',
    description: 'Show scale with common objects for reference',
    icon: 'scale',
    prompt: 'Show this product with common objects for size reference to help customers understand its scale. Create a clean, professional composition that clearly demonstrates the product dimensions in a helpful way.'
  }
];

/**
 * POST /api/product-ai-studio/upload
 * Handle initial product image uploads (1-5 images)
 */
router.post('/upload', upload.array('productImages', MAX_IMAGES), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    // Extract the session ID (created in multer storage configuration)
    const sessionId = req.body.sessionId || '';

    // Process and validate uploaded images
    const uploadedImages = files.map(file => {
      // Get relative path for client use
      const relativePath = path.relative(process.cwd(), file.path).replace(/\\/g, '/');

      return {
        id: path.basename(file.path, path.extname(file.path)),
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        relativePath: relativePath,
        size: file.size
      };
    });

    // Return success with image details and session info
    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${files.length} images`,
      sessionId: sessionId,
      images: uploadedImages
    });
  } catch (error: any) {
    console.error('[Product AI Studio] Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

/**
 * GET /api/product-ai-studio/ideas
 * Get enhancement ideas for uploaded images
 */
router.get('/ideas', (req, res) => {
  try {
    // Return the predefined ideas
    res.json({
      success: true,
      enhancementIdeas: ENHANCEMENT_IDEAS
    });
  } catch (error: any) {
    console.error('[Product AI Studio] Error fetching ideas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enhancement ideas',
      error: error.message
    });
  }
});

/**
 * POST /api/product-ai-studio/generate
 * Generate enhanced images based on selected ideas
 */
router.post('/generate', async (req, res) => {
  try {
    const { sessionId, selections } = req.body;

    if (!sessionId || !selections || !Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Session ID and selections are required.'
      });
    }

    // Create a unique job ID for this generation batch
    const jobId = uuid();

    // Create a directory for results
    const resultsDir = path.join(RESULTS_DIR, jobId);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Process each selection in the background
    // In a real implementation, this would be done with a job queue system
    const processingPromises = selections.map(async (selection: any) => {
      try {
        const { imageId, imagePath, selectedIdeas } = selection;

        if (!imagePath || !selectedIdeas || !Array.isArray(selectedIdeas) || selectedIdeas.length === 0) {
          return {
            imageId,
            success: false,
            message: 'Invalid selection data'
          };
        }

        // For each selected idea, generate an image using the OpenAI API
        const results = await Promise.all(selectedIdeas.map(async (ideaId: string) => {
          // Find the idea details including the prompt
          const idea = ENHANCEMENT_IDEAS.find(idea => idea.id === ideaId);
          if (!idea) {
            return {
              ideaId,
              success: false,
              message: 'Enhancement idea not found'
            };
          }

          // Call the OpenAI API with GPT-image-01 model
          const result = await generateEnhancedImage(imagePath, idea.prompt, resultsDir, ideaId);

          return {
            ideaId,
            success: result.success,
            resultPath: result.success ? result.resultPath : null,
            message: result.message
          };
        }));

        return {
          imageId,
          success: true,
          results
        };
      } catch (selectionError: any) {
        console.error(`[Product AI Studio] Error processing selection for image ${selection.imageId}:`, selectionError);
        return {
          imageId: selection.imageId,
          success: false,
          message: selectionError.message || 'Error processing selection'
        };
      }
    });

    // Send initial response with job ID
    res.status(202).json({
      success: true,
      message: 'Image enhancement job started',
      jobId,
      estimatedTimeSeconds: selections.length * 15 // Rough estimate: 15 seconds per image
    });

    // Continue processing in the background
    // In production, this should use a proper job queue system
    Promise.all(processingPromises)
      .then(results => {
        // Store the results for later retrieval
        const resultsFile = path.join(resultsDir, 'results.json');
        fs.writeFileSync(resultsFile, JSON.stringify({
          sessionId,
          jobId,
          completedAt: new Date().toISOString(),
          results
        }));

        console.log(`[Product AI Studio] Job ${jobId} completed with ${results.length} results`);
      })
      .catch(error => {
        console.error(`[Product AI Studio] Error processing job ${jobId}:`, error);
        // Save error information
        const errorFile = path.join(resultsDir, 'error.json');
        fs.writeFileSync(errorFile, JSON.stringify({
          sessionId,
          jobId,
          error: error.message || String(error),
          timestamp: new Date().toISOString()
        }));
      });
  } catch (error: any) {
    console.error('[Product AI Studio] Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting generation job',
      error: error.message
    });
  }
});

/**
 * GET /api/product-ai-studio/status/:jobId
 * Check the status of a generation job
 */
router.get('/status/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    // Check if results are available
    const resultsDir = path.join(RESULTS_DIR, jobId);
    const resultsFile = path.join(resultsDir, 'results.json');
    const errorFile = path.join(resultsDir, 'error.json');

    if (fs.existsSync(resultsFile)) {
      // Job completed successfully
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));

      return res.json({
        success: true,
        status: 'completed',
        jobId,
        results: results.results,
        completedAt: results.completedAt
      });
    } else if (fs.existsSync(errorFile)) {
      // Job failed
      const error = JSON.parse(fs.readFileSync(errorFile, 'utf8'));

      return res.json({
        success: false,
        status: 'failed',
        jobId,
        error: error.error,
        timestamp: error.timestamp
      });
    } else if (fs.existsSync(resultsDir)) {
      // Job is still processing
      return res.json({
        success: true,
        status: 'processing',
        jobId,
        message: 'Your images are still being enhanced'
      });
    } else {
      // Job not found
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: 'Job not found'
      });
    }
  } catch (error: any) {
    console.error('[Product AI Studio] Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking job status',
      error: error.message
    });
  }
});

/**
 * Generate an enhanced product image using OpenAI's GPT-image-01 model
 */
async function generateEnhancedImage(
  imagePath: string,
  prompt: string,
  outputDir: string,
  ideaId: string
): Promise<{ success: boolean; resultPath?: string; message: string }> {
  try {
    if (!fs.existsSync(imagePath)) {
      return {
        success: false,
        message: `Image file not found: ${imagePath}`
      };
    }

    // Create a unique filename for the result
    const resultFilename = `enhanced-${path.basename(imagePath, path.extname(imagePath))}-${ideaId}-${Date.now()}.png`;
    const resultPath = path.join(outputDir, resultFilename);

    // Create a FormData object for the OpenAI API request
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1024');

    // Append the image file with proper content type
    form.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: 'image/png'
    });

    // Send the request to OpenAI
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        responseType: 'json'
      }
    );

    // Process the response
    if (
      openAiResponse.data &&
      openAiResponse.data.data &&
      openAiResponse.data.data.length > 0 &&
      openAiResponse.data.data[0].url
    ) {
      // Download the generated image
      const imageUrl = openAiResponse.data.data[0].url;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      // Save the image to the result path
      fs.writeFileSync(resultPath, Buffer.from(imageResponse.data));

      // Return success with the result path
      return {
        success: true,
        resultPath: path.relative(process.cwd(), resultPath).replace(/\\/g, '/'),
        message: 'Image enhanced successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid response from OpenAI API'
      };
    }
  } catch (error: any) {
    console.error('[Product AI Studio] Image generation error:', error);

    // Provide detailed error information for debugging
    let errorMessage = 'Error generating enhanced image';

    if (error.response) {
      console.error('OpenAI API error response:', error.response.data);
      errorMessage = error.response.data?.error?.message || errorMessage;
    }

    return {
      success: false,
      message: errorMessage
    };
  }
}

// Export the router for integration with the main Express app
export default router;