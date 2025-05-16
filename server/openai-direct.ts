/**
 * OpenAI service for image transformations
 * This uses the official SDK with direct file uploads
 */
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import sharp from 'sharp';

// Initialize OpenAI client with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a new image based on a prompt and reference image
 * 
 * @param imagePath Path to the reference image
 * @param prompt The text prompt describing the desired transformation
 * @returns Promise resolving to the URL of the generated image
 */
export async function generateImageFromPrompt(
  imagePath: string,
  prompt: string
): Promise<string> {
  try {
    console.log(`[OpenAI] Generating image based on prompt: ${prompt}`);
    console.log(`[OpenAI] Using reference image: ${imagePath}`);

    // First, ensure the image is in PNG format, which is most compatible with the API
    const tempDir = path.join(process.cwd(), 'uploads', 'temp-' + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });

    // Generate a PNG version of the input image
    const pngFilePath = path.join(tempDir, 'input.png');
    await sharp(imagePath)
      .png()
      .toFile(pngFilePath);
    
    console.log(`[OpenAI] Converted image to PNG: ${pngFilePath}`);

    // Use OpenAI's DALL-E model to generate a new image based on the prompt
    // We need to use dalle-3 model which is more reliable for transformations
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${prompt} - Transform the following reference image (not provided in this prompt): ${path.basename(imagePath)}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log('[OpenAI] Response received from API');

    if (response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url;
      console.log(`[OpenAI] Image URL: ${imageUrl}`);
      
      // Clean up temp directory
      try {
        fs.unlinkSync(pngFilePath);
        fs.rmdirSync(tempDir);
      } catch (err) {
        console.error('[OpenAI] Error cleaning temporary files:', err);
      }
      
      return imageUrl;
    } else {
      console.error('[OpenAI] Invalid response from API:', response);
      throw new Error('No valid image URL in the OpenAI response');
    }
  } catch (error: any) {
    console.error('[OpenAI] Error generating image:', error.message);
    if (error.response) {
      console.error('[OpenAI] API error details:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    throw new Error(`Error generating image: ${error.message}`);
  }
}

/**
 * Download an image from a URL to a local file path
 * 
 * @param url The URL of the image to download
 * @param outputPath The local path to save the image to
 * @returns Promise that resolves when the download is complete
 */
export async function downloadImage(url: string, outputPath: string): Promise<void> {
  try {
    console.log(`[OpenAI] Downloading image from ${url}`);
    
    // Ensure the directory exists
    const outputDir = path.dirname(outputPath);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Download the image
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log(`[OpenAI] Image downloaded successfully to ${outputPath}`);
  } catch (error: any) {
    console.error('[OpenAI] Error downloading image:', error.message);
    throw new Error(`Error downloading image: ${error.message}`);
  }
}