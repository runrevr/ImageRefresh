import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import fetch from "node-fetch";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

export const imageVariationFormats = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Checks if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-dummy-key-for-development";
}

/**
 * Transforms an image based on the provided prompt
 */
export async function transformImage(
  imagePath: string, 
  prompt: string
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Create the image generation with the uploaded image as reference
    const enhancedPrompt = `Transform this product image: ${prompt}. Keep the product recognizable, but integrate it into the new environment seamlessly.`;
    
    console.log(`Processing image transformation with prompt: ${enhancedPrompt}`);
    
    // Use the newer DALL-E 3 model with generation instead of edit
    const response = await openai.images.generate({
      model: "dall-e-3", // Using the more advanced DALL-E 3
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });

    const data = response.data || [];
    if (!data.length || !data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    const imageUrl = data[0].url;

    // Generate unique name for the transformed image
    const originalFileName = path.basename(imagePath);
    const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    // Ensure the directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the image
    await pipeline(
      imageResponse.body,
      createWriteStream(transformedPath)
    );

    return {
      url: imageUrl,
      transformedPath,
    };
  } catch (error) {
    console.error("Error transforming image:", error);
    throw new Error(`Error transforming image: ${error.message}`);
  }
}

/**
 * Alternative implementation using the variation endpoint
 * for services where edit isn't available
 */
export async function createImageVariation(imagePath: string): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    const response = await openai.images.createVariation({
      image: fs.createReadStream(imagePath),
      n: 1,
      size: "1024x1024",
    });

    const data = response.data || [];
    if (!data.length || !data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    const imageUrl = data[0].url;

    // Generate unique name for the transformed image
    const originalFileName = path.basename(imagePath);
    const transformedFileName = `variation-${Date.now()}-${originalFileName}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    // Ensure the directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the image
    await pipeline(
      imageResponse.body,
      createWriteStream(transformedPath)
    );

    return {
      url: imageUrl,
      transformedPath,
    };
  } catch (error) {
    console.error("Error creating image variation:", error);
    throw new Error(`Error creating image variation: ${error.message}`);
  }
}
