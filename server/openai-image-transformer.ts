/**
 * OpenAI service for image transformations using GPT-Image-01 model
 * Uses only the /edit endpoint with base64 encoding
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allowed image sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's GPT-Image-01 model
 * 
 * @param imagePath Path to the image to transform
 * @param prompt The text prompt describing the desired transformation
 * @param size The size of the output image (must be one of the allowed sizes)
 * @returns Promise resolving to the transformed image information
 */
export async function transformImage(
  imagePath: string,
  prompt: string,
  size: string = "1024x1024"
): Promise<{ 
  transformedPath: string; 
  secondTransformedPath: string | null;
}> {
  try {
    console.log(`[OpenAI] Processing image transformation with prompt: ${prompt}`);
    
    // Validate and set image size to one of the allowed sizes
    const userSize = size;
    const finalSize = allowedSizes.includes(userSize) ? userSize : "1024x1024";
    console.log(`[OpenAI] Using image size: ${finalSize}`);
    
    // Read the image file and convert to base64
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image read and encoded as base64 (${base64Image.length} chars)`);
    
    // Create the destination filename for the transformed image
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Call OpenAI API with base64-encoded image
    console.log('[OpenAI] Calling OpenAI API with GPT-Image-01 model');
    
    // Make the API call with the exact parameters requested
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: base64Image,
      prompt: prompt,
      n: 2,
      moderation: "low",
      size: finalSize as any, // Type assertion needed as the SDK might not have updated typings yet
    });
    
    console.log('[OpenAI] Response received from API');
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data received from OpenAI API');
    }
    
    // Process the first transformed image
    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error('No image URL in the OpenAI response');
    }
    
    // Download the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Save the image to the destination path
    const imageBuffer = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(imageBuffer));
    
    console.log(`[OpenAI] Transformed image saved to ${transformedPath}`);
    
    // Process the second transformed image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
      
      // Download the second image
      const secondResponse = await fetch(secondImageUrl);
      if (secondResponse.ok) {
        const secondBuffer = await secondResponse.arrayBuffer();
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondBuffer));
        console.log(`[OpenAI] Second transformed image saved to ${secondTransformedPath}`);
      }
    }
    
    return {
      transformedPath,
      secondTransformedPath
    };
  } catch (error: any) {
    console.error('[OpenAI] Error in transformImage:', error);
    
    // Check for specific OpenAI error types
    if (error.message && error.message.includes('content policy')) {
      throw new Error('Your request was rejected due to content policy restrictions. Please try a different prompt.');
    }
    
    throw new Error(`Error transforming image: ${error.message}`);
  }
}