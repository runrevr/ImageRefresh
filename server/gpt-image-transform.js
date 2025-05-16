/**
 * OpenAI image transformation using gpt-image-1 model
 * ESM implementation compatible with the project
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

// Allowed sizes for the OpenAI API
const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];

/**
 * Transform an image using OpenAI's gpt-image-1 model
 * 
 * @param {string} imagePath - Path to the image file
 * @param {string} prompt - Transformation prompt
 * @param {string} size - Image size specification
 * @returns {Promise<Object>} - Transformation result
 */
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[OpenAI] Starting transformation with prompt: "${prompt}"`);
    
    // Validate size parameter
    const finalSize = allowedSizes.includes(size) ? size : "1024x1024";
    console.log(`[OpenAI] Using size: ${finalSize}`);
    
    // Make sure we have an absolute path to the image
    const absoluteImagePath = path.isAbsolute(imagePath) 
      ? imagePath 
      : path.join(process.cwd(), imagePath);
    
    console.log(`[OpenAI] Using absolute image path: ${absoluteImagePath}`);
    
    // Check if the image exists
    if (!fs.existsSync(absoluteImagePath)) {
      throw new Error(`Image file not found at path: ${absoluteImagePath}`);
    }
    
    // Get file info and log details
    const fileInfo = fs.statSync(absoluteImagePath);
    console.log(`[OpenAI] Image size: ${fileInfo.size} bytes`);
    
    // For generating two variations, we'll make separate API calls
    console.log('[OpenAI] Preparing first transformation...');

    // Create a timestamp for unique filenames
    const timestamp = Date.now();
    
    // First transformation
    const form1 = new FormData();
    form1.append('model', 'gpt-image-1');
    form1.append('prompt', prompt + " (Variation 1)");
    form1.append('n', 1);
    form1.append('size', finalSize);
    
    // Add image file to form data
    form1.append('image', fs.createReadStream(absoluteImagePath), {
      filename: path.basename(absoluteImagePath),
      contentType: 'image/png'
    });
    
    // Log for debugging
    console.log(`[OpenAI] Form data prepared with ${prompt.length} character prompt`);
    console.log(`[OpenAI] Request 1 making API call to /v1/images/edits...`);
    
    // Make the first API call
    const response1 = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form1,
      headers: {
        ...form1.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log(`[OpenAI] First transformation response status: ${response1.status}`);
    
    // Extract first image URL
    if (!response1.data || !response1.data.data || response1.data.data.length === 0) {
      throw new Error("No image data in first OpenAI response");
    }
    
    const imageUrl1 = response1.data.data[0].url;
    console.log(`[OpenAI] First image URL: ${imageUrl1}`);
    
    // Save first image
    const outputFileName1 = `transformed-${timestamp}-1.png`;
    const outputPath1 = path.join(process.cwd(), "uploads", outputFileName1);
    
    const imageResponse1 = await axios.get(imageUrl1, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath1, Buffer.from(imageResponse1.data));
    console.log(`[OpenAI] First image saved to: ${outputPath1}`);
    
    // Second transformation (slightly different prompt)
    console.log('[OpenAI] Preparing second transformation...');
    
    const form2 = new FormData();
    form2.append('model', 'gpt-image-1');
    form2.append('prompt', prompt + " (Variation 2 - alternate style)");
    form2.append('n', 1);
    form2.append('size', finalSize);
    
    // Add image file to form data - new stream for second request
    form2.append('image', fs.createReadStream(absoluteImagePath), {
      filename: path.basename(absoluteImagePath),
      contentType: 'image/png'
    });
    
    console.log(`[OpenAI] Request 2 making API call to /v1/images/edits...`);
    
    // Make the second API call
    const response2 = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form2,
      headers: {
        ...form2.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log(`[OpenAI] Second transformation response status: ${response2.status}`);
    
    // Extract second image URL
    if (!response2.data || !response2.data.data || response2.data.data.length === 0) {
      throw new Error("No image data in second OpenAI response");
    }
    
    const imageUrl2 = response2.data.data[0].url;
    console.log(`[OpenAI] Second image URL: ${imageUrl2}`);
    
    // Save second image
    const outputFileName2 = `transformed-${timestamp}-2.png`;
    const outputPath2 = path.join(process.cwd(), "uploads", outputFileName2);
    
    const imageResponse2 = await axios.get(imageUrl2, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath2, Buffer.from(imageResponse2.data));
    console.log(`[OpenAI] Second image saved to: ${outputPath2}`);
    
    // Return both image paths
    return {
      url: imageUrl1,
      transformedPath: outputPath1,
      secondTransformedPath: outputPath2
    };
  } catch (error) {
    console.error(`[OpenAI] Error in transformation: ${error.message}`);
    
    if (error.response) {
      console.error(`[OpenAI] Response status: ${error.response.status}`);
      console.error(`[OpenAI] Response data:`, error.response.data);
    }
    
    throw error;
  }
}

// Export for image variations
export async function createImageVariation(imagePath) {
  const variationPrompt = "Create a creative variation of this image with a different style and colors while keeping the main subject recognizable";
  return transformImage(imagePath, variationPrompt, "1024x1024");
}

export { allowedSizes };