
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config();

async function testWithSimpleImage() {
  console.log("=== TESTING WITH KNOWN-GOOD IMAGE FORMAT ===\n");
  
  try {
    // Create a simple, solid-color 1024x1024 PNG image
    const testImagePath = path.join(__dirname, 'test-solid-image.png');
    
    console.log("Creating a simple 1024x1024 solid color PNG...");
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 3, // RGB only, no alpha
        background: { r: 128, g: 128, b: 255 } // Light blue
      }
    })
    .png({ compressionLevel: 0 }) // No compression
    .toFile(testImagePath);
    
    const stats = fs.statSync(testImagePath);
    console.log(`✅ Created test image: ${testImagePath}`);
    console.log(`📊 Image size: ${stats.size} bytes`);
    
    // Test 1: Try with dall-e-2 (the standard model for edits)
    console.log("\n=== TEST 1: Using dall-e-2 model ===");
    await testImageEdit(testImagePath, 'dall-e-2');
    
    // Test 2: Try without specifying model (let OpenAI default)
    console.log("\n=== TEST 2: Using default model (no model specified) ===");
    await testImageEdit(testImagePath, null);
    
    // Test 3: Try with the exact same image but as JPEG
    console.log("\n=== TEST 3: Converting to JPEG format ===");
    const jpegPath = path.join(__dirname, 'test-solid-image.jpg');
    await sharp(testImagePath)
      .jpeg({ quality: 95 })
      .toFile(jpegPath);
    
    await testImageEdit(jpegPath, 'dall-e-2');
    
    // Cleanup
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    if (fs.existsSync(jpegPath)) fs.unlinkSync(jpegPath);
    
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

async function testImageEdit(imagePath, model) {
  try {
    const form = new FormData();
    
    // Add image
    form.append('image', fs.createReadStream(imagePath), {
      filename: path.basename(imagePath),
      contentType: imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg'
    });
    
    // Add parameters
    form.append('prompt', 'Add a bright sun in the sky');
    form.append('n', '1');
    form.append('size', '1024x1024');
    
    // Only add model if specified
    if (model) {
      form.append('model', model);
    }
    
    console.log(`Sending request with${model ? ` model: ${model}` : ' default model'}...`);
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders()
        },
        timeout: 60000,
        validateStatus: () => true
      }
    );
    
    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 && response.data?.data?.[0]?.url) {
      console.log("✅ SUCCESS! Image edit worked.");
      console.log(`🖼️ Generated URL: ${response.data.data[0].url}`);
      return true;
    } else {
      console.log("❌ Failed:");
      console.log(JSON.stringify(response.data, null, 2));
      return false;
    }
    
  } catch (error) {
    console.log("❌ Request failed:", error.message);
    return false;
  }
}

// Run the test
testWithSimpleImage().catch(console.error);
