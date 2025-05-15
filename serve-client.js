// Simple Express server to serve client files
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve uploads directory for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve attached assets
app.use('/attached_assets', express.static(path.join(__dirname, 'attached_assets')));

// Check if client/index.html exists, otherwise serve client/dist/index.html
let indexPath = path.join(__dirname, 'client/index.html');
if (!fs.existsSync(indexPath)) {
  indexPath = path.join(__dirname, 'client/dist/index.html');
}

// For any other routes, serve the index.html file
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Client files not found. Please build the client first.');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Client server running on http://0.0.0.0:${PORT}`);
});