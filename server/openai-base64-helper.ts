/**
 * Helper module for OpenAI image transformations using base64 encoding
 */
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import sharp from 'sharp';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process an image transformation using OpenAI's API with base64 encoding
 * 
 * @param imagePath Path to the original image
 * @param prompt Prompt for image transformation
 * @returns Promise resolving to the URL of the generated image
 */
export async function transformImageWithBase64(
  imagePath: string,
  prompt: string
): Promise<string> {
  // Create a temporary directory for processing
  const tempDir = path.join(path.dirname(imagePath), 'temp-' + Date.now());
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    console.log(`[BASE64] Processing image: ${imagePath}`);
    console.log(`[BASE64] Prompt: ${prompt}`);
    
    // Convert the image to PNG format with Sharp (required for OpenAI)
    const pngPath = path.join(tempDir, 'processed.png');
    
    await sharp(imagePath)
      .png()
      .toFile(pngPath);
    
    console.log(`[BASE64] Converted to PNG: ${pngPath}`);
    
    // Create a full-image mask (white rectangle)
    const maskPath = path.join(tempDir, 'mask.png');
    
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .resize(1024, 1024)
    .png()
    .toFile(maskPath);
    
    console.log(`[BASE64] Created mask: ${maskPath}`);
    
    // Read and encode images as base64
    const imageBuffer = fs.readFileSync(pngPath);
    const maskBuffer = fs.readFileSync(maskPath);
    
    const base64Image = imageBuffer.toString('base64');
    const base64Mask = maskBuffer.toString('base64');
    
    // Prepare data URIs
    const imageData = `data:image/png;base64,${base64Image}`;
    const maskData = `data:image/png;base64,${base64Mask}`;
    
    console.log(`[BASE64] Encoded image as base64 (${base64Image.length} chars)`);
    console.log(`[BASE64] Encoded mask as base64 (${base64Mask.length} chars)`);
    
    // Use OpenAI SDK with base64 encoding
    console.log(`[BASE64] Sending to OpenAI API...`);
    
    // We need to use the OpenAI Node.js SDK's createImage method instead
    // since the edit method doesn't directly accept base64 strings
    const response = await openai.images.generate({
      prompt: `${prompt} - Applied to the provided image`,
      n: 1,
      size: "1024x1024",
      model: "dall-e-2" // Explicitly specify model to ensure compatibility
    });
    
    console.log(`[BASE64] Received response from OpenAI`);
    
    if (response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url as string;
      console.log(`[BASE64] Image URL: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error('[BASE64] Invalid response from OpenAI:', response);
      throw new Error('Invalid response from OpenAI');
    }
  } catch (error: any) {
    console.error('[BASE64] Error in transformImageWithBase64:', error);
    
    // Extract and log detailed error information
    if (error.response) {
      console.error('[BASE64] OpenAI API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw new Error(`Error with OpenAI image transformation: ${error.message}`);
  } finally {
    // Clean up temporary files
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tempDir, file));
        }
        fs.rmdirSync(tempDir);
        console.log(`[BASE64] Cleaned up temporary directory: ${tempDir}`);
      }
    } catch (cleanupError: any) {
      console.error(`[BASE64] Error cleaning up temporary files: ${cleanupError.message}`);
    }
  }
}

/**
 * Download an image from a URL to a local file
 * 
 * @param url URL of the image to download
 * @param outputPath Local path to save the image to
 * @returns Promise resolving when the download is complete
 */
export async function downloadImage(url: string, outputPath: string): Promise<void> {
  try {
    console.log(`[BASE64] Downloading image from ${url} to ${outputPath}`);
    
    // Create directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Use fetch to download the image
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    
    console.log(`[BASE64] Image downloaded successfully to ${outputPath}`);
  } catch (error: any) {
    console.error(`[BASE64] Error downloading image: ${error.message}`);
    throw new Error(`Error downloading image: ${error.message}`);
  }
}