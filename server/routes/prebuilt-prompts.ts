
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prebuilt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * Get list of available prebuilt prompts
 */
export function getPrebuiltPrompts(req: Request, res: Response) {
  // 19 prebuilt prompts - placeholders that will be filled with actual content
  const prompts = [
    {
      id: 'prompt-001',
      title: 'Prompt 1 - [Title Pending]',
      description: 'Description for prompt 1 will be added',
      prompt: 'Prompt text will be added for prompt 1',
      category: 'Enhancement',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-002',
      title: 'Prompt 2 - [Title Pending]',
      description: 'Description for prompt 2 will be added',
      prompt: 'Prompt text will be added for prompt 2',
      category: 'Enhancement',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-003',
      title: 'Prompt 3 - [Title Pending]',
      description: 'Description for prompt 3 will be added',
      prompt: 'Prompt text will be added for prompt 3',
      category: 'Enhancement',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-004',
      title: 'Prompt 4 - [Title Pending]',
      description: 'Description for prompt 4 will be added',
      prompt: 'Prompt text will be added for prompt 4',
      category: 'Enhancement',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-005',
      title: 'Prompt 5 - [Title Pending]',
      description: 'Description for prompt 5 will be added',
      prompt: 'Prompt text will be added for prompt 5',
      category: 'Style',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-006',
      title: 'Prompt 6 - [Title Pending]',
      description: 'Description for prompt 6 will be added',
      prompt: 'Prompt text will be added for prompt 6',
      category: 'Style',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-007',
      title: 'Prompt 7 - [Title Pending]',
      description: 'Description for prompt 7 will be added',
      prompt: 'Prompt text will be added for prompt 7',
      category: 'Background',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-008',
      title: 'Prompt 8 - [Title Pending]',
      description: 'Description for prompt 8 will be added',
      prompt: 'Prompt text will be added for prompt 8',
      category: 'Background',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-009',
      title: 'Prompt 9 - [Title Pending]',
      description: 'Description for prompt 9 will be added',
      prompt: 'Prompt text will be added for prompt 9',
      category: 'Lighting',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-010',
      title: 'Prompt 10 - [Title Pending]',
      description: 'Description for prompt 10 will be added',
      prompt: 'Prompt text will be added for prompt 10',
      category: 'Lighting',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-011',
      title: 'Prompt 11 - [Title Pending]',
      description: 'Description for prompt 11 will be added',
      prompt: 'Prompt text will be added for prompt 11',
      category: 'Professional',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-012',
      title: 'Prompt 12 - [Title Pending]',
      description: 'Description for prompt 12 will be added',
      prompt: 'Prompt text will be added for prompt 12',
      category: 'Professional',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-013',
      title: 'Prompt 13 - [Title Pending]',
      description: 'Description for prompt 13 will be added',
      prompt: 'Prompt text will be added for prompt 13',
      category: 'Creative',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-014',
      title: 'Prompt 14 - [Title Pending]',
      description: 'Description for prompt 14 will be added',
      prompt: 'Prompt text will be added for prompt 14',
      category: 'Creative',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-015',
      title: 'Prompt 15 - [Title Pending]',
      description: 'Description for prompt 15 will be added',
      prompt: 'Prompt text will be added for prompt 15',
      category: 'Artistic',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-016',
      title: 'Prompt 16 - [Title Pending]',
      description: 'Description for prompt 16 will be added',
      prompt: 'Prompt text will be added for prompt 16',
      category: 'Artistic',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-017',
      title: 'Prompt 17 - [Title Pending]',
      description: 'Description for prompt 17 will be added',
      prompt: 'Prompt text will be added for prompt 17',
      category: 'Lifestyle',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-018',
      title: 'Prompt 18 - [Title Pending]',
      description: 'Description for prompt 18 will be added',
      prompt: 'Prompt text will be added for prompt 18',
      category: 'Lifestyle',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-019',
      title: 'Prompt 19 - [Title Pending]',
      description: 'Description for prompt 19 will be added',
      prompt: 'Prompt text will be added for prompt 19',
      category: 'Special',
      difficulty: 'Advanced'
    }
  ];

  res.json(prompts);
}

/**
 * Helper function to download and save image from URL
 */
async function downloadAndSaveImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    const savedPath = `uploads/prebuilt-${filename}-${Date.now()}.png`;
    await fs.writeFile(savedPath, uint8Array);
    
    return savedPath;
  } catch (error) {
    console.error('[Prebuilt Transform] Error downloading image:', error);
    throw error;
  }
}

/**
 * Transform image using prebuilt prompt
 */
export async function transformWithPrebuiltPrompt(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    const { promptId, imagePath } = req.body;
    
    console.log(`[Prebuilt Transform] Starting transformation with prompt: ${promptId}`);
    console.log(`[Prebuilt Transform] Image path: ${imagePath}`);

    if (!promptId || !imagePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing promptId or imagePath' 
      });
    }

    // Get the prompt details
    const prompts = [
      {
        id: 'prompt-001',
        title: 'Prompt 1 - [Title Pending]',
        description: 'Description for prompt 1 will be added',
        prompt: 'Prompt text will be added for prompt 1',
        category: 'Enhancement',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-002',
        title: 'Prompt 2 - [Title Pending]',
        description: 'Description for prompt 2 will be added',
        prompt: 'Prompt text will be added for prompt 2',
        category: 'Enhancement',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-003',
        title: 'Prompt 3 - [Title Pending]',
        description: 'Description for prompt 3 will be added',
        prompt: 'Prompt text will be added for prompt 3',
        category: 'Enhancement',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-004',
        title: 'Prompt 4 - [Title Pending]',
        description: 'Description for prompt 4 will be added',
        prompt: 'Prompt text will be added for prompt 4',
        category: 'Enhancement',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-005',
        title: 'Prompt 5 - [Title Pending]',
        description: 'Description for prompt 5 will be added',
        prompt: 'Prompt text will be added for prompt 5',
        category: 'Style',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-006',
        title: 'Prompt 6 - [Title Pending]',
        description: 'Description for prompt 6 will be added',
        prompt: 'Prompt text will be added for prompt 6',
        category: 'Style',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-007',
        title: 'Prompt 7 - [Title Pending]',
        description: 'Description for prompt 7 will be added',
        prompt: 'Prompt text will be added for prompt 7',
        category: 'Background',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-008',
        title: 'Prompt 8 - [Title Pending]',
        description: 'Description for prompt 8 will be added',
        prompt: 'Prompt text will be added for prompt 8',
        category: 'Background',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-009',
        title: 'Prompt 9 - [Title Pending]',
        description: 'Description for prompt 9 will be added',
        prompt: 'Prompt text will be added for prompt 9',
        category: 'Lighting',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-010',
        title: 'Prompt 10 - [Title Pending]',
        description: 'Description for prompt 10 will be added',
        prompt: 'Prompt text will be added for prompt 10',
        category: 'Lighting',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-011',
        title: 'Prompt 11 - [Title Pending]',
        description: 'Description for prompt 11 will be added',
        prompt: 'Prompt text will be added for prompt 11',
        category: 'Professional',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-012',
        title: 'Prompt 12 - [Title Pending]',
        description: 'Description for prompt 12 will be added',
        prompt: 'Prompt text will be added for prompt 12',
        category: 'Professional',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-013',
        title: 'Prompt 13 - [Title Pending]',
        description: 'Description for prompt 13 will be added',
        prompt: 'Prompt text will be added for prompt 13',
        category: 'Creative',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-014',
        title: 'Prompt 14 - [Title Pending]',
        description: 'Description for prompt 14 will be added',
        prompt: 'Prompt text will be added for prompt 14',
        category: 'Creative',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-015',
        title: 'Prompt 15 - [Title Pending]',
        description: 'Description for prompt 15 will be added',
        prompt: 'Prompt text will be added for prompt 15',
        category: 'Artistic',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-016',
        title: 'Prompt 16 - [Title Pending]',
        description: 'Description for prompt 16 will be added',
        prompt: 'Prompt text will be added for prompt 16',
        category: 'Artistic',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-017',
        title: 'Prompt 17 - [Title Pending]',
        description: 'Description for prompt 17 will be added',
        prompt: 'Prompt text will be added for prompt 17',
        category: 'Lifestyle',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-018',
        title: 'Prompt 18 - [Title Pending]',
        description: 'Description for prompt 18 will be added',
        prompt: 'Prompt text will be added for prompt 18',
        category: 'Lifestyle',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-019',
        title: 'Prompt 19 - [Title Pending]',
        description: 'Description for prompt 19 will be added',
        prompt: 'Prompt text will be added for prompt 19',
        category: 'Special',
        difficulty: 'Advanced'
      }
    ];

    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (!selectedPrompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid prompt ID' 
      });
    }

    const prompt = selectedPrompt.prompt;
    const variations = 2; // Generate 2 variations as requested

    // Generate multiple variations using GPT-image-01
    const transformedUrls: string[] = [];
    
    console.log(`[Prebuilt Transform] Generating ${variations} variations`);
    
    try {
      const response = await openai.images.edit({
        model: "gpt-image-01",
        image: fs.createReadStream(imagePath),
        prompt: prompt,
        n: 2, // Generate 2 variations in single call
        size: "1024x1024",
        response_format: "url"
      });

      if (response.data && response.data.length > 0) {
        // Download and save each variation
        for (let i = 0; i < response.data.length; i++) {
          const imageUrl = response.data[i].url;
          if (imageUrl) {
            const savedPath = await downloadAndSaveImage(imageUrl, `prebuilt-${promptId}-${i + 1}`);
            transformedUrls.push(savedPath);
            console.log(`[Prebuilt Transform] Variation ${i + 1} saved:`, savedPath);
          }
        }
      }
    } catch (error) {
      console.error(`[Prebuilt Transform] Error generating variations:`, error);
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    if (transformedUrls.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate any variations'
      });
    }

    console.log(`[Prebuilt Transform] Successfully generated ${transformedUrls.length} variations in ${processingTime}s`);

    res.json({
      success: true,
      originalImage: imagePath,
      transformedImages: transformedUrls,
      promptUsed: selectedPrompt,
      processingTime: processingTime,
      variations: transformedUrls.length
    });

  } catch (error) {
    console.error('[Prebuilt Transform] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transform image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export the upload middleware
export const uploadMiddleware = upload.single('image');
