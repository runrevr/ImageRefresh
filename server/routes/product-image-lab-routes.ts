import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Set up the upload directory
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// Function to setup Product Image Lab routes
export function setupProductImageLabRoutes() {
  const router = Router();

  // Endpoint to handle file uploads
  router.post('/api/product-image-lab/upload', upload.single('image'), async (req, res) => {
    try {
      // Check authentication or guest access
      const { userId } = req.body;
      const fingerprint = req.headers['x-fingerprint'] || req.body.fingerprint;
      
      if (!userId && !fingerprint) {
        return res.status(401).json({
          success: false,
          message: 'Authentication or fingerprint required for uploads',
          error: 'authentication_required'
        });
      }

      // Verify user exists if userId provided
      if (userId) {
        const { storage } = await import('../storage.ts');
        const user = await storage.getUser(parseInt(userId));
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'user_not_found'
          });
        }
      } else if (fingerprint) {
        console.log(`Guest upload request with fingerprint: ${fingerprint.toString().substring(0, 8)}...`);
      }

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
          path: req.file.path.replace(process.cwd(), ''),
          url: `/uploads/${req.file.filename}`
        }
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message
      });
    }
  });

  // Endpoint to process image transformations
  router.post('/api/product-image-lab/transform', async (req, res) => {
    try {
      const { imageId, transformationType, options, userId } = req.body;

      // Validate input
      if (!imageId || !transformationType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters'
        });
      }

      // Import storage to check user credits
      const { storage } = await import('../storage.ts');

      // Check if user has credits if userId is provided
      let userCredits = { freeCreditsUsed: false, paidCredits: 0 };

      if (userId) {
        try {
          const user = await storage.getUser(parseInt(userId));
          if (!user) {
            return res.status(404).json({ 
              success: false,
              message: "User not found",
              error: "authentication_required"
            });
          }

          // Check if the user has free credits
          const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(parseInt(userId));
          userCredits = {
            freeCreditsUsed: !hasMonthlyFreeCredit,
            paidCredits: user.paidCredits,
          };

          // Check if user has any credits available
          const totalCredits = (hasMonthlyFreeCredit ? 1 : 0) + user.paidCredits;
          
          if (totalCredits < 1) {
            return res.status(403).json({
              success: false,
              message: "Not enough credits",
              error: "credit_required",
              freeCreditsUsed: !hasMonthlyFreeCredit,
              paidCredits: user.paidCredits,
            });
          }
        } catch (userError) {
          console.error("Error checking user credits:", userError);
          return res.status(500).json({
            success: false,
            message: "Error verifying user credits",
            error: "credit_check_failed"
          });
        }
      } else {
        // No userId provided - check if this is a guest request with fingerprint
        const fingerprint = req.headers['x-fingerprint'] || req.body.fingerprint;
        
        if (fingerprint && typeof fingerprint === 'string') {
          // Allow guest usage with fingerprint-based credit tracking
          console.log(`Guest transformation request with fingerprint: ${fingerprint.substring(0, 8)}...`);
          
          // For guests, we allow 1 free transformation per fingerprint
          // This could be enhanced with a proper guest credit tracking system
          userCredits = {
            freeCreditsUsed: false, // Assume guest hasn't used their free credit yet
            paidCredits: 0
          };
          
          // In a production system, you'd want to track guest usage by fingerprint
          // For now, we'll allow the transformation to proceed
        } else {
          // No authentication and no fingerprint - require authentication
          return res.status(401).json({
            success: false,
            message: "Authentication required for image transformations",
            error: "authentication_required"
          });
        }
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
      // In a real implementation, this would call an image processing API or service
      fs.copyFileSync(originalPath, transformedPath);

      // Deduct credits after successful transformation
      if (userId) {
        try {
          const useFreeCredit = !userCredits.freeCreditsUsed;
          let newPaidCredits = userCredits.paidCredits;
          
          if (useFreeCredit) {
            // Mark free credit as used
            await storage.updateUserCredits(parseInt(userId), true, userCredits.paidCredits);
          } else {
            // Deduct paid credit
            newPaidCredits = Math.max(0, userCredits.paidCredits - 1);
            await storage.updateUserCredits(parseInt(userId), true, newPaidCredits);
          }
          
          console.log(`Credits deducted for user ${userId} - used free credit: ${useFreeCredit}, remaining paid: ${newPaidCredits}`);
        } catch (creditError) {
          console.error("Error deducting credits:", creditError);
          // Don't fail the transformation if credit deduction fails, but log it
        }
      }

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

    } catch (error: any) {
      console.error('Error transforming image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error transforming image',
        error: error.message
      });
    }
  });

  // Endpoint to get credit information
  router.get('/api/product-image-lab/credits', async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "authentication_required"
        });
      }

      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
          error: "invalid_user_id"
        });
      }

      // Import storage to get user credits
      const { storage } = await import('../storage.ts');
      
      const user = await storage.getUser(userIdNum);
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: "User not found",
          error: "user_not_found"
        });
      }

      // Check if the user has free credits
      const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userIdNum);
      
      return res.status(200).json({
        success: true,
        credits: {
          free: hasMonthlyFreeCredit ? 1 : 0,
          paid: user.paidCredits,
          total: (hasMonthlyFreeCredit ? 1 : 0) + user.paidCredits
        }
      });
      
    } catch (error: any) {
      console.error('Error getting credit information:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving credit information',
        error: error.message
      });
    }
  });

  return router;
}