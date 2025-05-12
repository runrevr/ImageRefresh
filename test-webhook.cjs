const fetch = require('node-fetch');

async function testWebhook() {
  try {
    console.log('Testing webhook connection...');
    const response = await fetch('https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'Test Script'
      },
      body: JSON.stringify({
        action: 'test',
        requestId: `test-${Date.now()}`
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const text = await response.text();
    console.log('Response body:', text);
  } catch (error) {
    console.error('Error connecting to webhook:', error.message);
    if (error.response) {
      console.error('Error response:', error.response);
    }
  }
}

testWebhook();