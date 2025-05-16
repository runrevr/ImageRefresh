/**
 * OpenAI image transformation using gpt-image-1 model
 * Direct implementation with proper MIME type handling
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import FormData from 'form-data';
import mime from 'mime-types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model with the edit endpoint
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size (from request body)
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  let tempFilePath = null;
  
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Validate size parameter - use only the three sizes specified
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);

    // Determine MIME type for the file
    const mimeType = mime.lookup(imagePath) || 'image/png';
    console.log(`[OpenAI] Image MIME type: ${mimeType}`);
    
    // Create a FormData object for sending multipart/form-data
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('n', '2');
    form.append('size', finalSize);
    
    // Add the image file to the form data with proper MIME type
    form.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: mimeType
    });
    
    console.log(`[OpenAI] Sending image with multipart/form-data`);
    
    // Make the API request
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        // Do not set content-type here, let FormData set it with the boundary
      },
      body: form
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }
    
    // Parse the JSON response
    const responseData = await response.json();
    
    console.log(`[OpenAI] Received response from API`);
    
    // Process the response
    if (!responseData.data || responseData.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = responseData.data[0].url;
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
    if (responseData.data.length > 1 && responseData.data[1].url) {
      const secondImageUrl = responseData.data[1].url;
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