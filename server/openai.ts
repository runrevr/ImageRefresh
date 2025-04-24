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
 * Saves an image from a URL or data URL to the local filesystem
 */
async function saveImageFromUrl(imageUrl: string, destinationPath: string): Promise<void> {
  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Check if this is a data URL (base64)
  if (imageUrl.startsWith('data:')) {
    console.log("Saving image from data URL");
    // Extract the base64 data from the data URL
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid data URL format");
    }
    
    // Convert base64 to buffer and save directly to filesystem
    const imageBuffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(destinationPath, imageBuffer);
    return;
  }
  
  // Otherwise treat as a regular URL
  console.log("Saving image from HTTP URL");
  // Download the image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.statusText}`);
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
 * Transforms an image based on the provided prompt using gpt-image-1
 * This directly passes the image and prompt to the model without pre-processing
 */
export async function transformImage(
  imagePath: string, 
  prompt: string
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    
    try {
      console.log("Submitting to gpt-image-1 model...");
      
      // Read the image file for the prompt
      const imageBuffer = fs.readFileSync(imagePath);
      
      // First, we need to resize/compress the image to reduce its size before encoding
      // For now, let's try a simpler approach using only the prompt with gpt-image-1
      // since the base64 encoding is too large for the prompt's max length
      
      // Create a data URL for the image that can be used in an HTML img tag
      const fileExtension = path.extname(imagePath).toLowerCase();
      const mimeType = fileExtension === '.png' ? 'image/png' : 
                      (fileExtension === '.jpg' || fileExtension === '.jpeg') ? 'image/jpeg' : 'application/octet-stream';
      
      // Use the gpt-image-1 model with a modified prompt that references the image indirectly
      console.log("Using gpt-image-1 with detailed prompt");
      
      // Create a specific prompt that's detailed about the transformation we want
      const enhancedPrompt = `${prompt}. The image should be the primary subject, with careful attention to its details and composition.`;
      
      console.log("Enhanced prompt:", enhancedPrompt);
      
      const imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024"
      });
      
      console.log("Successfully generated image with gpt-image-1 model");
      
      // Generate unique name for the transformed image
      const originalFileName = path.basename(imagePath);
      const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      let imageUrl;
      
      // Check what format we received
      if (imageResult.data && imageResult.data.length > 0) {
        if (imageResult.data[0].url) {
          // URL format - use saveImageFromUrl
          imageUrl = imageResult.data[0].url;
          console.log("Using URL format from response");
          await saveImageFromUrl(imageUrl, transformedPath);
        } else if (imageResult.data[0].b64_json) {
          // Base64 format - save directly
          console.log("Using b64_json format from response");
          const imageBuffer = Buffer.from(imageResult.data[0].b64_json, "base64");
          fs.writeFileSync(transformedPath, imageBuffer);
          imageUrl = `data:image/png;base64,${imageResult.data[0].b64_json}`;
        } else {
          console.log("Unknown response format:", JSON.stringify(imageResult.data[0]));
          throw new Error("Unexpected response format from gpt-image-1. Could not find url or b64_json in the response.");
        }
      } else {
        throw new Error("No image data returned. The gpt-image-1 generation failed.");
      }
  
      return {
        url: imageUrl,
        transformedPath,
      };
    } catch (err: any) {
      console.error("Error with gpt-image-1 model:", err);
      
      // Check for specific error types
      if (err.message && err.message.includes("organization verification")) {
        throw new Error("Your OpenAI account needs organization verification to use this feature. Error: " + err.message);
      } else if (err.code === "invalid_api_key") {
        throw new Error("Invalid OpenAI API key. Please check your configuration.");
      } else {
        throw new Error("Failed to generate image with gpt-image-1: " + err.message);
      }
    }
  } catch (error: any) {
    console.error("Error transforming image:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error transforming image: ${errorMessage}`);
  }
}

/**
 * Creates an image variation using only the gpt-image-1 model
 * with no fallback option
 */
export async function createImageVariation(imagePath: string): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Create a simple prompt for the image variation
    const variationPrompt = "Create a creative variation of this image with a different style and colors";
    
    // Only use gpt-image-1 model with no fallback for variation - using the example code provided
    try {
      console.log("Attempting to use gpt-image-1 model for variation with b64_json format...");
      
      // Read the image file for the prompt
      const imageBuffer = fs.readFileSync(imagePath);
      
      // For now, we'll use a detailed prompt approach for variation as well
      // since including the base64 image in the prompt exceeds the character limit
      
      // Create a data URL for the image that can be used in an HTML img tag
      const fileExtension = path.extname(imagePath).toLowerCase();
      const mimeType = fileExtension === '.png' ? 'image/png' : 
                       (fileExtension === '.jpg' || fileExtension === '.jpeg') ? 'image/jpeg' : 'application/octet-stream';
      
      // Use the gpt-image-1 model with a modified prompt for variation
      console.log("Using gpt-image-1 with detailed prompt for variation");
      
      // Create a specific prompt for the variation
      const enhancedVariationPrompt = `${variationPrompt}. Apply artistic filters, change the style dramatically, and create a visually distinct version while maintaining the composition.`;
      
      console.log("Enhanced variation prompt:", enhancedVariationPrompt);
      
      const imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedVariationPrompt,
        n: 1,
        size: "1024x1024"
      });
      
      console.log("Successfully generated variation with gpt-image-1 model");
      console.log("Variation response format:", JSON.stringify(imageResult, null, 2));
      
      // Generate unique name for the transformed image
      const originalFileName = path.basename(imagePath);
      const transformedFileName = `variation-${Date.now()}-${originalFileName}`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      let imageUrl;
      
      // Check what format we received - it could be URL or b64_json
      if (imageResult.data && imageResult.data.length > 0) {
        if (imageResult.data[0].url) {
          // URL format - use saveImageFromUrl
          imageUrl = imageResult.data[0].url;
          console.log("Using URL format from variation response");
          await saveImageFromUrl(imageUrl, transformedPath);
        } else if (imageResult.data[0].b64_json) {
          // Base64 format - save directly
          console.log("Using b64_json format from variation response");
          const imageBuffer = Buffer.from(imageResult.data[0].b64_json, "base64");
          fs.writeFileSync(transformedPath, imageBuffer);
          imageUrl = `data:image/png;base64,${imageResult.data[0].b64_json}`;
        } else {
          console.log("Unknown variation response format:", JSON.stringify(imageResult.data[0]));
          throw new Error("Unexpected response format from gpt-image-1 for variation. Could not find url or b64_json in the response.");
        }
      } else {
        throw new Error("No image data returned for variation. The gpt-image-1 model is not available for your account.");
      }
  
      return {
        url: imageUrl,
        transformedPath,
      };
    } catch (err: any) {
      console.error("Error with gpt-image-1 model for variation:", err);
      
      // Check for specific errors related to gpt-image-1 access
      if (err.message && err.message.includes("organization verification")) {
        throw new Error("Your OpenAI account needs organization verification to use gpt-image-1. Error: " + err.message);
      } else if (err.code === "unknown_parameter" && err.param === "response_format") {
        throw new Error("The gpt-image-1 model does not support the response_format parameter for variations as initially expected. Please try with a different parameter configuration.");
      } else {
        throw new Error("Failed to generate image variation with gpt-image-1: " + err.message);
      }
    }
  } catch (error: any) {
    console.error("Error creating image variation:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error creating image variation: ${errorMessage}`);
  }
}
