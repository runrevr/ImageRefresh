/**
 * OpenAI service for image transformations using base64 encoding
 * This uses the official SDK with base64-encoded images
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allowed image sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

/**
 * Generate a new image based on a prompt and reference image using base64 encoding
 * 
 * @param imagePath Path to the reference image
 * @param prompt The text prompt describing the desired transformation
 * @param size The size of the output image (must be one of the allowed sizes)
 * @returns Promise resolving to the transformed image information
 */
export async function transformImageBase64(
  imagePath: string,
  prompt: string,
  size: string = "1024x1024"
): Promise<{ url: string; transformedPath: string }> {
  try {
    console.log(`[OpenAI] Processing image transformation with prompt: ${prompt}`);
    
    // Validate and set image size
    const selectedSize = allowedSizes.includes(size) ? size : "1024x1024";
    const finalSize = selectedSize as "256x256" | "512x512" | "1024x1024";
    console.log(`[OpenAI] Using image size: ${finalSize}`);
    
    // Read the image file and convert to base64
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image read and encoded as base64`);
    
    // Create the destination filename for the transformed image
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Call OpenAI API with base64-encoded image
    console.log('[OpenAI] Calling OpenAI API with base64-encoded image');
    
    // Create a temporary file with the base64 content
    const tempImagePath = path.join(process.cwd(), 'uploads', `temp-${Date.now()}.png`);
    fs.writeFileSync(tempImagePath, Buffer.from(base64Image, 'base64'));
    
    // Use createReadStream for API compatibility
    const imageStream = fs.createReadStream(tempImagePath);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: finalSize,
      quality: "standard",
    });
    
    console.log('[OpenAI] Response received from API');
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No image data received from OpenAI API');
    }
    
    // Get the URL from the response
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
    
    // If there's a second image, handle it too
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
      url: imageUrl,
      transformedPath,
      secondTransformedPath
    };
  } catch (error: any) {
    console.error('[OpenAI] Error in transformImageBase64:', error);
    
    // Check for specific OpenAI error types
    if (error.message && error.message.includes('content policy')) {
      throw new Error('Your request was rejected due to content policy restrictions. Please try a different prompt.');
    }
    
    throw new Error(`Error transforming image: ${error.message}`);
  }
}