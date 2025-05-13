import fs from "fs";
import path from "path";
import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { Readable } from "stream";
import { promisify } from "util";
import stream from "stream";
import axios from "axios";

const pipeline = promisify(stream.pipeline);

// N8N webhook URL
const WEBHOOK_URL = "https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9";

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
    
    // Use GPT-4o Vision to create coloring book version
    console.log("Generating coloring book image with GPT-4o Vision");
    
    // First, analyze the image with Vision API
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: coloringBookPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });
    
    // Then use DALL-E to generate the coloring book image based on the analysis
    console.log("Generating coloring book image with DALL-E");
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${coloringBookPrompt} ${visionResponse.choices[0].message.content}`,
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
    
    // Check for specific OpenAI error types
    if (error.response?.status === 401) {
      console.error("OpenAI authentication error - check API key");
      throw new Error("OpenAI authentication failed. Check your API key.");
    }
    
    if (error.response?.status === 429) {
      console.error("OpenAI rate limit exceeded");
      throw new Error("OpenAI rate limit exceeded. Please try again later.");
    }
    
    if (error.response?.data?.error) {
      console.error("OpenAI error response:", error.response.data.error);
      throw new Error(`OpenAI error: ${error.response.data.error.message || 'Unknown error'}`);
    }
    
    // For image reading or file system errors
    if (error.code === 'ENOENT') {
      console.error("File not found:", error.path);
      throw new Error(`File not found: ${error.path}`);
    }
    
    throw error;
  }
}