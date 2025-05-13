// Debug script to monitor transformation progress
// Run with: node debug-transformation.js

import fs from 'fs';
import path from 'path';

// File to store logs
const logFile = path.join(process.cwd(), 'transformation-debug.log');

// Clear any previous logs
fs.writeFileSync(logFile, `Transformation debugging started at ${new Date().toISOString()}\n\n`);

function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  console.log(formattedMessage);
  fs.appendFileSync(logFile, formattedMessage);
}

// Add debug logging to transformations
import { transformImageWithOpenAI } from './server/openai-image.js';

// Debug wrapper for the transform function
async function debugTransform(imagePath, prompt) {
  log(`Starting transformation debug test with prompt: ${prompt}`);
  log(`Image path: ${imagePath}`);
  
  try {
    const result = await transformImageWithOpenAI(imagePath, prompt);
    log(`Transformation successful! Result: ${result}`);
    return result;
  } catch (error) {
    log(`Transformation failed with error: ${error.message}`);
    if (error.response) {
      log(`API error details: ${JSON.stringify(error.response.data || {})}`);
    }
    throw error;
  }
}

// Simple test with a local image (if available)
async function runTest() {
  log('Starting transformation debug test');
  
  // Find a sample image in the uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file) && 
      !file.includes('transformed')
    );
    
    if (imageFiles.length === 0) {
      log('No image files found in uploads directory');
      return;
    }
    
    // Use the most recent image file
    const testImageFile = imageFiles[0];
    const testImagePath = `uploads/${testImageFile}`;
    
    log(`Found test image: ${testImagePath}`);
    
    // Run the transformation
    const testPrompt = "Transform this image into a colorful cartoon style";
    
    try {
      const result = await debugTransform(testImagePath, testPrompt);
      log(`Test completed successfully with result: ${result}`);
    } catch (error) {
      log(`Test failed: ${error.message}`);
    }
  } catch (error) {
    log(`Error during test: ${error.message}`);
  }
}

// Run the test
runTest().then(() => {
  log('Debug test completed');
}).catch(error => {
  log(`Unhandled error in test: ${error.message}`);
});