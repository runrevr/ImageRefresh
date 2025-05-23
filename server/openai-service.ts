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

    console.log(`Transforming image: ${originalImagePath}`);
    console.log(`Prompt: ${prompt}`);

    // Verify original image exists
    if (!fs.existsSync(originalImagePath)) {
      throw new Error(`Original image not found: ${originalImagePath}`);
    }

    // Read image as base64
    const imageBuffer = fs.readFileSync(originalImagePath);
    const base64Image = imageBuffer.toString("base64");

    // Call OpenAI API for image editing using GPT-image-01
    // Note: Using the GPT-image-01 model for image editing/enhancement
    const response = await openai.images.edit({
      model: "gpt-image-01",
      image: fs.createReadStream(originalImagePath),
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // Get the URL of the first transformed image
    const transformedImageUrl = response.data && response.data[0]?.url;
    
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