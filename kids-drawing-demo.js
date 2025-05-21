const http = require('http');
const fs = require('fs');
const path = require('path');

// Create HTML content with the image and stylized content
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kids Drawing Transformation</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      background-color: #000;
      color: #fff;
    }
    .section {
      background: linear-gradient(to bottom, #4b0082, #000);
      padding: 4rem 2rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .flex-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    @media (min-width: 768px) {
      .flex-container {
        flex-direction: row;
        align-items: center;
      }
    }
    .image-side {
      width: 100%;
      margin-bottom: 2rem;
    }
    @media (min-width: 768px) {
      .image-side {
        width: 50%;
        margin-bottom: 0;
      }
    }
    .content-side {
      width: 100%;
      padding: 0 1rem;
    }
    @media (min-width: 768px) {
      .content-side {
        width: 50%;
        padding-left: 4rem;
      }
    }
    .image-card {
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }
    .image-card:hover {
      transform: scale(1.05);
    }
    img {
      width: 100%;
      display: block;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }
    p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      color: #d8b4fe;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      padding: 1rem 2rem;
      background-color: #9333ea;
      color: white;
      font-weight: bold;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .button:hover {
      background-color: #7e22ce;
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <section class="section">
    <div class="container">
      <div class="flex-container">
        <div class="image-side">
          <div class="image-card">
            <img src="/image" alt="Kids Drawing Transformation">
          </div>
        </div>
        <div class="content-side">
          <h1>Turn Your Child's Drawings Into Real Life Creatures</h1>
          <p>Our AI transforms your child's imagination into stunning visual creations they'll love!</p>
          <a href="#" class="button">Let's Make Some Magic</a>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
`;

// Create server
const server = http.createServer((req, res) => {
  // Route to serve the image
  if (req.url === '/image') {
    // Path to the image 
    const imagePath = path.join(__dirname, 'attached_assets', 'kids drawing converted2.png');
    
    try {
      // Read the image file
      const imageData = fs.readFileSync(imagePath);
      
      // Set appropriate headers
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageData.length
      });
      
      // Send the image data
      res.end(imageData);
    } catch (err) {
      console.error('Error reading image:', err);
      res.writeHead(404);
      res.end('Image not found');
    }
  } 
  // Main route to serve the HTML
  else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});