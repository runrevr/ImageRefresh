/**
 * Simple test to verify OpenAI and Anthropic API connections
 */
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

async function testOpenAIConnection() {
  try {
    console.log('🔍 Testing OpenAI API connection...');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Test basic chat completion first
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello! Just testing the connection." }],
      max_tokens: 10,
    });

    console.log('✅ OpenAI API working!');
    console.log('Response:', response.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    return false;
  }
}

async function testAnthropicConnection() {
  try {
    console.log('🔍 Testing Anthropic API connection...');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Test basic message
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "Hello! Just testing the connection." }]
    });

    console.log('✅ Anthropic API working!');
    console.log('Response:', response.content[0].text);
    return true;
  } catch (error) {
    console.error('❌ Anthropic API Error:', error.message);
    console.error('Error details:', error.response?.data || error);
    return false;
  }
}

async function runAPITests() {
  console.log('🚀 Starting API Connection Tests...\n');
  
  const openaiWorks = await testOpenAIConnection();
  console.log('');
  const anthropicWorks = await testAnthropicConnection();
  
  console.log('\n📊 Test Results:');
  console.log(`OpenAI: ${openaiWorks ? '✅ Working' : '❌ Failed'}`);
  console.log(`Anthropic: ${anthropicWorks ? '✅ Working' : '❌ Failed'}`);
  
  if (openaiWorks && anthropicWorks) {
    console.log('\n🎉 Both APIs are working! Your AI platform should work perfectly.');
  } else {
    console.log('\n🔧 Some APIs need attention. Check the error messages above.');
  }
}

// Run the tests
runAPITests().catch(console.error);