/**
 * OpenAI image transformation implementation using GPT-Image-01 model with /edit endpoint
 * Uses base64-encoded image in a JSON body as required
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

// Allowed image types
const allowedImageTypes = ['.png', '.jpg', '.jpeg', '.webp'];

// Maximum reasonable image dimensions to avoid 413 errors
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
 * Compress and resize an image to make it suitable for API submission
 * @param {string} imagePath - Path to original image
 * @returns {Promise<Buffer>} - Compressed image buffer
 */
async function prepareImageForAPI(imagePath) {
  console.log(`[OpenAI] Preparing image for API submission: ${imagePath}`);
  
  try {
    // Use sharp to resize and optimize the image
    const image = sharp(imagePath);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Determine if resizing is needed
    let resizeConfig = {};
    if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
      // Calculate dimensions while preserving aspect ratio
      if (metadata.width > metadata.height) {
        resizeConfig.width = MAX_IMAGE_DIMENSION;
      } else {
        resizeConfig.height = MAX_IMAGE_DIMENSION;
      }
      console.log(`[OpenAI] Resizing image from ${metadata.width}x${metadata.height} to fit within ${MAX_IMAGE_DIMENSION}px`);
    }
    
    // Process the image - optimize, resize if needed, and convert to PNG
    const processedImageBuffer = await image
      .resize(resizeConfig)
      .png({ quality: 80, compressionLevel: 9 })
      .toBuffer();
    
    console.log(`[OpenAI] Image prepared: ${processedImageBuffer.length} bytes`);
    return processedImageBuffer;
  } catch (error) {
    console.error(`[OpenAI] Error preparing image: ${error.message}`);
    throw error;
  }
}

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses the /edit endpoint with base64 encoding in a JSON body
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Validate image type
    if (!isValidImageType(imagePath)) {
      throw new Error(`Invalid image type. Only PNG, JPEG, and WEBP are supported.`);
    }
    
    // Validate size parameter - use only the three sizes specified
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // Prepare the image (resize/compress) for API submission
    const processedImageBuffer = await prepareImageForAPI(imagePath);
    
    // Convert processed image to base64
    const base64Image = processedImageBuffer.toString('base64');
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Create JSON request body with base64-encoded image
    const requestBody = {
      model: "gpt-image-1",
      image: base64Image,
      prompt: prompt,
      n: 2,
      moderation: "low",
      size: finalSize
    };
    
    console.log('[OpenAI] Sending API request with JSON body and base64 image...');
    
    // Make API call with JSON body containing base64-encoded image
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/edits',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          timeout: 120000, // 2 minutes timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      console.log('[OpenAI] Received response from API');
      
      // Process the response
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        throw new Error("No image data in OpenAI response");
      }
      
      // Create filenames for transformed images
      const transformedFileName = `transformed-${Date.now()}.png`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      // Download and save the primary transformed image
      const imageUrl = response.data.data[0].url;
      console.log(`[OpenAI] First image URL: ${imageUrl}`);
      
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(transformedPath, Buffer.from(imageResponse.data));
      console.log(`[OpenAI] First image saved to: ${transformedPath}`);
      
      // Process second image if available
      let secondTransformedPath = null;
      if (response.data.data.length > 1 && response.data.data[1].url) {
        const secondImageUrl = response.data.data[1].url;
        console.log(`[OpenAI] Second image URL: ${secondImageUrl}`);
        
        const secondFileName = `transformed-${Date.now()}-2.png`;
        secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
        
        const secondResponse = await axios.get(secondImageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondResponse.data));
        console.log(`[OpenAI] Second image saved to: ${secondTransformedPath}`);
      }
      
      return {
        url: imageUrl,
        transformedPath,
        secondTransformedPath
      };
    } catch (apiError) {
      // Log detailed error information for debugging
      console.error(`[OpenAI] API Error: ${apiError.message}`);
      
      if (apiError.response) {
        console.error(`[OpenAI] Response status: ${apiError.response.status}`);
        console.error(`[OpenAI] Response data:`, apiError.response.data);
      }
      
      // Log a sanitized version of the request for debugging (omit the actual base64 data)
      const debugRequestBody = {
        ...requestBody,
        image: `[Base64 Image String of ${base64Image.length} chars]`
      };
      console.error(`[OpenAI] Request body:`, JSON.stringify(debugRequestBody, null, 2));
      
      throw apiError;
    }
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };