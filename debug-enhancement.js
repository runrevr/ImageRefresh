const fs = require('fs');

// Log a test message
fs.appendFileSync('hair-care-debug.log', `\n\nDebug test at ${new Date().toISOString()}\n`);

// Try to get enhancement data
const enhancementId = 3; // From the recent upload

// Import storage from server/storage.ts
try {
  const { storage } = require('./server/storage');
  
  // Log that we imported storage
  fs.appendFileSync('hair-care-debug.log', `Imported storage successfully\n`);
  
  // Get enhancement data
  storage.getProductEnhancement(enhancementId)
    .then(enhancement => {
      fs.appendFileSync('hair-care-debug.log', `Enhancement data: ${JSON.stringify(enhancement, null, 2)}\n`);
      
      // Get enhancement images
      return storage.getProductEnhancementImages(enhancementId);
    })
    .then(images => {
      fs.appendFileSync('hair-care-debug.log', `Enhancement images: ${JSON.stringify(images, null, 2)}\n`);
      
      // Mock webhook data
      const { generateMockEnhancementOptions } = require('./server/mock-webhook-data');
      
      // Try to generate options for "hair care"
      const options = generateMockEnhancementOptions("hair care");
      fs.appendFileSync('hair-care-debug.log', `Options for "hair care": ${JSON.stringify(options, null, 2)}\n`);
      
      // Try with other variations
      const options2 = generateMockEnhancementOptions("haircare");
      fs.appendFileSync('hair-care-debug.log', `Options for "haircare": ${JSON.stringify(options2, null, 2)}\n`);
    })
    .catch(err => {
      fs.appendFileSync('hair-care-debug.log', `Error: ${err.message}\n${err.stack}\n`);
    });
} catch (err) {
  fs.appendFileSync('hair-care-debug.log', `Import error: ${err.message}\n${err.stack}\n`);
}