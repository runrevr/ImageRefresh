
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImageGeneration() {
  try {
    console.log('🧪 Testing OpenAI Image Generation Fix...');
    
    // Test 1: Check if we can upload an image
    console.log('\n1. Testing image upload...');
    
    const testImagePath = path.join(__dirname, 'src/assets/seltzer2.png');
    if (!fs.existsSync(testImagePath)) {
      console.error('❌ Test image not found at:', testImagePath);
      return;
    }
    
    const formData = new FormData();
    formData.append('images', fs.createReadStream(testImagePath));
    formData.append('industries', JSON.stringify(['E-commerce']));
    formData.append('productType', 'Beverage');
    formData.append('purposes', JSON.stringify(['ads']));
    
    const uploadResponse = await axios.post('http://localhost:5000/api/upload-images', formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });
    
    if (uploadResponse.data.success) {
      console.log('✅ Image upload successful');
      console.log('📸 Uploaded URLs:', uploadResponse.data.urls);
    } else {
      console.error('❌ Image upload failed:', uploadResponse.data);
      return;
    }
    
    // Test 2: Test AI analysis
    console.log('\n2. Testing AI analysis...');
    
    const analysisResponse = await axios.post('http://localhost:5000/api/analyze-products', {
      image_urls: uploadResponse.data.urls,
      industry_context: { industries: ['E-commerce'] },
      product_type: 'Beverage'
    }, { timeout: 60000 });
    
    if (analysisResponse.data.success) {
      console.log('✅ AI analysis successful');
      console.log('🔍 Analysis quality score:', analysisResponse.data.analysis.images[0]?.quality_score);
    } else {
      console.error('❌ AI analysis failed:', analysisResponse.data);
      return;
    }
    
    // Test 3: Test idea generation
    console.log('\n3. Testing idea generation...');
    
    const ideasResponse = await axios.post('http://localhost:5000/api/generate-ideas', {
      vision_analysis: analysisResponse.data.analysis,
      industry_context: { industries: ['E-commerce'] },
      ideas_per_image: 5
    }, { timeout: 60000 });
    
    if (ideasResponse.data.success) {
      console.log('✅ Idea generation successful');
      console.log('💡 Generated ideas count:', ideasResponse.data.ideas.length);
    } else {
      console.error('❌ Idea generation failed:', ideasResponse.data);
      return;
    }
    
    // Test 4: Test edit prompt generation (the step that was failing)
    console.log('\n4. Testing edit prompt generation...');
    
    const firstIdea = ideasResponse.data.ideas[0];
    const promptResponse = await axios.post('http://localhost:5000/api/generate-edit-prompt', {
      idea_title: firstIdea.title,
      idea_description: firstIdea.description,
      product_info: analysisResponse.data.analysis.images[0],
      is_chaos_concept: false
    }, { timeout: 30000 });
    
    if (promptResponse.data.success) {
      console.log('✅ Edit prompt generation successful');
      console.log('📝 Generated prompt length:', promptResponse.data.edit_prompt.length);
      console.log('📝 Prompt preview:', promptResponse.data.edit_prompt.substring(0, 100) + '...');
    } else {
      console.error('❌ Edit prompt generation failed:', promptResponse.data);
      return;
    }
    
    // Test 5: Test the actual image generation (this was the main failure point)
    console.log('\n5. Testing image generation with OpenAI...');
    
    const generationResponse = await axios.post('http://localhost:5000/api/generate-enhancement', {
      original_image_url: uploadResponse.data.urls[0],
      enhancement_prompt: promptResponse.data.edit_prompt,
      enhancement_title: firstIdea.title
    }, { timeout: 120000 }); // 2 minute timeout for image generation
    
    if (generationResponse.data.success) {
      console.log('✅ Image generation successful!');
      console.log('🖼️ Generated image URL:', generationResponse.data.enhanced_image_url);
      console.log('\n🎉 ALL TESTS PASSED! The fix is working correctly.');
    } else {
      console.error('❌ Image generation failed:', generationResponse.data);
      console.log('\n❌ Test failed at image generation step');
    }
    
  } catch (error) {
    console.error('🚨 Test failed with error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the test
testImageGeneration();
