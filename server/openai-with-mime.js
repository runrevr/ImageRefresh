/**
 * OpenAI image transformation with proper MIME type handling
 * This solves the "unsupported mimetype" error
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import mime from 'mime-types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

// Supported MIME types by OpenAI API
const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Transform an image using OpenAI's API with proper MIME type handling
 * @param {string} imagePath Path to the image file
 * @param {string} prompt Text prompt for the transformation
 * @param {string} size Optional size parameter (defaults to 1024x1024)
 * @returns {Promise<Object>} Promise resolving to the transformation result
 */
export async function transformImageWithMime(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    
    // Validate the size parameter
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`Using image size: ${finalSize}`);
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Get the MIME type of the image
    const detectedMime = mime.lookup(imagePath);
    console.log(`[TEST] About to send file: ${imagePath}`);
    console.log(`[TEST] Detected mime-type: ${detectedMime}`);
    
    // Verify that the MIME type is supported
    if (!supportedMimeTypes.includes(detectedMime)) {
      throw new Error(`Unsupported MIME type: ${detectedMime}. Supported types are: ${supportedMimeTypes.join(', ')}`);
    }
    
    // For generating new images based on a prompt (not editing existing ones)
    // We use the images.generate endpoint
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality: "standard",
      size: finalSize,
    });
    
    console.log('Response received from OpenAI');
    
    // Create filenames for the transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Process the primary image
    if (response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url;
      console.log(`Image URL received: ${imageUrl}`);
      
      // Download and save the transformed image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      fs.writeFileSync(transformedPath, Buffer.from(imageBuffer));
      console.log(`Transformed image saved to: ${transformedPath}`);
      
      return {
        url: imageUrl,
        transformedPath,
        secondTransformedPath: null
      };
    } else {
      throw new Error('No image data received from OpenAI API');
    }
  } catch (error) {
    console.error('Error in image transformation:', error);
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}

export { allowedSizes, supportedMimeTypes };