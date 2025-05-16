// Test file for OpenAI image variation API
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

// Test OpenAI image variation with proper MIME type
async function testOpenAIImageVariation(imagePath) {
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
    
    // Convert to PNG for consistency (needs to be square for OpenAI)
    const pngPath = path.join(TEST_DIR, 'test-image.png');
    
    // Process with Sharp - resize to 1024x1024 square (required for variation API)
    await sharp(imagePath)
      .resize(1024, 1024, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(pngPath);
    
    console.log(`Converted to square PNG (1024x1024): ${pngPath}`);
    
    // Create form data
    const form = new FormData();
    
    // Add the image with explicit content type - note the parameter name is 'image' for variations
    form.append('image', fs.createReadStream(pngPath), {
      filename: 'image.png',
      contentType: 'image/png'
    });
    
    // Add other required parameters
    form.append('n', '1');
    form.append('size', '1024x1024');
    
    console.log('Sending image to OpenAI variations API with image/png MIME type');
    console.log('Form data headers:', form.getHeaders());
    
    // Send request to variations endpoint which is simpler than edits
    const response = await axios.post(
      'https://api.openai.com/v1/images/variations',
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
    console.error('Error in OpenAI image variation test:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
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
      await testOpenAIImageVariation(imagePath);
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