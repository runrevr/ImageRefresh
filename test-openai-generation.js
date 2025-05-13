// Test script for OpenAI image generation
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Setup OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testImageGeneration() {
  console.log('Testing OpenAI image generation...');
  
  try {
    // Test image generation with a simple prompt
    console.log('Calling OpenAI image generation API...');
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "A cute cat playing with a ball of yarn",
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    console.log('Generation successful!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    if (response.data && response.data.length > 0 && response.data[0].url) {
      console.log('Image URL:', response.data[0].url);
      console.log('Test passed ✅');
    } else {
      console.log('No image URL returned');
      console.log('Test failed ❌');
    }
  } catch (error) {
    console.error('Error during OpenAI test:', error);
    if (error.response) {
      console.error('OpenAI API response error:', error.response.data);
    }
    console.log('Test failed ❌');
  }
}

// Run the test
testImageGeneration();