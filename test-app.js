// Simple test script to verify our application setup
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create express app
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'server/public')));

// Create a simple API endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Serve the test HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/test.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});