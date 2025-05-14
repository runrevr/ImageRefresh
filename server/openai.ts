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
  prompt: string
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);

    const transformedFileName = `transformed-${Date.now()}-${path.basename(imagePath)}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    const response = await openai.images.edit({
      image: fs.createReadStream(imagePath),
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    });

    if (response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url;
      await saveImageFromUrl(imageUrl, transformedPath);

      return {
        url: imageUrl,
        transformedPath
      };
    } else {
      throw new Error("No image data returned from OpenAI");
    }
  } catch (error: any) {
    console.error("Error transforming image:", error);
    throw new Error(`Error transforming image: ${error.message}`);
  }
}

/**
 * Creates an image variation using the same two-stage process as transformImage
 * 1. Analyze the image with GPT-4o Vision
 * 2. Create a variation with gpt-image-1 based on the analysis
 */
export async function createImageVariation(imagePath: string): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    // Create a prompt for the image variation
    const variationPrompt = "Create a creative variation of this image with a different style and colors";

    try {
      console.log("Starting two-stage variation process...");

      // Read the image file
      const variationImageBuffer = fs.readFileSync(imagePath);
      const base64Image = variationImageBuffer.toString('base64');

      // Stage 1: Analyze the image with GPT-4o Vision
      console.log("Stage 1: Analyzing image with GPT-4o vision capabilities for variation...");

      // Determine the correct MIME type for the image
      const fileExtension = path.extname(imagePath).toLowerCase();
      const mimeType = fileExtension === '.png' ? 'image/png' : 
                       (fileExtension === '.jpg' || fileExtension === '.jpeg') ? 'image/jpeg' : 'application/octet-stream';

      // Use the GPT-4o model with vision capabilities to analyze the image
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are an expert image analyzer. Provide a detailed description of the image focusing on key elements, colors, shapes, composition and style."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in detail, focusing on elements that a creative reinterpretation should maintain."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 800
      });

      // Extract the detailed description, with a fallback if it's null/undefined
      const content = visionResponse.choices[0].message.content;
      const detailedDescription = content ? content : "A detailed product image";
      console.log("Image analysis complete for variation. Description length:", detailedDescription.length);

      // Stage 2: Generate a variation with gpt-image-1
      console.log("Stage 2: Generating image variation with gpt-image-1...");

      // Create an enhanced prompt with special emphasis on preserving the object's identity
      // Add safety guardrails to avoid content policy violations
      const safetyGuards = "Create a family-friendly, G-rated image appropriate for all ages. Avoid any content that could be interpreted as violent, sexual, political, or offensive in any way. Ensure the output maintains a positive and appropriate tone.";

      const enhancedVariationPrompt = `Create an artistic variation of this exact product: "${detailedDescription}". 
The product must be the main focus and clearly recognizable as the same item. 
${variationPrompt}. 
Keep the product's shape and key details intact but you may alter the style, artistic treatment, lighting, and background.
${safetyGuards}`;

      console.log("Using enhanced prompt that emphasizes maintaining the original subject's identity");

      // Use gpt-image-1 for image variation
      console.log("Using gpt-image-1 for image variation generation");

      // Modified to remove unsupported 'style' parameter for gpt-image-1 model
      // Instead we'll incorporate style instructions in the prompt
      const finalVariationPrompt = `${enhancedVariationPrompt} Render in a natural, photorealistic style with fine details.`;
      
      const imageResult = await openai.images.generate({
        model: "gpt-image-1", // Use gpt-image-1 as requested
        prompt: finalVariationPrompt,
        n: 1,
        size: "1024x1024",
        quality: "high", // Changed to high
        moderation: "low" // Added moderation parameter
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
      
      // Add more detailed error logging
      console.error("OpenAI Variation Error Details:");
      console.error("Error type:", typeof err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error status:", err.status);
      console.error("Error stack:", err.stack);
      
      if (err.response) {
        console.error("API Response error data:", JSON.stringify(err.response.data || {}, null, 2));
        console.error("API Response error status:", err.response.status);
        console.error("API Response error headers:", JSON.stringify(err.response.headers || {}, null, 2));
      }

      // Check for specific errors related to gpt-image-1 access
      if (err.message && err.message.includes("organization verification")) {
        throw new Error("Your OpenAI account needs organization verification to use gpt-image-1. Error: " + err.message);
      } else if (err.code === "unknown_parameter" && err.param === "response_format") {
        throw new Error("The gpt-image-1 model does not support the response_format parameter for variations as initially expected. Please try with a different parameter configuration.");
      } else if (err.message && err.message.toLowerCase().includes("rate limit")) {
        throw new Error("OpenAI rate limit exceeded. Please try again in a few minutes.");
      } else if (err.message && err.message.toLowerCase().includes("billing")) {
        throw new Error("OpenAI billing issue: " + err.message);
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