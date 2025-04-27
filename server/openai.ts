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
 * Two-stage process for image transformation:
 * 1. First analyze the image with GPT-4o to get a detailed description
 * 2. Then create a new image with gpt-image-1 based on both the prompt and the description
 */
export async function transformImage(
  imagePath: string, 
  prompt: string,
  imageSize?: string | undefined,
  isEdit: boolean = false
): Promise<{ url: string; transformedPath: string }> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI API key is not configured");
  }

  try {
    console.log(`Processing image transformation with prompt: ${prompt}`);
    console.log(`Is this an edit request: ${isEdit}`);
    
    try {
      // Verify the image exists
      if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file does not exist at path: ${imagePath}`);
      }
      
      // Read the image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Determine the correct MIME type for the image
      const fileExtension = path.extname(imagePath).toLowerCase();
      const mimeType = fileExtension === '.png' ? 'image/png' : 
                      (fileExtension === '.jpg' || fileExtension === '.jpeg') ? 'image/jpeg' : 'application/octet-stream';
      
      // First use GPT-4o Vision to analyze the image and get a detailed description
      console.log("Stage 1: Analyzing image with GPT-4o vision capabilities...");
      
      // Use the GPT-4o model with vision capabilities to analyze the image
      const visionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: "You are an expert image analyzer. Provide a detailed description of the image that includes all visible elements, colors, shapes, textures, and other distinctive features. Your description should be comprehensive enough that it could be used to recreate the image."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe this image in extreme detail, focusing on all visual elements that make it unique."
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
        max_tokens: 1000
      });
      
      // Extract the detailed description from GPT-4o, with a fallback if it's null/undefined
      const content = visionResponse.choices[0].message.content;
      const detailedDescription = content ? content : "A detailed product image";
      console.log("Image analysis complete. Description length:", detailedDescription.length);
      
      // Now use gpt-image-1 to generate a new image based on the prompt and the detailed description
      console.log("Stage 2: Generating transformed image with gpt-image-1...");
      
      // Create a comprehensive prompt that incorporates both the user's request and the image details
      // The key is to emphasize preserving the original image's subject while applying the transformation
      // Also add safety guardrails to avoid content policy violations
      const safetyGuards = "Create a family-friendly, G-rated image appropriate for all ages. Avoid any content that could be interpreted as violent, sexual, political, or offensive in any way. Ensure the output maintains a positive and appropriate tone.";
      
      let enhancedPrompt;
      if (isEdit) {
        // For edits, focus more on applying the specific changes requested
        enhancedPrompt = `Apply the following edit to this image: "${prompt}". Preserve all key elements from the image. ${safetyGuards}`;
      } else {
        // For initial transformations, keep the subject but transform the context/background
        enhancedPrompt = `This is a photo editing task. Create an exact recreation of this product: "${detailedDescription}". The product must remain the primary focus and should look identical to the original. ${prompt}. Do not alter the product's appearance, only change its environment or background. ${safetyGuards}`;
      }
      
      console.log("Using enhanced prompt that emphasizes preserving the original subject");
      
      // Use the provided image size or default to 1024x1024
      console.log(`Using image size: ${imageSize || "1024x1024"}`);
      
      // Determine the size parameter based on input
      const sizeParam = imageSize === "1024x1536" ? "1024x1536" :
                        imageSize === "1536x1024" ? "1536x1024" :
                        "1024x1024";
      
      // Generate unique name for the transformed image
      const originalFileName = path.basename(imagePath);
      const transformedFileName = `transformed-${Date.now()}-${originalFileName}`;
      const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
      
      let imageUrl;
      
      // For edits, we use the images/edits endpoint
      // Use the images/edits endpoint with form-data
      const formData = new FormData();
      
      // Append the image file directly from the buffer
      formData.append('image', imageBuffer, {
        filename: path.basename(imagePath),
        contentType: mimeType,
      });
      formData.append('prompt', enhancedPrompt);
      formData.append('n', '1');
      formData.append('size', sizeParam);
      formData.append('model', 'gpt-image-1');
      
      // Call the images/edits endpoint directly
      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData as any, // Cast to any to avoid TypeScript errors
      });
      
      if (!response.ok) {
        const errorData = await response.json() as any;
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const imageResult = await response.json() as {
        data?: Array<{
          url?: string;
          b64_json?: string;
        }>
      };
      
      console.log("Successfully generated image with gpt-image-1 model");
      
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
      
      // We'll stick with the images/generate endpoint since the edit endpoint is complex
      // Note: We tried using the moderate parameter but it's not supported by the API
      const imageResult = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedVariationPrompt,
        n: 1,
        size: "1024x1024" as any
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
