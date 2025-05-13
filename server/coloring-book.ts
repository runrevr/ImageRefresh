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
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Checks if OpenAI API key is configured
 */
function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
}

/**
 * Saves an image from a URL to the local filesystem
 */
async function saveImageFromUrl(imageUrl: string, destinationPath: string): Promise<void> {
  // Ensure the uploads directory exists
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Download and save the image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Error downloading image: ${response.statusText}`);
  }

  const fileStream = createWriteStream(destinationPath);
  if (response.body instanceof Readable) {
    await pipeline(response.body, fileStream);
  } else {
    throw new Error("Response body is not a readable stream");
  }
}

/**
 * Creates a coloring book style version of an image
 * @param imagePath Path to the image to transform
 * @returns Path to the transformed image
 */
export async function createColoringBookImage(imagePath: string): Promise<{ outputPath: string }> {
  try {
    console.log(`Creating coloring book version of image: ${imagePath}`);
    
    if (!isOpenAIConfigured()) {
      throw new Error("OpenAI API key is not configured");
    }
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    
    // Generate a unique filename for the output
    const outputFilename = `coloring-book-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
    const outputDir = path.join(process.cwd(), "uploads");
    const outputPath = path.join(outputDir, outputFilename);
    
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Coloring book prompt
    const coloringBookPrompt = "Turn this into a black and white coloring book page. Use only thick black outlines on a white background. Remove all colors and details. Create simple line art with bold borders between sections. No shading, no gradients, no gray areas. Make it look like a children's coloring book with clear, easy-to-color sections.";
    
    // Use DALL-E to create coloring book version
    console.log("Generating coloring book image with DALL-E");
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${coloringBookPrompt} The image shows: ${base64Image.substring(0, 100)}...`,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });
    
    if (!imageResponse?.data?.[0]?.url) {
      throw new Error("Failed to generate coloring book image");
    }
    
    // Save the image
    const imageUrl = imageResponse.data[0].url;
    await saveImageFromUrl(imageUrl, outputPath);
    
    console.log(`Coloring book image saved to: ${outputPath}`);
    
    return { outputPath };
  } catch (error) {
    console.error("Error in createColoringBookImage:", error);
    throw error;
  }
}