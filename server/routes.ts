import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { generateMockEnhancementOptions, simulateProcessingDelay, generateMockEnhancementResults } from "./mock-webhook-data";
import { type InsertTransformation } from "../shared/schema";
import { createColoringBookImage } from "./coloring-book";

// Environment variable to control mock mode - will use mock data if true, real webhook if false
const USE_MOCK_WEBHOOK = process.env.USE_MOCK_WEBHOOK === "true";
// N8N webhook URL - for this URL format to work with N8N:
// 1. Make sure the webhook is active in N8N
// 2. Try using the exact URL from the N8N interface, including any query parameters
// 3. Some N8N webhooks don't expect additional path segments like "/options"
// Updated to use the /webhook/ path instead of /webhook-test/ based on testing
const WEBHOOK_URL = "https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9";

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

// Create multer instance for regular file uploads
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

// Create multer instance for product enhancement uploads
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Keep the original extension if it exists
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, "product-" + uniqueSuffix + ext);
  },
});

const productUpload = multer({
  storage: productStorage,
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
      throw new Error(`File not found: ${imagePath}`);
    }
    
    // Log some details about the file
    const stats = fs.statSync(imagePath);
    console.log(`Converting file to base64: ${imagePath} (${stats.size} bytes)`);
    
    if (stats.size === 0) {
      console.error(`File exists but is empty: ${imagePath}`);
      throw new Error(`File is empty: ${imagePath}`);
    }
    
    // Read the file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString("base64");
    
    // Validate that we got actual base64 data
    if (!base64 || base64.length === 0) {
      console.error(`Failed to convert file to base64: ${imagePath}`);
      throw new Error(`Base64 conversion failed: ${imagePath}`);
    }
    
    console.log(`Successfully converted ${imagePath} to base64 (${base64.length} characters)`);
    return base64;
  } catch (error) {
    console.error(`Error in imageToBase64 for ${imagePath}:`, error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Log all requests to help with debugging
  app.use((req, res, next) => {
    if (req.url.startsWith('/uploads')) {
      console.log(`Static file request: ${req.method} ${req.url}`);
    }
    next();
  });
  // Basic health check endpoint
  app.get("/api/health", (req, res) => {
    res.send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });
  
  // Config endpoint
  app.get("/api/config", (req, res) => {
    res.send({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      supportedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
      productEnhancementEnabled: true,
      stripeEnabled: true
    });
  });

  // Get current user endpoint (used for authentication)
  app.get("/api/user", (req, res) => {
    // If authenticated, return user info
    if (req.isAuthenticated() && req.user) {
      // Don't send the password hash
      const { password, ...userWithoutPassword } = req.user;
      return res.json(userWithoutPassword);
    }
    // Not authenticated
    res.status(401).json({ message: "Not authenticated" });
  });
  
  // User credits endpoint (original endpoint using userId parameter)
  app.get("/api/users/:userId/credits", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return the total credits (paid + free)
      const totalCredits = user.paidCredits + (user.freeCreditsUsed ? 0 : 1);
      
      res.json({
        credits: totalCredits,
        paidCredits: user.paidCredits,
        freeCreditsUsed: user.freeCreditsUsed
      });
      
    } catch (error: any) {
      console.error("Error fetching user credits:", error);
      res.status(500).json({ message: "Error fetching user credits", error: error.message });
    }
  });
  
  // Simplified user credits endpoint for current user
  app.get("/api/user/credits", async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(200).json({ 
          message: "Not authenticated", 
          credits: 0, 
          paidCredits: 0, 
          freeCreditsUsed: true 
        });
      }
      
      // Get user ID from authenticated session
      const userId = req.user.id;
      
      // Try to get user from database with error handling
      let user;
      try {
        user = await storage.getUser(userId);
      } catch (dbError) {
        console.error("Database error fetching user:", dbError);
        return res.status(200).json({ 
          message: "Error fetching user data", 
          credits: 0, 
          paidCredits: 0,
          freeCreditsUsed: true
        });
      }
      
      // If user not found, still return valid JSON
      if (!user) {
        return res.status(200).json({ 
          message: "User not found", 
          credits: 0, 
          paidCredits: 0,
          freeCreditsUsed: true
        });
      }
      
      // Calculate total credits and return as JSON
      const totalCredits = user.paidCredits + (user.freeCreditsUsed ? 0 : 1);
      
      return res.status(200).json({
        credits: totalCredits,
        paidCredits: user.paidCredits,
        freeCreditsUsed: user.freeCreditsUsed
      });
    } catch (error: any) {
      // Always return valid JSON even on error
      console.error("Error getting user credits:", error);
      return res.status(200).json({ 
        message: "Error fetching credits", 
        error: error.message || "Unknown error",
        credits: 0, 
        paidCredits: 0,
        freeCreditsUsed: true 
      });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the path to the uploaded file
      const imagePath = req.file.path.replace(process.cwd(), '').replace(/^\//, "");
      
      // Create the imageUrl for browser access
      const imageUrl = `/${imagePath}`;
      
      console.log("File uploaded successfully. Path:", imagePath, "URL:", imageUrl);
      
      res.json({
        message: "File uploaded successfully",
        imagePath,
        imageUrl,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transform image endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      const { originalImagePath, prompt, userId, preset } = req.body;
      
      // Support both originalImagePath (from client) and imagePath (for backward compatibility)
      const imagePath = originalImagePath || req.body.imagePath;

      // Log the received request for debugging
      console.log("Transform request received:", {
        originalImagePath,
        imagePath,
        promptLength: prompt?.length || 0,
        promptPreview: prompt ? prompt.substring(0, 50) + "..." : "",
        preset,
        userId
      });
      
      if (!imagePath) {
        console.error("Image path missing in transform request:", req.body);
        return res.status(400).json({ message: "Image path is required" });
      }

      if (!prompt && !preset) {
        console.error("Neither prompt nor preset provided in transform request");
        return res.status(400).json({ message: "Either prompt or preset is required" });
      }

      // Validate user ID and check for credits if provided
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          // Check if user has enough credits to perform transformation
          const hasCredits = (!user.freeCreditsUsed) || user.paidCredits > 0;
          if (!hasCredits) {
            return res.status(403).json({ 
              message: "Not enough credits to perform transformation", 
              error: "credit_required"
            });
          }
        } catch (error: any) {
          console.error("Error checking user:", error);
          // Continue anyway to prevent blocking transformations
        }
      }

      console.log(`Transforming image at path: ${imagePath} with prompt: ${prompt}`);

      // Create a new transformation record
      const transformation = await storage.createTransformation({
        userId: userId || null,
        prompt,
        originalImagePath: imagePath,
        status: "processing"
      });

      // Simulate processing delay (in a real app, this would be a call to AI service)
      // The processing would happen asynchronously, and the results would be stored
      
      // Return the transformation ID immediately
      res.json({
        message: "Transformation started",
        transformationId: transformation.id
      });
      
      // Further processing happens asynchronously

    } catch (error: any) {
      console.error("Error transforming image:", error);
      res.status(500).json({ message: "Error transforming image", error: error.message });
    }
  });

  // Product Enhancement Routes
  
  // Start product enhancement - upload images and initiate webhook process
  app.post("/api/product-enhancement/start", productUpload.array("images", 5), async (req, res) => {
    try {
      console.log("=== PRODUCT ENHANCEMENT START REQUEST ===");
      
      // Get uploaded files
      const uploadedImages = req.files as Express.Multer.File[];
      if (!uploadedImages || uploadedImages.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }
      
      // Get industry from request body
      const { industry } = req.body;
      if (!industry) {
        return res.status(400).json({ message: "Industry is required" });
      }
      
      console.log(`Received ${uploadedImages.length} images for industry: ${industry}`);
      
      // Get user ID if authenticated
      const userId = req.user?.id;
      console.log(`User ID: ${userId || 'Guest'}`);
      
      // Create a product enhancement record
      const enhancement = await storage.createProductEnhancement({
        userId: userId || null,
        industry
      });
      
      console.log(`Created product enhancement with ID: ${enhancement.id}`);
      
      // Process each uploaded image
      const imagePromises = uploadedImages.map(async (file, index) => {
        // Log more details about the uploaded file to debug
        console.log(`Processing uploaded file[${index}]:`, {
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          destination: file.destination,
          filename: file.filename
        });
        
        // Ensure the file path is valid and exists
        if (!file.path || !fs.existsSync(file.path)) {
          console.error(`File path is invalid or doesn't exist: ${file.path}`);
          throw new Error(`Invalid file path for uploaded image ${index}`);
        }
        
        // Create an enhancement image record
        const enhancementImage = await storage.createProductEnhancementImage({
          enhancementId: enhancement.id,
          originalImagePath: file.path
        });
        
        console.log(`Created enhancement image record ${enhancementImage.id} for file ${file.originalname}`);
        
        return {
          id: enhancementImage.id,
          path: file.path
        };
      });
      
      const enhancementImages = await Promise.all(imagePromises);
      
      // Generate webhook ID for this request
      const webhookId = uuid();
      
      // Update the enhancement record with the webhook ID
      await storage.updateProductEnhancementStatus(
        enhancement.id,
        "processing", // Set status to processing
        webhookId // Pass webhookId as the third parameter
      );
      
      // Submit to the N8N webhook for processing
      // We'll do this in the background to not block the response
      setTimeout(async () => {
        try {
          console.log(`Submitting to webhook ${WEBHOOK_URL} with request ID ${webhookId}`);
          
          // For each image, convert to base64 and add to the payload
          const imageBase64Promises = enhancementImages.map(async (image) => {
            try {
              const base64 = await imageToBase64(image.path);
              return {
                id: image.id,
                base64
              };
            } catch (error) {
              console.error(`Error converting image ${image.id} to base64:`, error);
              return null;
            }
          });
          
          const base64Images = (await Promise.all(imageBase64Promises)).filter(img => img !== null);
          
          if (base64Images.length === 0) {
            console.error("No images were successfully converted to base64");
            await storage.updateProductEnhancementStatus(
              enhancement.id,
              "failed",
              "Failed to convert images to base64"
            );
            return;
          }
          
          // Prepare payload with all images in base64 format
          const payload = {
            requestId: webhookId,
            industry,
            images: base64Images
          };
          
          // Make the API call to N8N webhook
          console.log("Making webhook request to " + WEBHOOK_URL);
          
          // Implement a retry mechanism for robustness
          let retryCount = 0;
          const maxRetries = 2;
          let success = false;
          let lastError = null;
          
          while (retryCount <= maxRetries && !success) {
            try {
              // If this is a retry, add a small delay
              if (retryCount > 0) {
                console.log(`Retry attempt ${retryCount}/${maxRetries} for webhook request`);
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              }
              
              // Make the HTTP request with enhanced error handling
              console.log(`Sending payload to webhook with ${base64Images.length} images for industry: ${industry}`);
              
              const response = await axios.post(WEBHOOK_URL, payload, {
                headers: {
                  'Content-Type': 'application/json'
                },
                timeout: 30000, // 30 second timeout
                validateStatus: function (status) {
                  // Consider any status code in 2xx range as success
                  return status >= 200 && status < 300;
                }
              });
              
              console.log(`Webhook response status: ${response.status}`);
              
              // Everything went well
              if (response.status >= 200 && response.status < 300) {
                console.log("Webhook call successful");
                success = true;
                
                // If we got data back, log it
                if (response.data) {
                  console.log("Webhook response data:", JSON.stringify(response.data).substring(0, 500) + "...");
                }
              } else {
                // Unexpected status code
                const errorMsg = `Webhook call returned unexpected status: ${response.status}`;
                console.error(errorMsg);
                lastError = new Error(errorMsg);
                
                // Only update status on the final retry
                if (retryCount === maxRetries) {
                  await storage.updateProductEnhancementStatus(
                    enhancement.id,
                    "failed",
                    errorMsg
                  );
                }
              }
            } catch (e) {
              const error = e as any; // Type assertion for error object
              lastError = error;
              console.error(`Error on webhook call (attempt ${retryCount+1}/${maxRetries+1}):`, error);
              
              // Log more detailed error info
              if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
              }
              
              // Only update status on the final retry
              if (retryCount === maxRetries) {
                const errorMessage = error.message || "Unknown error calling webhook";
                await storage.updateProductEnhancementStatus(
                  enhancement.id,
                  "failed",
                  errorMessage
                );
              }
            }
            
            retryCount++;
          }
          
          if (!success && lastError) {
            console.error("All webhook call attempts failed");
          }
        } catch (error: any) {
          // Log detailed error information  
          console.error("Error submitting to webhook:", error);
          
          if (error.response) {
            console.error("Webhook response error data:", error.response.data);
            console.error("Webhook response error status:", error.response.status);
            console.error("Webhook response error headers:", error.response.headers);
          }
          
          // Update enhancement status to failed
          await storage.updateProductEnhancementStatus(
            enhancement.id,
            "failed",
            error.message || "Failed to submit to webhook"
          );
        }
      }, 100); // Very short timeout just to not block the response
      
      // Return the enhancement ID to the client
      return res.status(200).json({ 
        message: "Enhancement started",
        id: enhancement.id,
        status: "processing"
      });
    } catch (error: any) {
      console.error("Error processing product enhancement start:", error);
      res.status(500).json({ 
        message: "Failed to start product enhancement",
        error: error.message
      });
    }
  });
  
  // Get enhancement data (with images and options)
  app.get("/api/product-enhancement/:id", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      // Get the enhancement
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      // Get the enhancement images
      const enhancementImages = await storage.getProductEnhancementImages(enhancementId);
      
      console.log(`\n\n====================== PRODUCT ENHANCEMENT DATA ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Enhancement ID: ${enhancementId}`);
      console.log(`Industry: "${enhancement.industry}"`);
      console.log(`Status: ${enhancement.status}`);
      console.log(`Found ${enhancementImages.length} images for this enhancement`);
      
      // Prepare the response
      const response = {
        id: enhancement.id,
        status: enhancement.status,
        industry: enhancement.industry,
        images: enhancementImages.map(img => ({
          id: img.id,
          originalImagePath: img.originalImagePath,
          options: img.options
        }))
      };
      
      res.json(response);
    } catch (error: any) {
      console.error("Error getting enhancement data:", error);
      res.status(500).json({ message: "Error getting enhancement data", error: error.message });
    }
  });

  // Get enhancement options after upload
  app.get("/api/product-enhancement/:id/options", async (req, res) => {
    try {
      console.log(`\n\n====================== GET ENHANCEMENT OPTIONS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      // Get the enhancement
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      console.log(`Enhancement ID: ${enhancementId}`);
      console.log(`Status: ${enhancement.status}`);
      
      // If options aren't ready, simply return the current status
      if (enhancement.status !== "options_ready") {
        return res.json({
          id: enhancement.id,
          status: enhancement.status
        });
      }
      
      // Get the enhancement images with options
      const enhancementImages = await storage.getProductEnhancementImages(enhancementId);
      
      // Check if options are available for at least one image
      const hasOptions = enhancementImages.some(img => 
        img.options && Object.keys(img.options).length > 0
      );
      
      // If no options are available, update status to failed
      if (!hasOptions) {
        console.log("No options available for any images - marking as failed");
        await storage.updateProductEnhancementStatus(
          enhancementId,
          "failed",
          "No enhancement options were returned from the webhook"
        );
        
        return res.json({
          id: enhancement.id,
          status: "failed",
          error: "No enhancement options were returned from the webhook"
        });
      }
      
      // Prepare the response
      const response = {
        id: enhancement.id,
        status: enhancement.status,
        industry: enhancement.industry,
        images: enhancementImages.map(img => ({
          id: img.id,
          originalImagePath: img.originalImagePath,
          options: img.options || {}
        }))
      };
      
      res.json(response);
    } catch (error: any) {
      console.error("Error getting enhancement options:", error);
      res.status(500).json({ message: "Error getting enhancement options", error: error.message });
    }
  });

  // Process selected enhancement options
  app.post("/api/product-enhancement/:id/process", async (req, res) => {
    try {
      console.log(`\n\n====================== PROCESS ENHANCEMENT OPTIONS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      // Get the selections from the request body
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ message: "Selections are required" });
      }
      
      console.log(`Enhancement ID: ${enhancementId}`);
      console.log(`Received ${selections.length} selections`);
      
      // Get the enhancement
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      // Validate that the enhancement is in the correct state
      if (enhancement.status !== "options_ready") {
        return res.status(400).json({ 
          message: `Enhancement is not ready for processing (status: ${enhancement.status})` 
        });
      }
      
      // Get user ID if available
      const userId = req.user?.id || enhancement.userId;
      
      // If we have a user ID, check credits
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Check if user has enough credits (1 credit per selection)
          const totalCreditsNeeded = selections.length;
          const availableCredits = (user.freeCreditsUsed ? 0 : 1) + user.paidCredits;
          
          if (availableCredits < totalCreditsNeeded) {
            return res.status(403).json({ 
              message: `Not enough credits. Need ${totalCreditsNeeded}, have ${availableCredits}`, 
              error: "credit_required"
            });
          }
          
          console.log(`User ${userId} has enough credits (${availableCredits}) for selections (${totalCreditsNeeded})`);
        } catch (userError: any) {
          console.error("Error checking user credits:", userError);
          // Continue anyway - we'll handle credits when we get results
        }
      }
      
      // Store selection records
      const selectionPromises = selections.map(async (selection: any) => {
        try {
          // Validate selection has required fields
          if (!selection.imageId || !selection.optionKey) {
            console.error("Invalid selection:", selection);
            return null;
          }
          
          // Get the option details from the image record
          const image = await storage.getProductEnhancementImage(selection.imageId);
          if (!image) {
            console.error(`Image not found: ${selection.imageId}`);
            return null;
          }
          
          // Verify the option exists for this image
          const options = image.options || {};
          const option = options[selection.optionKey as keyof typeof options];
          if (!option) {
            console.error(`Option ${selection.optionKey} not found for image ${selection.imageId}`);
            return null;
          }
          
          // Create selection record
          const optionKey = option as any;
          const result = await storage.createProductEnhancementSelection({
            enhancementId,
            imageId: selection.imageId,
            optionKey: selection.optionKey,
            optionId: optionKey.key || selection.optionKey,
            optionName: optionKey.name || 'Unknown Option'
          });
          
          console.log(`Created selection record ${result.id} for image ${selection.imageId}, option ${selection.optionKey}`);
          
          return result;
        } catch (error: any) {
          console.error("Error creating selection:", error);
          return null;
        }
      });
      
      const selectionResults = await Promise.all(selectionPromises);
      const validSelections = selectionResults.filter(s => s !== null);
      
      // Ensure we have at least one valid selection
      if (validSelections.length === 0) {
        return res.status(400).json({ message: "No valid selections were provided" });
      }
      
      // Update enhancement status
      await storage.updateProductEnhancementStatus(
        enhancementId,
        "processing_selections",
        undefined // Use undefined instead of null
      );
      
      // If we're in mock mode, generate results immediately
      if (USE_MOCK_WEBHOOK) {
        // Simulate a processing delay then generate results
        setTimeout(async () => {
          try {
            console.log("Generating mock results for selections");
            
            // For each selection, generate mock results
            const processSelectionPromises = validSelections.map(async (selection: any) => {
              try {
                // Get the image and option details
                const image = await storage.getProductEnhancementImage(selection.imageId);
                if (!image) {
                  console.error(`Image not found: ${selection.imageId}`);
                  return null;
                }
                
                // Generate mock results
                const mockResults = generateMockEnhancementResults(
                  image.originalImagePath,
                  selection.optionKey
                  // Industry parameter is not needed based on the function definition
                );
                
                // Store the results
                const result = await storage.createProductEnhancementResult({
                  enhancementId,
                  selectionId: selection.id,
                  imageId: selection.imageId,
                  optionKey: selection.optionKey,
                  optionName: selection.optionName,
                  resultImage1Path: mockResults.resultImage1Path,
                  resultImage2Path: mockResults.resultImage2Path
                });
                
                console.log(`Created mock result ${result.id} for selection ${selection.id}`);
                
                return result;
              } catch (error: any) {
                console.error("Error creating mock result:", error);
                return null;
              }
            });
            
            await Promise.all(processSelectionPromises);
            
            // Update enhancement status
            await storage.updateProductEnhancementStatus(
              enhancementId,
              "results_ready"
            );
            
            console.log(`Mock results ready for enhancement ${enhancementId}`);
          } catch (mockError: any) {
            console.error("Error generating mock results:", mockError);
            
            // Update enhancement status to failed
            await storage.updateProductEnhancementStatus(
              enhancementId,
              "failed",
              mockError.message || "Failed to generate mock results"
            );
          }
        }, 3000); // 3 second delay for mock results
        
        // Return immediately to client
        return res.status(200).json({
          message: "Selections processed (mock mode)",
          id: enhancementId,
          status: "processing_selections"
        });
      }
      
      // For real webhook, need to send selections to the webhook
      // We'll do this in the background to not block the response
      setTimeout(async () => {
        try {
          console.log(`Submitting selections to webhook ${WEBHOOK_URL}`);
          
          // Prepare the webhook payload
          const payload = {
            requestId: enhancement.webhookId,
            action: "processSelections",
            selections: validSelections.map(selection => ({
              imageId: selection.imageId,
              optionKey: selection.optionKey,
              selectionId: selection.id
            }))
          };
          
          // Make the API call to N8N webhook with enhanced error handling
          console.log(`Sending ${payload.selections.length} selections to webhook for processing`);
          
          const response = await axios.post(WEBHOOK_URL, payload, {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000, // 30 second timeout
            validateStatus: function (status) {
              // Consider any status code in 2xx range as success
              return status >= 200 && status < 300;
            }
          });
          
          console.log(`Webhook response status: ${response.status}`);
          
          // If webhook call was successful, we'll wait for callback
          if (response.status >= 200 && response.status < 300) {
            console.log("Webhook call successful - waiting for callback with results");
          } else {
            // Unexpected status code
            console.error(`Webhook call returned unexpected status: ${response.status}`);
            await storage.updateProductEnhancementStatus(
              enhancementId,
              "failed",
              `Webhook call returned unexpected status: ${response.status}`
            );
          }
        } catch (error: any) {
          // Log detailed error information
          console.error("Error submitting selections to webhook:", error);
          
          if (error.response) {
            console.error("Webhook response error data:", error.response.data);
            console.error("Webhook response error status:", error.response.status);
            console.error("Webhook response error headers:", error.response.headers);
          }
          
          // Update enhancement status to failed
          await storage.updateProductEnhancementStatus(
            enhancementId,
            "failed",
            error.message || "Failed to submit selections to webhook"
          );
        }
      }, 100);
      
      // Return immediately to client
      return res.status(200).json({
        message: "Selections received and processing started",
        id: enhancementId,
        status: "processing_selections"
      });
    } catch (error: any) {
      console.error("Error processing enhancement selections:", error);
      res.status(500).json({ 
        message: "Failed to process enhancement selections", 
        error: error.message 
      });
    }
  });

  // Select specific enhancement options for processing
  app.post("/api/product-enhancement/:id/select", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      // Get selected options from the request body
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ message: "No selections provided" });
      }
      
      console.log(`Processing ${selections.length} selections for enhancement ${enhancementId}`);
      
      // Check if the enhancement exists
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      // Process each selection
      // (Implementation would depend on your specific requirements)
      
      // Return success response
      res.status(200).json({ 
        message: "Selections processed successfully", 
        enhancementId 
      });
    } catch (error: any) {
      console.error("Error processing selections:", error);
      res.status(500).json({ message: "Error processing selections", error: error.message });
    }
  });

  // Get the results of enhancement processing
  app.get("/api/product-enhancement/:id/results", async (req, res) => {
    try {
      console.log(`\n\n====================== GET ENHANCEMENT RESULTS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      console.log(`Enhancement ID: ${enhancementId}`);
      
      // Get the enhancement
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      console.log(`Status: ${enhancement.status}`);
      
      // If results aren't ready, return the current status
      if (enhancement.status !== "results_ready") {
        return res.json({
          id: enhancement.id,
          status: enhancement.status
        });
      }
      
      // Get the results
      const results = await storage.getProductEnhancementResults(enhancementId);
      
      console.log(`Found ${results.length} results for enhancement ${enhancementId}`);
      
      // Prepare response
      const response = {
        id: enhancement.id,
        status: enhancement.status,
        industry: enhancement.industry,
        results: results.map(result => ({
          id: result.id,
          imageId: result.imageId,
          optionKey: result.optionKey,
          optionName: result.optionName,
          resultImage1Path: result.resultImage1Path,
          resultImage2Path: result.resultImage2Path
        }))
      };
      
      res.json(response);
    } catch (error: any) {
      console.error("Error getting enhancement results:", error);
      res.status(500).json({ message: "Error getting enhancement results", error: error.message });
    }
  });

  // Apply coloring book style transformation to an image
  app.post("/api/product-enhancement/coloring-book", async (req, res) => {
    try {
      console.log("=== COLORING BOOK TRANSFORMATION ===");
      const { imagePath, userId } = req.body;
      
      if (!imagePath) {
        return res.status(400).json({ message: "Image path is required" });
      }
      
      console.log(`Applying coloring book style to image: ${imagePath}`);
      
      // Check if user has credits if userId is provided
      if (userId) {
        try {
          const user = await storage.getUser(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Check if the user has free credits
          const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);
          
          // Check if user has enough credits (coloring book costs 1 credit)
          if (!hasMonthlyFreeCredit && user.paidCredits < 1) {
            return res.status(403).json({ 
              message: "Not enough credits for coloring book transformation",
              error: "credit_required"
            });
          }
          
          console.log(`User ${userId} has credits - proceeding with coloring book transformation`);
        } catch (userError: any) {
          console.error("Error checking user credits:", userError);
          // Continue with the transformation anyway
        }
      }
      
      // Process the coloring book transformation
      try {
        // Determine full path to image
        const fullImagePath = path.isAbsolute(imagePath) 
          ? imagePath 
          : path.join(process.cwd(), imagePath);
        
        // Check if image exists
        if (!fs.existsSync(fullImagePath)) {
          return res.status(404).json({ message: "Image file not found" });
        }
        
        // Create the coloring book version
        const result = await createColoringBookImage(fullImagePath);
        
        // Create a server-relative path for the transformed image
        const baseUrl = req.protocol + "://" + req.get("host");
        const transformedImagePath = result.outputPath.replace(process.cwd(), '').replace(/^\//, "");
        const transformedImageUrl = `${baseUrl}/${transformedImagePath}`;
        
        // Deduct credits if user is authenticated
        if (userId) {
          try {
            const user = await storage.getUser(userId);
            if (user) {
              const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(userId);
              
              // Update user credits
              const updatedUser = await storage.updateUserCredits(
                userId,
                hasMonthlyFreeCredit, // Use free credit if available
                hasMonthlyFreeCredit ? user.paidCredits : user.paidCredits - 1 // Deduct paid credit if no free credit
              );
              
              console.log(`Updated user ${userId} credits - Remaining paid credits: ${updatedUser.paidCredits}`);
            }
          } catch (creditError: any) {
            console.error("Error updating user credits:", creditError);
          }
        }
        
        // Return the transformed image URL
        return res.status(200).json({
          message: "Coloring book transformation successful",
          transformedImageUrl
        });
      } catch (error: any) {
        console.error("Error in coloring book transformation:", error);
        
        // Check for specific OpenAI error types
        if (error.message && (
          error.message.includes("organization verification") ||
          error.message.includes("invalid_api_key") ||
          error.message.includes("rate limit") ||
          error.message.includes("billing")
        )) {
          return res.status(400).json({ 
            message: error.message, 
            error: "openai_api_error" 
          });
        }
        
        // Generic error
        return res.status(500).json({ 
          message: "Error processing coloring book transformation", 
          error: error.message 
        });
      }
    } catch (error: any) {
      console.error("Error processing coloring book request:", error);
      res.status(500).json({ 
        message: "Failed to process coloring book transformation",
        error: error.message
      });
    }
  });

  // Webhook callback endpoints - for the webhook to send data back to us
  app.post("/api/webhook-callbacks/options", async (req, res) => {
    try {
      console.log(`\n\n====================== WEBHOOK CALLBACK: OPTIONS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Received webhook callback with options`);
      
      const { requestId, images } = req.body;
      if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
      }
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "Images with options are required" });
      }
      
      console.log(`Request ID: ${requestId}`);
      console.log(`Received options for ${images.length} images`);
      
      // Find the enhancement by webhook ID
      const enhancement = await storage.getProductEnhancementByWebhookId(requestId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found for request ID" });
      }
      
      console.log(`Found enhancement ${enhancement.id} for request ID ${requestId}`);
      
      // Process each image
      for (const imgData of images) {
        try {
          if (!imgData.id || !imgData.options) {
            console.error(`Invalid image data: missing id or options`, imgData);
            continue;
          }
          
          console.log(`Processing options for image ${imgData.id}`);
          
          // Update the image record with options
          await storage.updateProductEnhancementImageOptions(
            imgData.id,
            imgData.options
          );
          
          console.log(`Updated options for image ${imgData.id}`);
        } catch (imageError: any) {
          console.error(`Error processing options for image ${imgData?.id}:`, imageError);
        }
      }
      
      // Update enhancement status
      await storage.updateProductEnhancementStatus(
        enhancement.id,
        "options_ready"
      );
      
      console.log(`Updated enhancement ${enhancement.id} status to "options_ready"`);
      
      // Return success
      res.status(200).json({ message: "Options processed successfully" });
    } catch (error: any) {
      console.error("Error processing webhook options callback:", error);
      res.status(500).json({ message: "Error processing options", error: error.message });
    }
  });

  app.post("/api/webhook-callbacks/results", async (req, res) => {
    try {
      console.log(`\n\n====================== WEBHOOK CALLBACK: RESULTS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Received webhook callback with results`);
      
      const { requestId, results } = req.body;
      if (!requestId) {
        return res.status(400).json({ message: "Request ID is required" });
      }
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        return res.status(400).json({ message: "Results are required" });
      }
      
      console.log(`Request ID: ${requestId}`);
      console.log(`Received ${results.length} results`);
      
      // Find the enhancement by webhook ID
      const enhancement = await storage.getProductEnhancementByWebhookId(requestId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found for request ID" });
      }
      
      console.log(`Found enhancement ${enhancement.id} for request ID ${requestId}`);
      
      // Get all selections for this enhancement
      const selections = await storage.getProductEnhancementSelections(enhancement.id);
      console.log(`Found ${selections.length} selections for enhancement ${enhancement.id}`);
      
      // Create the uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Process each result
      const resultsPromises = results.map(async (resultData: any) => {
        try {
          // Validate result data
          if (!resultData.selectionId || 
              !resultData.imageId || 
              !resultData.optionKey ||
              !resultData.resultImage1Base64 ||
              !resultData.resultImage2Base64) {
            console.error(`Invalid result data: missing required fields`, 
              resultData.selectionId, 
              resultData.imageId, 
              resultData.optionKey);
            return null;
          }
          
          console.log(`Processing result for selection ${resultData.selectionId}`);
          
          // Find the matching selection
          const selection = selections.find(s => 
            s.id === resultData.selectionId ||
            (s.imageId === resultData.imageId && s.optionKey === resultData.optionKey)
          );
          
          if (!selection) {
            console.error(`Selection not found for ID ${resultData.selectionId} or image ${resultData.imageId}, option ${resultData.optionKey}`);
            return null;
          }
          
          // Save the result images
          const timestamp = Date.now();
          const image1Path = path.join(uploadsDir, `result-${selection.id}-1-${timestamp}.png`);
          const image2Path = path.join(uploadsDir, `result-${selection.id}-2-${timestamp}.png`);
          
          // Convert base64 to image files
          fs.writeFileSync(image1Path, Buffer.from(resultData.resultImage1Base64, 'base64'));
          fs.writeFileSync(image2Path, Buffer.from(resultData.resultImage2Base64, 'base64'));
          
          console.log(`Saved result images for selection ${selection.id}`);
          
          // Create the result record
          const result = await storage.createProductEnhancementResult({
            enhancementId: enhancement.id,
            selectionId: selection.id,
            imageId: selection.imageId,
            optionKey: selection.optionKey,
            optionName: selection.optionName || resultData.optionName,
            resultImage1Path: image1Path,
            resultImage2Path: image2Path
          });
          
          console.log(`Created result record ${result.id} for selection ${selection.id}`);
          
          // Deduct credits for this selection
          if (enhancement.userId) {
            try {
              const user = await storage.getUser(enhancement.userId);
              if (user) {
                // Check for free credits
                const hasMonthlyFreeCredit = await storage.checkAndResetMonthlyFreeCredit(enhancement.userId);
                
                // Update user credits
                await storage.updateUserCredits(
                  enhancement.userId,
                  true, // Set freeCreditsUsed to true if we used the free credit
                  hasMonthlyFreeCredit ? user.paidCredits : user.paidCredits - 1
                );
                
                console.log(`Deducted 1 credit from user ${enhancement.userId} for selection ${selection.id}`);
              }
            } catch (creditError: any) {
              console.error(`Error deducting credits for user ${enhancement.userId}:`, creditError);
            }
          }
          
          return result;
        } catch (resultError: any) {
          console.error(`Error processing result:`, resultError);
          return null;
        }
      });
      
      const processedResults = await Promise.all(resultsPromises);
      const validResults = processedResults.filter(r => r !== null);
      
      console.log(`Successfully processed ${validResults.length} out of ${results.length} results`);
      
      // Update enhancement status
      await storage.updateProductEnhancementStatus(
        enhancement.id,
        "results_ready"
      );
      
      console.log(`Updated enhancement ${enhancement.id} status to "results_ready"`);
      
      // Return success
      res.status(200).json({ 
        message: "Results processed successfully",
        processedCount: validResults.length 
      });
    } catch (error: any) {
      console.error("Error processing webhook results callback:", error);
      res.status(500).json({ message: "Error processing results", error: error.message });
    }
  });

  // Legacy endpoint for coloring book (used by ResultView.tsx)
  app.post("/api/coloring-book", async (req, res) => {
    try {
      console.log("=== COLORING BOOK TRANSFORMATION (LEGACY ENDPOINT) ===");
      const { imagePath, userId } = req.body;
      
      if (!imagePath) {
        return res.status(400).json({ message: "Image path is required" });
      }
      
      console.log(`Applying coloring book style to image: ${imagePath} (redirecting to /api/product-enhancement/coloring-book)`);
      
      // Redirect to new endpoint
      const response = await axios.post(`${req.protocol}://${req.get('host')}/api/product-enhancement/coloring-book`, {
        imagePath,
        userId
      });
      
      // Return the response from the new endpoint
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("Error in legacy coloring book endpoint:", error);
      res.status(500).json({ 
        message: "Failed to create coloring book style", 
        error: error.message
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}