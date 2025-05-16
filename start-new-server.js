/**
 * Simple server to test the new GPT-Image-01 implementation
 */
import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { transformImage } from './server/openai-final.js';

// Server setup
const app = express();
const PORT = 3000;

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Setup multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'image-' + uniquePrefix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

// Test page route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GPT-Image-01 Transformation Test</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
        }
        h1 { color: #333; }
        .container { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
        }
        .image-container { 
          display: flex; 
          gap: 20px; 
          flex-wrap: wrap;
        }
        .image-box { 
          border: 1px solid #ccc; 
          padding: 10px; 
          border-radius: 5px;
          flex: 1;
          min-width: 300px;
        }
        .image-box img { 
          max-width: 100%; 
          max-height: 400px; 
        }
        form { 
          display: flex; 
          flex-direction: column; 
          gap: 10px; 
        }
        input, textarea, select, button { 
          padding: 10px; 
          font-size: 16px; 
        }
        button { 
          cursor: pointer; 
          background: #4CAF50; 
          color: white; 
          border: none; 
          border-radius: 5px; 
        }
        .error { color: red; }
        .success { color: green; }
        .loading { color: orange; }
      </style>
    </head>
    <body>
      <h1>GPT-Image-01 Transformation Test</h1>
      <div class="container">
        <form id="uploadForm" enctype="multipart/form-data">
          <h3>Step 1: Upload an image</h3>
          <input type="file" id="imageFile" name="image" accept="image/*" required>
          <button type="submit">Upload Image</button>
        </form>
        
        <div id="transformForm" style="display: none;">
          <h3>Step 2: Transform the image</h3>
          <div class="image-container">
            <div class="image-box">
              <h4>Original Image</h4>
              <img id="originalImage" src="" alt="Original Image">
            </div>
          </div>
          
          <form id="promptForm">
            <input type="hidden" id="imagePath" name="imagePath">
            <div>
              <label for="prompt">Transformation Prompt:</label>
              <textarea id="prompt" name="prompt" rows="4" required 
                placeholder="Describe how you want to transform the image..."></textarea>
            </div>
            <div>
              <label for="imageSize">Image Size:</label>
              <select id="imageSize" name="imageSize">
                <option value="1024x1024">Square (1024x1024)</option>
                <option value="1536x1024">Landscape (1536x1024)</option>
                <option value="1024x1536">Portrait (1024x1536)</option>
              </select>
            </div>
            <button type="submit">Transform Image</button>
          </form>
        </div>
        
        <div id="resultContainer" style="display: none;">
          <h3>Transformation Result</h3>
          <div class="image-container">
            <div class="image-box">
              <h4>Original Image</h4>
              <img id="originalImageResult" src="" alt="Original Image">
            </div>
            <div class="image-box">
              <h4>Transformed Image</h4>
              <img id="transformedImage" src="" alt="Transformed Image">
            </div>
          </div>
          <div id="secondImageContainer" style="display: none;">
            <div class="image-box">
              <h4>Second Transformed Image</h4>
              <img id="secondTransformedImage" src="" alt="Second Transformed Image">
            </div>
          </div>
        </div>
        
        <div id="status"></div>
      </div>
      
      <script>
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const statusEl = document.getElementById('status');
          statusEl.innerHTML = 'Uploading...';
          statusEl.className = '';
          
          const formData = new FormData();
          const fileField = document.getElementById('imageFile');
          formData.append('image', fileField.files[0]);
          
          try {
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            
            if (response.ok) {
              statusEl.innerHTML = 'Upload successful!';
              statusEl.className = 'success';
              document.getElementById('imagePath').value = data.imagePath;
              document.getElementById('originalImage').src = '/' + data.imagePath;
              document.getElementById('originalImageResult').src = '/' + data.imagePath;
              document.getElementById('transformForm').style.display = 'block';
            } else {
              statusEl.innerHTML = 'Upload failed: ' + (data.message || 'Unknown error');
              statusEl.className = 'error';
            }
          } catch (error) {
            statusEl.innerHTML = 'Upload failed: ' + error.message;
            statusEl.className = 'error';
          }
        });
        
        document.getElementById('promptForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const statusEl = document.getElementById('status');
          statusEl.innerHTML = 'Transforming image... This may take a minute or two.';
          statusEl.className = 'loading';
          
          const imagePath = document.getElementById('imagePath').value;
          const prompt = document.getElementById('prompt').value;
          const imageSize = document.getElementById('imageSize').value;
          
          try {
            const response = await fetch('/transform', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                originalImagePath: imagePath,
                prompt,
                imageSize,
              }),
            });
            const data = await response.json();
            
            if (response.ok) {
              statusEl.innerHTML = 'Transformation successful!';
              statusEl.className = 'success';
              document.getElementById('transformedImage').src = '/' + data.transformedImagePath;
              document.getElementById('resultContainer').style.display = 'block';
              
              if (data.secondTransformedPath) {
                document.getElementById('secondTransformedImage').src = '/' + data.secondTransformedPath;
                document.getElementById('secondImageContainer').style.display = 'block';
              } else {
                document.getElementById('secondImageContainer').style.display = 'none';
              }
            } else {
              statusEl.innerHTML = 'Transformation failed: ' + (data.message || 'Unknown error');
              statusEl.className = 'error';
            }
          } catch (error) {
            statusEl.innerHTML = 'Transformation failed: ' + error.message;
            statusEl.className = 'error';
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    console.log(`File uploaded: ${req.file.path}`);
    
    res.json({
      message: 'File uploaded successfully',
      imagePath: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Error uploading file' });
  }
});

// Transform endpoint
app.post('/transform', async (req, res) => {
  try {
    console.log('Transform request received:');
    const { originalImagePath, prompt, imageSize } = req.body;
    console.log('- Original image path:', originalImagePath);
    console.log('- Prompt:', prompt);
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
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        error: 'Image not found',
        message: `Image not found at path: ${originalImagePath}`
      });
    }
    
    // Proceed with the transformation using our GPT-Image-01 implementation
    try {
      console.log(`Calling GPT-Image-01 transformation with imagePath: ${imagePath}`);
      
      // Use our GPT-Image-01 implementation directly
      const result = await transformImage(imagePath, prompt, imageSize);
      
      console.log('Transformation results:');
      console.log('- Transformed image path:', result.transformedPath);
      console.log('- Has second image:', !!result.secondTransformedPath);
      
      // Return the paths to the transformed images
      res.json({
        transformedImagePath: result.transformedPath,
        secondTransformedPath: result.secondTransformedPath,
        originalImagePath
      });
    } catch (transformError) {
      console.error('Error in OpenAI transformation:', transformError);
      
      // Generic error response
      return res.status(500).json({
        error: 'Transformation error',
        message: transformError.message || 'Failed to transform image',
        details: String(transformError)
      });
    }
  } catch (error) {
    console.error('Error transforming image:', error);
    res.status(500).json({
      error: 'Transformation error',
      message: error.message || 'An unknown error occurred'
    });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Using GPT-Image-01 implementation from ./server/openai-final.js`);
  console.log(`OPENAI_API_KEY is ${process.env.OPENAI_API_KEY ? 'configured' : 'NOT CONFIGURED'}`);
});