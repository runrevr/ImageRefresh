/**
 * OpenAI image transformation using base64 encoding
 * Implements the exact pattern requested
 */
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

/**
 * Transform an image using OpenAI's API with base64 encoding
 * @param {string} imagePath Path to the image file
 * @param {string} prompt Text prompt for the transformation
 * @param {string} size Optional size parameter (defaults to 1024x1024)
 * @returns {Promise<Object>} Promise resolving to the transformation result
 */
async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    
    // Validate size with the exact pattern requested
    const selectedSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(selectedSize) ? selectedSize : "1024x1024";
    console.log(`Using image size: ${finalSize}`);
    
    // Read the image file as base64 directly, following the requested pattern
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`Image encoded as base64 (${base64Image.length} characters)`);
    
    // Call OpenAI API - using the newer endpoint for DALL-E 3
    console.log('Calling OpenAI API with base64-encoded image');
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      quality: "standard",
      size: finalSize,
    });
    
    console.log('Response received from OpenAI');
    
    // Create filenames for the transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Process the primary image
    if (response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url;
      console.log(`Image URL received: ${imageUrl}`);
      
      // Download and save the transformed image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      
      const imageBuffer = await imageResponse.arrayBuffer();
      fs.writeFileSync(transformedPath, Buffer.from(imageBuffer));
      console.log(`Transformed image saved to: ${transformedPath}`);
      
      return {
        url: imageUrl,
        transformedPath,
        secondTransformedPath: null
      };
    } else {
      throw new Error('No image data received from OpenAI API');
    }
  } catch (error) {
    console.error('Error in image transformation:', error);
    throw new Error(`Failed to transform image: ${error.message}`);
  }
}

module.exports = {
  transformImage,
  allowedSizes
};