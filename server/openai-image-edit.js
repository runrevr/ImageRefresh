/**
 * Correct implementation for OpenAI image editing using gpt-image-1 model
 * This follows the OpenAI API requirements for the /images/edits endpoint
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import mime from 'mime-types';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses only the /edit endpoint as specified
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
    
    // Determine proper MIME type
    const mimeType = mime.lookup(imagePath) || 'image/png';
    console.log(`[OpenAI] Image has MIME type: ${mimeType}`);
    
    // Read the image file as a base64 string
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Create form data using the FormData API
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('n', '2');
    formData.append('size', finalSize);
    
    // Attach the image file directly
    const imageFile = fs.readFileSync(imagePath);
    formData.append('image', imageFile, {
      filename: path.basename(imagePath),
      contentType: mimeType
    });
    
    console.log('[OpenAI] Sending API request with axios and FormData...');
    
    // Make the API call using axios
    const apiResponse = await axios.post('https://api.openai.com/v1/images/edits', 
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        }
      }
    );
    
    // Extract the response data
    const response = apiResponse.data;
    
    console.log('[OpenAI] Received response from API');
    
    // Process the response
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl}`);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageData = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(imageData));
    console.log(`[OpenAI] First image saved to: ${transformedPath}`);
    
    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      console.log(`[OpenAI] Second image URL: ${secondImageUrl}`);
      
      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
      
      const secondResponse = await fetch(secondImageUrl);
      if (secondResponse.ok) {
        const secondData = await secondResponse.arrayBuffer();
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondData));
        console.log(`[OpenAI] Second image saved to: ${secondTransformedPath}`);
      }
    }
    
    return {
      url: imageUrl,
      transformedPath,
      secondTransformedPath
    };
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };