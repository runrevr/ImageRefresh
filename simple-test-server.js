// Simple test server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express server
const app = express();
const PORT = 5000;

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Endpoint for the test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-transform.html'));
});

// Endpoint to test API response parsing
app.get('/test-api-response', (req, res) => {
  // Send a sample API response
  res.json({
    transformedImagePath: "uploads/transformed-1747335126656-224b9222-6da6-467f-9d4d-13aa79917441.png",
    transformedImageUrl: "/uploads/transformed-1747335126656-224b9222-6da6-467f-9d4d-13aa79917441.png",
    originalPath: "uploads/image-1747335096205-723766163.png"
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});