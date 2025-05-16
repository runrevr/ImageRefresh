/**
 * OpenAI image transformation using gpt-image-1 model
 * Implements EXACTLY the pattern provided in the example
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses EXACTLY the pattern provided in the example
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size (from request body)
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformWithGptImage(imagePath, prompt, size) {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // This EXACTLY matches the pattern provided:
    // const fs = require('fs');
    // const allowedSizes = ["256x256", "512x512", "1024x1024"];
    // const imagePath = /* path to uploaded file */;
    // const prompt = /* prompt string */;
    // const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    // const selectedSize = req.body.size || "1024x1024";
    // const finalSize = allowedSizes.includes(selectedSize) ? selectedSize : "1024x1024";
    
    // Read the image as base64
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Determine the image size (exactly matching the example pattern)
    const selectedSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(selectedSize) ? selectedSize : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);

    // Call OpenAI API using the exact pattern from the example
    console.log(`[OpenAI] Calling OpenAI with gpt-image-1`);
    
    // Create the FormData object for the API request
    // Note: For the OpenAI Node.js SDK, we need to convert the base64 string to a Buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Save a temporary file to use with createReadStream
    const tempFilePath = path.join(process.cwd(), 'uploads', `temp-${Date.now()}.png`);
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    // Use createReadStream as required by the OpenAI SDK
    const imageStream = fs.createReadStream(tempFilePath);
    
    // Make the API call with EXACTLY the pattern from the example
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageStream,
      prompt: prompt,
      n: 2,
      moderation: "low",
      size: finalSize,
    });
    
    console.log(`[OpenAI] Received response from API`);
    
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
    
    // Clean up temporary file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.log(`[OpenAI] Warning: Could not delete temp file: ${e.message}`);
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