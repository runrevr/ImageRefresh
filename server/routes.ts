import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImage, isOpenAIConfigured } from "./openai";
import { insertTransformationSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";

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
        prompt: z.string().min(1).max(1000).optional(), // Made optional for preset transformations
        userId: z.number().optional(),
        isEdit: z.boolean().optional(),
        previousTransformation: z.string().optional(),
        imageSize: z.string().optional(),
        preset: z.string().optional(), // For predefined transformation types like 'cartoon' or 'product'
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
      
      // Check for preset transformations
      const presetType = validatedData.preset as string | undefined;
      if (presetType === 'cartoon' || presetType === 'product') {
        // Create a transformation record
        const transformation = await storage.createTransformation({
          userId,
          originalImagePath: validatedData.originalImagePath,
          prompt: validatedData.prompt || `Preset transformation: ${presetType}`,
        });
        
        // Update transformation status to processing
        await storage.updateTransformationStatus(transformation.id, "processing");
        
        try {
          // Get user prompt or use an empty string if none provided
          const userPrompt = validatedData.prompt || "";
          
          // Define preset contexts to combine with user input
          let presetPrompt = "";
          
          if (presetType === 'cartoon') {
            // Add cartoon-specific context, combined with user input
            let cartoonContext = "Transform this image into a vibrant cartoon style with bold outlines, simplified shapes, and exaggerated features. ";
            presetPrompt = `${cartoonContext}${userPrompt} Always ensure the original subject from the uploaded image remains the main focus with bright, saturated colors.`;
          } else if (presetType === 'product') {
            // Add product photography context, combined with user input
            let productContext = "Transform this into a professional product photography style with studio lighting, a clean background, perfect exposure, and commercial-quality presentation. ";
            presetPrompt = `${productContext}${userPrompt} Always ensure the product is the clear focal point with enhanced details and accurate colors.`;
          }
          
          // Send directly to gpt-image-1
          const { transformedPath } = await transformImage(
            fullImagePath, 
            presetPrompt,
            validatedData.imageSize
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
            prompt: presetPrompt,
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
        // If this is an edit request, proceed without checking credits (one free edit)
        const isEditRequest = validatedData.isEdit === true;
        
        // Check if free credit is available or paid credits (only for new transformations, not edits)
        if (isEditRequest || !user.freeCreditsUsed || user.paidCredits > 0) {
          // Create a transformation record
          const transformation = await storage.createTransformation({
            userId,
            originalImagePath: validatedData.originalImagePath,
            prompt: validatedData.prompt || "Custom transformation", // Add a default prompt if undefined
          });
          
          // Update transformation status to processing
          await storage.updateTransformationStatus(transformation.id, "processing");
          
          try {
            // Prepare the prompt - enhance it if this is an edit
            let enhancedPrompt = validatedData.prompt;
            
            if (validatedData.isEdit) {
              console.log("Processing an edit request with original image path:", validatedData.originalImagePath);
              
              // For edits, use a simplified prompt that directly describes the desired changes
              // We don't need to emphasize using the original image since we're directly passing it to gpt-image-1
              enhancedPrompt = validatedData.prompt;
              console.log("Using direct prompt for edit:", enhancedPrompt);
            }
            
            // Transform the image using OpenAI with specified image size if provided
            const { transformedPath } = await transformImage(
              fullImagePath, 
              enhancedPrompt || "Custom transformation", // Default value if prompt is undefined
              validatedData.imageSize
            );
            
            // Get relative path for storage
            const relativePath = path.relative(process.cwd(), transformedPath);
            
            // Update transformation with the result
            const updatedTransformation = await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              relativePath
            );
            
            // Update user credits - only for initial transformations, not edits
            if (!isEditRequest) {
              if (!user.freeCreditsUsed) {
                await storage.updateUserCredits(userId, true);
              } else if (user.paidCredits > 0) {
                await storage.updateUserCredits(userId, true, user.paidCredits - 1);
              }
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
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Unknown error' });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Unknown error' });
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
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Unknown error' });
    }
  });
  
  // Add credits to user account (for testing purposes)
  app.post("/api/add-credits/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add 10 credits to the user account
      const updatedUser = await storage.updateUserCredits(
        userId, 
        user.freeCreditsUsed, 
        user.paidCredits + 10
      );
      
      res.json({
        message: "Successfully added 10 credits",
        freeCreditsUsed: updatedUser.freeCreditsUsed,
        paidCredits: updatedUser.paidCredits,
      });
    } catch (error: any) {
      console.error('Error adding credits:', error);
      res.status(500).json({ message: "Error adding credits" });
    }
  });
  
  // Enhance prompt with AI
  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt, imageDescription } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      if (!isOpenAIConfigured()) {
        return res.status(500).json({ message: "OpenAI API key is not configured" });
      }
      
      console.log(`Enhancing prompt: ${prompt}`);
      
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Create a system message that guides the AI to enhance the prompt
        const systemMessage = `You are an expert at creating detailed, descriptive prompts for AI image generation. 
Your task is to enhance the user's prompt by:
1. Adding more specific details about style, lighting, and composition
2. Incorporating keywords that will help the AI understand what is most important to preserve
3. Adding descriptive adjectives to create a more vivid result
4. Maintaining the original intent of the prompt

VERY IMPORTANT: The prompt is being used to transform an uploaded image. The uploaded image 
MUST remain the primary focus of the transformation. Emphasize preserving the original subject 
while applying the requested changes. Add phrases like "maintain the original subject" or 
"preserve the original [product/item/person] as the main focus" to ensure the AI doesn't alter 
the primary subject too dramatically.

Your enhanced prompt MUST be 900 characters or less - this is a strict requirement.
Focus on quality over quantity and be concise while maintaining descriptive language.
If an image description is provided, incorporate relevant elements from it.`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: [
            { 
              role: "system", 
              content: systemMessage 
            },
            { 
              role: "user", 
              content: `Original prompt: "${prompt}"
${imageDescription ? `\nImage description: ${imageDescription}` : ''}
              
Please enhance this prompt for AI image generation while preserving the original intent.
Remember that this prompt is for transforming an uploaded image, so it's critical
that the original subject/object in the image remains the primary focus with minimal
alteration to its core appearance. The transformation should primarily affect the
style, environment, lighting, and background rather than changing the main subject.` 
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
        });
        
        const enhancedPrompt = response.choices[0].message.content?.trim();
        
        if (!enhancedPrompt) {
          throw new Error("Failed to generate enhanced prompt");
        }
        
        // Make sure the enhanced prompt doesn't exceed our limit
        const MAX_PROMPT_LENGTH = 1000; // Match the validation limit 
        const finalPrompt = enhancedPrompt.length > MAX_PROMPT_LENGTH 
          ? enhancedPrompt.substring(0, MAX_PROMPT_LENGTH - 3) + "..." 
          : enhancedPrompt;
        
        console.log("Generated enhanced prompt length:", finalPrompt.length);
        
        res.json({
          originalPrompt: prompt,
          enhancedPrompt: finalPrompt
        });
      } catch (error: any) {
        console.error("Error enhancing prompt:", error);
        res.status(500).json({ 
          message: "Error enhancing prompt", 
          error: error.message 
        });
      }
    } catch (error: any) {
      console.error("Error processing prompt enhancement:", error);
      res.status(500).json({ message: `Error enhancing prompt: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
