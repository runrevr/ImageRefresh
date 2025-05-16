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
    
    // Import only the GPT-Image-01 implementation that uses base64 encoding
    const { transformWithGptImage, allowedSizes } = await import('./openai-base64-direct.js');
    
    // Validate size parameter according to our three allowed sizes
    const validSizes = ["1024x1024", "1536x1024", "1024x1536"];
    const userSize = imageSize || "1024x1024";
    const finalSize = validSizes.includes(userSize) ? userSize : "1024x1024";
    
    console.log(`Using image path: ${imagePath} with size: ${finalSize}`);
    const result = await transformWithGptImage(imagePath, prompt, finalSize);
    
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
    // Create a basic variation prompt
    const variationPrompt = "Create a creative variation of this image with a different style and colors while keeping the main subject recognizable";

    try {
      console.log("Starting image variation process...");

      // Read the image file as base64 using the exact pattern requested
      const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
      console.log(`Image encoded as base64 (${base64Image.length} chars)`);

      // Validate size parameter - use only the three sizes specified
      const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];
      const finalSize = "1024x1024"; // Default to square format for variations
      
      console.log(`Using GPT-Image-01 with /edit endpoint for variation`);
      
      // Use the edit endpoint as requested - no generate endpoint
      // Convert base64 string to buffer for proper API compatibility
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      const imageResult = await openai.images.edit({
        model: "gpt-image-1",
        image: imageBuffer,
        prompt: variationPrompt,
        n: 1,
        size: finalSize,
        moderation: "low"
      });

      console.log("Successfully generated variation with gpt-image-1 model");
      
      // Process the response
      if (!imageResult.data || imageResult.data.length === 0) {
        throw new Error("No image data in OpenAI response");
      }
      
      // Create a filename for the transformed image
      const originalFileName = path.basename(imagePath);
      const transformedFileName = `variation-${Date.now()}-${originalFileName}`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      // Get the URL from the response
      const imageUrl = imageResult.data[0].url;
      if (!imageUrl) {
        throw new Error("No image URL in the OpenAI response");
      }
      
      console.log(`Variation image URL: ${imageUrl}`);
      
      // Download and save the image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      const imageData = await imageResponse.arrayBuffer();
      fs.writeFileSync(transformedPath, Buffer.from(imageData));
      console.log(`Variation image saved to: ${transformedPath}`);
      
      return {
        url: imageUrl,
        transformedPath,
      };
    } catch (err: any) {
      console.error("Error with GPT-Image-01 model for variation:", err);
      
      // Add detailed error information
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        status: err.status
      });
      
      if (err.response) {
        console.error("API Response error details:", {
          status: err.response.status,
          data: err.response.data
        });
      }

      // Check for specific errors related to the API
      if (err.message && err.message.includes("organization verification")) {
        throw new Error("Your OpenAI account needs verification to use this feature. Error: " + err.message);
      } else if (err.message && err.message.toLowerCase().includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.");
      } else if (err.message && err.message.toLowerCase().includes("billing")) {
        throw new Error("Billing issue: " + err.message);
      } else {
        throw new Error("Failed to generate image variation: " + err.message);
      }
    }
  } catch (error: any) {
    console.error("Error creating image variation:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error creating image variation: ${errorMessage}`);
  }
}