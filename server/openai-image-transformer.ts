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

// OpenAI API allowed sizes - these are the only sizes OpenAI accepts
const openaiAllowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

// Extended size options that users can choose from - these will be mapped to OpenAI sizes
const extendedSizeOptions = [
  "512x512",
  "768x768", 
  "1024x1024",
  "1280x720",    // 16:9 landscape
  "1536x1024",   // 3:2 landscape
  "1024x1536",   // 2:3 portrait
  "1920x1080",   // Full HD landscape
  "1080x1920",   // Full HD portrait
  "2048x2048",   // Large square
  "1600x900",    // 16:9 medium
  "900x1600"     // 9:16 medium portrait
];

// Function to map user-selected size to closest OpenAI-allowed size
function mapToOpenAISize(requestedSize: string): string {
  if (openaiAllowedSizes.includes(requestedSize)) {
    return requestedSize;
  }
  
  const [width, height] = requestedSize.split('x').map(Number);
  const aspectRatio = width / height;
  
  // Map based on aspect ratio
  if (aspectRatio > 1.4) {
    // Wide landscape - use 1536x1024
    return "1536x1024";
  } else if (aspectRatio < 0.7) {
    // Tall portrait - use 1024x1536
    return "1024x1536";
  } else {
    // Square or close to square - use 1024x1024
    return "1024x1024";
  }
}

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
    
    // Map user-requested size to OpenAI-compatible size
    const userSize = size;
    const finalSize = mapToOpenAISize(userSize);
    console.log(`[OpenAI] Requested size: ${userSize}, mapped to OpenAI size: ${finalSize}`);
    
    // Read the image file and convert to base64
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image read and encoded as base64 (${base64Image.length} chars)`);
    
    // Create the destination filename for the transformed image
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Call OpenAI API using the images.edit endpoint with GPT-image-01
    console.log('[OpenAI] Calling OpenAI API with GPT-image-01 model');
    
    // Convert base64 to buffer for proper file upload
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Make the API call with the correct GPT-image-01 model
    const response = await openai.images.edit({
      model: "gpt-image-01",
      image: imageBuffer,
      prompt: prompt,
      n: 2,
      size: finalSize as any,
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