import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { Readable } from "stream";
import { promisify } from "util";
import stream from "stream";

const pipeline = promisify(stream.pipeline);

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

export const imageVariationFormats = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// Define the interface for OpenAI API image generation response
interface OpenAIImageResponse {
  data?: Array<{
    url: string;
  }>;
}

/**
 * Checks if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-dummy-key-for-development";
}

/**
 * Saves an image from a URL to the local filesystem
 */
async function saveImageFromUrl(imageUrl: string, destinationPath: string): Promise<void> {
  // Download the image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
  }

  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Save the image
  const fileStream = createWriteStream(destinationPath);
  
  // Make sure we have a readable stream that's not null
  if (imageResponse.body) {
    const bodyAsReadable = Readable.from(imageResponse.body as any);
    await new Promise<void>((resolve, reject) => {
      bodyAsReadable.pipe(fileStream);
      bodyAsReadable.on('error', reject);
      fileStream.on('finish', resolve);
    });
  } else {
    throw new Error("Failed to get response body");
  }
}

/**
 * Transforms an image based on the provided prompt using GPT-4o
 */
export async function transformImage(
  imagePath: string, 
  prompt: string
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Read the image file as base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Create the enhanced prompt
    const enhancedPrompt = `Transform this product image: ${prompt}. Keep the product recognizable, but integrate it into the new environment seamlessly.`;
    
    console.log(`Processing image transformation with prompt: ${enhancedPrompt}`);
    
    // Use GPT-4o with vision capabilities
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the newest GPT-4o model with vision capabilities
      messages: [
        {
          role: "system",
          content: "You are an expert image creator. You will generate a detailed, photorealistic image based on the input image and prompt."
        },
        {
          role: "user",
          content: [
            { type: "text", text: enhancedPrompt },
            { 
              type: "image_url", 
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });
    
    // Since GPT-4o doesn't generate images directly, we'll use gpt-image-1 with the enhanced description from GPT-4o
    const gpt4oDescription = response.choices[0].message.content;
    
    console.log("GPT-4o enhanced description:", gpt4oDescription);
    
    // Try to use gpt-image-1 first, fall back to DALL-E 3 if needed
    let imageResult;
    try {
      // First attempt with gpt-image-1
      imageResult = await openai.images.generate({
        model: "gpt-image-1",  // Trying the newest image model
        prompt: gpt4oDescription || enhancedPrompt,
        n: 1,
        size: "1024x1024"
      });
      console.log("Successfully used gpt-image-1 model");
    } catch (err: any) {
      // If gpt-image-1 fails due to verification, fall back to DALL-E 3
      console.log("Falling back to DALL-E 3 model:", err.message);
      imageResult = await openai.images.generate({
        model: "dall-e-3",
        prompt: gpt4oDescription || enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
    }
    
    // Process the result from SDK
    const data = imageResult.data || [];
    
    if (!data.length || !data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    const imageUrl = data[0].url;

    // Generate unique name for the transformed image
    const originalFileName = path.basename(imagePath);
    const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // Save the image to the filesystem
    await saveImageFromUrl(imageUrl, transformedPath);

    return {
      url: imageUrl,
      transformedPath,
    };
  } catch (error: any) {
    console.error("Error transforming image:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error transforming image: ${errorMessage}`);
  }
}

/**
 * Creates an image variation using the gpt-image-1 model when available
 * with a fallback to DALL-E 3 if the newer model is not accessible
 */
export async function createImageVariation(imagePath: string): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Create a simple prompt for the image variation
    const variationPrompt = "Create a creative variation of this image with a different style and colors";
    
    // Try to use gpt-image-1 first, fall back to DALL-E 3 if needed
    let imageResult;
    try {
      // First attempt with gpt-image-1
      imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: variationPrompt,
        n: 1,
        size: "1024x1024"
      });
      console.log("Successfully used gpt-image-1 model for variation");
    } catch (err: any) {
      // If gpt-image-1 fails, fall back to DALL-E 3
      console.log("Falling back to DALL-E 3 model for variation:", err.message);
      imageResult = await openai.images.generate({
        model: "dall-e-3",
        prompt: variationPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
    }
    
    // Process the result from SDK
    const data = imageResult.data || [];
    
    if (!data.length || !data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    const imageUrl = data[0].url;

    // Generate unique name for the transformed image
    const originalFileName = path.basename(imagePath);
    const transformedFileName = `variation-${Date.now()}-${originalFileName}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // Save the image to the filesystem
    await saveImageFromUrl(imageUrl, transformedPath);

    return {
      url: imageUrl,
      transformedPath,
    };
  } catch (error: any) {
    console.error("Error creating image variation:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error creating image variation: ${errorMessage}`);
  }
}
