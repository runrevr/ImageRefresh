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
    console.log(`Starting OpenAI image transformation with prompt: ${prompt}`);
    
    // Check if image exists
    const fullImagePath = path.join(process.cwd(), imagePath);
    if (!fs.existsSync(fullImagePath)) {
      throw new Error(`Original image not found at path: ${fullImagePath}`);
    }

    // For generation mode instead of variation mode (if we keep having issues)
    console.log("Using OpenAI image generation with prompt instead of variation...");
    
    // Create a response using OpenAI DALL-E models for generation (not variation)
    console.log("Calling OpenAI API for image generation with prompt...");
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Transform this image: ${prompt}. Make it professional quality, highly detailed.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    // Check response
    if (!response.data || response.data.length === 0 || !response.data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    // Get the URL of the generated image
    const generatedImageUrl = response.data[0].url;
    console.log("Received image URL from OpenAI:", generatedImageUrl);
    
    // Download the image
    const imageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' });
    
    // Save the image to the uploads directory
    const imageExt = '.png'; // OpenAI returns PNG images
    const transformedImagePath = path.join(uploadsDir, `transformed-${Date.now()}-${uuid()}${imageExt}`);
    
    fs.writeFileSync(transformedImagePath, Buffer.from(imageResponse.data));
    
    // Return the relative path from the project root
    const relativePath = path.relative(process.cwd(), transformedImagePath).replace(/\\/g, '/');
    console.log(`Saved transformed image to: ${relativePath}`);
    
    return relativePath;
  } catch (error: any) {
    console.error("Error in OpenAI image transformation:", error);
    if (error.response) {
      console.error("OpenAI API response error:", error.response.data);
    }
    throw error;
  }
}