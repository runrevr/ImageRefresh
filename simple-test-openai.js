// Simple OpenAI test script with better error handling
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Robust initialization with error checking
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('ERROR: No OpenAI API key found in environment variables.');
    console.error('Make sure to set the OPENAI_API_KEY environment variable.');
    return null;
  }
  
  try {
    return new OpenAI({ apiKey });
  } catch (error) {
    console.error('ERROR: Failed to initialize OpenAI client:', error.message);
    return null;
  }
}

// Test basic chat functionality
async function testBasicChat(openai) {
  console.log('\n===== Testing Basic Chat Completion =====');
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that responds in a concise manner."
        },
        { 
          role: "user", 
          content: "What is today's date? Please respond in just one sentence."
        }
      ],
      max_tokens: 60, // Keep response short
    });
    
    const content = response.choices[0].message.content;
    console.log("Chat response:", content);
    return { success: true, content };
  } catch (error) {
    console.error('ERROR in chat completion:', error.message);
    if (error.response) {
      console.error('Response error details:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Main function with proper error handling
async function runTest() {
  console.log('===== OpenAI Integration Test =====');
  console.log('Testing connection and basic functionality...');
  
  // Initialize OpenAI with error checking
  const openai = initializeOpenAI();
  if (!openai) {
    console.error('Failed to initialize OpenAI client. Exiting test.');
    return;
  }
  
  try {
    // Test chat completion
    const chatResult = await testBasicChat(openai);
    
    // Log final results
    console.log('\n===== Test Results =====');
    console.log('Chat test:', chatResult.success ? '✅ PASSED' : '❌ FAILED');
    
    if (chatResult.success) {
      console.log('\n🎉 Basic OpenAI integration test passed!');
    } else {
      console.log('\n❌ OpenAI integration test failed. Check error messages above.');
    }
  } catch (error) {
    console.error('\n❌ Unexpected error during testing:', error);
  }
}

// Run the test with global error handling
runTest().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});