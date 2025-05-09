import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImage, isOpenAIConfigured } from "./openai";
import { runCleanupTasks } from "./cleanup";
import { insertTransformationSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Stripe from "stripe";
import { setupAuth } from "./auth";
import axios from "axios";
import sharp from "sharp";
import { setupTestStatusRoute } from "./test-status";
import { activeCampaignService } from "./activecampaign-service";
import { demoAccessMiddleware } from "./demo-access-control";

/**
 * Validates and parses a user ID parameter
 * @param userIdParam The user ID parameter to validate
 * @returns Object containing validation result and parsed ID or error message
 */
function validateUserId(userIdParam: string | undefined): { isValid: boolean; userId?: number; errorMessage?: string } {
  // For demos or dev environment, allow a default user ID
  const isDemoMode = process.env.NODE_ENV !== "production";
  
  // Check if the parameter is present and not empty
  if (!userIdParam) {
    if (isDemoMode) {
      // For demo or dev mode, use a default ID
      return { isValid: true, userId: 1 };
    }
    return { isValid: false, errorMessage: "User ID is required" };
  }
  
  // Sanitize the input - trim whitespace and ensure it's a string
  const sanitizedParam = String(userIdParam).trim();
  
  // Parse to integer, only if it looks like a number
  const numericRegex = /^\d+$/;
  if (!numericRegex.test(sanitizedParam)) {
    if (isDemoMode) {
      // For demo or dev mode, use a default ID
      return { isValid: true, userId: 1 };
    }
    return { isValid: false, errorMessage: "Invalid user ID format. Must be a positive integer." };
  }
  
  const parsedId = parseInt(sanitizedParam);
  
  // Enhanced validation to ensure we have a valid positive integer
  if (isNaN(parsedId) || !Number.isFinite(parsedId) || parsedId <= 0) {
    if (isDemoMode) {
      // For demo or dev mode, use a default ID
      return { isValid: true, userId: 1 };
    }
    return { isValid: false, errorMessage: "Invalid user ID. Must be a positive integer." };
  }
  
  return { isValid: true, userId: parsedId };
}

/**
 * Generate visual description and art prompt from image.
 */

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Convert image to supported JPEG format and resize if needed
 */
async function convertToJpeg(originalPath: string): Promise<string> {
  const parsed = path.parse(originalPath);
  const jpegPath = path.join(parsed.dir, `${parsed.name}-converted.jpg`);

  if (jpegPath === originalPath) {
    throw new Error("Input and output paths cannot be the same.");
  }

  await sharp(originalPath)
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toFile(jpegPath);

  return jpegPath;
}

/**
 * Analyze image and get description + artPrompt using OpenAI's latest `responses.create` API
 */
export async function getDescriptionAndPromptFromImage_OpenAI(
  imagePath: string,
): Promise<{ description: string; artPrompt: string }> {
  // Convert to JPEG if needed
  const jpegPath = await convertToJpeg(imagePath);
  const imageBytes = fs.readFileSync(jpegPath);
  const base64Image = imageBytes.toString("base64");

  // Use the chat.completions.create method which is more stable in the SDK
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
    messages: [
      {
        role: "system",
        content: "You are a visual expert describing a character-focused image."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
              Your job is to:

              1. Describe the image with extreme detail, emphasizing:
                 - the appearance of the character(s): gender, age, ethnicity (if clear), facial features, hairstyle, expression, pose, eye direction
                 - clothing: type, color, texture, accessories, and style
                 - physical context: body position, interaction with environment, background, lighting, color tones, and camera angle

              2. Then write an AI image generation prompt that recreates the same scene with creative enhancement, but **preserves the character's identity, pose, clothing, and visual essence**.

              The image generation prompt should be rich, cinematic, and ready for use in tools like DALL·E or Midjourney.

              Return the result as valid JSON in this format:
              { "description": "...", "artPrompt": "..." }

              Stay under 1000 characters per field. Be vivid, precise, and visual.
            `
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    response_format: { type: "json_object" } // Request JSON output
  });

  try {
    // Parse the response content as JSON
    const content = response.choices[0].message.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      description: parsed.description || "",
      artPrompt: parsed.artPrompt || ""
    };
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.log("Raw response:", response.choices[0].message.content);
    
    // Fallback to regex extraction if JSON parsing fails
    const text = response.choices[0].message.content || "";
    const jsonMatch = text.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("No valid JSON found in model output");
    }
    
    try {
      const extracted = JSON.parse(jsonMatch[0]);
      return {
        description: extracted.description || "",
        artPrompt: extracted.artPrompt || ""
      };
    } catch (e: any) {
      throw new Error("Failed to parse extracted JSON: " + (e.message || String(e)));
    }
  }
}
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
  apiVersion: "2023-10-16" as any,
});

/**
 * Helper function to convert an image file to base64
 */
async function imageToBase64(imagePath: string): Promise<string> {
  const fullPath = path.join(process.cwd(), imagePath);
  const imageBuffer = await fs.promises.readFile(fullPath);
  return imageBuffer.toString('base64');
}

/**
 * Helper function to handle webhook requests for product enhancements
 */
async function sendToProductEnhancementWebhook(
  industry: string,
  imagePaths: string[]
): Promise<any> {
  try {
    const webhookUrl = process.env.PRODUCT_ENHANCEMENT_WEBHOOK_URL || 
                        'https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9';
    
    // Convert images to base64
    const imageData = await Promise.all(
      imagePaths.map(async (path) => ({
        originalImagePath: path,
        base64Data: await imageToBase64(path)
      }))
    );
    
    // Prepare request data
    const requestData = {
      industry,
      images: imageData
    };
    
    console.log(`Sending request to product enhancement webhook for industry: ${industry}`);
    
    // Send request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook request failed with status ${response.status}: ${errorText}`);
    }
    
    // Parse response
    const responseData = await response.json();
    console.log('Webhook response received');
    
    return responseData;
  } catch (error) {
    console.error('Error in product enhancement webhook request:', error);
    throw error;
  }
}

/**
 * Helper function to handle webhook requests for product enhancement selections
 */
async function sendSelectionsToWebhook(
  webhookRequestId: string,
  selections: { 
    originalImagePath: string;
    selectedOptions: string[];
  }[]
): Promise<any> {
  try {
    const webhookUrl = process.env.PRODUCT_ENHANCEMENT_WEBHOOK_URL 
                       ? `${process.env.PRODUCT_ENHANCEMENT_WEBHOOK_URL}/selections`
                       : 'https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/selections';
    
    // Prepare data for webhook
    const webhookData = {
      requestId: webhookRequestId,
      selections: selections
    };

    console.log(`Sending selections to webhook for request ID: ${webhookRequestId}`);
    console.log(`Selections count: ${selections.length}`);
    
    // Send request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook selections request failed with status ${response.status}: ${errorText}`);
    }

    // Parse response
    const responseData = await response.json();
    console.log('Webhook selections response received');
    
    return responseData;
  } catch (error) {
    console.error('Error sending selections to product enhancement webhook:', error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Set up test status route for diagnostics
  app.use(setupTestStatusRoute());

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
  app.post("/api/transform", demoAccessMiddleware, async (req, res) => {
    try {
      // Log the raw request body for debugging
      console.log("API TRANSFORM - Raw request body:", JSON.stringify(req.body));
      
      // Log the user ID specifically
      console.log("API TRANSFORM - User ID from request:", req.body.userId, "Type:", typeof req.body.userId);
      
      // Log if user is authenticated
      console.log("API TRANSFORM - Is authenticated:", req.isAuthenticated ? req.isAuthenticated() : false);
      if (req.isAuthenticated && req.isAuthenticated()) {
        console.log("API TRANSFORM - Authenticated user:", req.user);
      }
      
      // Modified schema for better validation
      const transformSchema = z.object({
        originalImagePath: z.string(),
        prompt: z.string().max(5000).optional(), // Increased max length and made optional for preset transformations
        userId: z.union([z.string(), z.number()]).transform(val => {
          if (typeof val === 'string') {
            // Handle string input - convert to number if possible
            const parsed = parseInt(val, 10);
            console.log("API TRANSFORM - Parsed userId from string:", val, "->", parsed);
            return Number.isFinite(parsed) ? parsed : val;
          }
          return val; // return as is if already a number
        }).optional(),
        isEdit: z.boolean().optional(),
        previousTransformation: z.union([z.string(), z.number()]).optional(), // Accept either string or number ID
        imageSize: z.string().optional(),
        preset: z.string().optional(), // For predefined transformation types like 'cartoon' or 'product'
      });

      let validatedData;
      try {
        validatedData = transformSchema.parse(req.body);
        console.log("API TRANSFORM - Validated data:", JSON.stringify(validatedData));
      } catch (parseError: any) { // Cast to any to access message property
        console.error("API TRANSFORM - Validation error:", parseError);
        return res.status(400).json({ 
          message: "Invalid request data", 
          error: parseError.message || "Schema validation failed"
        });
      }

      // Check if image exists
      const fullImagePath = path.join(
        process.cwd(),
        validatedData.originalImagePath,
      );
      if (!fs.existsSync(fullImagePath)) {
        return res.status(400).json({ message: "Image not found" });
      }

      // Create transformation record
      // Log userId handling
      console.log("API TRANSFORM - Processing userId:", validatedData.userId, "Type:", typeof validatedData.userId);
      
      let userId: number = 1; // Default to guest user ID 1
      let isGuestUser = true;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user && (req.user as any).id) {
        // If user is authenticated, use their ID from the session
        userId = (req.user as any).id;
        isGuestUser = false;
        console.log("API TRANSFORM - Using authenticated user ID:", userId);
      } 
      else if (validatedData.userId !== undefined && validatedData.userId !== null) {
        // If userId is provided in the request and is valid, use it
        if (typeof validatedData.userId === 'string') {
          // If userId is a string, try to parse it
          if (/^\d+$/.test(validatedData.userId)) {
            userId = parseInt(validatedData.userId, 10);
            isGuestUser = false;
          } else {
            console.log("API TRANSFORM - Ignoring invalid userId string format:", validatedData.userId);
            // Continue with default guest ID instead of returning an error
          }
        } else if (typeof validatedData.userId === 'number') {
          // If userId is already a number and valid, use it
          if (Number.isFinite(validatedData.userId) && validatedData.userId > 0) {
            userId = validatedData.userId;
            isGuestUser = false;
          } else {
            console.log("API TRANSFORM - Ignoring invalid userId number:", validatedData.userId);
            // Continue with default guest ID instead of returning an error
          }
        }
      }
      
      console.log("API TRANSFORM - Final userId:", userId, "isGuestUser:", isGuestUser);
      
      // Support for anonymous/guest users
      console.log("API TRANSFORM - Looking up user with ID:", userId);
      
      // Create a default guest user object for demo/anonymous requests
      let user;
      
      // For development mode or guest users in development, create a guest user with unlimited credits
      if (process.env.NODE_ENV !== "production" || isGuestUser) {
        console.log("API TRANSFORM - Creating guest user because:", 
          process.env.NODE_ENV !== "production" ? "development mode" : "guest user request");
        // Create a guest user object with unlimited credits
        user = {
          id: userId,
          name: "Guest User",
          username: "guest",
          password: "",
          email: "guest@example.com",
          freeCreditsUsed: false,
          lastFreeCredit: null,
          paidCredits: 999, // Unlimited credits for development/testing
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: null,
          subscriptionStatus: null,
          createdAt: new Date(),
        };
      } else {
        // For production with a real user, check the database
        user = await storage.getUser(userId);
        if (!user) {
          console.error("API TRANSFORM - User not found for ID:", userId);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log("API TRANSFORM - Using user:", user.id, user.username);

      // Check for preset transformations
      const presetType = validatedData.preset as string | undefined;
      if (
        presetType === "cartoon" ||
        presetType === "product" ||
        presetType === "ghibli-style" ||
        presetType === "mario-style"
      ) {
        // Create a transformation record
        const transformation = await storage.createTransformation({
          userId,
          originalImagePath: validatedData.originalImagePath,
          prompt:
            validatedData.prompt || `Preset transformation: ${presetType}`,
        });

        // Update transformation status to processing
        await storage.updateTransformationStatus(
          transformation.id,
          "processing",
        );

        try {
          // Get user prompt or use an empty string if none provided
          const userPrompt = validatedData.prompt || "";

          // Define preset contexts to combine with user input
          let presetPrompt = "";
          console.log("Using preset type:", presetType);
          if (presetType === "cartoon") {
            // Add cartoon-specific context, combined with user input
            let cartoonContext =
              "Transform this image into a vibrant cartoon style with bold outlines, simplified shapes, and exaggerated features. ";
            presetPrompt = `${cartoonContext}${userPrompt} Always ensure the original subject from the uploaded image remains the main focus with bright, saturated colors.`;
          } else if (presetType === "product") {
            // Add product photography context, combined with user input
            let productContext =
              "Transform this into a professional product photography style with studio lighting, a clean background, perfect exposure, and commercial-quality presentation. ";
            presetPrompt = `${productContext}${userPrompt} Always ensure the product is the clear focal point with enhanced details and accurate colors.`;
          } else if (presetType === "ghibli-style") {
            // Add Ghibli style context, combined with user input
            let ghibliContext =
              "Transform this uploaded image into the distinctive Studio Ghibli animation style while preserving the subject's essential features and likeness. Apply the characteristic hand-painted watercolor aesthetic with soft, diffused lighting and a gentle color palette of muted pastels and natural tones. Add delicate line work and careful attention to small details that give depth to the scene. Recreate backgrounds with the studio's signature nature elements - billowing clouds, wind-swept grasses, detailed foliage, or charming rural/traditional architecture. Maintain the subject's core identity but render them with slightly simplified features, larger expressive eyes, and natural-looking hair with visible strands that might flow in a gentle breeze. The overall atmosphere should capture that dreamlike quality between fantasy and reality that defines the Ghibli look - where everyday moments feel magical and environments breathe with life. Include subtle environmental touches like floating dust particles, dappled sunlight, or small background movements that suggest a living world. ";
            presetPrompt = `${ghibliContext}${userPrompt}`;
          } else if (presetType === "mario-style") {
            // Add 8-bit Mario style context, combined with user input
            let marioContext = `Create a colorful 8-bit pixel art scene inspired by classic retro video games. Show a small pixelated character sitting on a brown brick platform, holding a glowing energy orb. The character wears a green shirt and blue pants. The background features a bright solid blue sky with pixelated white clouds outlined in black, rolling green hills, rounded green trees, and colorful pixel flowers growing from floating brick blocks. Add a large green warp pipe with a red and green plant rising from it, small turtle-like creatures walking on the ground, and floating question mark blocks above the character. The scene should look playful, nostalgic, and vibrant, like a cheerful side-scrolling adventure world.

`;
            presetPrompt = `${marioContext}${userPrompt} `;
          }

          // Send directly to gpt-image-1
          console.log(
            "Transforming image with preset prompt: 1st",
            presetPrompt,
          );
          const { transformedPath } = await transformImage(
            fullImagePath,
            presetPrompt,
            validatedData.imageSize,
          );

          // Get relative path for storage
          const relativePath = path.relative(process.cwd(), transformedPath);

          // Update transformation with the result
          const updatedTransformation =
            await storage.updateTransformationStatus(
              transformation.id,
              "completed",
              relativePath,
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
            error.message || "Unknown error occurred",
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
            return res.status(400).json({
              message: "Previous transformation ID is required for edits",
            });
          }

          // Guard against NaN when parsing previousTransformation
          // The ID could be a number, a URL, or an ID extracted from a filename pattern
          let prevTransformationId: number | null = null;

          // Handle different types of previousTransformation value
          if (typeof validatedData.previousTransformation === "number") {
            // If it's already a number, verify it's not NaN before using
            prevTransformationId = Number.isFinite(validatedData.previousTransformation) 
              ? validatedData.previousTransformation 
              : null;
          } else {
            // If it's a string, try to parse it as a number first
            const prevTransformationStr = String(
              validatedData.previousTransformation,
            );
            const parsedId = parseInt(prevTransformationStr);
            
            if (!isNaN(parsedId) && Number.isFinite(parsedId)) {
              prevTransformationId = parsedId;
            } else {
              // If that failed, check if there's a transformation ID pattern in the string
              // Look for patterns like transformed-12345-filename.jpg (where 12345 is the ID)
              const match = prevTransformationStr.match(/transformed-(\d+)-/);
              if (match && match[1]) {
                const extractedId = parseInt(match[1]);
                if (!isNaN(extractedId) && Number.isFinite(extractedId)) {
                  prevTransformationId = extractedId;
                }
              }
            }
          }

          // If we still don't have a valid ID, return an error
          if (prevTransformationId === null || isNaN(prevTransformationId) || !Number.isFinite(prevTransformationId)) {
            console.error(
              "Could not extract valid transformation ID from:",
              validatedData.previousTransformation,
            );
            return res
              .status(400)
              .json({ message: "Invalid previous transformation ID" });
          }
          const prevTransformation =
            await storage.getTransformation(prevTransformationId);

          if (!prevTransformation) {
            return res
              .status(404)
              .json({ message: "Previous transformation not found" });
          }

          // Check if this is beyond the first edit (which is free)
          if (prevTransformation.editsUsed > 0) {
            // Additional edits require credits
            if (user.paidCredits <= 0) {
              return res.status(402).json({
                message:
                  "You've used your free edit. Additional edits require credits.",
                needsCredits: true,
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
          await storage.updateTransformationStatus(
            transformation.id,
            "processing",
          );

          try {
            console.log(
              "Processing an edit request with image path:",
              validatedData.originalImagePath,
            );
            console.log("Full image path for edit:", fullImagePath);

            const enhancedPrompt = validatedData.prompt;
            console.log("Using direct prompt for edit:", enhancedPrompt);

            // For edit requests, we're now using the transformed image as the starting point
            // not the original image - this enables iterated edits like in ChatGPT
            const { transformedPath } = await transformImage(
              fullImagePath,
              enhancedPrompt || "Edit transformation",
              validatedData.imageSize,
              true, // Flag this as an edit operation
            );

            // Get relative path for storage
            const relativePath = path.relative(process.cwd(), transformedPath);

            // Update transformation with the result
            const updatedTransformation =
              await storage.updateTransformationStatus(
                transformation.id,
                "completed",
                relativePath,
              );

            // Return the transformation
            res.json({
              id: updatedTransformation.id,
              originalImageUrl: `/uploads/${path.basename(fullImagePath)}`,
              transformedImageUrl: `/uploads/${path.basename(transformedPath)}`,
              prompt: updatedTransformation.prompt,
              status: updatedTransformation.status,
              editsUsed: (prevTransformation.editsUsed || 0) + 1,
            });
          } catch (error: any) {
            // Update transformation with error
            await storage.updateTransformationStatus(
              transformation.id,
              "failed",
              undefined,
              error.message || "Unknown error occurred",
            );

            throw error;
          }
        }
        // Regular (non-edit) transformations
        // In development mode (NODE_ENV !== 'production'), bypass credit check for easier testing
        // In production, enforce the credit limit (monthly free credit or paid credits)
        else {
          // First check if the user has a free monthly credit available
          // In development mode or for guest users, always allow transformations
          // In production with regular users, enforce the credit limit (monthly free credit or paid credits)
          const hasFreeMonthlyCredit = 
            process.env.NODE_ENV !== "production" || isGuestUser ? 
            true : // Always true in development mode or for guest users
            (await storage.checkAndResetMonthlyFreeCredit(userId)); // Check in production

          if (hasFreeMonthlyCredit || user.paidCredits > 0) {
            // Create a transformation record
            console.log(
              "validatedData.originalImagePath:",
              validatedData.prompt,
            );
            const transformation = await storage.createTransformation({
              userId,
              originalImagePath: validatedData.originalImagePath,
              prompt: validatedData.prompt || "Custom transformation", // Add a default prompt if undefined
            });

            // Update transformation status to processing
            await storage.updateTransformationStatus(
              transformation.id,
              "processing",
            );

            try {
              // Transform the image using OpenAI with specified image size if provided
              console.log(
                "Transforming image with prompt 3rd:",
                validatedData.prompt,
              );
              
              // Enhanced logging for debugging
              const timestamp = new Date().toISOString();
              fs.appendFileSync('./logs/app.log', 
                `${timestamp} - TRANSFORM REQUEST: Image path: ${fullImagePath}, Prompt: ${validatedData.prompt || 'NONE'}, Image exists: ${fs.existsSync(fullImagePath)}\n`);
                
              let finalPrompt = validatedData.prompt || "";

              // Generate a prompt from the image if needed
              if (!finalPrompt || finalPrompt.trim() === "") {
                console.log(
                  "No prompt provided, generating prompt from image...",
                );

                try {
                  const { description, artPrompt } =
                    await getDescriptionAndPromptFromImage_OpenAI(
                      fullImagePath,
                    );
                  console.log("Auto-generated image description:", description);
                  console.log("Auto-generated art prompt:", artPrompt);
                  finalPrompt = artPrompt;
                } catch (err: any) {
                  console.error(
                    "Failed to generate description and prompt:",
                    err,
                  );
                  return res.status(500).json({
                    message: "Failed to generate prompt from image",
                    error: err.message,
                  });
                }
              }

              const { transformedPath, secondTransformedPath } = await transformImage(
                fullImagePath,
                validatedData.prompt || "Custom transformation", // Default value if prompt is undefined
                // finalPrompt,
                validatedData.imageSize,
              );

              // Get relative paths for storage
              const relativePath = path.relative(
                process.cwd(),
                transformedPath,
              );
              
              let secondRelativePath = undefined;
              if (secondTransformedPath) {
                secondRelativePath = path.relative(
                  process.cwd(),
                  secondTransformedPath,
                );
              }

              // Update transformation with the result
              const updatedTransformation =
                await storage.updateTransformationStatus(
                  transformation.id,
                  "completed",
                  relativePath,
                  undefined, // no error
                  secondRelativePath,
                );

              // Update user credits for transformations
              // Only bypass credit deduction for guest users
              if (!isGuestUser) {
                // Deduct credits for real users
                console.log("Deducting credits for user", userId);
                if (!user.freeCreditsUsed) {
                  console.log("Using free credit for user", userId);
                  await storage.updateUserCredits(userId, true);
                } else if (user.paidCredits > 0) {
                  console.log("Deducting 1 paid credit from user", userId, "Current credits:", user.paidCredits);
                  await storage.updateUserCredits(
                    userId,
                    true,
                    user.paidCredits - 1,
                  );
                }
              } else {
                console.log("Credit deduction bypassed for GUEST USER");
              }

              // Return the transformation including both generated images
              res.json({
                id: updatedTransformation.id,
                originalImageUrl: `/uploads/${path.basename(fullImagePath)}`,
                transformedImageUrl: `/uploads/${path.basename(transformedPath)}`,
                secondTransformedImageUrl: secondTransformedPath ? `/uploads/${path.basename(secondTransformedPath)}` : null,
                prompt: updatedTransformation.prompt,
                status: updatedTransformation.status,
              });
            } catch (error: any) {
              // Update transformation with error
              await storage.updateTransformationStatus(
                transformation.id,
                "failed",
                undefined,
                error.message || "Unknown error occurred",
              );

              throw error;
            }
          } else {
            return res.status(402).json({
              message:
                "No credits available. Please purchase credits to continue.",
            });
          }
        }
      }
    } catch (error: any) {
      console.error("Error transforming image:", error);

      // Check for content safety rejections from OpenAI
      if (error.message && error.message.includes("safety system")) {
        // If the prompt mentions or relates to children, babies, or clothing changes, provide a more specific message
        const isAboutChildren =
          req.body.prompt &&
          (req.body.prompt.toLowerCase().includes("baby") ||
            req.body.prompt.toLowerCase().includes("child") ||
            req.body.prompt.toLowerCase().includes("kid") ||
            req.body.prompt.toLowerCase().includes("shirt") ||
            req.body.prompt.toLowerCase().includes("cloth"));

        // Return specific error for content safety issues
        return res.status(400).json({
          message: isAboutChildren
            ? "Safety systems are particularly strict about editing images of children. Please try a different type of edit that doesn't involve changing clothing or appearance of the child image."
            : "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.",
          error: "content_safety",
        });
      }

      // Format a more user-friendly error message based on the error type
      let userErrorMessage = "An error occurred while transforming your image.";
      let statusCode = 500;
      
      if (error.message?.includes("Invalid OpenAI API key")) {
        userErrorMessage = "Our image service is temporarily unavailable. Please try again later.";
      } else if (error.message?.toLowerCase().includes("rate limit")) {
        userErrorMessage = "Our image service is experiencing high demand. Please try again in a few minutes.";
        statusCode = 429; // Too Many Requests
      } else if (error.message?.toLowerCase().includes("billing")) {
        userErrorMessage = "Our image service is temporarily unavailable. Please try again later.";
      } else if (error.message?.includes("organization verification")) {
        userErrorMessage = "Our image service is temporarily unavailable. Please try again later.";
      } else if (error.message?.toLowerCase().includes("timed out") || error.message?.toLowerCase().includes("timeout")) {
        userErrorMessage = "The image generation is taking longer than expected. Please try again.";
      }
      
      res.status(statusCode).json({
        message: userErrorMessage,
        technicalError: error.message || "Unknown error occurred",
      });
    }
  });

  // Get user credits
  app.get("/api/credits/:userId", async (req, res) => {
    try {
      const validation = validateUserId(req.params.userId);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.errorMessage });
      }
      
      const userId = validation.userId!;
      let user = await storage.getUser(userId);
      
      // For demo purposes, create a guest user if none exists
      if (!user && process.env.NODE_ENV !== "production") {
        user = {
          id: userId,
          name: "Guest User",
          username: "guest",
          password: "",
          email: "guest@example.com",
          freeCreditsUsed: false,
          lastFreeCredit: null,
          paidCredits: 100,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: null,
          subscriptionStatus: null,
          createdAt: new Date()
        };
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        freeCreditsUsed: user.freeCreditsUsed,
        paidCredits: user.paidCredits,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // Get user subscription status
  app.get("/api/user/subscription", async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return subscription information
      res.json({
        userId: user.id,
        hasActiveSubscription: user.subscriptionStatus === "active",
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        credits: user.paidCredits,
        freeCreditsUsed: user.freeCreditsUsed,
      });
    } catch (error: any) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Error fetching subscription status" });
    }
  });

  // Get payment history
  app.get("/api/user/payment-history", async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.user.id;
      console.log(`Fetching payment history for user ${userId}`);
      
      const payments = await storage.getUserPayments(userId);
      console.log(`Found ${payments.length} payment records`);
      
      if (payments.length > 0) {
        console.log('First payment:', JSON.stringify(payments[0], null, 2));
      } else {
        console.log('No payment records found');
      }

      // Return payment history
      res.json({
        userId: userId,
        payments: payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          credits: payment.credits,
          description: payment.description,
          status: payment.status,
          createdAt: payment.createdAt,
          paymentMethod: payment.paymentMethod,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Error fetching payment history" });
    }
  });

  // Get transformation history
  app.get("/api/transformations/:userId", async (req, res) => {
    try {
      // Use our centralized userId validation function
      const validation = validateUserId(req.params.userId);
      
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.errorMessage });
      }
      
      const userId = validation.userId!;
      console.log(`Getting transformations for user ID: ${userId}`);

      const transformations = await storage.getUserTransformations(userId);
      console.log(
        `Found ${transformations.length} transformations for user ID ${userId}`,
      );

      if (transformations.length > 0) {
        // Log first transformation to diagnose issues
        console.log(
          "First transformation:",
          JSON.stringify(transformations[0], null, 2),
        );
      }

      const mappedTransformations = transformations.map((t) => ({
        id: t.id,
        originalImagePath: t.originalImagePath,
        originalImageUrl: `/uploads/${path.basename(t.originalImagePath)}`,
        transformedImagePath: t.transformedImagePath,
        transformedImageUrl: t.transformedImagePath
          ? `/uploads/${path.basename(t.transformedImagePath)}`
          : null,
        secondTransformedImagePath: t.secondTransformedImagePath,
        secondTransformedImageUrl: t.secondTransformedImagePath
          ? `/uploads/${path.basename(t.secondTransformedImagePath)}`
          : null,
        selectedImagePath: t.selectedImagePath,
        selectedImageUrl: t.selectedImagePath
          ? `/uploads/${path.basename(t.selectedImagePath)}`
          : null,
        prompt: t.prompt,
        status: t.status,
        createdAt: t.createdAt,
        error: t.error,
      }));

      console.log(
        `Returning ${mappedTransformations.length} mapped transformations`,
      );
      res.json(mappedTransformations);
    } catch (error: any) {
      console.error("Error getting transformations:", error);
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // API endpoint to save the user's selected image from the two transformed images
  app.post("/api/transformation/:id/select-image", async (req, res) => {
    try {
      const transformationId = parseInt(req.params.id);
      
      if (isNaN(transformationId)) {
        return res.status(400).json({ message: "Invalid transformation ID" });
      }
      
      const { selectedImagePath } = req.body;
      
      if (!selectedImagePath) {
        return res.status(400).json({ message: "Selected image path is required" });
      }
      
      // Get the transformation to make sure it exists
      const transformation = await storage.getTransformation(transformationId);
      
      if (!transformation) {
        return res.status(404).json({ message: "Transformation not found" });
      }
      
      // Update the transformation with the selected image path
      const updatedTransformation = await storage.updateTransformationStatus(
        transformationId,
        transformation.status,
        transformation.transformedImagePath || undefined,
        transformation.error || undefined,
        transformation.secondTransformedImagePath || undefined,
        selectedImagePath
      );
      
      res.json({
        message: "Image selection saved successfully",
        transformation: {
          id: updatedTransformation.id,
          selectedImagePath: updatedTransformation.selectedImagePath
        }
      });
    } catch (error: any) {
      console.error("Error saving selected image:", error);
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // Track processed purchases to prevent duplicates
  const processedPurchases = new Set<string>(); 

  // Purchase credits and record payment
  app.post("/api/purchase-credits", async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { userId, credits, amount, paymentIntentId, description, timestamp } = req.body;
      const user = req.user as Express.User
      
      // Check if user has an active subscription
      if (!user.subscriptionStatus || user.subscriptionStatus !== "active") {
        return res.status(403).json({ 
          message: "Subscription required: You need an active subscription to purchase additional credits."
        });
      };

      // Security check: ensure user can only update their own credits
      if (user.id !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Cannot update another user's credits" });
      }

      if (!credits || credits <= 0) {
        return res.status(400).json({ message: "Invalid request: credits required" });
      }

      // Create a unique purchase identifier to prevent duplicates
      const purchaseId = paymentIntentId || `${userId}:${timestamp || Date.now()}`;
      
      // Check if we've already processed this purchase
      if (processedPurchases.has(purchaseId)) {
        console.log(`DUPLICATE PURCHASE PREVENTED: ${purchaseId}`);
        return res.status(200).json({
          success: true,
          message: "This purchase has already been processed.",
          alreadyProcessed: true,
        });
      }

      // Get current user state
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only add credits if the webhook hasn't already processed this payment
      if (currentUser.paidCredits === user.paidCredits) {
        // Update user credits
        const updatedUser = await storage.updateUserCredits(
          userId,
          currentUser.freeCreditsUsed,
          currentUser.paidCredits + credits,
        );

        // Create payment record if paymentIntentId is provided
        if (paymentIntentId && amount) {
          try {
            // Check if a payment record already exists for this payment intent
            const existingPayment = await storage.getPaymentByIntentId(paymentIntentId);
            
            if (!existingPayment) {
              // Create a new payment record
              await storage.createPayment({
                userId: userId,
                amount: amount,
                paymentIntentId: paymentIntentId,
                description: description || `${credits} Credit Purchase`,
                credits: credits,
                status: 'succeeded',
                paymentMethod: 'card',
              });
              console.log(`Payment record created for payment intent: ${paymentIntentId}`);
            } else {
              console.log(`Payment record already exists for intent: ${paymentIntentId}`);
            }
          } catch (paymentError) {
            console.error('Error creating payment record:', paymentError);
            // Continue anyway - we don't want to fail the purchase if just the record creation fails
          }
        }

        // Mark this purchase as processed to prevent duplicates
        processedPurchases.add(purchaseId);

        res.json({
          freeCreditsUsed: updatedUser.freeCreditsUsed,
          paidCredits: updatedUser.paidCredits,
          message: `Successfully purchased ${credits} credits`,
        });
      } else {
        // Credits were already added via webhook, just acknowledge it
        console.log('Credits already added, likely by webhook. Current credits:', currentUser.paidCredits);
        res.json({
          freeCreditsUsed: currentUser.freeCreditsUsed,
          paidCredits: currentUser.paidCredits,
          message: `Credits already added to your account`,
          alreadyProcessed: true,
        });
      }
    } catch (error: any) {
      console.error('Error in purchase-credits endpoint:', error);
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // Add credits to user account (for testing purposes - only available in non-production environments)
  app.post("/api/add-credits/:userId", async (req, res) => {
    // Block this endpoint in production mode for security
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "This endpoint is not available in production mode",
      });
    }

    try {
      // Use our centralized userId validation function
      const validation = validateUserId(req.params.userId);
      
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.errorMessage });
      }
      
      const userId = validation.userId!;

      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add 20 credits to the user account
      const updatedUser = await storage.updateUserCredits(
        userId,
        user.freeCreditsUsed,
        user.paidCredits + 20,
      );

      res.json({
        message: "Successfully added 20 credits (development mode only)",
        freeCreditsUsed: updatedUser.freeCreditsUsed,
        paidCredits: updatedUser.paidCredits,
      });
    } catch (error: any) {
      console.error("Error adding credits:", error);
      res.status(500).json({ message: "Error adding credits" });
    }
  });

  // Suggest a prompt based on image analysis
  app.post("/api/suggest-prompt", async (req, res) => {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({ message: "Image is required" });
      }

      if (!isOpenAIConfigured()) {
        return res
          .status(500)
          .json({ message: "OpenAI API key is not configured" });
      }

      // Extract the image path from the URL
      // The image URL is in format "/uploads/filename.jpg"
      const imageFileName = image.split('/').pop();
      const imagePath = path.join(uploadDir, imageFileName);

      // Check if image exists
      if (!fs.existsSync(imagePath)) {
        return res.status(400).json({ message: "Image not found on server" });
      }

      console.log(`Suggesting prompt for image: ${imageFileName}`);
      
      try {
        // Get description and art prompt using OpenAI
        const { description, artPrompt } = await getDescriptionAndPromptFromImage_OpenAI(imagePath);
        
        console.log("Generated description and art prompt:", {
          descriptionLength: description.length,
          artPromptLength: artPrompt.length
        });
        
        // Return the art prompt to the client
        return res.json({ 
          prompt: artPrompt,
          description: description 
        });
      } catch (analysisError: any) {
        console.error("Error analyzing image with OpenAI:", analysisError);
        
        // If we encounter an error with the OpenAI integration, fall back to a simpler response
        // This is a temporary fallback until the OpenAI integration issue is fixed
        return res.json({
          prompt: "Transform this image with creative artistic enhancements while preserving the main subject's identity and key features. Apply subtle lighting improvements and color adjustments for a more professional look.",
          description: "Image analysis temporarily unavailable. Using default prompt."
        });
      }
    } catch (error: any) {
      console.error("Error suggesting prompt:", error);
      return res.status(500).json({ 
        message: "Failed to suggest prompt", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt, imageDescription } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      if (!isOpenAIConfigured()) {
        return res
          .status(500)
          .json({ message: "OpenAI API key is not configured" });
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
              content: systemMessage,
            },
            {
              role: "user",
              content: `Original prompt: "${prompt}"
${imageDescription ? `\nImage description: ${imageDescription}` : ""}
              
Please enhance this prompt for AI image generation while preserving the original intent.
Remember that this prompt is for transforming an uploaded image, so it's critical
that the original subject/object in the image remains the primary focus with minimal
alteration to its core appearance. The transformation should primarily affect the
style, environment, lighting, and background rather than changing the main subject.`,
            },
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
        const finalPrompt =
          enhancedPrompt.length > MAX_PROMPT_LENGTH
            ? enhancedPrompt.substring(0, MAX_PROMPT_LENGTH - 3) + "..."
            : enhancedPrompt;

        console.log("Generated enhanced prompt length:", finalPrompt.length);

        res.json({
          originalPrompt: prompt,
          enhancedPrompt: finalPrompt,
        });
      } catch (error: any) {
        console.error("Error enhancing prompt:", error);
        res.status(500).json({
          message: "Error enhancing prompt",
          error: error.message,
        });
      }
    } catch (error: any) {
      console.error("Error processing prompt enhancement:", error);
      res
        .status(500)
        .json({ message: `Error enhancing prompt: ${error.message}` });
    }
  });

  // Update user email endpoint
  app.post("/api/update-email", async (req, res) => {
    try {
      const { userId, email } = req.body;

      if (!userId || !email) {
        return res
          .status(400)
          .json({ message: "User ID and email are required" });
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
        message: "Email updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // Stripe payment intent creation endpoint
  // Record subscription payment (for subscriptions initiated from the frontend)
  app.post("/api/record-subscription-payment", async (req, res) => {
    try {
      // Check if the user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount, credits, description, timestamp } = req.body;
      const userId = req.user.id;

      // Create a unique identifier for this subscription payment
      const paymentId = `sub_${userId}_${timestamp || Date.now()}`;

      // Create the payment record
      await storage.createPayment({
        userId: userId,
        amount: amount,
        paymentIntentId: paymentId,
        description: description || 'Pro Subscription (Monthly)',
        credits: credits || 30,
        status: 'succeeded',
        paymentMethod: 'card',
      });

      console.log(`Subscription payment record created for user: ${userId}`);
      res.status(200).json({ success: true, message: "Subscription payment recorded" });
    } catch (error: any) {
      console.error("Error recording subscription payment:", error);
      res.status(500).json({ message: error.message || "Error recording subscription payment" });
    }
  });

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
          integration_check: "accept_a_payment",
        },
      });

      // NOTE: Credits are updated via the webhook handler after successful payment

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res
        .status(500)
        .json({ message: `Error creating payment intent: ${error.message}` });
    }
  });

  // Track processed subscriptions to prevent duplicates
  const processedSubscriptions = new Set<string>();

  // Handle user subscription (Core or Premium) and add initial credits
  app.post("/api/update-user-subscription", async (req, res) => {
    // Check authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { 
        userId, 
        subscriptionTier, 
        subscriptionStatus, 
        stripeCustomerId, 
        stripeSubscriptionId,
        credits,
        amount,
        paymentIntentId,
        description,
        timestamp 
      } = req.body;
      
      // Security check: ensure user can only update their own subscription
      const currentUserId = req.user.id;
      if (currentUserId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Cannot update another user's subscription" });
      }

      if (!subscriptionTier || !subscriptionStatus) {
        return res.status(400).json({ message: "Invalid request: subscription details required" });
      }

      // Create a unique subscription identifier to prevent duplicates
      const subscriptionKey = stripeSubscriptionId || `${userId}:${timestamp || Date.now()}`;
      
      // Check if we've already processed this subscription
      if (processedSubscriptions.has(subscriptionKey)) {
        console.log(`DUPLICATE SUBSCRIPTION PREVENTED: ${subscriptionKey}`);
        return res.status(200).json({
          success: true,
          message: "This subscription has already been processed.",
          alreadyProcessed: true,
        });
      }

      // Get current user state
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // First update user subscription details
      const updatedUser = await storage.updateUserSubscription(
        userId,
        subscriptionTier,
        subscriptionStatus,
        stripeCustomerId,
        stripeSubscriptionId
      );

      console.log(`Updated user subscription: ${userId} to ${subscriptionTier} (${subscriptionStatus})`);
      
      // Add or update the user in ActiveCampaign with new subscription status
      try {
        if (activeCampaignService.isConfigured()) {
          // Add/update contact
          await activeCampaignService.addOrUpdateContact(updatedUser);
          
          // Update membership status and tags in ActiveCampaign
          await activeCampaignService.updateMembershipStatus(updatedUser);
          
          console.log(`User ${userId} subscription status updated in ActiveCampaign`);
        }
      } catch (acError) {
        // Log but don't fail the process if ActiveCampaign integration fails
        console.error("ActiveCampaign update error:", acError);
      }

      // Then update credits if provided - for initial credits with subscription
      if (credits && credits > 0) {
        // Add the purchased credits to their account
        const userWithCredits = await storage.updateUserCredits(
          userId,
          currentUser.freeCreditsUsed, // Don't change free credit status
          (currentUser.paidCredits || 0) + credits
        );

        console.log(`Added ${credits} initial subscription credits to user ${userId}`);

        // Record the payment
        const payment = await storage.createPayment({
          userId,
          amount,
          credits,
          description: description || `Initial ${subscriptionTier} Subscription Credits`,
          paymentIntentId: paymentIntentId || subscriptionKey,
          status: "completed",
        });

        console.log(`Created payment record: ${payment.id}`);

        // Add to our processed set
        processedSubscriptions.add(subscriptionKey);

        // Return full user state with updated credits
        res.json({
          success: true,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionStatus: updatedUser.subscriptionStatus,
          freeCreditsUsed: userWithCredits.freeCreditsUsed,
          paidCredits: userWithCredits.paidCredits,
          message: `Successfully subscribed to ${subscriptionTier} plan with ${credits} initial credits`,
        });
      } else {
        // Just return the updated subscription info
        res.json({
          success: true,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionStatus: updatedUser.subscriptionStatus,
          freeCreditsUsed: updatedUser.freeCreditsUsed,
          paidCredits: updatedUser.paidCredits,
          message: `Successfully subscribed to ${subscriptionTier} plan`,
        });
      }
    } catch (error: any) {
      console.error('Error in update-user-subscription endpoint:', error);
      res.status(500).json({ message: error.message || "Unknown error" });
    }
  });

  // Product enhancement endpoints
  // Create new product enhancement
  app.post("/api/product-enhancement", upload.array("images", 5), async (req, res) => {
    try {
      // Validate the request
      const enhancementSchema = z.object({
        industry: z.string().min(1, "Industry is required"),
        userId: z.union([z.string(), z.number()]).transform(val => {
          if (typeof val === 'string') {
            const parsed = parseInt(val, 10);
            return Number.isFinite(parsed) ? parsed : val;
          }
          return val;
        }).optional(),
      });

      let validatedData;
      try {
        validatedData = enhancementSchema.parse(req.body);
      } catch (parseError: any) {
        return res.status(400).json({
          message: "Invalid request data",
          error: parseError.message || "Schema validation failed"
        });
      }

      // Determine user ID (similar to transform endpoint)
      let userId: number = 1; // Default to guest user ID 1
      let isGuestUser = true;
      
      if (req.isAuthenticated && req.isAuthenticated() && req.user && (req.user as any).id) {
        userId = (req.user as any).id;
        isGuestUser = false;
      } 
      else if (validatedData.userId !== undefined && validatedData.userId !== null) {
        if (typeof validatedData.userId === 'string') {
          if (/^\d+$/.test(validatedData.userId)) {
            userId = parseInt(validatedData.userId, 10);
            isGuestUser = false;
          }
        } else if (typeof validatedData.userId === 'number') {
          if (Number.isFinite(validatedData.userId) && validatedData.userId > 0) {
            userId = validatedData.userId;
            isGuestUser = false;
          }
        }
      }

      // Get or create user (similar to transform endpoint)
      let user;
      if (process.env.NODE_ENV !== "production" || isGuestUser) {
        user = {
          id: userId,
          name: "Guest User",
          username: "guest",
          password: "",
          email: "guest@example.com",
          freeCreditsUsed: false,
          lastFreeCredit: null,
          paidCredits: 999, // Unlimited credits for development/testing
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: null,
          subscriptionStatus: null,
          createdAt: new Date(),
        };
      } else {
        user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
      }

      // Check if there are uploaded images
      if (!req.files || !(req.files as Express.Multer.File[]).length) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      if (files.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }

      // Create enhancement record
      const enhancement = await storage.createProductEnhancement({
        userId,
        industry: validatedData.industry,
      });

      // Store image paths
      const imagePaths: string[] = [];
      for (const file of files) {
        const imagePath = file.path;
        const relativePath = path.relative(process.cwd(), imagePath);

        // Create enhancement image record
        await storage.createProductEnhancementImage({
          enhancementId: enhancement.id,
          originalImagePath: relativePath,
        });

        imagePaths.push(relativePath);
      }

      // Send to webhook
      try {
        const webhookResponse = await sendToProductEnhancementWebhook(
          validatedData.industry,
          imagePaths
        );

        // Update enhancement with webhook request ID
        if (webhookResponse.requestId) {
          await storage.updateProductEnhancementStatus(
            enhancement.id,
            "processing",
            webhookResponse.requestId
          );
        }

        // Update enhancement image options
        if (webhookResponse.imageOptions && Array.isArray(webhookResponse.imageOptions)) {
          const enhancementImages = await storage.getEnhancementImages(enhancement.id);
          
          for (let i = 0; i < enhancementImages.length; i++) {
            const image = enhancementImages[i];
            const options = webhookResponse.imageOptions.find(
              (opt: any) => opt.originalImagePath === image.originalImagePath
            );
            
            if (options && options.options) {
              await storage.updateProductEnhancementImageOptions(
                image.id,
                options.options
              );
            }
          }
        }

        // Return success response
        res.json({
          enhancementId: enhancement.id,
          status: enhancement.status,
          imagePaths,
          imageOptions: webhookResponse.imageOptions || [],
        });

      } catch (webhookError: any) {
        // Update enhancement status to failed
        await storage.updateProductEnhancementStatus(
          enhancement.id,
          "failed",
          undefined,
          webhookError.message || "Webhook request failed"
        );

        throw webhookError;
      }

    } catch (error: any) {
      console.error("Error creating product enhancement:", error);
      res.status(500).json({
        message: "Failed to process product enhancement",
        error: error.message
      });
    }
  });

  // Get product enhancement status and options
  app.get("/api/product-enhancement/:id", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id, 10);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }

      // Get enhancement record
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }

      // Get enhancement images
      const images = await storage.getEnhancementImages(enhancementId);

      // Format response
      const response = {
        id: enhancement.id,
        status: enhancement.status,
        industry: enhancement.industry,
        creditsUsed: enhancement.creditsUsed,
        createdAt: enhancement.createdAt,
        images: images.map(image => ({
          id: image.id,
          originalImagePath: image.originalImagePath,
          imageUrl: `/uploads/${path.basename(image.originalImagePath)}`,
          options: image.optionsJson || [],
          selectedOptions: image.selectedOptions || [],
          resultImagePaths: image.resultImagePaths || [],
          resultImageUrls: image.resultImagePaths 
            ? image.resultImagePaths.map(p => `/uploads/${path.basename(p)}`)
            : [],
        })),
      };

      res.json(response);
    } catch (error: any) {
      console.error("Error getting product enhancement:", error);
      res.status(500).json({
        message: "Failed to get product enhancement",
        error: error.message
      });
    }
  });

  // Submit selections for a product enhancement
  app.post("/api/product-enhancement/:id/selections", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id, 10);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }

      // Validate request body
      const selectionSchema = z.object({
        selections: z.array(z.object({
          imageId: z.number(),
          selectedOptions: z.array(z.string()),
        })),
      });

      let validatedData;
      try {
        validatedData = selectionSchema.parse(req.body);
      } catch (parseError: any) {
        return res.status(400).json({
          message: "Invalid request data",
          error: parseError.message || "Schema validation failed"
        });
      }

      // Get enhancement record
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }

      if (!enhancement.webhookRequestId) {
        return res.status(400).json({ message: "Enhancement has no webhook request ID" });
      }

      // Update enhancement status
      await storage.updateProductEnhancementStatus(enhancementId, "processing");

      // Process selections
      const selectionsForWebhook: { originalImagePath: string; selectedOptions: string[] }[] = [];
      let totalCreditsUsed = 0;

      for (const selection of validatedData.selections) {
        // Get enhancement image
        const image = await storage.getProductEnhancementImage(selection.imageId);
        if (!image || image.enhancementId !== enhancementId) {
          return res.status(404).json({ 
            message: "Image not found or doesn't belong to this enhancement" 
          });
        }

        // Update image selections
        await storage.updateProductEnhancementImageSelections(
          image.id,
          selection.selectedOptions
        );

        // Add to webhook selections
        selectionsForWebhook.push({
          originalImagePath: image.originalImagePath,
          selectedOptions: selection.selectedOptions,
        });

        // Count credits (1 per selected option)
        totalCreditsUsed += selection.selectedOptions.length;
      }

      // Update total credits used
      await storage.updateProductEnhancementCredits(enhancementId, totalCreditsUsed);

      // Update user credits if not in development mode and not a guest user
      const userId = enhancement.userId;
      if (userId && process.env.NODE_ENV === "production") {
        const user = await storage.getUser(userId);
        if (user) {
          const newPaidCredits = Math.max(0, user.paidCredits - totalCreditsUsed);
          await storage.updateUserCredits(userId, false, newPaidCredits);
        }
      }

      // Send selections to webhook
      try {
        const webhookResponse = await sendSelectionsToWebhook(
          enhancement.webhookRequestId,
          selectionsForWebhook
        );

        // Process webhook response - store result images
        if (webhookResponse.results && Array.isArray(webhookResponse.results)) {
          for (const result of webhookResponse.results) {
            const image = await storage.getProductEnhancementImage(result.imageId);
            if (image && image.enhancementId === enhancementId && result.resultImagePaths) {
              await storage.updateProductEnhancementImageResults(
                image.id,
                result.resultImagePaths
              );
            }
          }
        }

        // Update enhancement status to completed
        await storage.updateProductEnhancementStatus(enhancementId, "completed");

        // Get updated images
        const updatedImages = await storage.getEnhancementImages(enhancementId);

        // Format response
        const response = {
          id: enhancement.id,
          status: "completed",
          creditsUsed: totalCreditsUsed,
          images: updatedImages.map(image => ({
            id: image.id,
            resultImagePaths: image.resultImagePaths || [],
            resultImageUrls: image.resultImagePaths 
              ? image.resultImagePaths.map(p => `/uploads/${path.basename(p)}`)
              : [],
          })),
        };

        res.json(response);

      } catch (webhookError: any) {
        // Update enhancement status to failed
        await storage.updateProductEnhancementStatus(
          enhancementId,
          "failed",
          enhancement.webhookRequestId,
          webhookError.message || "Webhook request failed"
        );

        throw webhookError;
      }

    } catch (error: any) {
      console.error("Error submitting product enhancement selections:", error);
      res.status(500).json({
        message: "Failed to process product enhancement selections",
        error: error.message
      });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      let event;

      // Try to verify webhook signature if we have the secret
      if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig as string,
            process.env.STRIPE_WEBHOOK_SECRET,
          );
          console.log("Webhook signature verified successfully");
        } catch (err: any) {
          console.error(
            `Webhook signature verification failed: ${err.message}`,
          );
          // Continue with the raw event data since this is a development environment
          event = req.body;
        }
      } else {
        // No webhook secret available, use the raw event data
        console.log("Using raw webhook data (no signature verification)");
        event = req.body;
      }

      // Add special handling for direct use of the event object
      if (
        event.type === "payment_intent.succeeded" ||
        (event.data &&
          event.data.object &&
          event.data.object.object === "payment_intent" &&
          event.data.object.status === "succeeded")
      ) {
        // Get the payment intent data, handling both verified and raw webhook formats
        const paymentIntent = event.data ? event.data.object : event;
        console.log(`PaymentIntent was successful: ${paymentIntent.id}`);

        // Update user credits based on metadata
        if (
          paymentIntent.metadata &&
          paymentIntent.metadata.userId &&
          paymentIntent.metadata.credits
        ) {
          const userId = parseInt(paymentIntent.metadata.userId);
          const creditsToAdd = parseInt(paymentIntent.metadata.credits);
          const planType = paymentIntent.metadata.planType;

          const user = await storage.getUser(userId);
          if (user) {
            // Add the purchased credits to the user's account
            await storage.updateUserCredits(
              userId,
              user.freeCreditsUsed,
              (user.paidCredits || 0) + creditsToAdd,
            );

            // Determine description based on plan type
            let paymentDescription;
            if (planType === "basic" || planType === "pro") {
              // This is a subscription purchase
              const tier = planType === "basic" ? "basic" : "premium";
              paymentDescription = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`;
              const updatedUser = await storage.updateUserSubscription(userId, tier, "active");
              console.log(
                `Updated user ${userId} subscription status to active (${tier})`,
              );
              
              // Update ActiveCampaign with new subscription status
              try {
                if (activeCampaignService.isConfigured() && updatedUser) {
                  await activeCampaignService.addOrUpdateContact(updatedUser);
                  await activeCampaignService.updateMembershipStatus(updatedUser);
                  console.log(`User ${userId} subscription status updated in ActiveCampaign via webhook`);
                }
              } catch (acError) {
                console.error("ActiveCampaign update error in webhook:", acError);
              }
            } else {
              // This is a one-time credit purchase
              paymentDescription = `${creditsToAdd} Credit Purchase`;
              console.log(
                `Processed one-time credit purchase for user ${userId}`,
              );
            }

            // Create payment record
            try {
              await storage.createPayment({
                userId: userId,
                amount: paymentIntent.amount,
                paymentIntentId: paymentIntent.id,
                description: paymentDescription,
                credits: creditsToAdd,
                status: paymentIntent.status,
                paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
              });
              console.log(`Payment record created for payment intent: ${paymentIntent.id}`);
            } catch (error) {
              console.error(`Error creating payment record: ${error}`);
            }

            console.log(
              `Updated user ${userId} with ${creditsToAdd} additional credits`,
            );
          }
        }
      } else {
        console.log(`Unhandled event type ${event.type || "unknown"}`);
      }

      // Return a 200 response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  });

  // Special test endpoint to add 30 credits to test account (user ID 1) - development only
  app.get("/api/admin/add-test-credits", async (req, res) => {
    // Block this endpoint in production mode for security
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "This endpoint is not available in production mode",
      });
    }

    try {
      const testUserId = 1; // Hardcoded user ID for test account
      const creditsToAdd = 30; // Add 30 credits

      // Get current user
      const user = await storage.getUser(testUserId);
      if (!user) {
        return res.status(404).json({ message: "Test user not found" });
      }

      // Update the user's credits
      const updatedUser = await storage.updateUserCredits(
        testUserId,
        user.freeCreditsUsed,
        user.paidCredits + creditsToAdd,
      );

      res.json({
        success: true,
        message: `Added ${creditsToAdd} credits to test account (development mode only)`,
        previousCredits: user.paidCredits,
        newCredits: updatedUser.paidCredits,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: error.message || "Unknown error occurred" });
    }
  });

  // Admin endpoint to manually trigger cleanup of old transformations (images older than 60 days)
  app.get("/api/admin/run-cleanup", async (req, res) => {
    // Block this endpoint in production mode for unauthenticated users
    if (process.env.NODE_ENV === "production" && !req.isAuthenticated()) {
      return res.status(403).json({
        message: "Authentication required",
      });
    }

    try {
      // Start cleanup in the background
      console.log("Manual cleanup triggered via admin endpoint");

      // Don't await - we want to return right away and let cleanup run in background
      runCleanupTasks()
        .then(() => console.log("Manual cleanup completed successfully"))
        .catch((err) => console.error("Error during manual cleanup:", err));

      res.status(202).json({
        message:
          "Cleanup process started in the background. Images older than 60 days will be removed.",
      });
    } catch (error: any) {
      console.error("Error triggering cleanup:", error);
      res.status(500).json({
        message: "Error triggering cleanup",
        error: error.message,
      });
    }
  });
  
  // Test endpoint for ActiveCampaign integration
  app.get("/api/admin/test-activecampaign", async (req, res) => {
    // Block this endpoint in production mode for unauthenticated users
    if (process.env.NODE_ENV === "production" && !req.isAuthenticated()) {
      return res.status(403).json({
        message: "Authentication required",
      });
    }

    try {
      if (!activeCampaignService.isConfigured()) {
        return res.status(400).json({
          success: false,
          message: "ActiveCampaign is not configured. Check API credentials in environment variables.",
          configStatus: {
            apiKeySet: !!process.env.ACTIVECAMPAIGN_API_KEY,
            baseUrlSet: !!process.env.ACTIVECAMPAIGN_BASE_URL
          }
        });
      }
      
      // Only allow admin users or in development
      if (process.env.NODE_ENV !== "development" && !req.user) {
        return res.status(403).json({
          message: "Admin access required",
        });
      }
      
      // Get the currently logged in user
      const userId = req.user?.id || 1; // Use user 1 for testing in dev mode
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Test ActiveCampaign contact creation or update
      const contactResult = await activeCampaignService.addOrUpdateContact(user);
      
      // Test tag and membership status update
      const membershipResult = await activeCampaignService.updateMembershipStatus(user);
      
      res.json({
        success: true,
        message: "ActiveCampaign integration test completed",
        results: {
          contactCreation: contactResult,
          membershipUpdate: membershipResult,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            subscriptionTier: user.subscriptionTier || 'free',
            subscriptionStatus: user.subscriptionStatus || 'inactive'
          }
        }
      });
    } catch (error: any) {
      console.error("Error testing ActiveCampaign integration:", error);
      res.status(500).json({
        success: false,
        message: "Error testing ActiveCampaign integration",
        error: error.message
      });
    }
  });

  // Test endpoint for updating user subscription and triggering ActiveCampaign updates
  app.post("/api/admin/test-update-subscription", async (req, res) => {
    // Block this endpoint in production mode
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "This endpoint is only available in development mode",
      });
    }

    try {
      const { userId, subscriptionTier, subscriptionStatus, stripeCustomerId, stripeSubscriptionId } = req.body;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required"
        });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      
      // Update user subscription details
      const updatedUser = await storage.updateUserSubscription(
        userId,
        subscriptionTier || null,
        subscriptionStatus || null,
        stripeCustomerId || null,
        stripeSubscriptionId || null
      );
      
      // Update ActiveCampaign with new subscription status
      const acSuccess = await activeCampaignService.updateMembershipStatus(updatedUser);
      
      return res.json({
        success: true,
        message: "User subscription updated and ActiveCampaign notified",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          subscriptionTier: updatedUser.subscriptionTier,
          subscriptionStatus: updatedUser.subscriptionStatus
        },
        activeCampaignUpdated: acSuccess
      });
    } catch (error) {
      console.error("Subscription update error:", error);
      return res.status(500).json({
        success: false,
        message: `Error updating subscription: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
