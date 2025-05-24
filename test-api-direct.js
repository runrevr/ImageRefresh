/**
 * Direct API test to verify backend is working
 */

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test edit prompt generation
    const promptResponse = await fetch('/api/generate-edit-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea_title: 'Test Enhancement',
        idea_description: 'A simple test to verify the API works',
        is_chaos_concept: false
      })
    });
    
    console.log('Prompt API response status:', promptResponse.status);
    console.log('Response headers:', [...promptResponse.headers.entries()]);
    
    const responseText = await promptResponse.text();
    console.log('Raw response:', responseText.substring(0, 500));
    
    if (responseText.startsWith('{')) {
      const jsonResponse = JSON.parse(responseText);
      console.log('JSON response:', jsonResponse);
      
      if (jsonResponse.edit_prompt) {
        console.log('✅ API is working! Edit prompt:', jsonResponse.edit_prompt);
        return jsonResponse.edit_prompt;
      }
    } else {
      console.log('❌ API returned HTML instead of JSON');
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test
testAPI();