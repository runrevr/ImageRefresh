/**
 * Helper module for handling OpenAI image uploads with proper MIME type handling
 */
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import stream from 'stream';
import { promisify } from 'util';
import { pipeline } from 'stream';

const streamPipeline = promisify(pipeline);

/**
 * Sends an image to OpenAI's image edit API with explicit MIME type control
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
  // Explicitly supported MIME types by OpenAI
  const supportedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create a unique temp directory for this operation
  const opId = Date.now().toString();
  const tempDir = path.join(uploadsDir, `temp-${opId}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Read the image file
  const imageBuffer = fs.readFileSync(imagePath);
  
  // Determine MIME type based on file signature/magic numbers
  let mimeType = 'image/png'; // Default
  
  // Check PNG signature (first 8 bytes)
  if (imageBuffer.length >= 8 && 
      imageBuffer[0] === 0x89 && 
      imageBuffer[1] === 0x50 && 
      imageBuffer[2] === 0x4E && 
      imageBuffer[3] === 0x47 && 
      imageBuffer[4] === 0x0D && 
      imageBuffer[5] === 0x0A && 
      imageBuffer[6] === 0x1A && 
      imageBuffer[7] === 0x0A) {
    mimeType = 'image/png';
  }
  // Check JPEG signature (first 3 bytes)
  else if (imageBuffer.length >= 3 && 
           imageBuffer[0] === 0xFF && 
           imageBuffer[1] === 0xD8 && 
           imageBuffer[2] === 0xFF) {
    mimeType = 'image/jpeg';
  }
  // Check WEBP signature (bytes 8-11)
  else if (imageBuffer.length >= 12 && 
           imageBuffer[8] === 0x57 && 
           imageBuffer[9] === 0x45 && 
           imageBuffer[10] === 0x42 && 
           imageBuffer[11] === 0x50) {
    mimeType = 'image/webp';
  }
  
  console.log(`Detected MIME type from file signature: ${mimeType}`);
  
  // Ensure the MIME type is supported
  if (!supportedMimeTypes.includes(mimeType)) {
    throw new Error(`Unsupported image format: ${mimeType}. Only PNG, JPEG, and WebP are supported.`);
  }
  
  // Define appropriate file extension
  const fileExt = mimeType === 'image/png' ? '.png' : 
                 mimeType === 'image/jpeg' ? '.jpg' : 
                 mimeType === 'image/webp' ? '.webp' : '.png';
  
  // Create a new file with the correct extension in the temp directory
  const tempFilePath = path.join(tempDir, `image${fileExt}`);
  fs.writeFileSync(tempFilePath, imageBuffer);
  
  console.log(`Created temporary file with correct extension: ${tempFilePath}`);
  console.log(`File size: ${imageBuffer.length} bytes`);
  
  try {
    // Create a form data object with explicit content types
    const form = new FormData();
    
    // Add the image with explicit content type
    form.append('image', fs.createReadStream(tempFilePath), {
      filename: `image${fileExt}`,
      contentType: mimeType
    });
    
    // Add other required parameters
    form.append('prompt', prompt);
    form.append('n', '1');
    form.append('size', '1024x1024'); // OpenAI edit API only supports 1024x1024
    
    console.log('Sending API request to OpenAI images/edits endpoint');
    console.log(`Using MIME type: ${mimeType}`);
    
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
    
    console.log(`Response received from OpenAI (${response.status})`);
    
    // Check if we got a valid response
    if (response.data && 
        response.data.data && 
        response.data.data.length > 0 && 
        response.data.data[0].url) {
      const imageUrl = response.data.data[0].url;
      return imageUrl;
    } else {
      console.error('Invalid response structure from OpenAI:', response.data);
      throw new Error('No valid image URL in the OpenAI response');
    }
  } catch (error: any) {
    console.error('Error in OpenAI image upload:', error.message);
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