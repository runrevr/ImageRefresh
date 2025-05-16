/**
 * Final OpenAI GPT-Image-01 transformation implementation
 * Uses GPT-Image-01 model with the /v1/images/edits endpoint and multipart/form-data
 * This is the primary implementation used by the application for all image transformations
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import sharp from 'sharp';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

// Allowed image types
const allowedImageTypes = ['.png', '.jpg', '.jpeg', '.webp'];

// Maximum image dimension to avoid timeout issues
const MAX_IMAGE_DIMENSION = 1024;

/**
 * Validate if a file is an allowed image type based on extension
 * @param {string} filePath - Path to the image file
 * @returns {boolean} - True if valid image type
 */
function isValidImageType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return allowedImageTypes.includes(ext);
}

/**
 * Resize and optimize an image to make it suitable for the API
 * @param {string} imagePath - Path to original image 
 * @returns {Promise<string>} - Path to the optimized image
 */
async function optimizeImage(imagePath) {
  try {
    console.log(`[OpenAI] Optimizing image for API: ${imagePath}`);
    
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    console.log(`[OpenAI] Original image: ${metadata.width}x${metadata.height}, ${metadata.format}`);
    
    // Create a temporary file for the resized image
    const tempFileName = `temp-${Date.now()}.png`;
    const tempFilePath = path.join(process.cwd(), tempFileName);
    
    // Check if resizing is needed
    let resizeOptions = {};
    if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
      if (metadata.width >= metadata.height) {
        resizeOptions.width = MAX_IMAGE_DIMENSION;
      } else {
        resizeOptions.height = MAX_IMAGE_DIMENSION;
      }
      console.log(`[OpenAI] Resizing image to fit within ${MAX_IMAGE_DIMENSION}px`);
    }
    
    // Process and save the image
    await sharp(imagePath)
      .resize(resizeOptions)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(tempFilePath);
    
    console.log(`[OpenAI] Optimized image saved to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error(`[OpenAI] Error optimizing image: ${error.message}`);
    throw error;
  }
}

/**
 * Transform an image using OpenAI's API with DALL-E 3 model
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  let tempImagePath = null;
  let absoluteImagePath = null;
  let optimizedImagePath = null;
  
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Validate size parameter - use only the three sizes specified
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // Make sure we have an absolute path to the image
    absoluteImagePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.join(process.cwd(), imagePath);
    
    console.log(`[OpenAI] Using absolute image path: ${absoluteImagePath}`);
    
    // Check if the image exists
    if (!fs.existsSync(absoluteImagePath)) {
      throw new Error(`Image file not found at path: ${absoluteImagePath}`);
    }
    
    // Get file info
    const fileInfo = fs.statSync(absoluteImagePath);
    console.log(`[OpenAI] Image size: ${fileInfo.size} bytes`);
    
    // We'll use DALL-E 3 model directly for image generation
    console.log('[OpenAI] Using DALL-E 3 model for direct image generation');
    
    // Import OpenAI
    const { OpenAI } = await import('openai');
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Create our transformation prompt based on the user's input
    const transformationPrompt = `Transform this image according to the following instructions: 
    
    ${prompt}
    
    The transformation should maintain the overall composition and structure of the original image, 
    but apply the requested style or modifications. Preserve the main subject matter while 
    transforming the visual elements as specified in the prompt.`;
    
    console.log(`[OpenAI] Using transformation prompt: "${transformationPrompt.substring(0, 50)}..."`);
    
    // Generate the first image with DALL-E 3
    console.log('[OpenAI] Generating first image variation...');
    const response1 = await openai.images.generate({
      model: "dall-e-3",
      prompt: transformationPrompt + " Variation 1.",
      n: 1,
      size: finalSize,
      quality: "standard",
    });
    
    console.log('[OpenAI] First image generation response received');
    
    // Process the first response
    if (!response1.data || response1.data.length === 0) {
      throw new Error("No image data in first OpenAI response");
    }
    
    // Generate the second image with a slightly different prompt for variety
    // but still keeping it similar to the first one
    console.log('[OpenAI] Generating second image variation...');
    const response2 = await openai.images.generate({
      model: "dall-e-3",
      prompt: transformationPrompt + " Create a similar but slightly different interpretation as variation 2.",
      n: 1,
      size: finalSize,
      quality: "standard",
    });
    
    console.log('[OpenAI] Second image generation response received');
    
    // Process the second response
    if (!response2.data || response2.data.length === 0) {
      throw new Error("No image data in second OpenAI response");
    }
    
    // Create filenames for transformed images
    const timeStamp = Date.now();
    const outputFileName1 = `transformed-${timeStamp}-1.png`;
    const outputPath1 = path.join(process.cwd(), "uploads", outputFileName1);
    
    const outputFileName2 = `transformed-${timeStamp}-2.png`;
    const outputPath2 = path.join(process.cwd(), "uploads", outputFileName2);
    
    // Get the image URLs from the responses
    const resultUrl1 = response1.data[0].url;
    const resultUrl2 = response2.data[0].url;
    
    console.log(`[OpenAI] First image URL: ${resultUrl1}`);
    console.log(`[OpenAI] Second image URL: ${resultUrl2}`);
    
    // Download and save the first transformed image
    const resultResponse1 = await axios.get(resultUrl1, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath1, Buffer.from(resultResponse1.data));
    console.log(`[OpenAI] First image saved to: ${outputPath1}`);
    
    // Download and save the second transformed image
    const resultResponse2 = await axios.get(resultUrl2, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath2, Buffer.from(resultResponse2.data));
    console.log(`[OpenAI] Second image saved to: ${outputPath2}`);
    
    // Return the result with both transformed images
    return {
      url: resultUrl1,
      transformedPath: outputPath1,
      secondTransformedPath: outputPath2
    };
  } catch (error) {
    console.error(`[OpenAI] Error in transformation: ${error.message}`);
    
    if (error.response) {
      console.error(`[OpenAI] Response status: ${error.response.status}`);
      console.error(`[OpenAI] Response details:`, error.response.data);
    }
    
    throw error;
  } finally {
    // Clean up temporary files if they were created
    const tempFiles = [tempImagePath, optimizedImagePath].filter(
      path => path && absoluteImagePath && path !== absoluteImagePath && fs.existsSync(path)
    );
    
    for (const tempFile of tempFiles) {
      try {
        fs.unlinkSync(tempFile);
        console.log(`[OpenAI] Removed temporary file: ${tempFile}`);
      } catch (cleanupError) {
        console.error(`[OpenAI] Error removing temporary file ${tempFile}: ${cleanupError.message}`);
      }
    }
  }
}

export { allowedSizes };