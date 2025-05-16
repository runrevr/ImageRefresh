/**
 * Direct image transformation implementation for the API
 * Using GPT-Image-1 model through the OpenAI API
 */

// Import the CommonJS transform module
const transformModule = require('./transform-image.cjs');

// Export the transform function
export async function transformImage(imagePath, prompt, imageSize = "1024x1024") {
  console.log(`[Direct Transform] Starting transformation with prompt: "${prompt}"`);
  console.log(`[Direct Transform] Image path: ${imagePath}, size: ${imageSize}`);
  
  try {
    // Call the CommonJS implementation
    const result = await transformModule.transformImage(imagePath, prompt, imageSize);
    
    console.log(`[Direct Transform] Transformation successful`);
    console.log(`[Direct Transform] First image: ${result.transformedPath}`);
    console.log(`[Direct Transform] Second image: ${result.secondTransformedPath || "None"}`);
    
    return result;
  } catch (error) {
    console.error(`[Direct Transform] Error: ${error.message}`);
    throw error;
  }
}

// Export variation functions to match the original API
export async function createImageVariation(imagePath) {
  const variationPrompt = "Create a creative variation of this image with a different style and colors while keeping the main subject recognizable";
  return transformImage(imagePath, variationPrompt, "1024x1024");
}

// Export the allowed sizes constant
export const allowedSizes = transformModule.allowedSizes;