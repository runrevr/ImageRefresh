
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function detailedOpenAITest() {
  console.log("=== DETAILED OPENAI API DEBUG TEST ===\n");
  
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in environment");
    return;
  }
  
  console.log("✅ API Key found, length:", process.env.OPENAI_API_KEY.length);
  
  // Find test image
  const testImagePath = path.join(__dirname, 'uploads', 'images-1748299014587-619687295.png');
  
  if (!fs.existsSync(testImagePath)) {
    console.error("❌ Test image not found at:", testImagePath);
    return;
  }
  
  console.log("✅ Test image found:", testImagePath);
  
  // Get image stats
  const stats = fs.statSync(testImagePath);
  console.log("📊 Image size:", stats.size, "bytes");
  console.log("📊 Image size (MB):", (stats.size / 1024 / 1024).toFixed(2));
  
  try {
    // Create form data
    console.log("\n=== CREATING FORM DATA ===");
    const form = new FormData();
    
    // Add image file
    const imageStream = fs.createReadStream(testImagePath);
    form.append('image', imageStream, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    // Add other required fields
    form.append('prompt', 'Make this image look more professional and vibrant');
    form.append('n', '1');
    form.append('size', '1024x1024');
    
    console.log("✅ Form data created with fields:");
    console.log("   - image: test-image.png (image/png)");
    console.log("   - prompt: Make this image look more professional and vibrant");
    console.log("   - n: 1");
    console.log("   - size: 1024x1024");
    
    // Get form headers
    const headers = form.getHeaders();
    console.log("\n=== FORM HEADERS ===");
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    console.log("\n=== SENDING REQUEST TO OPENAI ===");
    console.log("Endpoint: https://api.openai.com/v1/images/edits");
    console.log("Method: POST");
    console.log("Timeout: 60 seconds");
    
    const startTime = Date.now();
    
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...headers
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        validateStatus: () => true // Don't throw on non-2xx status codes
      }
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n=== RESPONSE RECEIVED (${duration}ms) ===`);
    console.log("Status Code:", response.status);
    console.log("Status Text:", response.statusText);
    
    // Log response headers
    console.log("\n=== RESPONSE HEADERS ===");
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    
    // Log response data in detail
    console.log("\n=== RESPONSE DATA ===");
    console.log("Type:", typeof response.data);
    console.log("Raw response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 200) {
      console.log("\n✅ SUCCESS!");
      if (response.data?.data?.[0]?.url) {
        console.log("🖼️ Generated image URL:", response.data.data[0].url);
      }
    } else {
      console.log("\n❌ ERROR RESPONSE DETAILS:");
      
      if (response.data?.error) {
        console.log("Error object:", JSON.stringify(response.data.error, null, 2));
        console.log("Error type:", response.data.error.type);
        console.log("Error code:", response.data.error.code);
        console.log("Error message:", response.data.error.message);
        
        if (response.data.error.param) {
          console.log("Error parameter:", response.data.error.param);
        }
      }
      
      // Check for specific error patterns
      const responseText = JSON.stringify(response.data);
      
      if (responseText.includes('multipart')) {
        console.log("\n🔍 MULTIPART ERROR DETECTED");
        console.log("This suggests an issue with form data encoding");
      }
      
      if (responseText.includes('content-type')) {
        console.log("\n🔍 CONTENT-TYPE ERROR DETECTED");
        console.log("This suggests an issue with MIME type or headers");
      }
      
      if (responseText.includes('size')) {
        console.log("\n🔍 SIZE ERROR DETECTED");
        console.log("Image might be too large or wrong dimensions");
      }
      
      if (responseText.includes('format')) {
        console.log("\n🔍 FORMAT ERROR DETECTED");
        console.log("Image format might not be supported");
      }
    }
    
  } catch (error) {
    console.log("\n💥 REQUEST FAILED WITH EXCEPTION:");
    console.log("Error type:", error.constructor.name);
    console.log("Error message:", error.message);
    
    if (error.code) {
      console.log("Error code:", error.code);
    }
    
    if (error.response) {
      console.log("\n=== ERROR RESPONSE DETAILS ===");
      console.log("Status:", error.response.status);
      console.log("Status Text:", error.response.statusText);
      console.log("Headers:", JSON.stringify(error.response.headers, null, 2));
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
      
      // Additional error analysis
      if (error.response.status === 400) {
        console.log("\n🔍 400 BAD REQUEST ANALYSIS:");
        console.log("This usually means:");
        console.log("1. Invalid request format (multipart/form-data issue)");
        console.log("2. Missing required fields");
        console.log("3. Invalid field values");
        console.log("4. Image format/size issues");
      }
      
      if (error.response.status === 401) {
        console.log("\n🔍 401 UNAUTHORIZED - Check API key");
      }
      
      if (error.response.status === 429) {
        console.log("\n🔍 429 RATE LIMITED - Too many requests");
      }
      
      if (error.response.status === 413) {
        console.log("\n🔍 413 PAYLOAD TOO LARGE - Image is too big");
      }
      
    } else if (error.request) {
      console.log("\n=== NETWORK ERROR ===");
      console.log("No response received from server");
      console.log("Request details:", error.request);
    }
    
    console.log("\n=== FULL ERROR STACK ===");
    console.log(error.stack);
  }
  
  console.log("\n=== TEST COMPLETE ===");
}

// Run the test
detailedOpenAITest().catch(console.error);
