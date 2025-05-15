// CommonJS module for testing OpenAI connection
const { OpenAI } = require('openai');
require('dotenv').config();

async function testOpenAIConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Error: OPENAI_API_KEY environment variable is not set');
      return false;
    }
    
    console.log('API key is set. Attempting to connect to OpenAI API...');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey,
    });
    
    // Test with a simple API call to avoid rate limits
    const models = await openai.models.list();
    
    console.log('Successfully connected to OpenAI API!');
    console.log(`Available models: ${models.data.length} models found`);
    console.log('First few models:');
    models.data.slice(0, 3).forEach(model => {
      console.log(`- ${model.id}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error connecting to OpenAI API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Run the test immediately if this file is executed directly
if (require.main === module) {
  testOpenAIConnection()
    .then(success => {
      console.log(`Test ${success ? 'passed ✅' : 'failed ❌'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
}

module.exports = { testOpenAIConnection };