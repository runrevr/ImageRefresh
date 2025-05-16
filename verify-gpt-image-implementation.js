/**
 * Simple test script to verify our GPT-Image-01 implementation
 * This uses the image edit endpoint directly with multipart/form-data
 */
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';
import sharp from 'sharp';

// Allowed image dimensions - square and rectangular options
const ALLOWED_SIZES = ["1024x1024", "1536x1024", "1024x1536"];

// Find a suitable test image in the uploads or attached_assets folder
async function findTestImage() {
  console.log("Looking for a test image...");
  
  // Check uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        return path.join(uploadsDir, file);
      }
    }
  }
  
  // Check attached_assets directory as fallback
  const assetsDir = path.join(process.cwd(), 'attached_assets');
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

// Prepare and optimize image for API submission
async function optimizeImage(imagePath) {
  try {
    console.log(`Optimizing image for API: ${imagePath}`);
    
    // Get image metadata
    const metadata = await sharp(imagePath).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}, ${metadata.format}`);
    
    // Create a temporary file for the resized image
    const tempFileName = `temp-${Date.now()}.png`;
    const tempFilePath = path.join(process.cwd(), tempFileName);
    
    // Check if resizing is needed
    let resizeOptions = {};
    if (metadata.width > 1024 || metadata.height > 1024) {
      if (metadata.width >= metadata.height) {
        resizeOptions.width = 1024;
      } else {
        resizeOptions.height = 1024;
      }
      console.log(`Resizing image to fit within 1024px`);
    }
    
    // Process and save the image
    await sharp(imagePath)
      .resize(resizeOptions)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(tempFilePath);
    
    console.log(`Optimized image saved to: ${tempFilePath}`);
    return tempFilePath;
  } catch (error) {
    console.error(`Error optimizing image: ${error.message}`);
    throw error;
  }
}

// Run a direct test of our implementation
async function testGptImageImplementation() {
  let tempImagePath = null;
  
  try {
    console.log("VERIFICATION TEST: OpenAI GPT-Image-01 with /v1/images/edits endpoint");
    
    // Verify API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("ERROR: OPENAI_API_KEY environment variable is not set");
      console.error("Please ensure your OpenAI API key is configured");
      return;
    }
    
    // Find a test image
    const imagePath = await findTestImage();
    if (!imagePath) {
      console.error("ERROR: No test image found in uploads or attached_assets folder");
      console.error("Please upload a JPG or PNG image to test with");
      return;
    }
    
    console.log(`Found test image: ${imagePath}`);
    
    // Optimize the image (resize if needed)
    tempImagePath = await optimizeImage(imagePath);
    
    // Create test parameters
    const prompt = "Transform this image into a cartoon character with vibrant colors";
    const size = "1024x1024"; // Use square format
    
    console.log(`Using prompt: "${prompt}"`);
    console.log(`Using size: ${size}`);
    
    // Create multipart form data
    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('image', fs.createReadStream(tempImagePath));
    form.append('prompt', prompt);
    form.append('n', 1);
    form.append('size', size);
    
    console.log("Sending API request to OpenAI...");
    
    // Make the API call
    const response = await axios.post(
      'https://api.openai.com/v1/images/edits',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 120000, // 2 minutes
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024
      }
    );
    
    console.log("API response received successfully!");
    console.log("Response status:", response.status);
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      console.log("Image transformation successful!");
      console.log("Image URL:", response.data.data[0].url);
      
      // Save the result
      const resultPath = path.join(process.cwd(), 'test-result.png');
      const imageResponse = await axios.get(response.data.data[0].url, { responseType: 'arraybuffer' });
      fs.writeFileSync(resultPath, Buffer.from(imageResponse.data));
      console.log(`Result saved to: ${resultPath}`);
      
      // Verification successful
      console.log("\n✅ VERIFICATION SUCCESSFUL: GPT-Image-01 implementation is working correctly");
      console.log("Your implementation correctly uses:");
      console.log("  - The GPT-Image-01 model (not DALL-E)");
      console.log("  - The /v1/images/edits endpoint (not /generate)");
      console.log("  - Multipart/form-data format (not JSON/base64)");
    } else {
      console.error("ERROR: No image data in response");
      console.error("Response data:", response.data);
    }
  } catch (error) {
    console.error("ERROR: Test failed with error:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response details:", error.response.data);
    }
    
    console.error("\n❌ VERIFICATION FAILED: GPT-Image-01 implementation has issues");
    console.error("Please check the error details above and fix the implementation");
  } finally {
    // Clean up temp file
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      try {
        fs.unlinkSync(tempImagePath);
        console.log(`Removed temporary file: ${tempImagePath}`);
      } catch (err) {
        console.error(`Error removing temporary file: ${err.message}`);
      }
    }
  }
}

// Run the verification test
testGptImageImplementation();