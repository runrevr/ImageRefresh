// Test using official OpenAI SDK
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import OpenAI from 'openai';

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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// Test using OpenAI SDK
async function testWithOpenAISDK(imagePath) {
  if (!imagePath) {
    console.error('No image path provided');
    return;
  }
  
  console.log(`Testing with OpenAI SDK: ${imagePath}`);
  
  try {
    // Convert to PNG and resize to square (1024x1024) for variations API
    const squarePngPath = path.join(TEST_DIR, 'square.png');
    
    await sharp(imagePath)
      .resize(1024, 1024, { fit: 'cover' })
      .png()
      .toFile(squarePngPath);
    
    console.log(`Converted to square PNG: ${squarePngPath}`);
    
    // Use OpenAI SDK for image variations
    console.log('Using OpenAI SDK createImageVariation method...');
    
    const response = await openai.images.createVariation({
      image: fs.createReadStream(squarePngPath),
      n: 1,
      size: "1024x1024",
    });
    
    console.log('Response from OpenAI:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data.length > 0) {
      console.log('Success! Variation image URL:', response.data[0].url);
    }
  } catch (error) {
    console.error('Error with OpenAI SDK:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
async function runTest() {
  try {
    const imagePath = await findTestImage();
    if (imagePath) {
      await testWithOpenAISDK(imagePath);
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