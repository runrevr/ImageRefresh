// Implementation of OpenAI image transformation functionality
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Directory for uploads
const uploadsDir = path.join(process.cwd(), "uploads");

/**
 * Transforms an image using OpenAI's image editing capabilities
 * @param imagePath Path to the original image
 * @param prompt The prompt describing the transformation
 * @returns Path to the transformed image
 */
export async function transformImageWithOpenAI(imagePath: string, prompt: string): Promise<string> {
  try {
    // Generate a unique ID for this transformation
    const transformationId = uuid();

    // Detailed logging with transformation ID
    console.log(`[OpenAI] [${transformationId}] Starting image transformation at ${new Date().toISOString()}`);
    console.log(`[OpenAI] [${transformationId}] Prompt: "${prompt}"`);
    console.log(`[OpenAI] [${transformationId}] Image path: ${imagePath}`);

    // Verify OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error(`[OpenAI] [${transformationId}] Missing API key: OPENAI_API_KEY environment variable is not set`);
      throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY environment variable.');
    } else {
      // Only show first and last 4 characters of the key for security
      const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 4);
      const keySuffix = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
      console.log(`[OpenAI] [${transformationId}] Using API key: ${keyPrefix}...${keySuffix}`);
    }

    // Normalize input to ensure proper path resolution
    let normalizedImagePath = imagePath;

    // If the path is already relative to the project root, make it absolute
    if (!path.isAbsolute(normalizedImagePath)) {
      normalizedImagePath = path.join(process.cwd(), normalizedImagePath);
    }

    // Handle case where the path might have the full workspace path already
    normalizedImagePath = normalizedImagePath.replace(/^\/home\/runner\/workspace\//, '');

    // If the path is now relative or has been modified, make it absolute again
    if (!path.isAbsolute(normalizedImagePath)) {
      normalizedImagePath = path.join(process.cwd(), normalizedImagePath);
    }

    // Set the full path for access
    const fullImagePath = normalizedImagePath;

    // Add detailed logging
    console.log(`[OpenAI] [${transformationId}] Image path construction:`);
    console.log(`- Original path: ${imagePath}`);
    console.log(`- Normalized path: ${normalizedImagePath}`);
    console.log(`- Full path: ${fullImagePath}`);

    if (!fs.existsSync(fullImagePath)) {
      console.error(`[OpenAI] [${transformationId}] Image not found: ${fullImagePath}`);
      throw new Error(`Original image not found at path: ${fullImagePath}`);
    }

    // Log image file details
    const stats = fs.statSync(fullImagePath);
    console.log(`[OpenAI] [${transformationId}] Image file size: ${stats.size} bytes`);
    console.log(`[OpenAI] [${transformationId}] Image last modified: ${stats.mtime}`);

    // For generation mode instead of variation mode
    console.log(`[OpenAI] [${transformationId}] Using image generation with prompt`);

    // Create a response using OpenAI DALL-E models for generation
    console.log(`[OpenAI] [${transformationId}] Calling OpenAI API with the provided prompt...`);

    // Use the prompt directly without any modifications
    // Our prompts in data.json are carefully crafted and should never be modified
    console.log(`[OpenAI] [${transformationId}] Using prompt directly from ideas page (length: ${prompt.length})`);
    console.log(`[OpenAI] [${transformationId}] Full prompt:`, prompt);

    // Before we make the API call, ensure we haven't truncated or modified the prompt in any way
    // For DALL-E 3, longer, more detailed prompts tend to give better results
    console.log(`[OpenAI] [${transformationId}] Calling OpenAI API with configuration:`);
    console.log(`  - Model: dall-e-3`);
    console.log(`  - Size: 1024x1024`);
    console.log(`  - Quality: hd`);

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: fs.createReadStream(imagePath),
      prompt: prompt,
      n: 2,
      size: "1024x1024",
      moderation_check: "low"
    });

    console.log(`[OpenAI] [${transformationId}] API call completed successfully`);
    console.log(`[OpenAI] [${transformationId}] Response:`, response.data);

    // Check response
    if (!response.data || response.data.length === 0) {
      throw new Error("No images returned from OpenAI");
    }

    const transformedImages = [];

    // Process both generated images
    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      if (!imageData.url) {
        console.warn(`[OpenAI] [${transformationId}] No URL for image ${i + 1}`);
        continue;
      }

      console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1}`);
      
      try {
        const imageResponse = await axios.get(imageData.url, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        console.log(`[OpenAI] [${transformationId}] Downloaded image ${i + 1}, size: ${imageResponse.data.length} bytes`);

        const imageExt = '.png';
        const uniqueId = `${Date.now()}-${i}-${uuid()}`;
        const transformedFileName = `transformed-${uniqueId}${imageExt}`;
        const transformedImagePath = path.join(uploadsDir, transformedFileName);

        console.log(`[OpenAI] [${transformationId}] Saving image ${i + 1} to: ${transformedImagePath}`);
        fs.writeFileSync(transformedImagePath, Buffer.from(imageResponse.data));

        const relativePath = `uploads/${transformedFileName}`;
        transformedImages.push(relativePath);
        console.log(`[OpenAI] [${transformationId}] Saved image ${i + 1} to: ${relativePath}`);
      } catch (error) {
        console.error(`[OpenAI] [${transformationId}] Error processing image ${i + 1}:`, error);
      }
    }

    if (transformedImages.length === 0) {
      throw new Error("Failed to save any transformed images");
    }

    return {
      primaryImage: transformedImages[0],
      secondaryImage: transformedImages[1]
    };
    } catch (error) {
      console.error(`[OpenAI] [${transformationId}] Error downloading or saving the image:`, error);
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      throw new Error(`Failed to download or save the transformed image: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error(`[OpenAI] [${transformationId}] Error in image transformation:`, error);

    // Enhanced error reporting
    if (error.response) {
      console.error(`[OpenAI] [${transformationId}] API response error:`, JSON.stringify({
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      }, null, 2));
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(`[OpenAI] [${transformationId}] Network connection error - unable to reach OpenAI API`);
    }

    if (error.message.includes('401')) {
      console.error(`[OpenAI] [${transformationId}] Authentication error - invalid or expired API key`);
    }

    if (error.message.includes('429')) {
      console.error(`[OpenAI] [${transformationId}] Rate limit exceeded - too many requests or quota exceeded`);
    }

    throw error;
  }
}