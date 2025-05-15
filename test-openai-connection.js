// ESM module for testing OpenAI connection
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API connection...');
    
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      process.exit(1);
    }
    
    console.log('API key is set. Attempting to connect to OpenAI API...');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
    });
    
    // Make a simple chat completion request
    // Note: The newest OpenAI model is "gpt-4o" which was released May 13, 2024
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello, world!" }],
      max_tokens: 5,
    });
    
    console.log('Successfully connected to OpenAI API!');
    console.log('Response:', chatCompletion.choices[0]?.message.content || 'No response text');
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to OpenAI API:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testOpenAI();