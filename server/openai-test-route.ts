import { Router } from 'express';
import { transformImageWithOpenAI } from './openai-image';
import path from 'path';
import fs from 'fs';

export function setupOpenAITestRoutes() {
  const router = Router();

  // Endpoint to test OpenAI integration
  router.get('/api/test-openai-transform', async (req, res) => {
    try {
      // Check if API key exists
      const apiKey = process.env.OPENAI_API_KEY || '';
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'OpenAI API key is not configured',
          details: 'No API key found in environment variables'
        });
      }

      // Find a test image
      const testImagePath = findTestImage();
      if (!testImagePath) {
        return res.status(404).json({
          success: false,
          message: 'No test image found',
          details: 'Could not find any images in the uploads directory to test with'
        });
      }

      // Use a simple test prompt
      const testPrompt = 'Transform this image into a colorful cartoon style';

      // Call OpenAI to transform the image
      const transformedImagePath = await transformImageWithOpenAI(testImagePath, testPrompt);

      // Return success with the transformed image path
      return res.json({
        success: true,
        message: 'OpenAI transformation successful',
        details: {
          originalImage: testImagePath,
          transformedImage: transformedImagePath,
          transformedImageUrl: `/${transformedImagePath}`
        }
      });
    } catch (error: any) {
      console.error('Error in OpenAI test transformation:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Error during OpenAI test transformation',
        details: error.message
      });
    }
  });

  return router;
}

// Helper function to find a test image in uploads directory
function findTestImage(): string | null {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return null;
  }
  
  // Try to find an image file
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  try {
    const files = fs.readdirSync(uploadsDir);
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (validExtensions.includes(ext)) {
        return path.join(uploadsDir, file);
      }
    }
    
    // Check subdirectories (one level deep)
    for (const item of files) {
      const itemPath = path.join(uploadsDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        try {
          const subDirFiles = fs.readdirSync(itemPath);
          
          for (const file of subDirFiles) {
            const ext = path.extname(file).toLowerCase();
            if (validExtensions.includes(ext)) {
              return path.join(itemPath, file);
            }
          }
        } catch (err) {
          console.error(`Error reading subdirectory ${itemPath}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error finding test image:', err);
  }
  
  return null;
}