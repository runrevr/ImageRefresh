// Test script for image transformation API (CommonJS version)
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Search uploads directory for a test image
async function findTestImage() {
  console.log("Finding a test image in the uploads directory...");
  const uploadsDir = 'uploads';
  
  try {
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log("Uploads directory not found. Using a sample from attached assets...");
      return path.join('attached_assets', 'ImageRefresh.com.png');
    }
    
    // List files in the uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log("No images found in uploads. Using a sample from attached assets...");
      return path.join('attached_assets', 'ImageRefresh.com.png');
    }
    
    // Use the first image found
    const testImagePath = path.join(uploadsDir, imageFiles[0]);
    console.log(`Found test image: ${testImagePath}`);
    return testImagePath;
  } catch (error) {
    console.error("Error finding test image:", error);
    console.log("Using a sample from attached assets...");
    return path.join('attached_assets', 'ImageRefresh.com.png');
  }
}

// Convert image file to base64
function imageToBase64(filePath) {
  try {
    // Read the file as buffer
    const buffer = fs.readFileSync(filePath);
    // Convert buffer to base64 string
    return buffer.toString('base64');
  } catch (error) {
    console.error(`Error converting image to base64: ${error.message}`);
    throw error;
  }
}

// Test the transformation function
async function testTransformation() {
  console.log("\n===== Testing Image Transformation =====");
  
  try {
    // Find a test image
    const imagePath = await findTestImage();
    console.log(`Using test image: ${imagePath}`);
    
    // Convert image to base64
    const base64Image = imageToBase64(imagePath);
    console.log(`Image converted to base64 (${base64Image.substring(0, 20)}...)`);
    
    // First step: analyze the image with vision model
    console.log("Step 1: Analyzing image with vision model...");
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for transformation with the following style: cartoon style"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 500,
    });
    
    const analysis = visionResponse.choices[0].message.content || "";
    console.log("Image analysis:", analysis.substring(0, 150) + "...");
    
    // Second step: generate transformed image
    console.log("Step 2: Generating transformed image based on analysis...");
    const enhancedPrompt = `Based on this image analysis: ${analysis}. 
                           Create a transformed version in cartoon style.`;
    
    const generationResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    const imageUrl = generationResponse.data?.[0]?.url || "";
    console.log("Transformed image URL:", imageUrl);
    
    return true;
  } catch (error) {
    console.error("Image transformation test failed:", error.message);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    return false;
  }
}

// Run the test
(async () => {
  console.log("===== Starting OpenAI Image Transformation Test =====");
  console.log("API Key:", process.env.OPENAI_API_KEY ? "Present (starts with " + process.env.OPENAI_API_KEY.substring(0, 3) + "...)" : "Missing!");
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: No OpenAI API key found. Make sure OPENAI_API_KEY is set in your environment variables.");
    return;
  }
  
  const success = await testTransformation();
  
  if (success) {
    console.log("\n✅ Image transformation test PASSED!");
  } else {
    console.log("\n❌ Image transformation test FAILED!");
  }
})().catch(error => {
  console.error("Test execution failed:", error);
});