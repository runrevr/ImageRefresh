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
    
    // For simplicity, we'll use DALL-E 3 model for image generation
    // instead of the edit endpoint which can be more finicky
    console.log('[OpenAI] Using DALL-E 3 model for image generation');
    
    // Import OpenAI
    const { OpenAI } = await import('openai');
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('[OpenAI] Starting image edits with gpt-image-1...');
    
    // Create a multipart form for the first image
    const form1 = new FormData();
    
    // Add API parameters to the form
    form1.append('model', 'gpt-image-1');
    form1.append('prompt', prompt + " Variation 1");
    form1.append('n', 1);
    form1.append('size', finalSize);
    
    // Add the image file - validating first
    const imageStream1 = fs.createReadStream(absoluteImagePath);
    form1.append('image', imageStream1, {
      filename: path.basename(absoluteImagePath),
      contentType: 'image/png'
    });
    
    console.log('[OpenAI] Sending first API request to /v1/images/edits...');
    
    // Make the first API call with multipart/form-data
    const response1 = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form1,
      {
        headers: {
          ...form1.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 120000, // 2 minutes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('[OpenAI] First image edit response received');
    
    // Create a multipart form for the second image
    const form2 = new FormData();
    
    // Add API parameters to the form
    form2.append('model', 'gpt-image-1');
    form2.append('prompt', prompt + " Variation 2 - create a different interpretation");
    form2.append('n', 1);
    form2.append('size', finalSize);
    
    // Add the image file - validating first
    const imageStream2 = fs.createReadStream(absoluteImagePath);
    form2.append('image', imageStream2, {
      filename: path.basename(absoluteImagePath),
      contentType: 'image/png'
    });
    
    console.log('[OpenAI] Sending second API request to /v1/images/edits...');
    
    // Make the second API call with multipart/form-data
    const response2 = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form2,
      {
        headers: {
          ...form2.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 120000, // 2 minutes timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log('[OpenAI] Second image response received');
    
    // Process responses - check first response
    if (!response1.data || !response1.data.data || response1.data.data.length === 0) {
      throw new Error("No image data in first OpenAI response");
    }
    
    // Process responses - check second response
    if (!response2.data || !response2.data.data || response2.data.data.length === 0) {
      throw new Error("No image data in second OpenAI response");
    }
    
    // Create filenames for transformed images
    const timeStamp = Date.now();
    const outputFileName1 = `transformed-${timeStamp}-1.png`;
    const outputPath1 = path.join(process.cwd(), "uploads", outputFileName1);
    
    const outputFileName2 = `transformed-${timeStamp}-2.png`;
    const outputPath2 = path.join(process.cwd(), "uploads", outputFileName2);
    
    // Get the image URLs from the responses
    const resultUrl1 = response1.data.data[0].url;
    const resultUrl2 = response2.data.data[0].url;
    
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
    // Clean up temporary file if it was created
    if (tempImagePath && absoluteImagePath && tempImagePath !== absoluteImagePath && fs.existsSync(tempImagePath)) {
      try {
        fs.unlinkSync(tempImagePath);
        console.log(`[OpenAI] Removed temporary file: ${tempImagePath}`);
      } catch (cleanupError) {
        console.error(`[OpenAI] Error removing temporary file: ${cleanupError.message}`);
      }
    }
  }
}

export { allowedSizes };