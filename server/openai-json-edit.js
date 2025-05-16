/**
 * Correct implementation for OpenAI image editing using gpt-image-1 model
 * Uses base64-encoded image in a JSON body
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

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
    
    // Validate size parameter - use only the three sizes specified
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // Read the image file as base64
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Create a plain JSON request body
    const requestBody = {
      model: "gpt-image-1",
      image: base64Image,
      prompt: prompt,
      n: 2,
      size: finalSize
    };
    
    console.log('[OpenAI] Sending API request with JSON body and base64 image...');
    
    // Make API call with JSON body (not multipart/form-data)
    const apiResponse = await axios.post(
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
    const response = apiResponse.data;
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl}`);
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(transformedPath, Buffer.from(imageResponse.data));
    console.log(`[OpenAI] First image saved to: ${transformedPath}`);
    
    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
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
    throw error;
  }
}

export { allowedSizes };