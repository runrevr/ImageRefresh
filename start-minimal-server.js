#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Core API endpoint for user images
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[API] GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const images = await storage.getUserImages(userId);
    console.log(`[API] Found ${images.length} images for user ${userId}`);

    return res.json({
      success: true,
      count: images.length,
      images: images,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: port });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Minimal server running on http://localhost:${port}`);
});