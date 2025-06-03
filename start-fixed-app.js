#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import storage after setting up environment
process.env.NODE_ENV = 'development';

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Import and initialize storage
let storage;
try {
  const storageModule = await import('./server/storage.js');
  storage = storageModule.storage;
  console.log('[SERVER] Storage imported successfully');
} catch (error) {
  console.error('[SERVER] Failed to import storage:', error);
  process.exit(1);
}

// Fixed user images endpoint
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[API] GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const images = await storage.getUserImages(userId);
    console.log(`[API] Found ${images.length} images for user ${userId}`);

    return res.status(200).json({
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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve client for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Fixed server running on http://localhost:${port}`);
  console.log(`API endpoint: http://localhost:${port}/api/user-images/6`);
});