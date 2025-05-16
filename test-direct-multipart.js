/**
 * Direct test for OpenAI's GPT-Image-1 model using multipart/form-data
 * This is a simplified test with minimal code to verify the API works
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import sharp from 'sharp';

// Find a small test image
async function findSmallTestImage() {
  console.log("Looking for a small test image...");
  
  // Check attached_assets directory
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        if (file.includes('small') || file.includes('icon') || file.includes('logo')) {
          return path.join(assetsDir, file);
        }
      }
    }
    
    // If no small image found, get the first image
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return path.join(assetsDir, file);
      }
    }
  }
  
  // Check uploads directory as fallback
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return path.join(uploadsDir, file);
      }
    }
  }
  
  return null;
}

// Resize image to make it smaller for API request
async function prepareSmallImage(imagePath) {
  console.log(`Resizing image for API submission: ${imagePath}`);
  
  // Create a temporary file for the resized image
  const resizedImagePath = path.join(process.cwd(), 'temp-small-image.png');
  
  // Resize the image to a smaller size
  await sharp(imagePath)
    .resize({ width: 512, height: 512, fit: 'inside' })
    .png({ quality: 80, compressionLevel: 9 })
    .toFile(resizedImagePath);
  
  console.log(`Image resized and saved to: ${resizedImagePath}`);
  
  return resizedImagePath;
}

// Main test function
async function testDirectMultipart() {
  try {
    console.log("DIRECT TEST: OpenAI GPT-Image-1 with multipart/form-data");
    
    // Find and prepare a small test image
    const imagePath = await findSmallTestImage();
    if (!imagePath) {
      console.error("No test image found");
      return;
    }
    
    // Resize the image to make it smaller
    const smallImagePath = await prepareSmallImage(imagePath);
    
    // Set up test parameters
    const prompt = "Transform this into a cartoon character";
    const size = "1024x1024";
    
    console.log(`Using image: ${smallImagePath}`);
    console.log(`Using prompt: "${prompt}"`);
    console.log(`Using size: ${size}`);
    
    // Create form data
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('image', fs.createReadStream(smallImagePath));
    form.append('prompt', prompt);
    form.append('n', 1);
    form.append('size', size);
    
    console.log("Sending API request to OpenAI...");
    console.log(`Endpoint: https://api.openai.com/v1/images/edits`);
    
    // Make direct API call
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 60000, // 1 minute timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log("API response received!");
    console.log("Response status:", response.status);
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log("Transformation successful!");
      console.log("Image URL:", response.data.data[0].url);
      
      // Save the generated image
      const resultPath = path.join(process.cwd(), 'test-result.png');
      const imageResponse = await axios.get(response.data.data[0].url, { responseType: 'arraybuffer' });
      fs.writeFileSync(resultPath, Buffer.from(imageResponse.data));
      console.log(`Result saved to: ${resultPath}`);
    } else {
      console.error("No image data in response:", response.data);
    }
    
    // Clean up temporary file
    fs.unlinkSync(smallImagePath);
    console.log("Test complete!");
  } catch (error) {
    console.error("Test failed with error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run the test
testDirectMultipart();