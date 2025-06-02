// ESM-compatible version of openai-image.ts for testing
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// Test export
export const testExport = "This is a test";

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Directory for uploads
const uploadsDir = path.join(projectRoot, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Transforms an image using OpenAI's image generation capabilities
 * @param imagePath Path to the original image
 * @param prompt The prompt describing the transformation
 * @param size The size of the generated image (1024x1024, 1792x1024, or 1024x1792)
 * @returns Path to the transformed image
 */
export async function transformImageWithOpenAI(imagePath, prompt, size = "1024x1024") {
  // Generate a unique ID for this transformation
  const transformationId = uuid().substring(0, 8);

  try {
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
      normalizedImagePath = path.join(projectRoot, normalizedImagePath);
    }

    // Handle case where the path might have the full workspace path already
    normalizedImagePath = normalizedImagePath.replace(/^\/home\/runner\/workspace\//, '');

    // If the path is now relative or has been modified, make it absolute again
    if (!path.isAbsolute(normalizedImagePath)) {
      normalizedImagePath = path.join(projectRoot, normalizedImagePath);
    }

    // Set the full path for access
    const fullImagePath = normalizedImagePath;

    // Add detailed logging
    console.log(`[OpenAI] [${transformationId}] Image path construction:`);
    console.log(`[OpenAI] [${transformationId}] - Original path: ${imagePath}`);
    console.log(`[OpenAI] [${transformationId}] - Normalized path: ${normalizedImagePath}`);
    console.log(`[OpenAI] [${transformationId}] - Full path: ${fullImagePath}`);

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
    // Our prompts are carefully crafted and should never be modified
    console.log(`[OpenAI] [${transformationId}] Using prompt directly (length: ${prompt.length})`);
    console.log(`[OpenAI] [${transformationId}] Prompt preview: ${prompt.substring(0, 100)}...`);

    // Use GPT-image-1 for text-to-image generation with n: 2
    // Validate the size parameter
    const validSizes = ["1024x1024", "1792x1024", "1024x1792"];

    if (!validSizes.includes(size)) {
      throw new Error(`Invalid size. Must be one of: ${validSizes.join(", ")}`);
    }

    console.log(`[OpenAI] [${transformationId}] Using GPT-image-1 model for text-to-image generation with size: ${size}`);
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 2,
      size: size,
      moderation: "low"
    });

    console.log(`[OpenAI] [${transformationId}] API call completed successfully`);

    // Check response
    if (!response.data || response.data.length === 0) {
      throw new Error("No images returned from OpenAI");
    }

    console.log(`[OpenAI] [${transformationId}] Received ${response.data.length} images from OpenAI`);

    // Process multiple images (n: 2)
    const savedImagePaths = [];

    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      if (!imageData.url) {
        console.error(`[OpenAI] [${transformationId}] No URL for image ${i + 1}`);
        continue;
      }

      console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1} from OpenAI`);

    // Download each image
      console.log(`[OpenAI] [${transformationId}] Downloading image ${i + 1}...`);
      try {
        const imageResponse = await axios.get(imageData.url, { 
          responseType: 'arraybuffer',
          timeout: 30000 // 30 second timeout
        });

        console.log(`[OpenAI] [${transformationId}] Download ${i + 1} successful, received ${imageResponse.data.length} bytes`);

        // Save the image to the uploads directory
        const imageExt = '.png'; // OpenAI returns PNG images
        const uniqueId = `${Date.now()}-${uuid()}`;
        const transformedFileName = `text-to-image-${uniqueId}${i > 0 ? `-${i + 1}` : ''}${imageExt}`;
        const transformedImagePath = path.join(uploadsDir, transformedFileName);

        console.log(`[OpenAI] [${transformationId}] Saving image ${i + 1} to: ${transformedImagePath}`);
        fs.writeFileSync(transformedImagePath, Buffer.from(imageResponse.data));

        // Store the relative path
        const relativePath = `uploads/${transformedFileName}`;
        savedImagePaths.push(relativePath);
        console.log(`[OpenAI] [${transformationId}] Successfully saved image ${i + 1} to: ${relativePath}`);

      } catch (downloadError) {
        console.error(`[OpenAI] [${transformationId}] Error downloading image ${i + 1}:`, downloadError);
      }
    }

    // Return the first image path for backward compatibility, but log all paths
    if (savedImagePaths.length === 0) {
      throw new Error("Failed to download any images from OpenAI");
    }

    console.log(`[OpenAI] [${transformationId}] Successfully processed ${savedImagePaths.length} images`);
    console.log(`[OpenAI] [${transformationId}] All image paths:`, savedImagePaths);

    // Return the first image path for backward compatibility
    return savedImagePaths[0];

  } catch (error) {
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

    if (error.message && error.message.includes('401')) {
      console.error(`[OpenAI] [${transformationId}] Authentication error - invalid or expired API key`);
    }

    if (error.message && error.message.includes('429')) {
      console.error(`[OpenAI] [${transformationId}] Rate limit exceeded - too many requests or quota exceeded`);
    }

    throw error;
  }
}



// Text-to-image generation function - moved up for proper export
export async function generateTextToImage(prompt, options = {}) {
  const transformationId = `txt2img_${Date.now()}`;

  try {
    console.log(`[OpenAI] [${transformationId}] Starting text-to-image generation with prompt: "${prompt}"`);

    const {
      size = "1024x1024",
      quality = "standard",
      style = "natural"
    } = options;

    // Validate the size parameter
    const validSizes = ["1024x1024", "1792x1024", "1024x1792"];
    const finalSize = validSizes.includes(size) ? size : "1024x1024";

    console.log(`[OpenAI] [${transformationId}] Using GPT-image-1 model for text-to-image generation with size: ${finalSize}`);

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 2,
      size: finalSize,
      moderation: "low"
    });

    console.log(`[OpenAI] [${transformationId}] API call completed successfully`);

    // Check response
    if (!response.data || response.data.length === 0) {
      throw new Error("No images returned from OpenAI");
    }

    console.log(`[OpenAI] [${transformationId}] Received ${response.data.length} images from OpenAI`);

    // Process multiple images
    const savedImagePaths = [];
    const imageUrls = [];

    for (let i = 0; i < response.data.length; i++) {
      const imageData = response.data[i];
      if (!imageData.url) {
        console.error(`[OpenAI] [${transformationId}] No URL for image ${i + 1}`);
        continue;
      }

      console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1} from OpenAI`);

      // Download and save the image
      const imageResponse = await axios.get(imageData.url, { 
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });

      if (imageResponse.status !== 200) {
        throw new Error(`Failed to download image ${i + 1}: ${imageResponse.status}`);
      }

      const imageBuffer = imageResponse.data;
      const filename = `txt2img-${transformationId}-${i + 1}.png`;
      const filepath = path.join(uploadsDir, filename);

      fs.writeFileSync(filepath, Buffer.from(imageBuffer));

      savedImagePaths.push(filepath);
      imageUrls.push(`/uploads/${filename}`);

      console.log(`[OpenAI] [${transformationId}] Saved image ${i + 1} to: ${filepath}`);
    }

    return {
      success: true,
      imageUrls,
      savedPaths: savedImagePaths,
      transformationId,
      prompt
    };

  } catch (error) {
    console.error(`[OpenAI] [${transformationId}] Error in generateTextToImage:`, error);
    throw new Error(`Text-to-image generation failed: ${error.message}`);
  }
}

// ES6 exports only
export { transformImageWithOpenAI };

console.log('[OpenAI Module] File fully loaded - exports available:', {
  transformImageWithOpenAI: typeof transformImageWithOpenAI,
  generateTextToImage: typeof generateTextToImage
});