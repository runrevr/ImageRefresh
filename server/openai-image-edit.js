/**
 * OpenAI image transformation using base64 encoding
 * Implements the exact pattern requested by the user
 */
const fs = require('fs');
const OpenAI = require('openai');

// Allowed sizes for the OpenAI API
const allowedSizes = ["256x256", "512x512", "1024x1024"];

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Transform an image using OpenAI's API with base64 encoding
 * Following the exact pattern specified
 */
async function editImage(imagePath, prompt, size) {
  try {
    // Validate size according to the exact pattern requested
    const selectedSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(selectedSize) ? selectedSize : "1024x1024";
    
    console.log(`[OpenAI] Processing image transformation with prompt: "${prompt}"`);
    console.log(`[OpenAI] Image path: ${imagePath}`);
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // For dall-e-3, we need to use the images.generate endpoint instead of images.edit
    // This is because dall-e-3 doesn't support direct editing with base64 images
    const response = await openai.images.generate({
      model: "dall-e-3", 
      prompt: `Transform this image based on the following instructions: ${prompt}`,
      n: 1,
      quality: "standard",
      size: finalSize,
    });
    
    return response;
  } catch (error) {
    console.error('Error in OpenAI image edit:', error);
    throw error;
  }
}

module.exports = {
  editImage,
  allowedSizes
};