/**
 * Helper module for handling OpenAI image uploads with proper MIME type handling
 * Uses Sharp for reliable image conversion to PNG format
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import stream from 'stream';
import { promisify } from 'util';
import { pipeline } from 'stream';
import sharp from 'sharp';

const streamPipeline = promisify(pipeline);

/**
 * Sends an image to OpenAI's image edit API with explicit MIME type control
 * Converts any image to PNG format using Sharp before sending to OpenAI
 * 
 * @param imagePath Path to the image file to send
 * @param prompt The prompt for OpenAI to use for image editing
 * @param apiKey The OpenAI API key
 * @returns Promise resolving to the URL of the transformed image
 */
export async function sendImageToOpenAI(
  imagePath: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create a unique temp directory for this operation
  const opId = Date.now().toString();
  const tempDir = path.join(uploadsDir, `temp-${opId}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Define path for the converted PNG file
  const convertedPngPath = path.join(tempDir, `converted-${opId}.png`);
  
  try {
    console.log(`Converting image to PNG format using Sharp: ${imagePath}`);
    
    // Use Sharp to convert the input image to PNG format
    await sharp(imagePath)
      .png() // Explicitly convert to PNG format
      .toFile(convertedPngPath);
    
    console.log(`Successfully converted image to PNG: ${convertedPngPath}`);
    
    // Read the converted PNG file to verify it
    const pngBuffer = fs.readFileSync(convertedPngPath);
    console.log(`Converted PNG file size: ${pngBuffer.length} bytes`);
    
    // Log file headers for debugging
    let headerBytes = '';
    for (let i = 0; i < Math.min(16, pngBuffer.length); i++) {
      headerBytes += pngBuffer[i].toString(16).padStart(2, '0') + ' ';
    }
    console.log(`PNG file header bytes: ${headerBytes}`);
    
    // Create a form data object for the API request
    const form = new FormData();
    
    // Add the PNG image with explicit content type
    form.append('image', fs.createReadStream(convertedPngPath), {
      filename: 'image.png', // Always use .png extension
      contentType: 'image/png'  // Always use image/png MIME type
    });
    
    // Add other required parameters
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1024'); // OpenAI edit API only supports 1024x1024
    
    console.log('Sending image to OpenAI with image/png MIME type');
    
    // Send the request to OpenAI
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...form.getHeaders()
      },
      data: form,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    console.log(`Response received from OpenAI: Status ${response.status}`);
    
    // Extract the image URL from the response
    if (response.data?.data?.[0]?.url) {
      const imageUrl = response.data.data[0].url;
      console.log(`Received image URL from OpenAI: ${imageUrl}`);
      return imageUrl;
    } else {
      console.error('Invalid OpenAI response structure:', response.data);
      throw new Error('No valid image URL in the OpenAI response');
    }
  } catch (error: any) {
    console.error('Error in OpenAI image upload:', error.message);
    
    // Log detailed API error information
    if (error.response) {
      console.error('OpenAI API error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(error.response.data)
      });
    }
    
    throw new Error(`Error uploading image to OpenAI: ${error.message}`);
  } finally {
    // Clean up temp directory and files
    try {
      if (fs.existsSync(tempDir)) {
        // Remove all files in the temp directory
        const files = fs.readdirSync(tempDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tempDir, file));
        }
        // Remove the directory
        fs.rmdirSync(tempDir);
        console.log(`Cleaned up temporary directory: ${tempDir}`);
      }
    } catch (cleanupError: any) {
      console.error(`Error cleaning up temporary files: ${cleanupError.message}`);
    }
  }
}

/**
 * Downloads an image from a URL and saves it to a local file
 * 
 * @param imageUrl URL of the image to download
 * @param outputPath Local path where the image should be saved
 */
export async function downloadImage(imageUrl: string, outputPath: string): Promise<void> {
  try {
    // Make a GET request to the image URL
    const response = await axios({
      method: 'get',
      url: imageUrl,
      responseType: 'stream'
    });
    
    // Save the image to the output path
    await streamPipeline(response.data, fs.createWriteStream(outputPath));
    
    console.log(`Image downloaded and saved to: ${outputPath}`);
  } catch (error: any) {
    console.error(`Error downloading image: ${error.message}`);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}