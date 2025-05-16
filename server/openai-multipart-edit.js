/**
 * OpenAI image transformation implementation using GPT-Image-01 model with /edit endpoint
 * Uses multipart/form-data as required by the OpenAI API
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

// Allowed image types
const allowedImageTypes = ['.png', '.jpg', '.jpeg', '.webp'];

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
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses the /edit endpoint with multipart/form-data as required by the API
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
    
    // Create a form data object for multipart/form-data request
    const form = new FormData();
    
    // Add all required fields to the form
    form.append('model', 'gpt-image-1');
    form.append('image', fs.createReadStream(imagePath)); // Send image as a file stream
    form.append('prompt', prompt);
    form.append('n', 2);
    form.append('moderation', 'low');
    form.append('size', finalSize);
    
    console.log('[OpenAI] Sending API request with multipart/form-data...');
    
    // Make API call with multipart/form-data as required by OpenAI
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/edits',
        form,
        {
          headers: {
            // Use form's getHeaders() to set the correct Content-Type and boundaries
            ...form.getHeaders(),
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
        console.error(`[OpenAI] Response status:`, apiError.response.status);
        console.error(`[OpenAI] Response data:`, apiError.response.data);
      }
      
      // Log request details for debugging
      console.error(`[OpenAI] Request details: Using multipart/form-data with image from ${imagePath}`);
      
      throw apiError;
    }
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };