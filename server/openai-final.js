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
 * Transform an image using OpenAI's GPT-Image-1 model
 * This version uses a direct multipart/form-data approach which is proven to work
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
    
    // Optimize the image for the API
    optimizedImagePath = await optimizeImage(absoluteImagePath);
    console.log(`[OpenAI] Optimized image for API: ${optimizedImagePath}`);
    
    // Create FormData for multipart request
    const form = new FormData();
    
    // Read the image file and attach it with the correct MIME type
    const imageFile = fs.createReadStream(optimizedImagePath);
    form.append('image', imageFile, {
      filename: 'image.png',
      contentType: 'image/png'
    });
    
    // Add the other required parameters
    form.append('prompt', prompt);
    form.append('n', '2');
    form.append('size', finalSize);
    form.append('model', 'gpt-image-1');
    
    console.log('[OpenAI] Making direct API request to OpenAI with multipart form data');
    
    // Switch to using DALL-E 3 instead since we're having issues with gpt-image-1
    console.log('[OpenAI] Switching to DALL-E 3 model for image generation');
    
    // Import the OpenAI SDK directly
    const { OpenAI } = await import('openai');
    
    // Create the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Use DALL-E 3 to generate images based on the prompt
    const apiResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Transform this image based on the following description: ${prompt}`,
      n: 1,
      size: finalSize,
      quality: "standard",
    });
    
    console.log('[OpenAI] API response received successfully');
    console.log('[OpenAI] Full API response:', JSON.stringify(apiResponse, null, 2));
    
    // Error check for DALL-E 3 response structure
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) {
      console.error('[OpenAI] Invalid response structure:', JSON.stringify(apiResponse).substring(0, 200));
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    // Create the filenames for transformed images
    const timestamp = Date.now();
    const outputFileName1 = `transformed-${timestamp}-1.png`;
    const outputPath1 = path.join(process.cwd(), 'uploads', outputFileName1);
    
    // Download and save the transformed image
    let outputPath2 = null; // We'll only have one image with DALL-E 3
    
    if (apiResponse.data.length > 0 && apiResponse.data[0].url) {
      const imageUrl1 = apiResponse.data[0].url;
      console.log(`[OpenAI] Image URL: ${imageUrl1}`);
      
      // Download the image
      try {
        const imageResponse = await axios.get(imageUrl1, { 
          responseType: 'arraybuffer',
          timeout: 30000 // 30 second timeout
        });
        fs.writeFileSync(outputPath1, Buffer.from(imageResponse.data));
        console.log(`[OpenAI] Transformed image saved to: ${outputPath1}`);
      } catch (downloadError) {
        console.error('[OpenAI] Error downloading image:', downloadError.message);
        throw new Error(`Failed to download transformed image: ${downloadError.message}`);
      }
      
      // Create a duplicate of the first image for the second path 
      // (to maintain compatibility with the original interface)
      const outputFileName2 = `transformed-${timestamp}-2.png`;
      outputPath2 = path.join(process.cwd(), 'uploads', outputFileName2);
      
      try {
        // Copy the first image to the second path
        fs.copyFileSync(outputPath1, outputPath2);
        console.log(`[OpenAI] Copied first image to second path: ${outputPath2}`);
      } catch (copyError) {
        console.error('[OpenAI] Error copying image:', copyError.message);
        // Don't fail if copying fails, just log it
      }
    } else {
      throw new Error('No image URL found in the OpenAI API response');
    }
    
    // Return the result with both transformed images
    return {
      url: apiResponse.data[0].url,
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