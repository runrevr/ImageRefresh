import { createServer } from "http";
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { IStorage } from "./storage";
import { transformImage } from "./openai-service";
import { enhancePrompt } from "./prompt-service";

export interface ServerConfig {
  port: number;
}

export function createRouter(config: ServerConfig, storage: IStorage) {
  const app = express();
  app.use(express.json());

  // Base upload directory for storing images
  const UPLOAD_DIR = "uploads";

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  // Configure multer for file uploads
  const upload = multer({
    dest: UPLOAD_DIR,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
      }
    },
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Check if a file exists
  app.get("/api/file-exists", (req, res) => {
    try {
      const { path: filePath } = req.query;

      if (!filePath) {
        return res.status(400).json({ exists: false, error: "No path provided" });
      }

      const fullPath = path.join(process.cwd(), filePath as string);
      const exists = fs.existsSync(fullPath);

      res.json({ exists });
    } catch (error: any) {
      console.error("Error checking file existence:", error);
      res.status(500).json({ 
        exists: false, 
        error: error.message 
      });
    }
  });

  // Upload image endpoint
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the renamed file path from multer
      const imagePath = file.path;
      const imageUrl = `/${imagePath}`;

      res.json({
        imagePath,
        imageUrl,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Error uploading file", error: error.message });
    }
  });

  // Transform image endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      const { originalImagePath, prompt, userId, imageSize, isEdit, previousTransformation } = req.body;

      if (!originalImagePath) {
        return res.status(400).json({ 
          error: "Missing image path",
          message: "No image path was provided for transformation",
        });
      }

      if (!prompt && !previousTransformation) {
        return res.status(400).json({
          error: "Missing prompt",
          message: "No transformation prompt was provided",
        });
      }

      console.log(`Transforming image: ${originalImagePath}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`User ID: ${userId || 'anonymous'}`);
      console.log(`Is Edit: ${isEdit ? 'yes' : 'no'}`);
      console.log(`Previous Transformation: ${previousTransformation || 'none'}`);

      let transformationResult;
      try {
        // Perform the transformation
        transformationResult = await transformImage(
          originalImagePath,
          prompt,
          userId
        );

        if (!transformationResult || !transformationResult.transformedImagePath) {
            return res.status(404).json({
              error: "transformation_failed",
              message: "Transformation didn't return a valid result",
            });
        }

        // Store transformation in database if there's a valid userId
        if (userId) {
            try {
              const transformation = await storage.createTransformation({
                userId: parseInt(userId),
                originalImagePath: originalImagePath,
                prompt: prompt,
                transformedImagePath: transformationResult.transformedImagePath,
                status: "completed"
              });
              
              console.log("Transformation saved to database:", transformation.id);
              transformationResult.transformation = transformation;
            } catch (dbError) {
              console.error("Error saving transformation to database:", dbError);
              return res.status(500).json({
                error: "database_error",
                message: "Error saving transformation to database",
                transformedImagePath: transformationResult.transformedImagePath
              });
            }
        }

        // Return the transformed image path
        return res.json({
          transformedImagePath: transformationResult.transformedImagePath,
          transformedImageUrl: `/${transformationResult.transformedImagePath}`,
          originalPath: originalImagePath,
          transformation: transformationResult.transformation
        });
      } catch (transformError: any) {
        console.error("Error during transformation:", transformError);
        
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

  // Get user credits endpoint
  app.get("/api/user/credits", async (req, res) => {
    try {
      // Get user from session or request
      // Assuming req.user is populated by middleware (e.g., authentication middleware)
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ 
          credits: 0,
          paidCredits: 0,
          freeCreditsUsed: false,
          message: "User not authenticated"
        });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ 
          credits: 0,
          paidCredits: 0,
          freeCreditsUsed: false,
          message: "User not found"
        });
      }

      return res.json({
        credits: user.freeCreditsUsed ? user.paidCredits : user.paidCredits + 1,
        paidCredits: user.paidCredits,
        freeCreditsUsed: user.freeCreditsUsed,
      });
    } catch (error: any) {
      console.error("Error getting user credits:", error);
      return res.status(500).json({ 
        credits: 0,
        paidCredits: 0,
        freeCreditsUsed: false,
        message: "Error fetching user credits"
      });
    }
  });

  // Get user credits by ID endpoint (compatibility with client)
  app.get("/api/credits/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ 
          paidCredits: 0,
          freeCreditsUsed: false,
          message: "User not found"
        });
      }
      
      // Return user credits in the format expected by the client
      return res.json({
        id: user.id,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits
      });
    } catch (error: any) {
      console.error("Error getting user credits by ID:", error);
      return res.status(500).json({ 
        message: "Error fetching user credits", 
        error: error.message 
      });
    }
  });

  // Update user credits endpoint
  app.post("/api/user/:id/credits", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { paidCredits } = req.body;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      if (paidCredits === undefined) {
        return res.status(400).json({ message: "Paid credits are required" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user credits
      const updatedUser = await storage.updateUserCredits(
        userId,
        false, // We're not using a free credit
        paidCredits
      );
      
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        freeCreditsUsed: updatedUser.freeCreditsUsed,
        paidCredits: updatedUser.paidCredits
      });
    } catch (error: any) {
      console.error("Error updating user credits:", error);
      res.status(500).json({ message: "Error updating user credits", error: error.message });
    }
  });

  // Enhance prompt endpoint
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const enhancedPrompt = await enhancePrompt(prompt);
      
      res.json({
        originalPrompt: prompt,
        enhancedPrompt
      });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ message: "Error enhancing prompt", error: error.message });
    }
  });

  // Get Configuration
  app.get("/api/config", (req, res) => {
    res.json({
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}