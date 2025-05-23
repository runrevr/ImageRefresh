import OpenAI from "openai";
import path from "path";
import fs from "fs";

// Create OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the base upload directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Ensures the upload directory exists
 */
function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Transforms an image based on the provided prompt using OpenAI's API
 * 
 * @param originalImagePath Path to the original image
 * @param prompt User's transformation prompt
 * @param userId User ID (for organizing uploads)
 * @returns Path to the transformed image
 */
export async function transformImage(
  originalImagePath: string,
  prompt: string,
  userId?: string
): Promise<{ 
  transformedImagePath: string;
  transformation: any; 
}> {
  try {
    // Ensure upload directory exists
    ensureUploadDirExists();

    console.log(`[OpenAI Service] Transforming image: ${originalImagePath}`);
    console.log(`[OpenAI Service] Edit prompt: ${prompt}`);

    // Verify original image exists
    if (!fs.existsSync(originalImagePath)) {
      throw new Error(`Original image not found: ${originalImagePath}`);
    }

    // Use form data for the edit endpoint (required for GPT-image-01)
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('model', 'gpt-image-01');
    form.append('prompt', prompt);
    form.append('size', '1024x1024');
    form.append('n', '1');
    form.append('image', fs.createReadStream(originalImagePath));

    // Make direct API call to OpenAI edit endpoint
    const axios = require('axios');
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // Process the API response
    console.log(`[OpenAI Service] API response received`);
    
    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error("No image data returned from OpenAI edit endpoint");
    }

    // Get the URL of the first transformed image
    const transformedImageUrl = response.data.data[0]?.url;
    
    if (!transformedImageUrl) {
      throw new Error("No transformed image URL returned from OpenAI");
    }

    // Download the transformed image
    const imageResponse = await fetch(transformedImageUrl);
    const transformedImageBuffer = await imageResponse.arrayBuffer();

    // Generate a unique filename for the transformed image
    const timestamp = Date.now();
    const userFolder = userId ? userId : "anonymous";
    const userDir = path.join(UPLOAD_DIR, userFolder);
    
    // Ensure user directory exists
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Save transformed image
    const transformedImageFilename = `transformed_${timestamp}.png`;
    const transformedImagePath = path.join(userDir, transformedImageFilename);
    
    fs.writeFileSync(
      transformedImagePath,
      Buffer.from(transformedImageBuffer)
    );

    console.log(`Transformed image saved to: ${transformedImagePath}`);

    // Return the transformation details
    return {
      transformedImagePath,
      transformation: {
        originalImagePath,
        prompt,
        timestamp,
        userId: userId || "anonymous",
      },
    };
  } catch (error: any) {
    console.error("Error in transformImage:", error);
    throw new Error(`Image transformation failed: ${error.message}`);
  }
}

/**
 * Tests the OpenAI connection by generating a simple image
 */
export async function testOpenAIConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Use a simple create call to test the API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: "user", content: "Hello world" }],
      max_tokens: 5
    });

    return {
      success: true,
      message: "Successfully connected to OpenAI API",
    };
  } catch (error: any) {
    console.error("OpenAI connection test failed:", error);
    return {
      success: false,
      message: `Failed to connect to OpenAI API: ${error.message}`,
    };
  }
}