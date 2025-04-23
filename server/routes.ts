import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImage, isOpenAIConfigured } from "./openai";
import { insertTransformationSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
    cb(null, true);
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadDir, req.url);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Check OpenAI configuration
  app.get("/api/config", (req, res) => {
    res.json({
      openaiConfigured: isOpenAIConfigured(),
    });
  });

  // Upload image endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = req.file.path;
    const relativePath = path.relative(process.cwd(), imagePath);
    const imageUrl = `/uploads/${path.basename(imagePath)}`;

    res.json({
      imagePath: relativePath,
      imageUrl,
    });
  });

  // Transform image endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      // Validate request body
      const transformSchema = z.object({
        originalImagePath: z.string(),
        prompt: z.string().min(1).max(500),
        userId: z.number().optional(),
      });

      const validatedData = transformSchema.parse(req.body);
      
      // Check if image exists
      const fullImagePath = path.join(process.cwd(), validatedData.originalImagePath);
      if (!fs.existsSync(fullImagePath)) {
        return res.status(400).json({ message: "Image not found" });
      }
      
      // Create transformation record
      const userId = validatedData.userId || 1; // Use default for unauthenticated users
      
      // Check if user has credits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // For demo transformation of the shampoo bottle
      if (path.basename(fullImagePath) === "shampoo_bottle.jpg") {
        // Create a transformation record
        const transformation = await storage.createTransformation({
          userId,
          originalImagePath: validatedData.originalImagePath,
          prompt: validatedData.prompt,
        });
        
        // Update transformation status to processing
        await storage.updateTransformationStatus(transformation.id, "processing");
        
        try {
          // Transform the image using OpenAI with specified prompt
          const forestPrompt = "a shampoo bottle in the middle of a forest with lucious green leaves after a fresh rain, dewdrops on leaves, sunlight filtering through the canopy, photorealistic, high detail";
          
          const { transformedPath } = await transformImage(
            fullImagePath, 
            forestPrompt
          );
          
          // Get relative path for storage
          const relativePath = path.relative(process.cwd(), transformedPath);
          
          // Update transformation with the result
          const updatedTransformation = await storage.updateTransformationStatus(
            transformation.id,
            "completed",
            relativePath
          );
          
          // Return the transformation
          res.json({
            id: updatedTransformation.id,
            originalImageUrl: `/uploads/${path.basename(fullImagePath)}`,
            transformedImageUrl: `/uploads/${path.basename(transformedPath)}`,
            prompt: forestPrompt,
            status: updatedTransformation.status,
          });
        } catch (error: any) {
          // Update transformation with error
          await storage.updateTransformationStatus(
            transformation.id,
            "failed",
            undefined,
            error.message || 'Unknown error occurred'
          );
          
          throw error;
        }
      } else {
        // Regular credit-based flow for non-demo images
        // Check if free credit is available or paid credits
        if (!user.freeCreditsUsed || user.paidCredits > 0) {
          // Create a transformation record
          const transformation = await storage.createTransformation({
            userId,
            originalImagePath: validatedData.originalImagePath,
            prompt: validatedData.prompt,
          });
          
          // Update transformation status to processing
          await storage.updateTransformationStatus(transformation.id, "processing");
          
          try {
            // Transform the image using OpenAI
            const { transformedPath } = await transformImage(
              fullImagePath, 
              validatedData.prompt
            );
            
            // Get relative path for storage
            const relativePath = path.relative(process.cwd(), transformedPath);
            
            // Update transformation with the result
            const updatedTransformation = await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              relativePath
            );
            
            // Update user credits
            if (!user.freeCreditsUsed) {
              await storage.updateUserCredits(userId, true);
            } else if (user.paidCredits > 0) {
              await storage.updateUserCredits(userId, true, user.paidCredits - 1);
            }
            
            // Return the transformation
            res.json({
              id: updatedTransformation.id,
              originalImageUrl: `/uploads/${path.basename(fullImagePath)}`,
              transformedImageUrl: `/uploads/${path.basename(transformedPath)}`,
              prompt: updatedTransformation.prompt,
              status: updatedTransformation.status,
            });
          } catch (error: any) {
            // Update transformation with error
            await storage.updateTransformationStatus(
              transformation.id,
              "failed",
              undefined,
              error.message || 'Unknown error occurred'
            );
            
            throw error;
          }
        } else {
          return res.status(402).json({ message: "No credits available. Please purchase credits to continue." });
        }
      }
    } catch (error: any) {
      console.error("Error transforming image:", error);
      res.status(500).json({ message: `Error transforming image: ${error.message || 'Unknown error occurred'}` });
    }
  });

  // Get user credits
  app.get("/api/credits/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get transformation history
  app.get("/api/transformations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transformations = await storage.getUserTransformations(userId);
      
      res.json(transformations.map(t => ({
        id: t.id,
        originalImageUrl: `/uploads/${path.basename(t.originalImagePath)}`,
        transformedImageUrl: t.transformedImagePath ? `/uploads/${path.basename(t.transformedImagePath)}` : null,
        prompt: t.prompt,
        status: t.status,
        createdAt: t.createdAt,
        error: t.error,
      })));
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Purchase credits (mock implementation)
  app.post("/api/purchase-credits", async (req, res) => {
    try {
      const { userId, credits } = req.body;
      
      if (!userId || !credits || credits <= 0) {
        return res.status(400).json({ message: "Invalid request" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user credits (in a real app, this would happen after payment processing)
      const updatedUser = await storage.updateUserCredits(
        userId, 
        user.freeCreditsUsed, 
        user.paidCredits + credits
      );
      
      res.json({
        freeCreditsUsed: updatedUser.freeCreditsUsed,
        paidCredits: updatedUser.paidCredits,
        message: `Successfully purchased ${credits} credits`,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
