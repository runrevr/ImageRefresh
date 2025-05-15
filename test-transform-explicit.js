// Test script for image transformation
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to find a test image
async function findTestImage() {
  const uploadsDir = path.join(__dirname, 'uploads');
  let testImagePath = null;
  
  try {
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      
      // Find the first image file
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          testImagePath = path.join(uploadsDir, file);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error looking for test image:', err);
  }
  
  return testImagePath;
}

// Function to convert an image to base64
function imageToBase64(filePath) {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString('base64');
}

// Function to test image transformation
async function testTransformation() {
  try {
    // Find a test image
    const testImagePath = await findTestImage();
    if (!testImagePath) {
      console.error('No test image found');
      return;
    }
    
    console.log(`Using test image: ${testImagePath}`);
    
    // Convert image to base64
    const imageBase64 = imageToBase64(testImagePath);
    console.log('Image converted to base64');
    
    // Create a transformation prompt
    const prompt = "Transform this image into a cartoon style";
    console.log(`Using prompt: "${prompt}"`);
    
    // Call OpenAI API to transform the image
    console.log('Calling OpenAI API to transform the image...');
    const response = await openai.images.edit({
      model: "dall-e-2",
      image: Buffer.from(imageBase64, 'base64'),
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    
    console.log('Raw API response:');
    console.log(JSON.stringify(response, null, 2));
    
    // Extract the image URL from the response
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      console.error('No image URL found in API response');
      return;
    }
    
    console.log(`Transformed image URL: ${imageUrl}`);
    
    // Download the transformed image
    const outputDir = path.join(__dirname, 'transformed');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, `transformed-${Date.now()}.png`);
    console.log(`Downloading transformed image to: ${outputPath}`);
    
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    const fileStream = createWriteStream(outputPath);
    await pipeline(imageResponse.body, fileStream);
    
    console.log('Image download complete');
    console.log('Transformation test completed successfully!');
    console.log(`Transformed image saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error in transformation test:', error);
    return null;
  }
}

// Run the test
testTransformation().catch(error => {
  console.error('Test failed with error:', error);
});