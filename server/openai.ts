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
    
    // Since GPT-4o doesn't generate images directly, we'll use DALL-E 3 with the enhanced description from GPT-4o
    const gpt4oDescription = response.choices[0].message.content;
    
    console.log("GPT-4o enhanced description:", gpt4oDescription);
    
    // Now use DALL-E 3 with the enhanced description
    const imageGenResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: gpt4oDescription || enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
    });
    
    const data = imageGenResponse.data || [];
    if (!data.length || !data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }
    
    const imageUrl = data[0].url;

    // Generate unique name for the transformed image
    const originalFileName = path.basename(imagePath);
    const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // Download the image
    const imageDownloadResponse = await fetch(imageUrl);
    if (!imageDownloadResponse.ok) {
      throw new Error(`Failed to download image: ${imageDownloadResponse.statusText}`);
    }

    // Ensure the directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the image
    await pipeline(
      imageDownloadResponse.body,
      createWriteStream(transformedPath)
    );

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
  } catch (error: any) {
    console.error("Error creating image variation:", error);
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(`Error creating image variation: ${errorMessage}`);
  }
}
