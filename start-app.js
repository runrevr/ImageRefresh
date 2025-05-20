/**
 * Simple script to start the application server
 * Run with: node start-app.js
 */
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050; // Using port 5050 instead

// Serve the public directory as static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve examples directory if it exists
if (fs.existsSync(path.join(__dirname, 'examples'))) {
  app.use('/examples', express.static(path.join(__dirname, 'examples')));
}

// Create a placeholder endpoint for API requests in our static HTML page
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  res.redirect(`https://via.placeholder.com/${width}x${height}`);
});

// Basic API endpoints
app.get('/api/config', (req, res) => {
  res.json({
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    maxUploadSize: 10 * 1024 * 1024 // 10MB
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Special endpoint for the Product Image Lab HTML page
app.get('/product-image-lab-html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-image-lab.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Product Image Lab server running on http://0.0.0.0:${PORT}`);
  console.log(`View the Product Image Lab at: http://localhost:${PORT}/product-image-lab-html`);
});