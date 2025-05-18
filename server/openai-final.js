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
    
    // Make the direct API request with proper content type header
    const apiResponse = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form,
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('[OpenAI] API response received successfully');
    
    // Error check
    if (!apiResponse.data || !apiResponse.data.data || !Array.isArray(apiResponse.data.data)) {
      console.error('[OpenAI] Invalid response structure:', JSON.stringify(apiResponse.data).substring(0, 200));
      throw new Error('Invalid response structure from OpenAI API');
    }
    
    // Create the filenames for transformed images
    const timestamp = Date.now();
    const outputFileName1 = `transformed-${timestamp}-1.png`;
    const outputPath1 = path.join(process.cwd(), 'uploads', outputFileName1);
    
    // Download and save first transformed image
    let outputPath2 = null;
    
    if (apiResponse.data.data.length > 0 && apiResponse.data.data[0].url) {
      const imageUrl1 = apiResponse.data.data[0].url;
      console.log(`[OpenAI] First image URL: ${imageUrl1}`);
      
      // Download the image
      try {
        const imageResponse = await axios.get(imageUrl1, { responseType: 'arraybuffer' });
        fs.writeFileSync(outputPath1, Buffer.from(imageResponse.data));
        console.log(`[OpenAI] First transformed image saved to: ${outputPath1}`);
      } catch (downloadError) {
        console.error('[OpenAI] Error downloading first image:', downloadError.message);
        throw new Error(`Failed to download transformed image: ${downloadError.message}`);
      }
      
      // Process second image if available
      if (apiResponse.data.data.length > 1 && apiResponse.data.data[1].url) {
        const imageUrl2 = apiResponse.data.data[1].url;
        console.log(`[OpenAI] Second image URL: ${imageUrl2}`);
        
        const outputFileName2 = `transformed-${timestamp}-2.png`;
        outputPath2 = path.join(process.cwd(), 'uploads', outputFileName2);
        
        try {
          const imageResponse2 = await axios.get(imageUrl2, { responseType: 'arraybuffer' });
          fs.writeFileSync(outputPath2, Buffer.from(imageResponse2.data));
          console.log(`[OpenAI] Second transformed image saved to: ${outputPath2}`);
        } catch (downloadError) {
          console.error('[OpenAI] Error downloading second image:', downloadError.message);
          // Don't fail if second image fails, just log it
        }
      }
    } else {
      throw new Error('No image URLs found in the API response');
    }
    
    // Return the result with both transformed images
    return {
      url: apiResponse.data.data[0].url,
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