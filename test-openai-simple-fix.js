/**
 * Simple test script for the fixed OpenAI image transformation 
 */
import { transformImage } from './server/openai-final.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Function to create a small test image
async function createTestImage() {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create a simple test image path
    const testImagePath = path.join(uploadsDir, `test-image-${Date.now()}.png`);
    
    // Generate a simple 256x256 colored image
    await sharp({
      create: {
        width: 256,
        height: 256,
        channels: 4,
        background: { r: 50, g: 100, b: 200, alpha: 1 }
      }
    })
    .png()
    .toFile(testImagePath);
    
    console.log(`Created test image at ${testImagePath}`);
    return testImagePath;
  } catch (error) {
    console.error('Error creating test image:', error);
    throw error;
  }
}

// Main test function
async function runTest() {
  try {
    // Create a simple test image
    const imagePath = await createTestImage();
    
    // Simple test prompt
    const prompt = "Transform this into a magical forest scene with glowing elements";
    
    console.log(`Running transformation with prompt: "${prompt}"`);
    
    // Run the transformation
    const result = await transformImage(imagePath, prompt);
    
    console.log('Transformation successful!');
    console.log(`First transformed image: ${result.transformedPath}`);
    
    if (result.secondTransformedPath) {
      console.log(`Second transformed image: ${result.secondTransformedPath}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error running test:', error);
    throw error;
  }
}

// Execute the test
console.log('Starting simple OpenAI transformation test...');
runTest()
  .then(result => {
    console.log('Test completed successfully!');
  })
  .catch(error => {
    console.error('Test failed:', error);
  });