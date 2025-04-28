import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImage, isOpenAIConfigured } from "./openai";
import { insertTransformationSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Stripe from "stripe";
import { setupAuth } from "./auth";

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

// Initialize Stripe with our secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
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
        prompt: z.string().max(5000).optional(), // Increased max length and made optional for preset transformations
        userId: z.number().optional(),
        isEdit: z.boolean().optional(),
        previousTransformation: z.union([z.string(), z.number()]).optional(), // Accept either string or number ID
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
      if (presetType === 'cartoon' || presetType === 'product' || presetType === 'ghibli-style' || presetType === 'mario-style') {
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
          } else if (presetType === 'ghibli-style') {
            // Add Ghibli style context, combined with user input
            let ghibliContext = "Transform this uploaded image into the distinctive Studio Ghibli animation style while preserving the subject's essential features and likeness. Apply the characteristic hand-painted watercolor aesthetic with soft, diffused lighting and a gentle color palette of muted pastels and natural tones. Add delicate line work and careful attention to small details that give depth to the scene. Recreate backgrounds with the studio's signature nature elements - billowing clouds, wind-swept grasses, detailed foliage, or charming rural/traditional architecture. Maintain the subject's core identity but render them with slightly simplified features, larger expressive eyes, and natural-looking hair with visible strands that might flow in a gentle breeze. The overall atmosphere should capture that dreamlike quality between fantasy and reality that defines the Ghibli look - where everyday moments feel magical and environments breathe with life. Include subtle environmental touches like floating dust particles, dappled sunlight, or small background movements that suggest a living world. ";
            presetPrompt = `${ghibliContext}${userPrompt}`;
          } else if (presetType === 'mario-style') {
            // Add 8-bit Mario style context, combined with user input
            let marioContext = `Transform the uploaded image into a vibrant 8-bit pixel art style, reminiscent of classic retro video games. The background should feature a bright, solid blue sky filled with fluffy white pixel clouds, outlined in black with subtle blue pixel highlights. The ground must be constructed from brown, brick-textured tiles arranged in a classic platformer style.

              In the foreground, add a large, vivid green pipe emerging from the ground, possibly with a red-and-green plant creature (similar to a carnivorous vine) rising out of it. Place small turtle-like pixel creatures with green shells scattered playfully across the ground.

              Include suspended floating elements, such as brown brick blocks and special yellow marked blocks with question marks, hinting at hidden rewards or power-ups. From some of these blocks, grow colorful pixelated flowers with white petals and orange centers.

              Fill the background landscape with rolling green hills and rounded, cartoonish trees drawn in simple, bold shapes, outlined in black for a classic pixel-art look.

              Emphasize vibrant, saturated colors, crisp pixel details, and a lively, nostalgic side-scrolling atmosphere full of energy and charm, inspired by iconic 8-bit adventure games.

 `;
            presetPrompt = `${marioContext}${userPrompt} Ensure the original subject from the uploaded image remains the primary focus, pixelated in the 8-bit style but still clearly recognizable.`;
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
        
        // Handle edit requests separately with additional credit tracking
        if (isEditRequest) {
          // Get the previousTransformation to check edit count
          if (!validatedData.previousTransformation) {
            return res.status(400).json({ message: "Previous transformation ID is required for edits" });
          }
          
          // Guard against NaN when parsing previousTransformation
          // The ID could be a number, a URL, or an ID extracted from a filename pattern
          let prevTransformationId: number;
          
          // Handle different types of previousTransformation value
          if (typeof validatedData.previousTransformation === 'number') {
            // If it's already a number, use it directly
            prevTransformationId = validatedData.previousTransformation;
          } else {
            // If it's a string, try to parse it as a number first
            const prevTransformationStr = String(validatedData.previousTransformation);
            prevTransformationId = parseInt(prevTransformationStr);
            
            // If that failed, check if there's a transformation ID pattern in the string
            if (isNaN(prevTransformationId)) {
              // Look for patterns like transformed-12345-filename.jpg (where 12345 is the ID)
              const match = prevTransformationStr.match(/transformed-(\d+)-/);
              if (match && match[1]) {
                prevTransformationId = parseInt(match[1]);
              }
            }
          }
          
          // If we still don't have a valid ID, return an error
          if (isNaN(prevTransformationId)) {
            console.error("Could not extract transformation ID from:", validatedData.previousTransformation);
            return res.status(400).json({ message: "Invalid previous transformation ID" });
          }
          const prevTransformation = await storage.getTransformation(prevTransformationId);
          
          if (!prevTransformation) {
            return res.status(404).json({ message: "Previous transformation not found" });
          }
          
          // Check if this is beyond the first edit (which is free)
          if (prevTransformation.editsUsed > 0) {
            // Additional edits require credits
            if (user.paidCredits <= 0) {
              return res.status(402).json({ 
                message: "You've used your free edit. Additional edits require credits.",
                needsCredits: true 
              });
            }
            
            // Deduct a credit for additional edits
            await storage.updateUserCredits(userId, true, user.paidCredits - 1);
          }
          
          // Update the edits used count
          await storage.incrementEditsUsed(prevTransformationId);
          
          // Create a new transformation record for this edit
          const transformation = await storage.createTransformation({
            userId,
            originalImagePath: validatedData.originalImagePath,
            prompt: validatedData.prompt || "Edit transformation",
          });
          
          // Update transformation status to processing
          await storage.updateTransformationStatus(transformation.id, "processing");
          
          try {
            console.log("Processing an edit request with image path:", validatedData.originalImagePath);
            console.log("Full image path for edit:", fullImagePath);
            
            const enhancedPrompt = validatedData.prompt;
            console.log("Using direct prompt for edit:", enhancedPrompt);
            
            // For edit requests, we're now using the transformed image as the starting point
            // not the original image - this enables iterated edits like in ChatGPT
            const { transformedPath } = await transformImage(
              fullImagePath, 
              enhancedPrompt || "Edit transformation", 
              validatedData.imageSize,
              true // Flag this as an edit operation
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
              prompt: updatedTransformation.prompt,
              status: updatedTransformation.status,
              editsUsed: (prevTransformation.editsUsed || 0) + 1
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
        } 
        // Regular (non-edit) transformations
        else if (!user.freeCreditsUsed || user.paidCredits > 0) {
          // Create a transformation record
          const transformation = await storage.createTransformation({
            userId,
            originalImagePath: validatedData.originalImagePath,
            prompt: validatedData.prompt || "Custom transformation", // Add a default prompt if undefined
          });
          
          // Update transformation status to processing
          await storage.updateTransformationStatus(transformation.id, "processing");
          
          try {
            // Transform the image using OpenAI with specified image size if provided
            const { transformedPath } = await transformImage(
              fullImagePath, 
              validatedData.prompt || "Custom transformation", // Default value if prompt is undefined
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
            
            // Update user credits for initial transformations
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
      
      // Check for content safety rejections from OpenAI
      if (error.message && error.message.includes("safety system")) {
        // Return specific error for content safety issues
        return res.status(400).json({ 
          message: "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.", 
          error: "content_safety" 
        });
      }
      
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
      
      // Add 20 credits to the user account
      const updatedUser = await storage.updateUserCredits(
        userId, 
        user.freeCreditsUsed, 
        user.paidCredits + 20
      );
      
      res.json({
        message: "Successfully added 20 credits",
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

  // Update user email endpoint
  app.post("/api/update-email", async (req, res) => {
    try {
      const { userId, email } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ message: "User ID and email are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user's email
      const updatedUser = await storage.updateUserEmail(userId, email);
      
      res.json({
        success: true,
        email: updatedUser.email,
        message: "Email updated successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || 'Unknown error' });
    }
  });

  // Stripe payment intent creation endpoint
  // Create payment intent for subscription/one-time purchase
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      // Validate authentication
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { planType, credits, amount } = req.body;
      
      if (!planType || !credits || !amount) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      // Create a payment intent with the order amount and currency
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // amount in cents
        currency: "usd",
        // Verify your integration in this guide by including this parameter
        metadata: {
          userId: req.user.id,
          planType,
          credits,
          integration_check: 'accept_a_payment',
        },
      });
      
      // NOTE: Credits are updated via the webhook handler after successful payment
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: `Error creating payment intent: ${error.message}` });
    }
  });

  // Stripe webhook handler
  app.post('/api/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    // This is a simplified example - in production you would verify the signature
    // using a webhook secret from your Stripe dashboard
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log(`PaymentIntent was successful: ${paymentIntent.id}`);
          
          // Update user credits based on metadata
          if (paymentIntent.metadata.userId && paymentIntent.metadata.credits) {
            const userId = parseInt(paymentIntent.metadata.userId);
            const creditsToAdd = parseInt(paymentIntent.metadata.credits);
            
            const user = await storage.getUser(userId);
            if (user) {
              // Add the purchased credits to the user's account
              await storage.updateUserCredits(
                userId, 
                user.freeCreditsUsed, 
                (user.paidCredits || 0) + creditsToAdd
              );
              console.log(`Updated user ${userId} with ${creditsToAdd} additional credits`);
            }
          }
          break;
          
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      // Return a 200 response to acknowledge receipt of the event
      res.json({received: true});
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
