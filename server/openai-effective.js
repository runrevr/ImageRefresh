/**
 * Effective implementation for OpenAI image editing using gpt-image-1 model
 * Uses the required multipart/form-data format with base64 conversion
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses the /edit endpoint with correct multipart/form-data encoding
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Validate size parameter - use only the three sizes specified
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create FormData object
    const formData = new FormData();
    
    // Add required parameters to form data
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('n', '2');
    formData.append('size', finalSize);
    
    // Add image to form data with proper filename and content type
    const fileName = path.basename(imagePath);
    formData.append('image', imageBuffer, {
      filename: fileName,
      contentType: 'image/png' // Default to PNG, adjust as needed
    });
    
    console.log('[OpenAI] Sending API request with multipart/form-data...');
    
    // Make the API call with proper form data encoding
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        },
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
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    if (error.response) {
      console.error(`[OpenAI] Response status:`, error.response.status);
      console.error(`[OpenAI] Response data:`, error.response.data);
    }
    throw error;
  }
}

export { allowedSizes };