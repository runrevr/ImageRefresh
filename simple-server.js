// Simple standalone server
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { transformImageWithOpenAI } from './server/openai-image.js';

// Environment setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup directories
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static routes
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the image URL
    const imagePath = `uploads/${req.file.filename}`;
    const imageUrl = `/${imagePath}`;

    console.log(`Image uploaded to ${imagePath}`);

    res.json({
      imagePath,
      imageUrl,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message,
    });
  }
});

app.post('/api/transform', async (req, res) => {
  try {
    const { originalImagePath, prompt, userId, imageSize = "1024x1024" } = req.body;

    console.log('Transform request received:');
    console.log('- Original image path:', originalImagePath);
    console.log('- Prompt:', prompt);
    console.log('- User ID:', userId);
    console.log('- Image size:', imageSize);

    // Validate inputs
    if (!originalImagePath) {
      return res.status(400).json({
        error: 'Missing image path',
        message: 'Original image path is required'
      });
    }

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'Transformation prompt is required'
      });
    }

    // Check if the image exists
    let imagePath = originalImagePath;
    
    // If the path is relative (doesn't start with /), ensure it's relative to the project root
    if (!path.isAbsolute(imagePath) && !imagePath.startsWith('uploads/')) {
      imagePath = `uploads/${imagePath}`;
    }

    // If the path is still relative, make it absolute
    if (!path.isAbsolute(imagePath)) {
      imagePath = path.join(__dirname, imagePath);
    }

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found',
        message: `Image not found at path: ${originalImagePath}` 
      });
    }

    // Proceed with the transformation
    try {
      const transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
      console.log(`Transformation successful. Path: ${transformedImagePath}`);

      // Return the result
      res.json({
        transformedImagePath,
        transformedImageUrl: `/${transformedImagePath}`
      });
    } catch (transformError) {
      console.error("Error in OpenAI transformation:", transformError);
      
      if (transformError instanceof Error) {
        const errorMessage = transformError.message;
        
        // Handle specific error messages
        if (errorMessage.includes("not found")) {
          return res.status(404).json({
            error: "Not found",
            message: "Original image could not be processed",
            details: errorMessage
          });
        } 
        
        if (errorMessage.includes("API key")) {
          return res.status(500).json({
            error: "API error",
            message: "Issue with OpenAI credentials",
            details: "The API key for image transformation service is invalid or missing"
          });
        }
        
        return res.status(500).json({
          error: "Transformation error",
          message: "Failed to transform image",
          details: errorMessage
        });
      }
      
      // Generic error response
      return res.status(500).json({
        error: "Unknown error",
        message: "An unknown error occurred during image transformation",
        details: String(transformError)
      });
    }
  } catch (error) {
    console.error("Error transforming image:", error);
    res.status(500).json({
      error: "Transformation error",
      message: error.message || "An unknown error occurred"
    });
  }
});

app.get('/test-openai', async (req, res) => {
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

// Serve test page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-page.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Visit the test page at http://localhost:${PORT} or the Replit URL`);
});