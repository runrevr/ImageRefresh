// ESM version of routes.ts for direct server running
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { transformImageWithOpenAI } from './openai-image.js';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Set up multer for file uploads
const uploadsDir = path.join(projectRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `image-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export function registerRoutes(app) {
  const express = app.get('express');
  // Upload endpoint
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

  // Transform endpoint
  app.post('/api/transform', async (req, res) => {
    try {
      const { originalImagePath, prompt, userId, imageSize = "1024x1024", isEdit = false, previousTransformation = null } = req.body;

      console.log('Transform request received:');
      console.log('- Original image path:', originalImagePath);
      console.log('- Prompt:', prompt);
      console.log('- User ID:', userId);
      console.log('- Image size:', imageSize);
      console.log('- Is edit:', isEdit);

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
        imagePath = path.join(projectRoot, imagePath);
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

  // Endpoint to get OpenAI configuration status
  app.get('/api/config', (req, res) => {
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    res.json({ openaiConfigured });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  return app;
}