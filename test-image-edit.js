// Test the new OpenAI images.edit implementation
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

async function testImageEdit() {
  try {
    // 1. First, upload a test image
    const testImagePath = './uploads/image-1745518488094-199361840.jpg'; // Change to an existing image in your uploads folder
    
    if (!fs.existsSync(testImagePath)) {
      console.error('Test image not found. Please specify an existing image path.');
      return;
    }
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    const uploadResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }
    
    const uploadData = await uploadResponse.json();
    console.log('Uploaded image successfully:', uploadData);
    
    // 2. Now test the image transformation with our new edit functionality
    const testPrompt = "Place this image on a wooden table with some flowers around it";
    
    const transformResponse = await fetch('http://localhost:5000/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalImagePath: uploadData.imagePath,
        prompt: testPrompt,
        userId: 1, // Use default user ID
        isEdit: true // Indicate this is an edit
      })
    });
    
    if (!transformResponse.ok) {
      const errorText = await transformResponse.text();
      throw new Error(`Image edit failed: ${errorText}`);
    }
    
    const transformData = await transformResponse.json();
    console.log('Image edit successful!');
    console.log('Result:', transformData);
    console.log('Transformed image URL:', transformData.transformedImageUrl);
    
  } catch (error) {
    console.error('Error testing image edit:', error);
  }
}

testImageEdit();