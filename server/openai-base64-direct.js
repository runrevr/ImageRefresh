/**
 * Direct implementation for OpenAI image editing with GPT-Image-01 model
 * Uses base64-encoded image data in a JSON body with the edit endpoint
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * This implementation uses a direct axios call with a JSON body and base64 image
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
    
    // Read the image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Create the request body with base64-encoded image
    const requestBody = {
      model: "gpt-image-1",
      image: base64Image,
      prompt: prompt,
      n: 2,
      size: finalSize
    };
    
    console.log('[OpenAI] Sending direct API request with JSON body...');
    
    // Make a direct API call to OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
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