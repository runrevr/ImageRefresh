/**
 * OpenAI image transformation using gpt-image-1 model
 * Implements EXACTLY the pattern requested for using base64 encoding
 */
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import FormData from 'form-data';
import https from 'https';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Allowed sizes for the OpenAI API - only supporting these three sizes
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * Uses the /edit endpoint with base64 encoding as requested
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size (from request body)
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformWithGptImage(imagePath, prompt, size) {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Read the image as base64 using the exact pattern requested
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
    console.log(`[OpenAI] Image encoded as base64 (${base64Image.length} chars)`);
    
    // Validate size parameter - use only the three sizes specified
    const userSize = size || "1024x1024";
    const finalSize = allowedSizes.includes(userSize) ? userSize : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);

    // Call OpenAI API using the exact pattern from the request
    console.log(`[OpenAI] Calling OpenAI with gpt-image-1 model`);
    
    // Make the API call with EXACTLY the pattern requested
    // For the OpenAI SDK, we need to use a proper File object with correct MIME type
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Ensure we're getting a valid image type
    let mime = 'image/png';
    if (imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg')) {
      mime = 'image/jpeg';
    } else if (imagePath.toLowerCase().endsWith('.webp')) {
      mime = 'image/webp';
    }
    
    // Create a temp file with proper extension
    const fileExt = mime.split('/')[1];
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}.${fileExt}`);
    fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'));
    
    // Create a FormData instance for proper multipart/form-data handling
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt);
    form.append('n', '2');
    form.append('size', finalSize);
    
    // Append the file with the proper mime type
    form.append('image', fs.readFileSync(tempFilePath), {
      filename: path.basename(tempFilePath),
      contentType: mime
    });
    
    console.log(`[OpenAI] Using file with MIME type: ${mime}`);
    
    // Make a direct API call using the form-data package
    return new Promise((resolve, reject) => {
      const request = https.request({
        hostname: 'api.openai.com',
        path: '/v1/images/edits',
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          // Parse the response data
          try {
            if (response.statusCode !== 200) {
              console.error(`[OpenAI] API error: ${response.statusCode} ${data}`);
              reject(new Error(`OpenAI API error: ${response.statusCode} ${data}`));
              return;
            }
            
            const parsedData = JSON.parse(data);
            console.log(`[OpenAI] Received successful response from API`);
            resolve(parsedData);
          } catch (error) {
            reject(error);
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      // Send the form data
      form.pipe(request);
    })
    .then(response => {
      console.log(`[OpenAI] Processing response`);
      
      // Process the response
      if (!response.data || response.data.length === 0) {
        throw new Error("No image data in OpenAI response");
      }
      
      return response;
    });
    if (!response.data || response.data.length === 0) {
      throw new Error("No image data in OpenAI response");
    }
    
    // Create filenames for transformed images
    const transformedFileName = `transformed-${Date.now()}.png`;
    const transformedPath = path.join(process.cwd(), "uploads", transformedFileName);
    
    // Download and save the primary transformed image
    const imageUrl = response.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl}`);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageData = await imageResponse.arrayBuffer();
    fs.writeFileSync(transformedPath, Buffer.from(imageData));
    console.log(`[OpenAI] First image saved to: ${transformedPath}`);
    
    // Process second image if available
    let secondTransformedPath = null;
    if (response.data.length > 1 && response.data[1].url) {
      const secondImageUrl = response.data[1].url;
      console.log(`[OpenAI] Second image URL: ${secondImageUrl}`);
      
      const secondFileName = `transformed-${Date.now()}-2.png`;
      secondTransformedPath = path.join(process.cwd(), "uploads", secondFileName);
      
      const secondResponse = await fetch(secondImageUrl);
      if (secondResponse.ok) {
        const secondData = await secondResponse.arrayBuffer();
        fs.writeFileSync(secondTransformedPath, Buffer.from(secondData));
        console.log(`[OpenAI] Second image saved to: ${secondTransformedPath}`);
      }
    }
    
    // Clean up the temporary file
    try {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`[OpenAI] Cleaned up temporary file: ${tempFilePath}`);
      }
    } catch (cleanupError) {
      console.error(`[OpenAI] Error cleaning up temporary file: ${cleanupError.message}`);
    }
    
    return {
      url: imageUrl,
      transformedPath,
      secondTransformedPath
    };
  } catch (error) {
    console.error(`[OpenAI] Error: ${error.message}`);
    throw error;
  }
}

export { allowedSizes };