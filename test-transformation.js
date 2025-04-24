// Test the image transformation implementation
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

async function testTransformation() {
  try {
    // 1. First, upload a test image
    const testImagePath = path.join(process.cwd(), 'attached_assets/51CItn4oOGL._SL1500_.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.error('Test image not found:', testImagePath);
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
    
    // 2. Now test the image transformation
    const testPrompt = "Place this shampoo bottle on a wooden table with some flowers around it";
    
    const transformResponse = await fetch('http://localhost:5000/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        originalImagePath: uploadData.imagePath,
        prompt: testPrompt,
        userId: 1
      })
    });
    
    if (!transformResponse.ok) {
      const errorText = await transformResponse.text();
      throw new Error(`Transformation failed: ${errorText}`);
    }
    
    const transformData = await transformResponse.json();
    console.log('Transformation successful!');
    console.log('Result:', transformData);
    console.log('Transformed image URL:', transformData.transformedImageUrl);
    
  } catch (error) {
    console.error('Error testing transformation:', error);
  }
}

testTransformation();