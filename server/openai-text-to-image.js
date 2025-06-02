
// openai-text-to-image.js
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Directory for uploads
const uploadsDir = path.join(projectRoot, "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Text-to-image generation function
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

    console.log(`[OpenAI] [${transformationId}] Using gpt-image-1 model for text-to-image generation with size: ${finalSize}`);

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

      // Download the image from URL
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

// Log that the module loaded successfully
console.log('[OpenAI Text-to-Image Module] Loaded successfully');
