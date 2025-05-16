/**
 * Test script for OpenAI image transformation with MIME type handling
 * This verifies that the correct MIME types are being sent to the OpenAI API
 */
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

// Get current file directory (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our OpenAI implementation with MIME type handling 
import { transformImageWithMime } from './server/openai-with-mime.js';

// Test prompt
const TEST_PROMPT = "Transform this image into a colorful cartoon version";

/**
 * Find a test image in the uploads directory
 */
async function findTestImage() {
  console.log('Looking for a test image...');
  
  // Look in the uploads directory first
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const mimeType = mime.lookup(filePath);
      
      // Check if it's a supported image type (png, jpeg, webp)
      if (mimeType && ['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
        console.log(`Found test image: ${filePath} (${mimeType})`);
        return filePath;
      }
    }
  }
  
  // If no suitable image is found in uploads, check attached_assets
  const assetsDir = path.join(process.cwd(), 'attached_assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    for (const file of files) {
      const filePath = path.join(assetsDir, file);
      const mimeType = mime.lookup(filePath);
      
      // Check if it's a supported image type (png, jpeg, webp)
      if (mimeType && ['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
        console.log(`Found test image: ${filePath} (${mimeType})`);
        return filePath;
      }
    }
  }
  
  console.log('No suitable test image found');
  return null;
}

/**
 * Main test function
 */
async function runTest() {
  try {
    console.log('Starting OpenAI image transformation test with MIME type handling');
    
    // Find a test image
    const testImagePath = await findTestImage();
    if (!testImagePath) {
      console.error('Error: No suitable test image found');
      return;
    }
    
    // Check the MIME type of the test image
    const detectedMime = mime.lookup(testImagePath);
    console.log(`Test image MIME type: ${detectedMime}`);
    
    // Attempt to transform the image
    console.log(`Transforming image with prompt: "${TEST_PROMPT}"`);
    const result = await transformImageWithMime(testImagePath, TEST_PROMPT);
    
    // Log the result
    console.log('Transformation successful!');
    console.log(`Original image: ${testImagePath}`);
    console.log(`Transformed image: ${result.transformedPath}`);
    console.log(`Image URL: ${result.url}`);
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
runTest();