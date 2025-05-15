// Simple script to test OpenAI API connection and functionality
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test basic chat completion
async function testChatCompletion() {
  console.log("\n===== Testing Chat Completion =====");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: "Hello! Can you tell me what model you are?",
        },
      ],
    });
    
    console.log("Chat response:", response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("Chat completion test failed:", error.message);
    console.error("Full error:", error);
    return false;
  }
}

// Test the DALL-E image generation
async function testImageGeneration() {
  console.log("\n===== Testing Image Generation =====");
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A simple test image of a cute cartoon robot holding a sign that says 'Hello World'",
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    
    console.log("Image URL:", response.data[0].url);
    return true;
  } catch (error) {
    console.error("Image generation test failed:", error.message);
    console.error("Full error:", error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log("===== Starting OpenAI API Tests =====");
  console.log("API Key:", process.env.OPENAI_API_KEY ? "Present (starts with " + process.env.OPENAI_API_KEY.substring(0, 3) + "...)" : "Missing!");
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("ERROR: No OpenAI API key found. Make sure OPENAI_API_KEY is set in your environment variables.");
    return;
  }
  
  let results = {
    chatTest: false,
    imageTest: false
  };
  
  // Run the chat test
  results.chatTest = await testChatCompletion();
  
  // Run the image generation test
  results.imageTest = await testImageGeneration();
  
  // Summary
  console.log("\n===== Test Results Summary =====");
  console.log("Chat Completion Test:", results.chatTest ? "✅ PASSED" : "❌ FAILED");
  console.log("Image Generation Test:", results.imageTest ? "✅ PASSED" : "❌ FAILED");
  
  if (results.chatTest && results.imageTest) {
    console.log("\n🎉 All tests passed! Your OpenAI integration is working correctly.");
  } else {
    console.log("\n⚠️ Some tests failed. Check the error messages above for details.");
  }
}

// Execute the tests
runTests().catch(error => {
  console.error("Test execution failed:", error);
});