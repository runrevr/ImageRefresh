/**
 * Simplified server route for image transformation
 * Directly handles the /api/transform endpoint
 */
import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { transformImage } from './transform-openai.js';

// Set up uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
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

// Create Express app
const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the image URL
    const imagePath = req.file.path;
    const imageUrl = `/${imagePath.replace(process.cwd(), '')}`;

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
    const { originalImagePath, prompt, imageSize = "1024x1024" } = req.body;

    if (!originalImagePath) {
      return res.status(400).json({
        error: 'Missing image path',
        message: 'No image path was provided for transformation',
      });
    }

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt',
        message: 'A prompt is required for transformation',
      });
    }

    console.log(`Processing transformation request for ${originalImagePath}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Image size: ${imageSize}`);

    // Normalize the image path
    const fullImagePath = path.isAbsolute(originalImagePath)
      ? originalImagePath
      : path.join(process.cwd(), originalImagePath);

    // Verify the image exists
    if (!fs.existsSync(fullImagePath)) {
      return res.status(404).json({
        error: 'Image not found',
        message: `The image at path ${originalImagePath} does not exist`,
      });
    }

    // Perform the image transformation
    const result = await transformImage(fullImagePath, prompt, imageSize);

    // Create relative paths for the response
    const transformedImagePath = result.transformedPath.replace(process.cwd(), '').replace(/^\//, '');
    const transformedImageUrl = `/${transformedImagePath}`;

    let secondTransformedImageUrl = null;
    if (result.secondTransformedPath) {
      const secondTransformedImagePath = result.secondTransformedPath.replace(process.cwd(), '').replace(/^\//, '');
      secondTransformedImageUrl = `/${secondTransformedImagePath}`;
    }

    // Send the response
    res.json({
      message: 'Image transformed successfully',
      transformedImagePath,
      transformedImageUrl,
      secondTransformedImagePath: result.secondTransformedPath ? 
        result.secondTransformedPath.replace(process.cwd(), '').replace(/^\//, '') : null,
      secondTransformedImageUrl,
      originalPath: originalImagePath,
    });
  } catch (error) {
    console.error('Error in transformation:', error);
    res.status(500).json({
      error: 'Transformation failed',
      message: error.message,
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the server at http://localhost:${PORT}`);
});