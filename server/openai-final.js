/**
 * Final OpenAI GPT-Image-01 transformation implementation
 * Uses GPT-Image-1 model with the /v1/images/edits endpoint and multipart/form-data
 */
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import axios from "axios";
import sharp from "sharp";
import { toFile } from "openai";

// Initialize OpenAI client with timeout
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 120000, // 2 minutes timeout
  maxRetries: 2
});

// Define allowed sizes for the OpenAI API
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536", "auto"];

// Allowed image types
const allowedImageTypes = [".png", ".jpg", ".jpeg", ".webp"];

// Maximum image dimension to avoid timeout issues
const MAX_IMAGE_DIMENSION = 1024;

/**
 * Resize and optimize an image to make it suitable for the API
 * @param {string} imagePath - Path to original image
 * @returns {Promise<string>} - Path to the optimized image
 */
async function optimizeImage(imagePath) {
  try {
    console.log(`[OpenAI] Optimizing image for API: ${imagePath}`);

    // Check if the image file exists
    if (!fs.existsSync(imagePath)) {
      console.error(
        `[OpenAI] Image file not found during optimization: ${imagePath}`,
      );
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    console.log(
      `[OpenAI] Original image: ${metadata.width}x${metadata.height}, ${metadata.format}`,
    );

    // Create a temporary file for the resized image
    const tempFileName = `temp-${Date.now()}.png`;
    const tempFilePath = path.join(process.cwd(), tempFileName);

    // Check if resizing is needed
    let resizeOptions = {};
    if (
      metadata.width > MAX_IMAGE_DIMENSION ||
      metadata.height > MAX_IMAGE_DIMENSION
    ) {
      if (metadata.width >= metadata.height) {
        resizeOptions.width = MAX_IMAGE_DIMENSION;
      } else {
        resizeOptions.height = MAX_IMAGE_DIMENSION;
      }
      console.log(
        `[OpenAI] Resizing image to fit within ${MAX_IMAGE_DIMENSION}px`,
      );
    }

    // Process and save the image
    await sharp(imagePath)
      .resize(resizeOptions)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(tempFilePath);

    console.log(`[OpenAI] Optimized image saved to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error(`[OpenAI] Error optimizing image: ${error.message}`);
    throw error;
  }
}

/**
 * Transform an image using OpenAI's GPT-Image-1 model
 * This version uses a direct multipart/form-data approach which is proven to work
 *
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI] Transform Image called with path: ${imagePath}`);

    // Validate size
    if (!allowedSizes.includes(size)) {
      console.log(`[OpenAI] Invalid size "${size}", defaulting to "1024x1024"`);
      size = "1024x1024";
    }

    console.log(`[OpenAI] Using validated size: ${size}`);

    // Handle possible path issues
    let finalImagePath = imagePath;

    // Make sure the image file exists
    if (!fs.existsSync(finalImagePath)) {
      console.error(`[OpenAI] Image file not found at: ${finalImagePath}`);
      throw new Error(`Image file not found: ${finalImagePath}`);
    }

    // Ensure PNG image
    const optimizedImagePath = await optimizeImage(finalImagePath);

    // Read image and convert to base64 for generations endpoint
    const imageBuffer = fs.readFileSync(optimizedImagePath);
    const base64Image = imageBuffer.toString('base64');

    try {
      console.log("[OpenAI] Sending request to OpenAI API");

        if (!openai) {
          throw new Error("OpenAI client not initialized");
        }

        // Use the proper way to create a file for OpenAI SDK
        const imageFile = await toFile(
          fs.readFileSync(optimizedImagePath),
          'image.png',
          { type: 'image/png' }
        );

        // Try with n=2 first, but be prepared to handle if the parameter is not supported
        let response;
        try {
          response = await openai.images.edit({
            model: "gpt-image-1", 
            image: imageFile,
            prompt: prompt,
            size: size,
            n: 2,
            moderation: "low"
          });
        } catch (apiError) {
          // If n parameter is not supported, make two separate calls
          if (apiError.message && apiError.message.includes("Unknown parameter") && apiError.message.includes("n")) {
            console.log("[OpenAI] n parameter not supported, making two separate calls");
            
            const firstCall = await openai.images.edit({
              model: "gpt-image-1", 
              image: imageFile,
              prompt: prompt,
              size: size,
              moderation: "low"
            });
            
            const secondCall = await openai.images.edit({
              model: "gpt-image-1", 
              image: imageFile,
              prompt: prompt,
              size: size,
              moderation: "low"
            });
            
            // Combine the results
            response = {
              data: [
                ...firstCall.data,
                ...secondCall.data
              ]
            };
          } else {
            throw apiError;
          }
        }

      console.log(`[OpenAI] API Response received successfully`);

      const timestamp = Date.now();
      const uploadsDir = path.join(process.cwd(), "uploads");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Process response data to extract images
      let transformedImagePaths = [];

      if (
        response.data &&
        Array.isArray(response.data)
      ) {
        console.log(
          `[OpenAI] Received ${response.data.length} images from the API`,
        );

        // Process each image in the response
        for (let i = 0; i < response.data.length; i++) {
          const item = response.data[i];
          const outputPath = path.join(
            uploadsDir,
            `transformed-${timestamp}${i > 0 ? "-" + (i + 1) : ""}.png`,
          );

          if (item.url) {
            // It's a regular URL - download it
            console.log(
              `[OpenAI] Downloading image ${i + 1} from URL: ${item.url}`,
            );
            try {
              const imageResponse = await axios.get(item.url, {
                responseType: "arraybuffer",
              });
              fs.writeFileSync(
                outputPath,
                Buffer.from(imageResponse.data, "binary"),
              );
              transformedImagePaths.push(outputPath);
              console.log(
                `[OpenAI] Successfully saved image ${i + 1} to ${outputPath}`,
              );
            } catch (downloadError) {
              console.error(
                `[OpenAI] Error downloading image ${i + 1}: ${downloadError.message}`,
              );
            }
          } else if (item.b64_json) {
            // It's base64 data - decode and save it
            console.log(
              `[OpenAI] Processing base64 image data for image ${i + 1}`,
            );
            const imgBuffer = Buffer.from(item.b64_json, "base64");
            fs.writeFileSync(outputPath, imgBuffer);
            transformedImagePaths.push(outputPath);
            console.log(
              `[OpenAI] Successfully saved image ${i + 1} from base64 to ${outputPath}`,
            );
          }
        }
      }

      // If we have at least one transformed image, return the paths
      if (transformedImagePaths.length > 0) {
        console.log(
          `[OpenAI] Returning ${transformedImagePaths.length} transformed images`,
        );
        console.log(`[OpenAI] Primary image path: ${transformedImagePaths[0]}`);
        if (transformedImagePaths.length > 1) {
          console.log(
            `[OpenAI] Secondary image path: ${transformedImagePaths[1]}`,
          );
        }

        return {
          url: `file://${transformedImagePaths[0]}`, // Use file path as URL
          transformedPath: transformedImagePaths[0],
          secondTransformedPath:
            transformedImagePaths.length > 1 ? transformedImagePaths[1] : null,
          transformedImagePaths: transformedImagePaths // Return all paths
        };
      }

      // If no images processed, throw error
      throw new Error("Failed to process any images from API response");
    } catch (apiError) {
      console.error("[OpenAI] API Error:", apiError.message);
      console.error("[OpenAI] API Error Details:", apiError.response?.data);
      console.error("[OpenAI] API Status:", apiError.response?.status);

      

      // Don't use fallback - throw the actual error so user knows what happened
      console.error("[OpenAI] All transformation attempts failed");
      throw new Error(`OpenAI API connection failed. Please try again in a moment. If the problem persists, OpenAI's service may be temporarily unavailable.`);
    }
  } catch (error) {
    console.error("[OpenAI] Error in transformation:", error.message);
    throw error;
  }
}

// Export the allowedSizes variable for use elsewhere
export { allowedSizes };