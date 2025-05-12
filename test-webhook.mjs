import axios from 'axios';

async function testWebhook() {
  try {
    console.log('Testing webhook connection...');
    const response = await axios.post('https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9', {
      action: 'test',
      requestId: `test-${Date.now()}`
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'Test Script'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response body:', response.data);
  } catch (error) {
    console.error('Error connecting to webhook:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

testWebhook();