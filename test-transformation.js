// This script tests the image transformation endpoint with the shampoo bottle image
import fetch from 'node-fetch';

async function testTransformation() {
  try {
    console.log('Starting test transformation...');
    
    // Call the transformation API endpoint with the shampoo bottle image
    const response = await fetch('http://localhost:5000/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalImagePath: 'uploads/shampoo_bottle.jpg',
        prompt: 'a shampoo bottle in the middle of a forest with lucious green leaves after a fresh rain, dewdrops on leaves, sunlight filtering through the canopy',
        userId: 1
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Transformation completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('\nYou can view the original image at:', `http://localhost:5000${result.originalImageUrl}`);
    console.log('You can view the transformed image at:', `http://localhost:5000${result.transformedImageUrl}`);
  } catch (error) {
    console.error('Error during transformation test:', error);
  }
}

testTransformation();