// Simple script to test image transformation API
import { transformImageWithOpenAI } from './server/openai-image.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Find an image in uploads directory
async function findTestImage() {
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir);
  
  // Look for image files not starting with "transformed"
  const originalImages = files.filter(file => 
    (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) &&
    !file.startsWith('transformed')
  );
  
  if (originalImages.length > 0) {
    return path.join('uploads', originalImages[0]);
  }
  
  // If no image found in uploads, try to find one in attached_assets
  const assetsDir = path.join(__dirname, 'attached_assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    const imageAssets = assetFiles.filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')
    );
    
    if (imageAssets.length > 0) {
      const assetPath = path.join(assetsDir, imageAssets[0]);
      const targetPath = path.join(uploadsDir, 'test-image-' + Date.now() + path.extname(imageAssets[0]));
      
      // Copy the file to uploads
      fs.copyFileSync(assetPath, targetPath);
      return 'uploads/' + path.basename(targetPath);
    }
  }
  
  return null;
}

// Main test function
async function testTransformation() {
  console.log('Starting test of image transformation API');
  
  try {
    // Find a test image
    const imagePath = await findTestImage();
    
    if (!imagePath) {
      console.error('No test image found. Please upload an image to the uploads directory.');
      return;
    }
    
    console.log(`Using image: ${imagePath}`);
    
    // Test prompt
    const prompt = 'Transform this image into a vibrant oil painting with bold brush strokes and bright colors';
    console.log(`Using prompt: "${prompt}"`);
    
    // Call the transformation function
    console.log('Calling transformImageWithOpenAI...');
    console.time('transformation');
    
    const transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
    
    console.timeEnd('transformation');
    console.log(`Transformation complete! Result: ${transformedImagePath}`);
    
    // Verify the transformed image exists
    const fullPath = path.join(__dirname, transformedImagePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`Transformed image file size: ${Math.round(stats.size / 1024)} KB`);
      console.log(`Success! Image transformed and saved to: ${transformedImagePath}`);
    } else {
      console.error(`Error: Transformed image file not found at ${fullPath}`);
    }
  } catch (error) {
    console.error('Error in transformation test:', error);
  }
}

// Run the test
testTransformation();