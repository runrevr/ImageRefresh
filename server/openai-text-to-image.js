
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
      response_format: "url", // Explicitly request URL format
      moderation: "low"
    });

    console.log(`[OpenAI] [${transformationId}] API call completed successfully`);
    
    // Debug the entire response object
    console.log(`[OpenAI] [${transformationId}] Response type:`, typeof response);
    console.log(`[OpenAI] [${transformationId}] Response keys:`, Object.keys(response));
    console.log(`[OpenAI] [${transformationId}] Response.data type:`, typeof response.data);
    console.log(`[OpenAI] [${transformationId}] Response.data:`, response.data);
    
    // If response.data is an array, check its contents
    if (Array.isArray(response.data)) {
      console.log(`[OpenAI] [${transformationId}] Response.data length:`, response.data.length);
      if (response.data.length > 0) {
        console.log(`[OpenAI] [${transformationId}] First item type:`, typeof response.data[0]);
        console.log(`[OpenAI] [${transformationId}] First item:`, JSON.stringify(response.data[0], null, 2));
      }
    }

    // Check response
    if (!response.data || response.data.length === 0) {
      throw new Error("No images returned from OpenAI");
    }

    console.log(`[OpenAI] [${transformationId}] Received ${response.data.length} images from OpenAI`);

    // Process multiple images
    const savedImagePaths = [];
    const imageUrls = [];

    for (let i = 0; i < response.data.length; i++) {
      try {
        const imageData = response.data[i];
        console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1}`);
        console.log(`[OpenAI] [${transformationId}] Image ${i + 1} type:`, typeof imageData);
        console.log(`[OpenAI] [${transformationId}] Image ${i + 1} data:`, JSON.stringify(imageData, null, 2));
        
        if (!imageData) {
          console.error(`[OpenAI] [${transformationId}] Image ${i + 1} is null or undefined`);
          continue;
        }
        
        // Check all possible URL fields
        console.log(`[OpenAI] [${transformationId}] Checking for URL fields...`);
        console.log(`[OpenAI] [${transformationId}] - imageData.url:`, imageData.url);
        console.log(`[OpenAI] [${transformationId}] - imageData.URL:`, imageData.URL);
        console.log(`[OpenAI] [${transformationId}] - imageData.image_url:`, imageData.image_url);
        console.log(`[OpenAI] [${transformationId}] - imageData.b64_json:`, imageData.b64_json ? 'present' : 'not present');
        console.log(`[OpenAI] [${transformationId}] All properties:`, Object.keys(imageData || {}));
        
        // Check for URL in different possible locations
        const imageUrl = imageData.url || imageData.URL || imageData.image_url || imageData.imageUrl;
        const imageB64 = imageData.b64_json;
        
        if (!imageUrl && !imageB64) {
          console.error(`[OpenAI] [${transformationId}] No URL or base64 data found for image ${i + 1}`);
          console.error(`[OpenAI] [${transformationId}] Available properties:`, Object.keys(imageData));
          continue;
        }

        let imageBuffer;
        
        if (imageUrl) {
          console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1} from URL: ${imageUrl}`);
          
          // Download and save the image
          const imageResponse = await axios.get(imageUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000 // 30 second timeout
          });

          if (imageResponse.status !== 200) {
            throw new Error(`Failed to download image ${i + 1}: ${imageResponse.status}`);
          }

          imageBuffer = imageResponse.data;
        } else if (imageB64) {
          console.log(`[OpenAI] [${transformationId}] Processing image ${i + 1} from base64 data`);
          imageBuffer = Buffer.from(imageB64, 'base64');
        }

        const filename = `txt2img-${transformationId}-${i + 1}.png`;
        const filepath = path.join(uploadsDir, filename);

        fs.writeFileSync(filepath, Buffer.from(imageBuffer));

        savedImagePaths.push(filepath);
        imageUrls.push(`/uploads/${filename}`);

        console.log(`[OpenAI] [${transformationId}] Saved image ${i + 1} to: ${filepath}`);
      } catch (imageError) {
        console.error(`[OpenAI] [${transformationId}] Error processing image ${i + 1}:`, imageError);
      }
    }

    // Return results even if some images failed
    if (imageUrls.length === 0) {
      console.warn(`[OpenAI] [${transformationId}] No images were successfully downloaded`);
      throw new Error("Failed to download any images from OpenAI - no URLs provided");
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
