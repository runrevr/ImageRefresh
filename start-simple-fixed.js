#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Basic middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import storage
let storage;
try {
  const storageModule = await import('./server/storage.js');
  storage = storageModule.storage;
  console.log('[SERVER] Storage loaded');
} catch (error) {
  console.error('[SERVER] Storage failed:', error.message);
}

// Fixed user images API endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[API] GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!storage) {
      return res.status(500).json({ error: 'Storage not available' });
    }

    const images = await storage.getUserImages(userId);
    console.log(`[API] Found ${images.length} images`);

    return res.json({
      success: true,
      count: images.length,
      images: images
    });
    
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Simple server running on port ${port}`);
  console.log(`Test: http://localhost:${port}/api/user-images/6`);
});