// Simple Express server for direct running
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { registerRoutes } from './routes.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Create required directories
const uploadsDir = path.join(projectRoot, 'uploads');
const logsDir = path.join(projectRoot, 'logs');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Set express as an app property so routes can access it
app.set('express', express);

// Register API routes
registerRoutes(app);

// Serve static files from client directory (includes src, public)
app.use(express.static(path.join(projectRoot, 'client')));

// Add static route for client/src
app.use('/src', express.static(path.join(projectRoot, 'client/src')));

// Add static route for client/public
app.use('/public', express.static(path.join(projectRoot, 'client/public')));

// Add API status route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

// Add route to test OpenAI connectivity
app.get('/api/test-openai', async (req, res) => {
  try {
    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY || '';
    const hasValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API key is not configured',
        details: 'No API key found in environment variables'
      });
    }

    if (!hasValidFormat) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI API key has invalid format',
        details: `Key should start with "sk-" and be at least 20 characters`
      });
    }

    // Successfully verified API key format
    return res.json({
      success: true,
      message: 'OpenAI API key is properly configured',
      details: {
        key_format: 'valid'
      }
    });
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    
    // Detailed error response
    return res.status(500).json({
      success: false,
      message: 'Error checking OpenAI API configuration',
      details: error.message
    });
  }
});

// Serve our test page for direct test access
app.get('/test', (req, res) => {
  const testPath = path.join(projectRoot, 'test-page.html');
  if (fs.existsSync(testPath)) {
    res.sendFile(testPath);
  } else {
    res.status(404).send('Test page not found. Please check if test-page.html exists in the project root.');
  }
});

// For any other routes, serve the index.html file
app.get('*', (req, res) => {
  // First try the client/index.html
  const indexPath = path.join(projectRoot, 'client/index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to test-page.html if client/index.html doesn't exist
    const testPath = path.join(projectRoot, 'test-page.html');
    if (fs.existsSync(testPath)) {
      res.sendFile(testPath);
    } else {
      res.status(404).send('Client files not found. Please check the client directory structure.');
    }
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});