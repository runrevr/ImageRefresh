/**
 * Test script for image transformation with gpt-image-1 model
 * This uses the exact pattern specified by the user
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformWithGptImage } from './server/openai-base64-direct.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_PROMPT = "Transform this image into a cartoon character with vibrant colors";

// Function to find a test image
async function findTestImage() {
  console.log("Looking for a test image...");
  
  // Check uploads directory
  const uploadsDir = path.join(__dirname, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return path.join(uploadsDir, file);
      }
    }
  }
  
  // Check attached_assets directory
  const assetsDir = path.join(__dirname, 'attached_assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return path.join(assetsDir, file);
      }
    }
  }
  
  return null;
}

// Main test function
async function testTransformation() {
  try {
    console.log("Starting image transformation test with gpt-image-1");
    
    // Find a test image
    const imagePath = await findTestImage();
    if (!imagePath) {
      console.error("No test image found");
      return;
    }
    
    console.log(`Found test image: ${imagePath}`);
    console.log(`Applying transformation with prompt: "${TEST_PROMPT}"`);
    
    // Transform the image using gpt-image-1 model
    const result = await transformWithGptImage(imagePath, TEST_PROMPT);
    
    console.log("Transformation successful!");
    console.log(`Original image: ${imagePath}`);
    console.log(`Transformed image: ${result.transformedPath}`);
    console.log(`Second transformed image: ${result.secondTransformedPath}`);
    console.log(`Image URL: ${result.url}`);
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the test
testTransformation();