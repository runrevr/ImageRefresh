import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImageWithOpenAI } from "./openai-image";

// Configure multer for uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  
  // Add an endpoint to check if an image exists (for debugging)
  app.get("/api/check-image", (req, res) => {
    try {
      const { path: imagePath } = req.query;
      
      if (!imagePath) {
        return res.status(400).json({ exists: false, error: "No path provided" });
      }
      
      const paths = [
        // Path as provided
        imagePath as string,
        // Path with process.cwd()
        path.join(process.cwd(), imagePath as string),
        // Path with uploads directory
        path.join(process.cwd(), 'uploads', path.basename(imagePath as string))
      ];
      
      const results = paths.map(p => ({
        path: p,
        exists: fs.existsSync(p)
      }));
      
      const anyExists = results.some(r => r.exists);
      
      res.json({
        exists: anyExists,
        paths: results,
        originalPath: imagePath
      });
    } catch (error) {
      res.status(500).json({ 
        exists: false, 
        error: error.message 
      });
    }
  });

  app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imagePath = req.file.path;
      const relativePath = path.relative(process.cwd(), imagePath).replace(/\\/g, '/');

      res.json({
        imagePath: relativePath,
        imageUrl: `/${relativePath}`
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error: error.message });
    }
  });

  app.post("/api/transform", async (req, res) => {
    try {
      const { originalImagePath, prompt, userId, imageSize, isEdit, previousTransformation } = req.body;

      if (!originalImagePath || !prompt) {
        return res.status(400).json({ 
          error: "Validation error",
          message: "Original image path and prompt are required" 
        });
      }

      console.log("Transformation request:", {
        originalImagePath,
        promptLength: prompt.length,
        userId,
        imageSize,
        isEdit,
        previousTransformation
      });

      // Normalize path handling - check if the path exists as provided first
      let imagePath = originalImagePath;
      
      // If the path doesn't exist and isn't absolute, try to resolve it relative to process.cwd()
      if (!fs.existsSync(imagePath) && !path.isAbsolute(imagePath)) {
        imagePath = path.join(process.cwd(), originalImagePath);
        console.log(`Trying resolved path: ${imagePath}`);
      }
      
      // If still not found, try normalizing the path by removing the 'uploads/' prefix if it exists
      if (!fs.existsSync(imagePath) && originalImagePath.startsWith('uploads/')) {
        imagePath = path.join(process.cwd(), originalImagePath);
        console.log(`Trying with uploads prefix: ${imagePath}`);
      }
      
      // One more attempt - try using just the filename from uploads directory
      if (!fs.existsSync(imagePath)) {
        const filename = path.basename(originalImagePath);
        imagePath = path.join(process.cwd(), 'uploads', filename);
        console.log(`Last attempt with filename only: ${imagePath}`);
      }
      
      if (!fs.existsSync(imagePath)) {
        console.error(`Original image not found at any of the attempted paths. Last tried: ${imagePath}`);
        return res.status(404).json({ 
          error: "Not found",
          message: "Original image not found", 
          details: `Image not found at path: ${originalImagePath}` 
        });
      }

      // Proceed with the transformation
      try {
        const transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
        console.log(`Transformation successful. Path: ${transformedImagePath}`);

        // Store transformation in database if userId is provided
        if (userId) {
          try {
            const transformation = await storage.createTransformation({
              userId,
              originalImagePath,
              prompt,
              status: "completed",
              editsUsed: isEdit ? 1 : 0
            });
            
            await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              transformedImagePath
            );
            
            console.log(`Transformation stored in database with ID: ${transformation.id}`);
          } catch (dbError) {
            console.error("Failed to store transformation in database:", dbError);
            // Continue anyway since we have the transformed image
          }
        }

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
    } catch (error: any) {
      console.error("Error transforming image:", error);
      res.status(500).json({
        error: "Transformation error",
        message: error.message || "Unknown error occurred during image transformation",
        details: error.stack || undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}