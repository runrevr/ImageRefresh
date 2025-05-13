// Implementation of OpenAI image transformation functionality
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Directory for uploads
const uploadsDir = path.join(process.cwd(), "uploads");

/**
 * Transforms an image using OpenAI's image editing capabilities
 * @param imagePath Path to the original image
 * @param prompt The prompt describing the transformation
 * @returns Path to the transformed image
 */
export async function transformImageWithOpenAI(imagePath: string, prompt: string): Promise<string> {
  try {
    // Detailed logging
    console.log(`[OpenAI] Starting image transformation at ${new Date().toISOString()}`);
    console.log(`[OpenAI] Prompt: "${prompt}"`);
    console.log(`[OpenAI] Image path: ${imagePath}`);
    
    // Verify OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('[OpenAI] Missing API key: OPENAI_API_KEY environment variable is not set');
      throw new Error('OpenAI API key is missing. Please set OPENAI_API_KEY environment variable.');
    } else {
      // Only show first and last 4 characters of the key for security
      const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 4);
      const keySuffix = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
      console.log(`[OpenAI] Using API key: ${keyPrefix}...${keySuffix}`);
    }
    
    // Check if image exists
    const fullImagePath = path.join(process.cwd(), imagePath);
    console.log(`[OpenAI] Checking image at full path: ${fullImagePath}`);
    
    if (!fs.existsSync(fullImagePath)) {
      console.error(`[OpenAI] Image not found: ${fullImagePath}`);
      throw new Error(`Original image not found at path: ${fullImagePath}`);
    }
    
    // Log image file details
    const stats = fs.statSync(fullImagePath);
    console.log(`[OpenAI] Image file size: ${stats.size} bytes`);
    console.log(`[OpenAI] Image last modified: ${stats.mtime}`);

    // For generation mode instead of variation mode
    console.log("[OpenAI] Using image generation with prompt");
    
    // Create a response using OpenAI DALL-E models for generation
    console.log("[OpenAI] Calling OpenAI API with the provided prompt...");
    
    // Use the prompt directly without any modifications
    // Our prompts in data.json are carefully crafted and should never be modified
    console.log("[OpenAI] Using prompt directly from ideas page (length: " + prompt.length + ")");
    console.log("[OpenAI] Prompt preview:", prompt.substring(0, 100) + "...");
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt, // Use original prompt without any modifications
      n: 1,
      size: "1024x1024",
      quality: "standard", 
    });
    
    console.log("[OpenAI] API call completed successfully");
    
    // Check response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    // Get the URL of the generated image
    const generatedImageUrl = response.data[0].url;
    console.log("[OpenAI] Received image URL from OpenAI");
    
    // Download the image
    console.log("[OpenAI] Downloading generated image...");
    try {
      const imageResponse = await axios.get(generatedImageUrl, { 
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });
      
      console.log(`[OpenAI] Download successful, received ${imageResponse.data.length} bytes`);
      
      // Save the image to the uploads directory
      const imageExt = '.png'; // OpenAI returns PNG images
      const transformedImagePath = path.join(uploadsDir, `transformed-${Date.now()}-${uuid()}${imageExt}`);
      
      console.log(`[OpenAI] Saving image to: ${transformedImagePath}`);
      fs.writeFileSync(transformedImagePath, Buffer.from(imageResponse.data));
      
      // Return the relative path from the project root
      const relativePath = path.relative(process.cwd(), transformedImagePath).replace(/\\/g, '/');
      console.log(`[OpenAI] Successfully saved transformed image to: ${relativePath}`);
      
      return relativePath;
    } catch (error) {
      console.error("[OpenAI] Error downloading or saving the image:", error);
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      throw new Error(`Failed to download or save the transformed image: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error("[OpenAI] Error in image transformation:", error);
    
    // Enhanced error reporting
    if (error.response) {
      console.error("[OpenAI] API response error:", JSON.stringify({
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      }, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error("[OpenAI] Network connection error - unable to reach OpenAI API");
    }
    
    if (error.message.includes('401')) {
      console.error("[OpenAI] Authentication error - invalid or expired API key");
    }
    
    if (error.message.includes('429')) {
      console.error("[OpenAI] Rate limit exceeded - too many requests or quota exceeded");
    }
    
    throw error;
  }
}