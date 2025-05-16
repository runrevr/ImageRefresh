// Direct test of OpenAI image uploads with proper MIME types
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import mime from 'mime-types';
import axios from 'axios';
import FormData from 'form-data';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test paths
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const TEST_DIR = path.join(UPLOADS_DIR, 'test-' + Date.now());

// Create test directory
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

// Find a test image
async function findTestImage() {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    const imageFile = files.find(file => 
      (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) && 
      !file.includes('transformed')
    );
    
    if (!imageFile) {
      console.error('No test image found in uploads directory');
      return null;
    }
    
    const imagePath = path.join(UPLOADS_DIR, imageFile);
    console.log(`Found test image: ${imagePath}`);
    return imagePath;
  } catch (error) {
    console.error('Error finding test image:', error);
    return null;
  }
}

// Test OpenAI image upload with proper MIME type
async function testOpenAIImageUpload(imagePath) {
  if (!imagePath) {
    console.error('No image path provided');
    return;
  }
  
  try {
    // Check if the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return;
    }
    
    // Detect MIME type
    const detectedMime = mime.lookup(imagePath);
    console.log(`Original image: ${imagePath}`);
    console.log(`Detected MIME type: ${detectedMime}`);
    
    // Convert to PNG for consistency
    const pngPath = path.join(TEST_DIR, 'test-image.png');
    await sharp(imagePath)
      .png()
      .toFile(pngPath);
    
    console.log(`Converted to PNG: ${pngPath}`);
    
    // Create form data
    const form = new FormData();
    
    // Add the image with explicit content type
    form.append('image', fs.createReadStream(pngPath), {
      filename: 'image.png',
      contentType: 'image/png'
    });
    
    // Create a mask image (required for image edits)
    const maskPath = path.join(TEST_DIR, 'mask.png');
    
    // Generate a simple mask that covers the entire image
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
    .png()
    .toFile(maskPath);
    
    console.log(`Created mask image: ${maskPath}`);
    
    // Add the mask image to the form
    form.append('mask', fs.createReadStream(maskPath), {
      filename: 'mask.png',
      contentType: 'image/png'
    });
    
    // Add other required parameters
    form.append('prompt', 'Add a subtle glow effect to the image');
    form.append('n', '1');
    form.append('size', '1024x1024');
    
    console.log('Sending image to OpenAI with image/png MIME type');
    
    // Send request
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    
    console.log(`OpenAI response status: ${response.status}`);
    
    if (response.data?.data?.[0]?.url) {
      console.log('Success! Image URL received from OpenAI');
      return response.data.data[0].url;
    } else {
      console.error('Invalid response structure from OpenAI:', response.data);
    }
  } catch (error) {
    console.error('Error in OpenAI image upload test:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run the test
async function runTest() {
  try {
    const imagePath = await findTestImage();
    if (imagePath) {
      await testOpenAIImageUpload(imagePath);
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Clean up test directory
    try {
      if (fs.existsSync(TEST_DIR)) {
        const files = fs.readdirSync(TEST_DIR);
        for (const file of files) {
          fs.unlinkSync(path.join(TEST_DIR, file));
        }
        fs.rmdirSync(TEST_DIR);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }
  }
}

runTest();