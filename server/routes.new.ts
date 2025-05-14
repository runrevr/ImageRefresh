import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { type InsertTransformation } from "../shared/schema";
import { transformImageWithOpenAI } from "./openai-image";

// Configure multer for uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for regular image uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Keep the original extension if it exists
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Create multer instance for file uploads
const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

// Helper function to convert an image file to base64
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`File does not exist: ${imagePath}`);
      throw new Error(`File does not exist: ${imagePath}`);
    }

    // Read the file as binary data
    const imageData = fs.readFileSync(imagePath);
    
    // Convert binary data to base64 encoded string
    return imageData.toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

export function setupRoutes(app: Express): Server {
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Health check route for uptime monitoring
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // User authentication routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Get the user
      const user = await storage.getUserByUsername(username);
      
      // If the user doesn't exist
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if the password matches
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Reset free credits if the month has changed
      await storage.checkAndResetMonthlyFreeCredit(user.id);
      
      // Return the user info
      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error: any) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Error in login", error: error.message });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { name, username, email, password } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      
      // Check if the username already exists
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser({
        name: name || username,
        username,
        password,
        email,
        freeCreditsUsed: false,
        paidCredits: 0
      });
      
      // Return the user info
      res.status(201).json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits
      });
    } catch (error: any) {
      console.error("Error in register:", error);
      res.status(500).json({ message: "Error in register", error: error.message });
    }
  });

  // User data routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset free credits if the month has changed
      await storage.checkAndResetMonthlyFreeCredit(user.id);
      
      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus
      });
    } catch (error: any) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
  });

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

  // Image transformation routes
  app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const imagePath = req.file.path;
      const relativePath = path.relative(process.cwd(), imagePath).replace(/\\/g, '/');
      
      // Return the path relative to the project root
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
      const { originalImagePath, prompt, userId } = req.body;
      
      if (!originalImagePath) {
        return res.status(400).json({ message: "Original image path is required" });
      }
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Create a transformation record
      const transformation = await storage.createTransformation({
        userId: userId || null,
        originalImagePath,
        prompt,
        status: "pending"
      });
      
      // Return the transformation ID immediately
      res.status(202).json({ 
        id: transformation.id,
        status: transformation.status 
      });
      
      // Process the transformation asynchronously
      (async () => {
        try {
          // Perform the transformation
          try {
            console.log(`Starting transformation for ${transformation.id}`);
            
            // Get the absolute path to the image
            const imagePath = originalImagePath;
            const fullImagePath = path.join(process.cwd(), imagePath);
            
            // Verify the image exists
            if (!fs.existsSync(fullImagePath)) {
              throw new Error(`Original image not found at path: ${fullImagePath}`);
            }
            
            // Determine which OpenAI transform method to use
            // For ideas page transformations, we want to use the more sophisticated approach
            let transformedImagePath;
            let secondTransformedImagePath;
            
            if (prompt.length > 300) {
              console.log(`Using detailed prompt approach for ${transformation.id} (prompt length: ${prompt.length})`);
              // Import the more sophisticated transform function from openai.ts
              const { transformImage } = await import('./openai');
              
              try {
                // Try the transformImage function with gpt-image-1 two-stage approach
                console.log(`Attempting to use two-stage transform with gpt-image-1 for ${transformation.id}`);
                const result = await transformImage(imagePath, prompt, "1024x1024");
                transformedImagePath = result.transformedPath;
                secondTransformedImagePath = result.secondTransformedPath;
                console.log(`Two-stage transform successful for ${transformation.id}`);
              } catch (error: any) {
                console.error(`Error using gpt-image-1: ${error.message}`);
                console.log(`Falling back to DALL-E 3 for ${transformation.id}`);
                
                // Fall back to DALL-E 3 if gpt-image-1 fails
                transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
              }
            } else {
              // Use the direct DALL-E 3 approach for simpler prompts
              console.log(`Using simple DALL-E 3 approach for ${transformation.id} (prompt length: ${prompt.length})`);
              transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
            }
            
            console.log(`OpenAI transformation completed for ${transformation.id}, new image at: ${transformedImagePath}`);
            
            // Update the transformation status to "completed"
            await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              transformedImagePath, // Use the transformed image path
              undefined, // No error
              secondTransformedImagePath, // Second transformed image if available
              undefined  // No selected image
            );
            
            console.log(`Transformation record ${transformation.id} updated with status completed`);
            
            // If userId is provided, update their credit balance
            if (userId) {
              try {
                // Get the user
                const user = await storage.getUser(userId);
                if (user) {
                  // Determine free credit status and paid credits
                  const useFreeCredit = !user.freeCreditsUsed;
                  const paidCredits = useFreeCredit ? user.paidCredits : Math.max(0, user.paidCredits - 1);
                  
                  // Update user credits
                  await storage.updateUserCredits(userId, useFreeCredit, paidCredits);
                  
                  if (useFreeCredit) {
                    console.log(`Used free credit for user ${userId}`);
                  } else if (user.paidCredits > 0) {
                    console.log(`Used paid credit for user ${userId}, ${paidCredits} paid credits remaining`);
                  } else {
                    console.log(`User ${userId} has no credits remaining`);
                  }
                }
              } catch (creditError) {
                console.error(`Error updating user credits for user ${userId}:`, creditError);
                // Continue anyway, don't fail the transformation
              }
            }
          } catch (transformError: any) {
            console.error(`Error in transformation processing: ${transformError.message}`);
            
            // Update the transformation status to "failed"
            await storage.updateTransformationStatus(
              transformation.id,
              "failed",
              undefined,
              transformError.message
            );
            
            console.log(`Transformation ${transformation.id} marked as failed due to error`);
          }
        } catch (asyncError: unknown) {
          const error = asyncError as Error;
          console.error(`Error in async transformation processing: ${error.message}`);
          try {
            await storage.updateTransformationStatus(
              transformation.id,
              "failed",
              undefined,
              error.message
            );
          } catch (updateError) {
            console.error("Failed to update transformation status:", updateError);
          }
        }
      })();
    } catch (error: any) {
      console.error("Error creating transformation:", error);
      res.status(500).json({ message: "Error creating transformation", error: error.message });
    }
  });

  app.post("/api/select-image", async (req, res) => {
    try {
      const { transformationId, selectedImagePath } = req.body;
      
      if (!transformationId) {
        return res.status(400).json({ message: "Transformation ID is required" });
      }
      
      if (!selectedImagePath) {
        return res.status(400).json({ message: "Selected image path is required" });
      }
      
      const transformation = await storage.getTransformation(transformationId);
      
      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }
      
      // Update the transformation with the selected image
      const updatedTransformation = await storage.updateTransformationStatus(
        transformationId,
        transformation.status, // Keep the current status
        transformation.transformedImagePath, // Keep the current transformed image path
        transformation.error, // Keep any error message
        transformation.secondTransformedImagePath, // Keep the second transformed image path
        selectedImagePath // Update the selected image path
      );
      
      res.json(updatedTransformation);
    } catch (error: any) {
      console.error("Error selecting image:", error);
      res.status(500).json({ message: "Error selecting image", error: error.message });
    }
  });

  app.get("/api/transformation/:id", async (req, res) => {
    try {
      const transformationId = parseInt(req.params.id);
      
      if (isNaN(transformationId)) {
        return res.status(400).json({ message: "Invalid transformation ID" });
      }
      
      const transformation = await storage.getTransformation(transformationId);
      
      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }
      
      res.json(transformation);
    } catch (error: any) {
      console.error("Error retrieving transformation:", error);
      res.status(500).json({ message: "Error retrieving transformation", error: error.message });
    }
  });

  app.get("/api/transformations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const transformations = await storage.getUserTransformations(userId);
      
      res.json(transformations);
    } catch (error: any) {
      console.error("Error retrieving transformations:", error);
      res.status(500).json({ message: "Error retrieving transformations", error: error.message });
    }
  });

  app.post("/api/edit-transformation", async (req, res) => {
    try {
      const { transformationId, prompt, imageSize } = req.body;
      
      if (!transformationId) {
        return res.status(400).json({ message: "Transformation ID is required" });
      }
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      // Get the original transformation
      const originalTransformation = await storage.getTransformation(transformationId);
      
      if (!originalTransformation) {
        return res.status(404).json({ message: "Original transformation not found" });
      }
      
      // Increment edits used count
      const editsUsed = (originalTransformation.editsUsed || 0) + 1;
      
      // Use the selected image if available, otherwise the first transformed image
      const sourcePath = originalTransformation.selectedImagePath || 
                        originalTransformation.transformedImagePath;
      
      if (!sourcePath) {
        return res.status(400).json({ message: "No valid source image found for editing" });
      }
      
      // Create a new transformation record for the edit
      const editTransformation = await storage.createTransformation({
        userId: originalTransformation.userId,
        originalImagePath: sourcePath,
        prompt,
        status: "pending",
        editsUsed
      });
      
      // Return the transformation ID immediately
      res.status(202).json({ 
        id: editTransformation.id,
        status: editTransformation.status 
      });
      
      // Process the edit transformation asynchronously
      (async () => {
        try {
          try {
            console.log(`Starting edit transformation for ${editTransformation.id} (edit #${editsUsed} of original ${transformationId})`);
            
            // Get the absolute path to the image
            const imagePath = sourcePath;
            const fullImagePath = path.join(process.cwd(), imagePath);
            
            // Verify the image exists
            if (!fs.existsSync(fullImagePath)) {
              throw new Error(`Source image not found at path: ${fullImagePath}`);
            }
            
            // Import the transformImage function for edit
            const { transformImage } = await import('./openai');
            
            let transformedImagePath;
            let secondTransformedImagePath;
            
            try {
              // Try the transformImage function with gpt-image-1 two-stage approach
              // Pass the isEdit flag to better handle edits
              console.log(`Using transformImage for edit ${editTransformation.id}`);
              const result = await transformImage(
                imagePath, 
                prompt, 
                imageSize || "1024x1024",
                true // isEdit flag
              );
              
              transformedImagePath = result.transformedPath;
              secondTransformedImagePath = result.secondTransformedPath;
            } catch (error: any) {
              console.error(`Error using transformImage for edit: ${error.message}`);
              console.log(`Falling back to DALL-E 3 for edit ${editTransformation.id}`);
              
              // Fall back to DALL-E 3 if the other approach fails
              transformedImagePath = await transformImageWithOpenAI(imagePath, prompt);
            }
            
            console.log(`Edit transformation completed for ${editTransformation.id}, new image at: ${transformedImagePath}`);
            
            // Update the transformation status to "completed"
            await storage.updateTransformationStatus(
              editTransformation.id,
              "completed",
              transformedImagePath,
              undefined, // No error
              secondTransformedImagePath // Second transformed image if available
            );
            
            console.log(`Edit transformation record ${editTransformation.id} updated with status completed`);
            
            // If userId is provided, update their credit balance
            if (originalTransformation.userId) {
              try {
                // Get the user
                const user = await storage.getUser(originalTransformation.userId);
                if (user) {
                  // For edits, always use paid credits
                  const paidCredits = Math.max(0, user.paidCredits - 1);
                  
                  // Update user credits
                  await storage.updateUserCredits(
                    originalTransformation.userId,
                    false, // Don't use free credit for edits
                    paidCredits
                  );
                  
                  console.log(`Used paid credit for edit by user ${originalTransformation.userId}, ${paidCredits} paid credits remaining`);
                }
              } catch (creditError) {
                console.error(`Error updating user credits for edit by user ${originalTransformation.userId}:`, creditError);
                // Continue anyway, don't fail the transformation
              }
            }
          } catch (transformError: any) {
            console.error(`Error in edit transformation processing: ${transformError.message}`);
            
            // Update the transformation status to "failed"
            await storage.updateTransformationStatus(
              editTransformation.id,
              "failed",
              undefined,
              transformError.message
            );
            
            console.log(`Edit transformation ${editTransformation.id} marked as failed due to error`);
          }
        } catch (asyncError: unknown) {
          const error = asyncError as Error;
          console.error(`Error in async edit transformation processing: ${error.message}`);
          try {
            await storage.updateTransformationStatus(
              editTransformation.id,
              "failed",
              undefined,
              error.message
            );
          } catch (updateError) {
            console.error("Failed to update edit transformation status:", updateError);
          }
        }
      })();
    } catch (error: any) {
      console.error("Error creating edit transformation:", error);
      res.status(500).json({ message: "Error creating edit transformation", error: error.message });
    }
  });

  // Create the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}