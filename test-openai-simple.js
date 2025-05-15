// Simple OpenAI test script
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to test text generation
async function testText() {
  try {
    console.log('Testing OpenAI text generation...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello, can you give me a short greeting?" }
      ],
    });

    console.log('Text API Response:');
    console.log(completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('Error testing text generation:', error);
    return false;
  }
}

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
  
  // If no image found in uploads, check if there's any in attached_assets
  if (!testImagePath) {
    const assetsDir = path.join(__dirname, 'attached_assets');
    try {
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            testImagePath = path.join(assetsDir, file);
            break;
          }
        }
      }
    } catch (err) {
      console.error('Error looking for test image in assets:', err);
    }
  }
  
  return testImagePath;
}

// Main function to run all tests
async function runTests() {
  console.log('Starting OpenAI connection test...');
  
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in the environment');
    return;
  }
  
  console.log('API key is set');
  
  // Test text generation
  const textSuccess = await testText();
  if (!textSuccess) {
    console.error('Text generation test failed');
    return;
  }
  
  console.log('Text generation test successful');
  
  // Find a test image 
  console.log('Looking for a test image...');
  const testImagePath = await findTestImage();
  
  if (!testImagePath) {
    console.error('No test image found. Please upload an image to the uploads or attached_assets folder');
    return;
  }
  
  console.log(`Found test image: ${testImagePath}`);
  console.log('All tests completed successfully!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed with error:', error);
});