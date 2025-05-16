/**
 * OpenAI image transformation using gpt-image-1 model
 * Implements EXACTLY the pattern requested for using base64 encoding
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses the /edit endpoint with base64 encoding as requested
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size (from request body)
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformWithGptImage(imagePath, prompt, size) {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Read the image as base64 using the exact pattern requested
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Validate size parameter - use only the three sizes specified
    const userSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(userSize) ? userSize : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);

    // Call OpenAI API using the exact pattern from the request
    console.log(`[OpenAI] Calling OpenAI with gpt-image-1 model`);
    
    // Make the API call with EXACTLY the pattern requested
    // For the Node.js SDK, we need to handle the base64 image properly for the API
    // Create a Buffer from the base64 string first
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // The OpenAI SDK needs a proper File-like object, so we'll create one
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageBuffer,
      prompt: prompt,
      n: 2,
      moderation: "low",
      size: finalSize,
    });
    
    console.log(`[OpenAI] Received response from API`);
    
    // Process the response
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl}`);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageData = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(imageData));
    console.log(`[OpenAI] First image saved to: ${transformedPath}`);
    
    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      console.log(`[OpenAI] Second image URL: ${secondImageUrl}`);
      
      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
      
      const secondResponse = await fetch(secondImageUrl);
      if (secondResponse.ok) {
        const secondData = await secondResponse.arrayBuffer();
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondData));
        console.log(`[OpenAI] Second image saved to: ${secondTransformedPath}`);
      }
    }
    
    // No temporary files to clean up since we're using base64 directly
    
    return {
      url: imageUrl,
      transformedPath,
      secondTransformedPath
    };
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };