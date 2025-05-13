// Test file to check OpenAI API key configuration
import 'dotenv/config';

console.log("==== OpenAI API Key Diagnostic Test ====");

const apiKey = process.env.OPENAI_API_KEY;

console.log(`API Key exists: ${!!apiKey}`);

if (apiKey) {
  console.log(`API Key format check (starts with 'sk-'): ${apiKey.startsWith('sk-')}`);
  console.log(`API Key length: ${apiKey.length}`);
  console.log(`API Key prefix: ${apiKey.substring(0, 5)}`);
  console.log(`API Key suffix: ${apiKey.substring(apiKey.length - 4)}`);
  
  // Basic validation
  if (apiKey.startsWith('sk-') && apiKey.length > 20) {
    console.log("✓ API Key appears to be properly formatted");
  } else {
    console.log("✗ API Key does not appear to be properly formatted");
    console.log("  - OpenAI API keys should start with 'sk-'");
    console.log("  - Keys are typically ~50 characters long");
  }
}

console.log("\nIf the key looks properly formatted but you're still having issues:");
console.log("1. Check if the key is active in your OpenAI account");
console.log("2. Verify that you have sufficient credits in your OpenAI account");
console.log("3. Make sure you're not hitting any rate limits");