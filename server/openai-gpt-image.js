/**
 * OpenAI image transformation using gpt-image-1 model
 * This implements the exact pattern requested
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

/**
 * Transform an image using gpt-image-1 model with base64 encoding
 * This follows the exact pattern specified
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size (defaults to "1024x1024")
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformWithGptImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[GPT-Image] Starting transformation with prompt: ${prompt}`);
    
    // Validate and select size using the exact pattern
    const selectedSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(selectedSize) ? selectedSize : "1024x1024";
    console.log(`[GPT-Image] Using size: ${finalSize}`);
    
    // Read the image file as base64 using the exact pattern
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[GPT-Image] Image encoded to base64 (${base64Image.length} chars)`);
    
    // Call OpenAI API using gpt-image-1 with the exact pattern
    console.log(`[GPT-Image] Calling OpenAI API with gpt-image-1 model`);
    
    // Convert base64 string to Buffer for the OpenAI SDK
    // This ensures compatibility with the API requirements
    const tempBuffer = Buffer.from(base64Image, 'base64');
    
    // Create a temporary file for the API call
    const tempFilePath = path.join(process.cwd(), 'uploads', `temp-${Date.now()}.png`);
    fs.writeFileSync(tempFilePath, tempBuffer);
    
    // Call the OpenAI API using a readable stream from the temp file
    const imageStream = fs.createReadStream(tempFilePath);
    
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageStream,
      prompt: prompt,
      n: 2,
      moderation: "low",
      size: finalSize,
    });
    
    console.log(`[GPT-Image] Received response from OpenAI`);
    
    // Process the response
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = response.data[0].url;
    console.log(`[GPT-Image] First image URL: ${imageUrl}`);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const responseBuffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(responseBuffer));
    console.log(`[GPT-Image] First image saved to: ${transformedPath}`);
    
    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      console.log(`[GPT-Image] Second image URL: ${secondImageUrl}`);
      
      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
      
      const secondResponse = await fetch(secondImageUrl);
      if (secondResponse.ok) {
        const secondBuffer = await secondResponse.arrayBuffer();
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondBuffer));
        console.log(`[GPT-Image] Second image saved to: ${secondTransformedPath}`);
      }
    }
    
    return {
      url: imageUrl,
      transformedPath,
      secondTransformedPath
    };
  } catch (error) {
    console.error(`[GPT-Image] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };