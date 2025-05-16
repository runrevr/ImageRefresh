/**
 * OpenAI image transformation with proper MIME type handling
 * This implementation specifically checks for proper MIME types
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import mime from 'mime-types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for OpenAI API
const ALLOWED_SIZES = ["256x256", "512x512", "1024x1024"];

// Supported MIME types by OpenAI API
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Transform an image using OpenAI's API with proper MIME type detection
 */
export async function transformWithMimeCheck(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI Edit] Starting image transformation with prompt: "${prompt}"`);
    
    // Validate image size
    const finalSize = ALLOWED_SIZES.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI Edit] Using size: ${finalSize}`);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }
    
    // Check the MIME type
    const contentType = mime.lookup(imagePath);
    console.log(`[OpenAI Edit] File MIME type: ${contentType}`);
    
    if (!SUPPORTED_MIME_TYPES.includes(contentType)) {
      throw new Error(`Unsupported MIME type: ${contentType}. Supported types: ${SUPPORTED_MIME_TYPES.join(', ')}`);
    }
    
    // Call OpenAI to generate the image
    console.log(`[OpenAI Edit] Calling API with detected MIME type: ${contentType}`);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality: "standard",
      size: finalSize,
    });
    
    // Check the response
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in response");
    }
    
    // Get the image URL
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI Edit] Received image URL: ${imageUrl}`);
    
    // Create a filename for the transformed image
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download the image
    console.log(`[OpenAI Edit] Downloading image to ${transformedPath}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    // Save the image
    const imageBuffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(imageBuffer));
    
    console.log(`[OpenAI Edit] Successfully saved transformed image`);
    
    return {
      url: imageUrl,
      transformedPath
    };
  } catch (error) {
    console.error(`[OpenAI Edit] Error: ${error.message}`);
    throw error;
  }
}

export { ALLOWED_SIZES, SUPPORTED_MIME_TYPES };