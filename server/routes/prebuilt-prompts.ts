
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const projectRoot = path.resolve(process.cwd());

interface PrebuiltTransformRequest {
  originalImagePath: string;
  promptId: string;
  prompt: string;
  variations: number;
}

/**
 * Transform image using prebuilt prompts with multiple variations
 */
export async function transformWithPrebuiltPrompt(req: Request, res: Response) {
  try {
    console.log('[Prebuilt Transform] Request received:', req.body);
    
    const { originalImagePath, promptId, prompt, variations = 2 }: PrebuiltTransformRequest = req.body;

    // Validate inputs
    if (!originalImagePath) {
      return res.status(400).json({
        error: 'Missing image path',
        message: 'Original image path is required'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'Transformation prompt is required'
      });
    }

    // Resolve image path
    let imagePath = originalImagePath;
    if (!path.isAbsolute(imagePath)) {
      if (!imagePath.startsWith('uploads/')) {
        imagePath = path.join('uploads', imagePath);
      }
      imagePath = path.join(projectRoot, imagePath);
    }

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found',
        message: `Image not found at path: ${originalImagePath}`
      });
    }

    console.log('[Prebuilt Transform] Processing image:', imagePath);
    console.log('[Prebuilt Transform] Using prompt:', prompt);
    console.log('[Prebuilt Transform] Generating variations:', variations);

    const startTime = Date.now();

    // Convert image to base64 for OpenAI
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);

    // Generate multiple variations using GPT-image-01
    const transformedUrls: string[] = [];
    
    for (let i = 0; i < variations; i++) {
      console.log(`[Prebuilt Transform] Generating variation ${i + 1}/${variations}`);
      
      try {
        const response = await openai.images.edit({
          model: "gpt-image-01",
          image: fs.createReadStream(imagePath),
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          response_format: "url"
        });

        if (response.data && response.data.length > 0) {
          const imageUrl = response.data[0].url;
          if (imageUrl) {
            // Download and save the transformed image
            const savedPath = await downloadAndSaveImage(imageUrl, `prebuilt-${promptId}-${i + 1}`);
            transformedUrls.push(savedPath);
            console.log(`[Prebuilt Transform] Variation ${i + 1} saved:`, savedPath);
          }
        }
      } catch (variationError) {
        console.error(`[Prebuilt Transform] Error generating variation ${i + 1}:`, variationError);
        // Continue with other variations even if one fails
      }
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    if (transformedUrls.length === 0) {
      return res.status(500).json({
        error: 'Transformation failed',
        message: 'Failed to generate any variations'
      });
    }

    console.log(`[Prebuilt Transform] Completed successfully. Generated ${transformedUrls.length} variations in ${processingTime}s`);

    res.json({
      success: true,
      variations: transformedUrls,
      promptId,
      processingTime,
      generatedCount: transformedUrls.length,
      requestedCount: variations
    });

  } catch (error) {
    console.error('[Prebuilt Transform] Error:', error);
    res.status(500).json({
      error: 'Transformation error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
}

/**
 * Download image from URL and save to uploads directory
 */
async function downloadAndSaveImage(imageUrl: string, prefix: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const filename = `${prefix}-${timestamp}-${random}.png`;
    const uploadsDir = path.join(projectRoot, 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    
    // Save the file
    fs.writeFileSync(filepath, uint8Array);
    
    // Return the relative path for the frontend
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error downloading and saving image:', error);
    throw error;
  }
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

/**
 * Get list of available prebuilt prompts
 */
export function getPrebuiltPrompts(req: Request, res: Response) {
  // This could be moved to a database or JSON file in the future
  const prompts = [
    {
      id: 'background-removal',
      title: 'Background Removal',
      description: 'Remove the background and replace with a clean white backdrop for professional product photos.',
      prompt: 'Remove the background completely and replace it with a pure white background. Keep the product exactly as it is, maintaining all details, shadows, and lighting. Create a clean, professional e-commerce style product photo with the item centered on a seamless white backdrop.',
      category: 'Product Enhancement',
      difficulty: 'Easy'
    },
    {
      id: 'black-white',
      title: 'Black & White Classic',
      description: 'Convert your product image to an elegant black and white with enhanced contrast and detail.',
      prompt: 'Transform this image into a striking black and white photograph with enhanced contrast and detail. Maintain all product features while creating dramatic lighting and shadow effects. Use professional black and white photography techniques to emphasize texture, form, and visual impact.',
      category: 'Artistic',
      difficulty: 'Easy'
    },
    {
      id: 'lifestyle-natural',
      title: 'Natural Lifestyle',
      description: 'Place your product in a natural, everyday setting that shows real-world use.',
      prompt: 'Place this product in a natural, authentic lifestyle setting that demonstrates real-world usage. Create a warm, inviting environment with natural lighting, complementary props, and a setting that appeals to your target audience. The scene should feel genuine and aspirational.',
      category: 'Lifestyle',
      difficulty: 'Medium'
    },
    {
      id: 'premium-luxury',
      title: 'Premium Luxury',
      description: 'Elevate your product with luxury styling, premium materials, and sophisticated lighting.',
      prompt: 'Transform this product into a luxury, premium presentation with sophisticated lighting, elegant materials, and high-end styling. Use dramatic shadows, rich textures, and premium backdrop elements that convey exclusivity and quality. Create an aspirational, high-value aesthetic.',
      category: 'Premium',
      difficulty: 'Advanced'
    }
  ];

  res.json({
    success: true,
    prompts
  });
}
