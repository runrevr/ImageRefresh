/**
 * Final implementation of OpenAI image transformation
 * Using gpt-image-1 model with the OpenAI API
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

// Transform an image using OpenAI's API
export async function transformImage(imagePath, prompt, size = "1024x1024") {
  try {
    console.log(`[Transform] Starting transformation for ${imagePath}`);
    console.log(`[Transform] Prompt: ${prompt}`);
    console.log(`[Transform] Size: ${size}`);
    
    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found: ${imagePath}`);
    }
    
    // Create timestamp for unique filenames
    const timestamp = Date.now();
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // FIRST TRANSFORMATION
    console.log('[Transform] Creating first variation...');
    
    // Create form data
    const form1 = new FormData();
    form1.append('model', 'gpt-image-1');
    form1.append('prompt', prompt);
    form1.append('n', 1);
    form1.append('size', size);
    
    // Add image file to form data
    form1.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
    });
    
    // Make API call for first transformation
    const response1 = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form1,
      headers: {
        ...form1.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    console.log('[Transform] First variation API response received');
    
    // Get URL from response
    const imageUrl1 = response1.data.data[0].url;
    
    // Download and save first transformed image
    const outputFileName1 = `transformed-${timestamp}-1.png`;
    const outputPath1 = path.join(uploadsDir, outputFileName1);
    
    const imageResponse1 = await axios.get(imageUrl1, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath1, Buffer.from(imageResponse1.data));
    
    console.log(`[Transform] First image saved to ${outputPath1}`);
    
    // SECOND TRANSFORMATION (with slight prompt variation)
    console.log('[Transform] Creating second variation...');
    
    // Create form data for second variation
    const form2 = new FormData();
    form2.append('model', 'gpt-image-1');
    form2.append('prompt', `${prompt} (using alternate artistic style)`);
    form2.append('n', 1);
    form2.append('size', size);
    
    // Add image file to form data
    form2.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
    });
    
    // Make API call for second transformation
    const response2 = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/images/edits',
      data: form2,
      headers: {
        ...form2.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    console.log('[Transform] Second variation API response received');
    
    // Get URL from response
    const imageUrl2 = response2.data.data[0].url;
    
    // Download and save second transformed image
    const outputFileName2 = `transformed-${timestamp}-2.png`;
    const outputPath2 = path.join(uploadsDir, outputFileName2);
    
    const imageResponse2 = await axios.get(imageUrl2, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath2, Buffer.from(imageResponse2.data));
    
    console.log(`[Transform] Second image saved to ${outputPath2}`);
    
    // Return results
    return {
      url: imageUrl1,
      transformedPath: outputPath1,
      secondTransformedPath: outputPath2
    };
  } catch (error) {
    console.error('[Transform] Error transforming image:', error.message);
    
    if (error.response) {
      console.error('[Transform] API Error:', error.response.status);
      console.error('[Transform] Error data:', error.response.data);
    }
    
    throw new Error(`Error transforming image: ${error.message}`);
  }
}

// Create a variation of an image (using the same transformation function)
export async function createImageVariation(imagePath) {
  const variationPrompt = "Create a creative variation of this image with a different style and colors";
  return transformImage(imagePath, variationPrompt, "1024x1024");
}

// Export allowed sizes
export const allowedSizes = ["1024x1024", "1536x1024", "1024x1536"];