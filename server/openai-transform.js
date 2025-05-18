/**
 * OpenAI image transformation implementation using the SDK
 * Only using GPT-Image-01 model with the edit endpoint
 */
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import axios from "axios";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * This function uses the official SDK which handles all formatting correctly
 *
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    console.log("Image path exists:", fs.existsSync(imagePath), imagePath);

    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);

    const imageStream = fs.createReadStream(imagePath);

    console.log("[OpenAI] Sending API request with SDK...");
    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageStream,
      prompt: prompt,
      n: 2,
      size: finalSize,
    });

    console.log(
      "[OpenAI] Full API response:",
      JSON.stringify(response, null, 2),
    );

    console.log(
      "[OpenAI] Received response from API:",
      JSON.stringify(response, null, 2),
    );

    // Add response checks
    if (!response || !response.data || !response.data.length) {
      console.error("[OpenAI] No images returned from API:", response);
      throw new Error("No image URLs returned from OpenAI API");
    }

    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(
      process.cwd(),
      "uploads",
      transformedFileName,
    );
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl}`);

    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    fs.writeFileSync(transformedPath, Buffer.from(imageResponse.data));
    console.log(`[OpenAI] First image saved to: ${transformedPath}`);

    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      console.log(`[OpenAI] Second image URL: ${secondImageUrl}`);

      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(
        process.cwd(),
        "uploads",
        secondFileName,
      );

      const secondResponse = await axios.get(secondImageUrl, {
        responseType: "arraybuffer",
      });
      fs.writeFileSync(secondTransformedPath, Buffer.from(secondResponse.data));
      console.log(`[OpenAI] Second image saved to: ${secondTransformedPath}`);
    }

    return {
      url: imageUrl,
      transformedPath,
      secondTransformedPath,
    };
  } catch (error) {
    if (error.response && error.response.data) {
      console.error("[OpenAI] API Error:", error.response.data);
    }
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };
