/**
 * Final implementation for OpenAI image transformations
 * Uses only GPT-Image-01 model with the edit endpoint
 * Supports only the three specified image dimensions
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses FormData with proper multipart encoding as required by OpenAI API
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
    
    // Create a proper FormData object
    const form = new FormData();
    
    // Add all required fields to form data
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('n', '2');
    form.append('size', finalSize);
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Determine MIME type - default to PNG if detection fails
    let mimeType = 'image/png';
    try {
      const fileTypeResult = await fileTypeFromBuffer(imageBuffer);
      if (fileTypeResult && fileTypeResult.mime) {
        mimeType = fileTypeResult.mime;
      }
    } catch (err) {
      console.log('[OpenAI] Could not detect MIME type, using default image/png');
    }
    
    // Add the image to the form with proper filename and content type
    form.append('image', imageBuffer, {
      filename: path.basename(imagePath),
      contentType: mimeType
    });
    
    console.log('[OpenAI] Sending API request with multipart/form-data...');
    
    // Make the API call with proper headers
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
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