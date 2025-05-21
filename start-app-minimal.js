import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));
app.use('/images', express.static('public/images'));
app.use('/assets', express.static('client/src/assets'));

// Simple endpoint to serve the demo HTML
app.get('/', (req, res) => {
  // Create a simple HTML file that includes our components
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Transformation Demo</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: 'Arial', sans-serif;
        background-color: #000;
        color: #fff;
      }
      .hero {
        position: relative;
        width: 100%;
        padding-top: 32px;
        padding-bottom: 32px;
        overflow: hidden;
        background: linear-gradient(to bottom, #4b0082, #000);
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 16px;
      }
      .flex-row {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      @media (min-width: 768px) {
        .flex-row {
          flex-direction: row;
        }
      }
      .image-container {
        width: 100%;
        margin-bottom: 24px;
      }
      @media (min-width: 768px) {
        .image-container {
          width: 50%;
          margin-bottom: 0;
        }
      }
      .content-container {
        width: 100%;
        padding: 0 16px;
      }
      @media (min-width: 768px) {
        .content-container {
          width: 50%;
          padding-left: 64px;
        }
      }
      .image-wrapper {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        transform: scale(1);
        transition: transform 0.3s ease;
      }
      .image-wrapper:hover {
        transform: scale(1.05);
      }
      .image-wrapper img {
        width: 100%;
        display: block;
      }
      h1 {
        font-size: 48px;
        line-height: 1.2;
        margin-bottom: 24px;
        color: #fff;
      }
      p {
        font-size: 20px;
        line-height: 1.6;
        margin-bottom: 40px;
        color: #d8b4fe;
      }
      .button {
        display: inline-block;
        padding: 16px 32px;
        background-color: #9333ea;
        color: white;
        font-weight: bold;
        border-radius: 9999px;
        text-decoration: none;
        transition: background-color 0.3s, transform 0.3s;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
      }
      .button:hover {
        background-color: #7e22ce;
        transform: scale(1.05);
      }
    </style>
  </head>
  <body>
    <section class="hero">
      <div class="container">
        <div class="flex-row">
          <!-- Image Container -->
          <div class="image-container">
            <div class="image-wrapper">
              <img src="/images/kids-drawing-converted2.png" alt="Kids Drawing Transformation" />
            </div>
          </div>
          
          <!-- Content Container -->
          <div class="content-container">
            <h1>Turn Your Child's Drawings Into Real Life Creatures</h1>
            <p>Our AI transforms your child's imagination into stunning visual creations they'll love!</p>
            <a href="/try-it" class="button">Let's Make Some Magic</a>
          </div>
        </div>
      </div>
    </section>
  </body>
  </html>
  `;
  
  res.send(htmlContent);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});