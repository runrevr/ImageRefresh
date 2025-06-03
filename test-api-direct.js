import { storage } from './server/storage.js';

async function testDirectApi() {
  try {
    console.log('Testing direct storage.getUserImages(6)...');
    const images = await storage.getUserImages(6);
    console.log(`Found ${images.length} images:`);
    console.log(JSON.stringify(images.slice(0, 2), null, 2));
    
    // Test if we can serialize to JSON
    const jsonString = JSON.stringify(images);
    console.log('JSON serialization successful');
    console.log(`Total JSON length: ${jsonString.length} characters`);
    
  } catch (error) {
    console.error('Direct API test failed:', error);
  }
}

testDirectApi();