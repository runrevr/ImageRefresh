/**
 * This file helps generate placeholder images for the Product Image Lab examples
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const examplesDir = path.join(__dirname);
if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

// Function to download a placeholder image
function downloadPlaceholder(width, height, filename, text) {
  return new Promise((resolve, reject) => {
    const url = `https://via.placeholder.com/${width}x${height}/${text ? '?text=' + encodeURIComponent(text) : ''}`;
    const filePath = path.join(examplesDir, filename);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve(filePath);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

// Main function to download all placeholder images
async function downloadAllPlaceholders() {
  try {
    // Example product images
    await downloadPlaceholder(300, 300, 'example-product-1.jpg', 'Shampoo Bottle');
    await downloadPlaceholder(300, 300, 'example-product-2.jpg', 'Coffee Mug');
    await downloadPlaceholder(300, 300, 'example-product-3.jpg', 'Headphones');
    await downloadPlaceholder(300, 300, 'example-product-4.jpg', 'Sneakers');
    await downloadPlaceholder(300, 300, 'example-product-5.jpg', 'Watch');
    
    // Before and after examples for the image slider
    await downloadPlaceholder(800, 400, 'example-product-before.jpg', 'Original Product');
    await downloadPlaceholder(800, 400, 'example-product-after.jpg', 'Enhanced Product');
    
    // Enhancement examples
    await downloadPlaceholder(220, 150, 'enhancement-1.jpg', 'Background Removal');
    await downloadPlaceholder(220, 150, 'enhancement-2.jpg', 'Shadow Addition');
    await downloadPlaceholder(220, 150, 'enhancement-3.jpg', 'Enhanced Lighting');
    await downloadPlaceholder(220, 150, 'enhancement-4.jpg', 'Color Correction');
    
    // Results examples
    await downloadPlaceholder(400, 300, 'result-1.jpg', 'Enhanced Lighting');
    await downloadPlaceholder(400, 300, 'result-2.jpg', 'Background Removed');
    await downloadPlaceholder(400, 300, 'result-3.jpg', 'Color Enhanced');
    
    console.log('All placeholder images have been downloaded successfully!');
  } catch (error) {
    console.error('Error downloading placeholder images:', error);
  }
}

// Run the download function
downloadAllPlaceholders();