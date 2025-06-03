#!/usr/bin/env node

// Direct test of the user images API endpoint
import express from 'express';
import cors from 'cors';
import { storage } from './server/storage.js';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test the specific problematic endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[DIRECT TEST] GET /api/user-images/${req.params.userId}`);
  
  // Force JSON content type
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log(`[DIRECT TEST] Parsed userId: ${userId}`);

    if (isNaN(userId) || userId <= 0) {
      console.log(`[DIRECT TEST] Invalid userId`);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    console.log(`[DIRECT TEST] Calling storage.getUserImages(${userId})`);
    const images = await storage.getUserImages(userId);
    console.log(`[DIRECT TEST] Storage returned ${images.length} images`);

    const response = {
      success: true,
      count: images.length,
      images: images,
      timestamp: new Date().toISOString()
    };

    console.log(`[DIRECT TEST] Sending JSON response`);
    return res.json(response);
    
  } catch (error) {
    console.error(`[DIRECT TEST] Error:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'direct-test-ok', port: port });
});

// Start server
app.listen(port, () => {
  console.log(`Direct test server running on http://localhost:${port}`);
  console.log(`Test URL: http://localhost:${port}/api/user-images/6`);
});