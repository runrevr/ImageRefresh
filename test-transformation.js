/**
 * Direct test script for the gpt-image-1 transformation
 * This bypasses the complex server code to directly test our implementation
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// CommonJS modules
const transformModule = require('./server/transform-image.cjs');

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Main test function
async function runTransformTest() {
  console.log("Starting direct test of image transformation with gpt-image-1...");
  
  // Find a test image
  const testImagePath = await findTestImage();
  
  if (!testImagePath) {
    console.error("No test image found in uploads directory");
    return;
  }
  
  console.log(`Found test image: ${testImagePath}`);
  
  // Test prompt
  const testPrompt = "Transform this image into a vibrant watercolor painting with bright, flowing colors and artistic style";
  
  try {
    console.log(`Applying transformation with prompt: "${testPrompt}"`);
    
    // Use our direct implementation
    const result = await transformModule.transformImage(testImagePath, testPrompt);
    
    console.log("Transformation successful!");
    console.log(`First transformed image: ${result.transformedPath}`);
    console.log(`Second transformed image: ${result.secondTransformedPath || "None"}`);
    
    return result;
  } catch (error) {
    console.error("Error in transformation test:", error.message);
    if (error.response) {
      console.error("API Error Response:", error.response.status);
      console.error("Error data:", error.response.data);
    }
  }
}

// Find a test image in the uploads directory
async function findTestImage() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  // Check if uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    console.error(`Uploads directory not found at ${uploadsDir}`);
    return null;
  }
  
  // Get all files in the uploads directory
  const files = fs.readdirSync(uploadsDir);
  
  // Find image files
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });
  
  if (imageFiles.length === 0) {
    console.error("No image files found in uploads directory");
    return null;
  }
  
  // Pick the first image
  return path.join(uploadsDir, imageFiles[0]);
}

// Run the test
runTransformTest()
  .then(result => {
    if (result) {
      console.log("Test completed successfully!");
    } else {
      console.log("Test failed, see errors above.");
    }
  })
  .catch(err => {
    console.error("Unhandled error in test:", err);
  });