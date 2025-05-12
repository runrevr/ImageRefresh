import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transformImage, isOpenAIConfigured } from "./openai";
import { runCleanupTasks } from "./cleanup";
import { insertTransformationSchema, insertProductEnhancementSchema, insertProductEnhancementImageSchema, insertProductEnhancementSelectionSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Stripe from "stripe";
import { setupAuth } from "./auth";
import axios from "axios";
import sharp from "sharp";
import { setupTestStatusRoute } from "./test-status";
import { activeCampaignService } from "./activecampaign-service";
import { demoAccessMiddleware } from "./demo-access-control";

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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

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

export async function getDescriptionAndPromptFromImage_OpenAI(
  imagePath: string,
): Promise<{ description: string; artPrompt: string }> {
  // Convert to JPEG if needed
  const jpegPath = await convertToJpeg(imagePath);
  const imageBytes = fs.readFileSync(jpegPath);
  const base64Image = imageBytes.toString("base64");

  try {
    // This is a placeholder for the actual implementation
    return {
      description: "Image description",
      artPrompt: "Art prompt for the image"
    };
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration
  const isDemoMode = process.env.NODE_ENV !== "production";
  const uploadsDir = path.join(process.cwd(), "uploads");
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
      }
      cb(null, true);
    }
  });

  // Configure product enhancement uploads
  const productUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return cb(new Error("Only JPG, JPEG, and PNG images are allowed"), false);
      }
      cb(null, true);
    }
  });

  // Set up authentication
  setupAuth(app);
  
  // Set up test status route
  setupTestStatusRoute(app);
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // Schedule cleanup tasks
  setInterval(runCleanupTasks, 24 * 60 * 60 * 1000); // Run once a day

  // ***********************************************
  // Product Enhancement Routes
  // ***********************************************
  
  // Start a new product enhancement job
  app.post("/api/product-enhancement/start", productUpload.array("images", 5), async (req, res) => {
    try {
      console.log("Product enhancement start request received");
      
      // Validate request body
      if (!req.body.industry) {
        return res.status(400).json({ message: "Industry type is required" });
      }
      
      // Check if files were uploaded
      const uploadedImages = req.files as Express.Multer.File[];
      if (!uploadedImages || uploadedImages.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }
      
      if (uploadedImages.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }
      
      // Create a new product enhancement record
      const productEnhancement = await storage.createProductEnhancement({
        userId: req.isAuthenticated() ? (req.user as any).id : null,
        industry: req.body.industry,
        status: "pending",
        webhookId: null,
        errorMessage: null,
        createdAt: new Date()
      });
      
      // Create image records
      const enhancementImages = [];
      for (const file of uploadedImages) {
        const imagePath = file.path;
        const enhancementImage = await storage.createProductEnhancementImage({
          enhancementId: productEnhancement.id,
          originalPath: imagePath,
          originalImageUrl: `/uploads/${path.basename(imagePath)}`
        });
        enhancementImages.push(enhancementImage);
      }
      
      // Convert images to base64 for the webhook request
      const images = [];
      for (const file of uploadedImages) {
        const imageBuffer = fs.readFileSync(file.path);
        const base64Image = imageBuffer.toString("base64");
        images.push(base64Image);
      }
      
      // Send request to webhook
      try {
        // Include our own webhook URL as a callback parameter
        // Use the configured domain, or fallback to request host
        const domain = process.env.WEBHOOK_DOMAIN || req.headers.host;
        // Use HTTPS for production domains, HTTP otherwise
        const protocol = domain && !domain.includes('localhost') && !domain.includes(':') ? 'https' : 'http';
        const appBaseUrl = `${protocol}://${domain}`;
        const webhookCallbackUrl = `${appBaseUrl}/api/webhook/enhancement-ideas`;
        console.log(`Using webhook callback URL: ${webhookCallbackUrl}`);
        
        // For testing without the actual webhook service:
        const USE_MOCK_WEBHOOK = false; // Toggle this for testing
        
        if (USE_MOCK_WEBHOOK) {
          // Import mock webhook data
          const { simulateProcessingDelay, generateMockEnhancementOptions } = await import("./mock-webhook-data");
          
          // Generate a mock webhook ID
          const mockWebhookId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          
          // Update status to processing
          await storage.updateProductEnhancementStatus(
            productEnhancement.id,
            "processing",
            mockWebhookId
          );
          
          // Get images for processing
          const mockOptions = generateMockEnhancementOptions(req.body.industry);
          
          // Update the image options in the database
          for (let i = 0; i < enhancementImages.length; i++) {
            await storage.updateProductEnhancementImageOptions(
              enhancementImages[i].id,
              mockOptions
            );
          }
          
          // Simulate processing delay
          await simulateProcessingDelay();
          
          res.json({
            id: productEnhancement.id,
            webhookId: mockWebhookId,
            status: "processing",
            images: enhancementImages
          });
        } else {
          // Call the real webhook
          console.log("Payload includes:", {
            industryType: req.body.industry,
            imageCount: images.length,
            callbackUrl: webhookCallbackUrl
          });
          
          try {
            console.log("Attempting webhook call to: https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9");
            const requestPayload = {
              industry: req.body.industry,
              images,
              callbackUrl: webhookCallbackUrl
            };
            console.log("Request payload structure:", {
              industry: req.body.industry,
              imageCount: images.length,
              firstImageByteLength: images[0]?.length || 0,
              callbackUrl: webhookCallbackUrl
            });
            
            const webhookResponse = await axios.post("https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9", requestPayload, {
              timeout: 60000, // Increased to 60 second timeout
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            // Update the product enhancement with webhook ID
            if (webhookResponse.data && webhookResponse.data.id) {
              await storage.updateProductEnhancementStatus(
                productEnhancement.id,
                "processing",
                webhookResponse.data.id
              );
              
              // Update the image options from the webhook response
              if (webhookResponse.data.images && Array.isArray(webhookResponse.data.images)) {
                for (let i = 0; i < webhookResponse.data.images.length; i++) {
                  const responseImage = webhookResponse.data.images[i];
                  if (i < enhancementImages.length) {
                    const imageId = enhancementImages[i].id;
                    await storage.updateProductEnhancementImageOptions(
                      imageId,
                      responseImage.options
                    );
                  }
                }
              }
              
              res.json({
                id: productEnhancement.id,
                webhookId: webhookResponse.data.id,
                status: "processing",
                images: enhancementImages
              });
            } else {
              throw new Error("Invalid webhook response");
            }
          } catch (webhookError: any) {
            console.error("Error calling product enhancement webhook:", webhookError.message);
            
            // Log detailed error information
            if (webhookError.response) {
              console.error("Webhook response status:", webhookError.response.status);
              console.error("Webhook response data:", JSON.stringify(webhookError.response.data, null, 2));
              console.error("Webhook response headers:", JSON.stringify(webhookError.response.headers, null, 2));
            } else if (webhookError.request) {
              console.error("Webhook request was made but no response received");
              console.error("Request details:", webhookError.request);
            } else {
              console.error("Error setting up webhook request:", webhookError.message);
              console.error("Error stack:", webhookError.stack);
            }
            
            console.error("Webhook error code:", webhookError.code || "No error code");
            
            // Handle different error types
            let errorMessage = "Error connecting to enhancement service";
            
            if (webhookError.code === 'ECONNREFUSED' || webhookError.code === 'ECONNABORTED') {
              errorMessage = "Unable to connect to enhancement service - connection refused or timed out";
            } else if (webhookError.code === 'ETIMEDOUT') {
              errorMessage = "Connection to enhancement service timed out - please try again";
            } else if (webhookError.response) {
              errorMessage = `Enhancement service error (${webhookError.response.status}): ${webhookError.response.data?.message || webhookError.message}`;
            }
            
            // Update the enhancement status to failed
            await storage.updateProductEnhancementStatus(
              productEnhancement.id,
              "failed",
              undefined,
              errorMessage
            );
            
            res.status(500).json({ 
              message: "Error processing product enhancement",
              error: errorMessage,
              details: webhookError.message || "Unknown webhook error",
              id: productEnhancement.id
            });
          }
        }
      } catch (error: any) {
        console.error("Error in product enhancement start:", error);
        res.status(500).json({ 
          message: "Error starting product enhancement",
          error: error.message || "Unknown error"
        });
      }
    } catch (error: any) {
      console.error("Error in product enhancement start:", error);
      res.status(500).json({ 
        message: "Error starting product enhancement",
        error: error.message || "Unknown error"
      });
    }
  });
  
  // Endpoint to get product enhancement status and options
  app.get("/api/product-enhancement/:id", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Product enhancement not found" });
      }
      
      const images = await storage.getProductEnhancementImages(enhancementId);
      
      res.json({
        ...enhancement,
        images
      });
    } catch (error: any) {
      console.error("Error getting product enhancement:", error);
      res.status(500).json({ 
        message: "Error retrieving product enhancement",
        error: error.message || "Unknown error"
      });
    }
  });
  
  // Endpoint to select enhancement options
  app.post("/api/product-enhancement/:id/select", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      // Validate the request body
      if (!req.body.selections || !Array.isArray(req.body.selections) || req.body.selections.length === 0) {
        return res.status(400).json({ message: "Selections are required" });
      }
      
      // Validate each selection
      for (const selection of req.body.selections) {
        if (!selection.imageId || !selection.optionKey) {
          return res.status(400).json({ message: "Invalid selection format. Each selection must have imageId and optionKey." });
        }
      }
      
      // Check if enhancement exists
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Product enhancement not found" });
      }
      
      // Check for maximum selections (5 per image)
      const existingSelections = await storage.getProductEnhancementSelections(enhancementId);
      const selectionCounts = new Map<number, number>();
      
      // Count existing selections per image
      for (const selection of existingSelections) {
        const count = selectionCounts.get(selection.imageId) || 0;
        selectionCounts.set(selection.imageId, count + 1);
      }
      
      // Check if new selections would exceed the limit
      for (const selection of req.body.selections) {
        const imageId = selection.imageId;
        const count = selectionCounts.get(imageId) || 0;
        if (count >= 5) {
          return res.status(400).json({ 
            message: `Maximum 5 selections allowed per image. Image ID ${imageId} already has ${count} selections.`
          });
        }
        selectionCounts.set(imageId, count + 1);
      }
      
      // Create selection records in the database
      const selections = [];
      for (const selection of req.body.selections) {
        const enhancementImage = await storage.getProductEnhancementImage(selection.imageId);
        if (!enhancementImage) {
          return res.status(400).json({ message: `Image with ID ${selection.imageId} not found` });
        }
        
        // Find the image index from the full list of images
        const images = await storage.getProductEnhancementImages(enhancementId);
        const imageIndex = images.findIndex(img => img.id === selection.imageId);
        
        const newSelection = await storage.createProductEnhancementSelection({
          enhancementId,
          imageId: selection.imageId,
          imageIndex,
          optionKey: selection.optionKey,
          status: "pending",
          resultImagePaths: [],
          createdAt: new Date()
        });
        
        selections.push(newSelection);
      }
      
      // Format the selections for the webhook
      const formattedSelections = selections.map(selection => {
        return {
          imageIndex: selection.imageIndex,
          options: [selection.optionKey]
        };
      });
      
      // Send selections to webhook
      try {
        // Include our own webhook URL as a callback parameter for results
        // Use the configured domain, or fallback to request host
        const domain = process.env.WEBHOOK_DOMAIN || req.headers.host;
        // Use HTTPS for production domains, HTTP otherwise
        const protocol = domain && !domain.includes('localhost') && !domain.includes(':') ? 'https' : 'http';
        const appBaseUrl = `${protocol}://${domain}`;
        const webhookCallbackUrl = `${appBaseUrl}/api/webhook/enhancement-results`;
        console.log(`Using webhook results callback URL: ${webhookCallbackUrl}`);
        
        // For testing without the actual webhook service:
        const USE_MOCK_WEBHOOK = false; // Toggle this for testing
        let webhookResponse;
        
        if (USE_MOCK_WEBHOOK) {
          // Import mock webhook data
          const { simulateProcessingDelay, generateMockEnhancementResults } = await import("./mock-webhook-data");
          
          // Create selection records
          const selections = [];
          for (const selection of req.body.selections) {
            // Get the enhancement image
            const enhancementImage = await storage.getProductEnhancementImage(selection.imageId);
            if (!enhancementImage) continue;
            
            // Create the selection
            const newSelection = await storage.createProductEnhancementSelection({
              enhancementId,
              imageId: selection.imageId,
              imageIndex: selection.imageIndex || 0,
              optionKey: selection.optionKey,
              status: "pending",
              resultImagePaths: [],
              createdAt: new Date()
            });
            
            selections.push(newSelection);
          }
          
          // Simulate processing delay
          await simulateProcessingDelay();
          
          // Generate mock results for each selection
          const results = [];
          for (const selection of req.body.selections) {
            // Get original image
            const enhancementImage = await storage.getProductEnhancementImage(selection.imageId);
            if (!enhancementImage) continue;
            
            // Generate mock results
            const mockResults = await generateMockEnhancementResults(
              enhancementImage.originalPath,
              selection.optionKey
            );
            
            // Save result paths to selection
            const selectionRecord = selections.find(s => 
              s.imageId === selection.imageId && s.optionKey === selection.optionKey
            );
            
            if (selectionRecord) {
              await storage.updateProductEnhancementSelectionResults(
                selectionRecord.id,
                "completed",
                mockResults.map(r => r.path)
              );
            }
            
            // Add to results
            results.push({
              imageIndex: selection.imageIndex || 0,
              option: selection.optionKey,
              resultImages: mockResults.map(r => ({
                url: r.url,
                path: r.path
              }))
            });
          }
          
          // Process payment if authenticated
          if (req.isAuthenticated && req.isAuthenticated()) {
            try {
              const userId = (req.user as any).id;
              if (userId) {
                const user = await storage.getUser(userId);
                if (user) {
                  const creditsToDeduct = req.body.selections.length;
                  const newPaidCredits = Math.max(0, user.paidCredits - creditsToDeduct);
                  console.log(`Deducting ${creditsToDeduct} credits. Old: ${user.paidCredits}, New: ${newPaidCredits}`);
                  await storage.updateUserCredits(userId, false, newPaidCredits);
                }
              }
            } catch (error) {
              console.error("Error processing payment:", error);
            }
          }
          
          return res.status(200).json({ results });
        } else {
          // Call the real webhook
          console.log("Posting to product enhancement selection webhook");
          console.log("Webhook URL:", "https://www.n8nemma.live/webhook-test/selections/dbf2c53a-616d-4ba7-8934-38fa5e881ef9");
          console.log("Payload:", {
            id: enhancement.webhookId,
            selections: formattedSelections,
            callbackUrl: webhookCallbackUrl
          });
          
          webhookResponse = await axios.post(
            "https://www.n8nemma.live/webhook-test/selections/dbf2c53a-616d-4ba7-8934-38fa5e881ef9",
            {
              id: enhancement.webhookId,
              selections: formattedSelections,
              callbackUrl: webhookCallbackUrl
            },
            {
              timeout: 30000, // 30 second timeout
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
        }
        
        // Update the enhancement status based on the webhook response
        if (webhookResponse && webhookResponse.data) {
          // Update status to processing selections
          await storage.updateProductEnhancementStatus(
            enhancementId,
            "processing_selections"
          );
          
          // Return the webhook response
          res.json({
            id: enhancementId,
            status: "processing_selections",
            webhookResponse: webhookResponse.data
          });
        } else {
          throw new Error("Invalid webhook response for selections");
        }
      } catch (webhookError: any) {
        console.error("Error calling product enhancement selection webhook:", webhookError);
        
        // Update the enhancement status to failed
        await storage.updateProductEnhancementStatus(
          enhancementId,
          "failed",
          undefined,
          webhookError.message || "Webhook selection error"
        );
        
        res.status(500).json({ 
          message: "Error processing product enhancement selections",
          error: webhookError.message || "Unknown webhook error"
        });
      }
    } catch (error: any) {
      console.error("Error in product enhancement selection:", error);
      res.status(500).json({ 
        message: "Error processing product enhancement selections",
        error: error.message || "Unknown error"
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}