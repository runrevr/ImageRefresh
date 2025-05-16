/**
 * Test script for the updated image transformation implementation
 * Using GPT-4o for image analysis and DALL-E 3 for generation
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Make sure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Find a test image in the uploads directory
 */
async function findTestImage() {
  try {
    // Look in the uploads directory for an image
    const files = fs.readdirSync(uploadsDir);
    
    // Filter for common image extensions
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
    
    if (imageFiles.length > 0) {
      return path.join(uploadsDir, imageFiles[0]);
    }
    
    // If no image was found, create a simple test image
    console.log('No test images found, creating a simple test image');
    
    // Create a simple test image with sharp
    const { default: sharp } = await import('sharp');
    
    const testImagePath = path.join(uploadsDir, `test-image-${Date.now()}.png`);
    
    // Create a simple colored square
    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: { r: 255, g: 200, b: 100, alpha: 1 }
      }
    })
    .png()
    .toFile(testImagePath);
    
    console.log(`Created test image at ${testImagePath}`);
    return testImagePath;
  } catch (error) {
    console.error('Error finding test image:', error);
    throw error;
  }
}

/**
 * Main test function for image transformation
 */
async function testTransformation() {
  try {
    console.log('Running test for the fixed image transformation...');
    
    // Import the transformImage function from the updated module
    const { transformImage } = await import('./server/openai-final.js');
    
    // Find a test image
    const testImagePath = await findTestImage();
    console.log(`Using test image: ${testImagePath}`);
    
    // Create a test prompt
    const testPrompt = "Transform this image into a fantasy scene with magical elements, vibrant colors, and whimsical details";
    
    console.log(`Starting transformation with prompt: "${testPrompt}"`);
    
    // Call the transformation function
    const result = await transformImage(testImagePath, testPrompt);
    
    console.log('Transformation completed successfully!');
    console.log(`First transformed image saved to: ${result.transformedPath}`);
    
    if (result.secondTransformedPath) {
      console.log(`Second transformed image saved to: ${result.secondTransformedPath}`);
    }
    
    return {
      success: true,
      testImagePath,
      transformedPath: result.transformedPath,
      secondTransformedPath: result.secondTransformedPath
    };
  } catch (error) {
    console.error('Error in test:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
console.log('Starting OpenAI transformation test...');
testTransformation()
  .then(result => {
    if (result.success) {
      console.log('Test completed successfully!');
      console.log(`Original image: ${result.testImagePath}`);
      console.log(`Transformed image: ${result.transformedPath}`);
    } else {
      console.error('Test failed:', result.error);
    }
  })
  .catch(error => {
    console.error('Unexpected error during test:', error);
  });