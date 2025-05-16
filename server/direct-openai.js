/**
 * Direct OpenAI integration for image transformations
 * This is a simplified version designed for reliability
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

// Function to transform an image using OpenAI GPT-Image-1
export async function transformImage(imagePath, prompt, imageSize = "1024x1024") {
  try {
    console.log(`Starting transformation with prompt: "${prompt}"`);
    
    // Make sure the image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    
    // Create a timestamp for unique filenames
    const timestamp = Date.now();
    const outputDir = path.join(process.cwd(), "uploads");
    
    // Ensure the uploads directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // First transformation
    console.log("Preparing first transformation...");
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('prompt', prompt + " (Variation 1)");
    form.append('n', 1);
    form.append('size', imageSize);
    form.append('image', fs.createReadStream(imagePath));
    
    // Make the API call
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form,
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    // Extract image URL
    const imageUrl = response.data.data[0].url;
    
    // Save the image
    const outputFileName = `transformed-${timestamp}-1.png`;
    const outputPath = path.join(outputDir, outputFileName);
    
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath, Buffer.from(imageResponse.data));
    
    // Second transformation (different variation)
    console.log("Preparing second transformation...");
    const form2 = new FormData();
    form2.append('model', 'gpt-image-1');
    form2.append('prompt', prompt + " (Variation 2 - alternate style)");
    form2.append('n', 1);
    form2.append('size', imageSize);
    form2.append('image', fs.createReadStream(imagePath));
    
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
    
    // Extract second image URL
    const imageUrl2 = response2.data.data[0].url;
    
    // Save the second image
    const outputFileName2 = `transformed-${timestamp}-2.png`;
    const outputPath2 = path.join(outputDir, outputFileName2);
    
    const imageResponse2 = await axios.get(imageUrl2, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath2, Buffer.from(imageResponse2.data));
    
    // Return the results
    return {
      url: imageUrl,
      transformedPath: outputPath,
      secondTransformedPath: outputPath2
    };
  } catch (error) {
    console.error("Error in transformation:", error.message);
    
    if (error.response) {
      console.error(`API Error: ${error.response.status}`);
      console.error("Error data:", error.response.data);
    }
    
    throw error;
  }
}

// Create an image variation (using the same transformation function)
export async function createImageVariation(imagePath) {
  const variationPrompt = "Create a creative variation of this image with a different style and colors";
  return transformImage(imagePath, variationPrompt, "1024x1024");
}

// Check if OpenAI is configured
export function isOpenAIConfigured() {
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
}