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
    
    // Only use gpt-image-1 model with no fallback - using the example code provided
    try {
      console.log("Attempting to use gpt-image-1 model with b64_json format...");
      
      // Try without the response_format parameter as the API is rejecting it
      const imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: gpt4oDescription || enhancedPrompt,
        n: 1,
        size: "1024x1024"
      });
      
      console.log("Successfully generated image with gpt-image-1 model");
      console.log("Response format:", JSON.stringify(imageResult, null, 2));
      
      // Generate unique name for the transformed image
      const originalFileName = path.basename(imagePath);
      const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      let imageUrl;
      
      // Check what format we received - it could be URL or b64_json
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
        throw new Error("No image data returned. The gpt-image-1 model is not available for your account.");
      }
  
      return {
        url: imageUrl,
        transformedPath,
      };
    } catch (err: any) {
      console.error("Error with gpt-image-1 model:", err);
      
      // Check for specific errors related to gpt-image-1 access
      if (err.message && err.message.includes("organization verification")) {
        throw new Error("Your OpenAI account needs organization verification to use gpt-image-1. Error: " + err.message);
      } else if (err.code === "unknown_parameter" && err.param === "response_format") {
        throw new Error("The gpt-image-1 model does not support the response_format parameter as initially expected. Please try with a different parameter configuration.");
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
      
      // Try without the response_format parameter as the API is rejecting it
      const imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: variationPrompt,
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
