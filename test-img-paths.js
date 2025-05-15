// Simple script to test image path accessibility
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3030;

// Serve uploaded files directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Sample image paths for testing
const samplePaths = [
  'uploads/sample-image.jpg',
  '/uploads/sample-image.jpg',
  './uploads/sample-image.jpg'
];

// Main route for testing
app.get('/', (req, res) => {
  // Find an image in the uploads directory for testing
  const uploadsDir = path.join(process.cwd(), 'uploads');
  let testImages = [];
  
  try {
    if (fs.existsSync(uploadsDir)) {
      // Get all files in the uploads directory
      const files = fs.readdirSync(uploadsDir);
      
      // Find image files
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
          testImages.push(file);
        }
      }
    }
  } catch (err) {
    console.error('Error reading uploads directory:', err);
  }
  
  // Generate HTML with test images
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Image Path Tester</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        h1 {
          margin-bottom: 20px;
        }
        h2 {
          margin-top: 30px;
        }
        .image-test {
          margin-bottom: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .image-container {
          margin-top: 10px;
          max-width: 300px;
          max-height: 300px;
          overflow: hidden;
          border: 1px solid #eee;
        }
        img {
          max-width: 100%;
          display: block;
        }
        .path {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 5px;
          margin: 5px 0;
          border-radius: 3px;
        }
        .error {
          color: red;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>Image Path Tester</h1>
      <p>This tool tests different ways of referencing image paths to diagnose path-related issues.</p>
      
      ${testImages.length > 0 ? `
        <h2>Found Test Images (${testImages.length})</h2>
        ${testImages.map(image => {
          // Test different path formats
          const paths = [
            `uploads/${image}`,
            `/uploads/${image}`,
            `./uploads/${image}`
          ];
          
          return `
            <div class="image-test">
              <h3>Image: ${image}</h3>
              
              ${paths.map(p => `
                <div>
                  <div class="path">${p}</div>
                  <div class="image-container">
                    <img src="${p}" onerror="this.parentNode.innerHTML = '<p class=\\'error\\'>Failed to load image using this path</p>'" alt="Test image" />
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      ` : `
        <div class="error">
          <p>No test images found in the uploads directory.</p>
          <p>Please add some images to the uploads directory for testing.</p>
        </div>
      `}
    </body>
    </html>
  `;
  
  res.send(html);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Image path test server running at http://localhost:${PORT}`);
  console.log(`From outside, access at the Replit URL + /`);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});