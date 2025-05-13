// Simple test script to verify OpenAI API functionality
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

async function testOpenAI() {
  console.log("Testing OpenAI API connection...");
  
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables!");
      return;
    }
    
    console.log("API key found, attempting connection...");
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Make a simple completion request
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { 
          role: "user", 
          content: "Hello, I'm testing the OpenAI API connection from ImageRefresh. Please respond with 'Connection successful!'" 
        }
      ],
      max_tokens: 20
    });
    
    console.log("OpenAI Response:", response.choices[0].message.content);
    console.log("Test completed successfully!");
    
  } catch (error) {
    console.error("Error testing OpenAI API:", error.message);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
  }
}

// Run the test
testOpenAI().catch(err => {
  console.error("Unhandled error in test:", err);
});