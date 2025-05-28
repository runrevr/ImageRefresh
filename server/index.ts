
import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = 'uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 100000000);
    cb(null, `images-${timestamp}-${randomNum}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// API config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    featureFlags: {
      newUI: true
    },
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    stripeConfigured: true,
    maxUploadSize: 10 * 1024 * 1024
  });
});

// Text-to-image generation endpoint
app.post('/api/generate-images', async (req, res) => {
  try {
    const { prompt, width = 1024, height = 1024 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log('Generating image with prompt:', prompt);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: `${width}x${height}`,
      response_format: "b64_json",
    });

    const base64ImageData = response.data[0].b64_json;

    if (!base64ImageData) {
      return res.status(500).json({ error: "Failed to generate image" });
    }
    
    // Convert base64 to buffer and send as image
    const buffer = Buffer.from(base64ImageData, "base64");

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': buffer.length
    });
    res.end(buffer);

  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate image",
      details: error.response?.data || error
    });
  }
});

// Basic image upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
      success: true,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve the React client build files from the correct path
const clientDistPath = path.join(process.cwd(), 'client', 'dist', 'public');
const clientDistFallback = path.join(process.cwd(), 'client', 'dist');

// Try the built assets first
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else if (fs.existsSync(clientDistFallback)) {
  app.use(express.static(clientDistFallback));
}

// Serve specific HTML files
app.get('/text-to-image', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'text-to-image.html'));
});

// Handle all other routes - serve the React app
app.get('*', (req, res) => {
  // First try the public folder structure
  let indexPath = path.join(process.cwd(), 'client', 'dist', 'public', 'index.html');
  
  // Fallback to regular dist folder
  if (!fs.existsSync(indexPath)) {
    indexPath = path.join(process.cwd(), 'client', 'dist', 'index.html');
  }
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`
      <html>
        <body>
          <h1>ImageRefresh - AI Image Enhancement</h1>
          <p>Backend server is running on port ${port}</p>
          <p>Building frontend assets...</p>
          <script>
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
});
