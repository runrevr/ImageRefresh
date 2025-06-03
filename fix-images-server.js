#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5001;

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import storage
let storage;
try {
  const storageModule = await import('./server/storage.js');
  storage = storageModule.storage;
  console.log('[FIX-SERVER] Storage loaded successfully');
} catch (error) {
  console.error('[FIX-SERVER] Storage import failed:', error.message);
}

// FIXED: User images API endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[FIX-API] GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      console.log(`[FIX-API] Invalid userId: ${req.params.userId}`);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    if (!storage) {
      console.log(`[FIX-API] Storage not available`);
      return res.status(500).json({ 
        success: false,
        error: 'Storage not available' 
      });
    }

    console.log(`[FIX-API] Calling storage.getUserImages(${userId})`);
    const images = await storage.getUserImages(userId);
    console.log(`[FIX-API] Storage returned ${images.length} images`);

    const response = {
      success: true,
      count: images.length,
      userId: userId,
      images: images,
      timestamp: new Date().toISOString()
    };

    console.log(`[FIX-API] Returning JSON response with ${images.length} images`);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[FIX-API] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'fix-server-ok', 
    port: port,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Fix server running on port ${port}`);
  console.log(`Test API: curl http://localhost:${port}/api/user-images/6`);
});