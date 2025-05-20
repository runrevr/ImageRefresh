/**
 * Simple script to start the Product Image Lab server
 * Run with: node start-product-lab-server.cjs
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5055;

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up the upload directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const uniqueId = `upload-${timestamp}-${Math.floor(Math.random() * 1000000000)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG and WEBP files are allowed.'));
  }
};

// Set up multer with the configured storage
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: fileFilter
});

// Endpoint to handle file uploads
app.post('/api/product-image-lab/upload', upload.single('image'), (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return success with file info
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: path.basename(req.file.path, path.extname(req.file.path)),
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path.replace(__dirname, ''),
        url: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// Endpoint to process image transformations
app.post('/api/product-image-lab/transform', (req, res) => {
  try {
    const { imageId, transformationType, options } = req.body;

    // Validate input
    if (!imageId || !transformationType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    // Find the original image
    const files = fs.readdirSync(uploadsDir);
    const originalFile = files.find(file => file.startsWith(`${imageId}`));

    if (!originalFile) {
      return res.status(404).json({
        success: false, 
        message: 'Original image not found'
      });
    }

    const originalPath = path.join(uploadsDir, originalFile);
    
    // Generate a unique ID for the transformed image
    const transformId = uuidv4();
    const ext = path.extname(originalFile);
    const transformedFilename = `transformed-${Date.now()}-${transformId}${ext}`;
    const transformedPath = path.join(uploadsDir, transformedFilename);

    // For now, we'll create a simulated transformation by copying the original file
    fs.copyFileSync(originalPath, transformedPath);

    // Return the information about the transformed image
    return res.status(200).json({
      success: true,
      message: 'Image transformation completed',
      transformation: {
        id: transformId,
        type: transformationType,
        originalImageId: imageId,
        originalPath: `/uploads/${originalFile}`,
        transformedPath: `/uploads/${transformedFilename}`,
        transformedUrl: `/uploads/${transformedFilename}`
      }
    });

  } catch (error) {
    console.error('Error transforming image:', error);
    return res.status(500).json({
      success: false,
      message: 'Error transforming image',
      error: error.message
    });
  }
});

// Endpoint to get credit information
app.get('/api/product-image-lab/credits', (req, res) => {
  // In a real implementation, this would retrieve the user's credit information
  return res.status(200).json({
    credits: {
      free: 5,
      paid: 5,
      total: 10
    }
  });
});

// Special endpoint for the Product Image Lab HTML page
app.get('/product-image-lab-html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'product-image-lab.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Product Image Lab server running on http://0.0.0.0:${PORT}`);
  console.log(`View the Product Image Lab at: http://localhost:${PORT}/product-image-lab-html`);
});