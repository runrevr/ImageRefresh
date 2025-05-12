import axios from 'axios';

async function testWebhook() {
  try {
    console.log('Testing webhook connection...');
    
    // Creating a more complete test payload that matches our real implementation
    const testPayload = {
      action: 'processImages',
      requestId: `test-${Date.now()}`,
      industry: 'hair care',
      images: [
        {
          id: 1,
          data: 'test-image-data-placeholder' // Not sending real image data in test
        }
      ],
      callbackUrls: {
        options: 'https://test-callback.example.com/options',
        results: 'https://test-callback.example.com/results'
      }
    };
    
    console.log('Sending test payload to webhook:', JSON.stringify({
      ...testPayload,
      images: [{id: 1, dataSize: 'placeholder'}] // Log-friendly version
    }, null, 2));
    
    // Try with the alternative URL structure N8N might be using
    const webhookUrl = 'https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9';
    console.log(`Trying webhook URL: ${webhookUrl}`);
    
    const response = await axios.post(webhookUrl, 
      testPayload, 
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'ImageRefresh-App',
          'Accept': 'application/json'
        }
      }
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response body:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error connecting to webhook:', error.message);
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
    }
  }
}

testWebhook();