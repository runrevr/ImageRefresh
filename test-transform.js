// Test script for OpenAI image transformation
import { transformImageWithOpenAI } from './server/openai-image.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a test image if none exists
async function ensureTestImage() {
  const testDir = path.join(process.cwd(), 'uploads');
  const testImagePath = path.join(testDir, 'test-image.jpg');
  
  // If test image doesn't exist, copy one from attached_assets if available
  if (!fs.existsSync(testImagePath)) {
    try {
      // Check if we have an attached asset to use
      const assetsDir = path.join(process.cwd(), 'attached_assets');
      const assets = fs.readdirSync(assetsDir);
      const imageFiles = assets.filter(file => 
        file.endsWith('.jpg') || file.endsWith('.png')
      );
      
      if (imageFiles.length > 0) {
        const sourceImage = path.join(assetsDir, imageFiles[0]);
        fs.copyFileSync(sourceImage, testImagePath);
        console.log(`Copied test image from ${sourceImage} to ${testImagePath}`);
        return 'uploads/test-image.jpg';
      } else {
        console.log('No image found in attached_assets to use for testing');
        return null;
      }
    } catch (err) {
      console.error('Error creating test image:', err);
      return null;
    }
  }
  
  return 'uploads/test-image.jpg';
}

// Use an existing image in uploads folder if one exists
async function findExistingImage() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      (file.endsWith('.jpg') || file.endsWith('.png')) && 
      !file.includes('transformed')
    );
    
    if (imageFiles.length > 0) {
      return `uploads/${imageFiles[0]}`;
    } else {
      console.log('No existing images found in uploads directory');
      return null;
    }
  } catch (err) {
    console.error('Error reading uploads directory:', err);
    return null;
  }
}

// Main test function
async function testTransformation() {
  console.log('Starting OpenAI transformation test...');
  
  try {
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables. Please set it and try again.');
      return;
    }
    
    // First try to use an existing image
    let imagePath = await findExistingImage();
    
    // If no existing image, create a test image
    if (!imagePath) {
      imagePath = await ensureTestImage();
    }
    
    if (!imagePath) {
      console.error('No image available for testing. Please add an image to the uploads directory.');
      return;
    }
    
    console.log(`Using image at path: ${imagePath}`);
    
    // Test prompt
    const testPrompt = 'Transform this image into a vibrant oil painting with bright colors and bold brush strokes.';
    console.log(`Using test prompt: "${testPrompt}"`);
    
    // Call the transformation function
    console.log('Calling transformImageWithOpenAI function...');
    const transformedImagePath = await transformImageWithOpenAI(imagePath, testPrompt);
    
    console.log('Transformation completed successfully!');
    console.log(`Transformed image saved at: ${transformedImagePath}`);
    
    // Verify the transformed image exists
    const fullPath = path.join(process.cwd(), transformedImagePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`Transformed image file size: ${Math.round(stats.size / 1024)} KB`);
      console.log('Test completed successfully ✅');
    } else {
      console.error(`Transformed image file not found at: ${fullPath}`);
      console.log('Test failed ❌');
    }
  } catch (error) {
    console.error('Error during transformation test:', error);
    if (error.response) {
      console.error('OpenAI API response error:', error.response.data);
    }
    console.log('Test failed ❌');
  }
}

// Run the test
testTransformation().catch(err => {
  console.error('Unhandled error in test:', err);
});