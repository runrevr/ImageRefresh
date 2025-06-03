#!/usr/bin/env node

// Complete fix for the image saving and retrieval system
import express from 'express';
import { storage } from './server/storage.js';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test the storage connection directly
async function testStorage() {
  try {
    console.log('Testing storage connection...');
    const images = await storage.getUserImages(6);
    console.log(`Storage test: Found ${images.length} images for user 6`);
    return true;
  } catch (error) {
    console.error('Storage test failed:', error);
    return false;
  }
}

// Fixed API endpoint for user images
app.get('/api/user-images/:userId', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log(`API Request for user images: ${userId}`);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const images = await storage.getUserImages(userId);
    console.log(`API Response: Found ${images.length} images`);

    // Return images in the format expected by frontend
    return res.json(images);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  const storageWorking = await testStorage();
  
  if (!storageWorking) {
    console.error('Storage system not working - aborting');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Image fix server running on http://localhost:${port}`);
    console.log(`Test endpoint: http://localhost:${port}/api/user-images/6`);
  });
}

startServer();