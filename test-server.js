#!/usr/bin/env node

// Direct test server to verify API endpoint
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Mock the storage function for testing
const mockStorage = {
  getUserImages: async (userId) => {
    console.log(`Mock storage called for user ${userId}`);
    return [
      {
        id: 1,
        userId: userId,
        imagePath: '/uploads/test1.png',
        imageUrl: 'http://localhost:3000/uploads/test1.png',
        imageType: 'style_transfer',
        category: 'personal',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        userId: userId,
        imagePath: '/uploads/test2.png', 
        imageUrl: 'http://localhost:3000/uploads/test2.png',
        imageType: 'background_change',
        category: 'personal',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

// Test endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`TEST API: GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const images = await mockStorage.getUserImages(userId);
    console.log(`TEST API: Returning ${images.length} images`);

    return res.status(200).json({
      success: true,
      count: images.length,
      images: images,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('TEST API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'test-ok' });
});

app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
  console.log(`Test endpoint: curl http://localhost:${port}/api/user-images/6`);
});