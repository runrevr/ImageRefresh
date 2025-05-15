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
  imageSize = "square", // default to square
  isEdit = false        // flag to indicate if this is an edit
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    console.log(`Image size: ${imageSize}, Is Edit: ${isEdit}`);

    // Import mime-types package
    const mime = require('mime-types');
    
    // Get the file extension and determine the correct MIME type
    const fileExtension = path.extname(imagePath).toLowerCase();
    // Use mime-types package to get correct MIME type
    let mimeType = mime.lookup(imagePath);
    
    // Fallback if mime-types doesn't identify the file
    if (!mimeType || mimeType === 'application/octet-stream') {
      // Manual assignment based on extension
      mimeType = fileExtension === '.png' ? 'image/png' : 
                (fileExtension === '.jpg' || fileExtension === '.jpeg') ? 'image/jpeg' : 
                fileExtension === '.webp' ? 'image/webp' : 'image/png'; // Default to PNG
    }
    
    // Validate mime type is supported by OpenAI
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      throw new Error(`Unsupported image format: ${mimeType}. Only JPEG, PNG, and WebP are supported.`);
    }
    
    console.log(`Image MIME type: ${mimeType}`);
    
    const transformedFileName = `transformed-${Date.now()}-${path.basename(imagePath)}`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);

    // OpenAI edit API only supports 1024x1024 size
    const sizeParam = "1024x1024";
    
    // Read the file as a buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Create temporary file with proper extension to ensure correct MIME type
    const fileExt = mimeType === 'image/png' ? '.png' : 
                   mimeType === 'image/jpeg' ? '.jpg' : 
                   mimeType === 'image/webp' ? '.webp' : '.png';
                   
    const tempFilePath = path.join(
      process.cwd(), 
      "uploads", 
      `temp-${Date.now()}${fileExt}`
    );
    
    // Log details for debugging
    console.log(`Creating temporary file with correct extension: ${tempFilePath}`);
    console.log(`Original image path: ${imagePath}`);
    console.log(`Detected MIME type: ${mimeType}`);
    
    // Write the image buffer to a temporary file with the proper extension
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    try {
      // Log the image details before sending to OpenAI
      console.log(`Sending image to OpenAI with explicit MIME type: ${mimeType}`);
      console.log(`Image size parameter: ${sizeParam}`);
      
      // Create a readable stream from the temporary file with known extension
      const properImageStream = fs.createReadStream(tempFilePath);
      
      // Manual FormData approach with axios
      const axios = require('axios');
      const FormData = require('form-data');
      
      const formData = new FormData();
      formData.append('image', properImageStream, {
        filename: path.basename(tempFilePath),
        contentType: mimeType
      });
      formData.append('prompt', prompt);
      formData.append('n', '1');
      formData.append('size', sizeParam);
      formData.append('model', 'dall-e-2');
      
      console.log('Sending request to OpenAI with FormData and explicit content type');
      
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/images/edits',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            ...formData.getHeaders()
          }
        }
      );
      
      console.log('Response received from OpenAI API');
      
      // Format the response to match what our application expects
      const response = {
        data: openaiResponse.data.data
      };
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      
      if (response.data && response.data.length > 0 && response.data[0].url) {
        const imageUrl = response.data[0].url;
        await saveImageFromUrl(imageUrl, transformedPath);
      } else {
        throw new Error("No valid URL found in OpenAI response");
      }
    } catch (error) {
      console.error("Error during OpenAI image transformation:", error);
      throw error;
    }
    
    if (response && response.data && response.data.length > 0 && response.data[0].url) {

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