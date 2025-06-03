#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Import storage after setup
let storage;
try {
  const storageModule = await import('./server/storage.js');
  storage = storageModule.storage;
  console.log('[SERVER] Storage loaded successfully');
} catch (error) {
  console.error('[SERVER] Storage import failed:', error.message);
  process.exit(1);
}

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `image-${Date.now()}-${Math.floor(Math.random() * 1000000)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Core API routes
app.get('/api/user-images/:userId', async (req, res) => {
  console.log(`[API] GET /api/user-images/${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    const images = await storage.getUserImages(userId);
    console.log(`[API] Retrieved ${images.length} images for user ${userId}`);

    return res.status(200).json({
      success: true,
      count: images.length,
      images: images,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[API] Error fetching images:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user images',
      details: error.message 
    });
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    console.log(`[UPLOAD] File uploaded: ${req.file.filename}`);

    res.json({
      message: 'File uploaded successfully',
      imagePath,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('[UPLOAD] Error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: port
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Client build not found');
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Complete server running on http://localhost:${port}`);
  console.log(`Test images API: http://localhost:${port}/api/user-images/6`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});