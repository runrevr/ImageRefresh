import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { Readable } from "stream";
import { promisify } from "util";
import stream from "stream";
import FormData from "form-data";

const pipeline = promisify(stream.pipeline);

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

// Log OpenAI configuration but mask the key
console.log(`OpenAI configured with API key: ${process.env.OPENAI_API_KEY ? "****" + process.env.OPENAI_API_KEY.slice(-4) : "NOT CONFIGURED"}`);

export const imageVariationFormats = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface OpenAIImageResponse {
  data?: Array<{
    url: string;
  }>;
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
}

async function saveImageFromUrl(imageUrl: string, destinationPath: string): Promise<void> {
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  if (imageUrl.startsWith('data:')) {
    console.log("Saving image from data URL");
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid data URL format");
    }
    const imageBuffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(destinationPath, imageBuffer);
    return;
  }

  console.log("Saving image from HTTP URL");
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
  }

  const fileStream = createWriteStream(destinationPath);

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

export async function transformImage(
  imagePath: string, 
  prompt: string,
  imageSize = "1024x1024", // default to 1024x1024
  isEdit = false        // flag to indicate if this is an edit
): Promise<{ url: string; transformedPath: string; secondTransformedPath?: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    
    // Import the direct GPT-Image-01 implementation with multipart/form-data
    // This implementation uses only the /v1/images/edits endpoint as required
    const { transformImage: gptImageTransform } = await import('./openai-direct.js');
    
    // Validate size parameter according to our three allowed sizes
    const validSizes = ["1024x1024", "1536x1024", "1024x1536"];
    const userSize = imageSize || "1024x1024";
    const finalSize = validSizes.includes(userSize) ? userSize : "1024x1024";
    
    console.log(`Using image path: ${imagePath} with size: ${finalSize}`);
    const result = await gptImageTransform(imagePath, prompt, finalSize);
    
    console.log(`Successfully transformed image to: ${result.transformedPath}`);
    
    // Return both the primary and secondary transformed images
    return {
      url: result.url,
      transformedPath: result.transformedPath,
      secondTransformedPath: result.secondTransformedPath // gpt-image-1 generates two images
    };
  } catch (error: any) {
    console.error("Error in transformImage:", error);
    throw new Error(`Error transforming image: ${error.message}`);
  }
}

/**
 * Creates an image variation using the gpt-image-1 model with the /edit endpoint
 * This function ensures we only use the edit endpoint as requested
 */
export async function createImageVariation(imagePath: string): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Create a variation prompt - this will be passed to our GPT-Image-01 implementation
    const variationPrompt = "Create a creative variation of this image with a different style and colors while keeping the main subject recognizable";

    console.log("Starting image variation process using GPT-Image-01 model...");

    // Import the direct GPT-Image-01 implementation with multipart/form-data
    // This implementation uses only the /v1/images/edits endpoint as required
    const { transformImage: gptImageTransform } = await import('./openai-direct.js');
    
    // Use the square format for variations
    const finalSize = "1024x1024";
    
    console.log(`Using image path: ${imagePath} with size: ${finalSize}`);
    
    // Use our GPT-Image-01 implementation for the variation
    const result = await gptImageTransform(imagePath, variationPrompt, finalSize);
    
    console.log(`Successfully created variation at: ${result.transformedPath}`);
    
    // For consistency with the original function, we'll return just the basic structure
    return {
      url: result.url,
      transformedPath: result.transformedPath
    };
  } catch (error: any) {
    console.error("Error creating image variation:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error creating image variation: ${errorMessage}`);
  }
}