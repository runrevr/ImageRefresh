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
import sharp from 'sharp';
import mime from 'mime-types';

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
  // List of MIME types supported by OpenAI
  const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create a unique temp directory for this operation
  const opId = Date.now().toString();
  const tempDir = path.join(uploadsDir, `temp-${opId}`);
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Detect the MIME type based on file extension
    const detectedMime = mime.lookup(imagePath);
    console.log("[TEST] About to send file:", imagePath);
    console.log("[TEST] Detected mime-type:", detectedMime);
    
    // Validate the MIME type is supported
    if (!detectedMime || !supportedMimeTypes.includes(detectedMime)) {
      console.log("[TEST] Unsupported MIME type detected. Converting to PNG...");
      
      // Convert to PNG since the MIME type isn't supported
      const convertedPath = path.join(tempDir, `converted-${opId}.png`);
      
      await sharp(imagePath)
        .png()
        .toFile(convertedPath);
      
      console.log(`[TEST] Successfully converted image to PNG: ${convertedPath}`);
      
      // Update the path and MIME type
      imagePath = convertedPath;
      const newMimeType = 'image/png';
      console.log(`[TEST] Using converted image with MIME type: ${newMimeType}`);
      
      // Create form data object
      const form = new FormData();
      
      // Add the image with explicit content type
      form.append('image', fs.createReadStream(imagePath), {
        filename: path.basename(imagePath),
        contentType: newMimeType // Explicitly set to image/png
      });
      
      // Add other required parameters
      form.append('prompt', prompt);
      form.append('n', '1');
      form.append('size', '1024x1024'); // OpenAI edit API only supports 1024x1024
      
      console.log(`[TEST] Sending image to OpenAI with MIME type: ${newMimeType}`);
      
      // Send request to OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/images/edits',
        form,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...form.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      // Process response
      console.log(`Response received from OpenAI: Status ${response.status}`);
      
      if (response.data?.data?.[0]?.url) {
        const imageUrl = response.data.data[0].url;
        console.log(`Received image URL from OpenAI: ${imageUrl}`);
        return imageUrl;
      } else {
        console.error('Invalid OpenAI response structure:', response.data);
        throw new Error('No valid image URL in the OpenAI response');
      }
    } else {
      // MIME type is supported, use the file as is
      console.log(`[TEST] File has supported MIME type: ${detectedMime}`);
      
      // Create form data object
      const form = new FormData();
      
      // Add the image with explicit content type
      form.append('image', fs.createReadStream(imagePath), {
        filename: path.basename(imagePath),
        contentType: detectedMime // Use the detected MIME type
      });
      
      // Add other required parameters
      form.append('prompt', prompt);
      form.append('n', '1');
      form.append('size', '1024x1024'); // OpenAI edit API only supports 1024x1024
      
      console.log(`[TEST] Sending image to OpenAI with MIME type: ${detectedMime}`);
      
      // Send request to OpenAI
      const response = await axios.post(
        'https://api.openai.com/v1/images/edits',
        form,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            ...form.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      // Process response
      console.log(`Response received from OpenAI: Status ${response.status}`);
      
      if (response.data?.data?.[0]?.url) {
        const imageUrl = response.data.data[0].url;
        console.log(`Received image URL from OpenAI: ${imageUrl}`);
        return imageUrl;
      } else {
        console.error('Invalid OpenAI response structure:', response.data);
        throw new Error('No valid image URL in the OpenAI response');
      }
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