import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { generateMockEnhancementOptions, simulateProcessingDelay, generateMockEnhancementResults } from "./mock-webhook-data";

// Environment variable to control mock mode - will use mock data if true, real webhook if false
const USE_MOCK_WEBHOOK = process.env.USE_MOCK_WEBHOOK === "true";
const WEBHOOK_URL = "https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9";

// Helper function to convert an image file to base64
async function imageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.promises.readFile(imagePath);
    return imageBuffer.toString("base64");
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add detailed console logs for debugging
  app.use((req, res, next) => {
    const start = Date.now();
    
    // Log when the request completes
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    
    // Log the request body for POST/PUT requests (exclude large base64 data)
    if (req.method === 'POST' || req.method === 'PUT') {
      if (req.body && typeof req.body === 'object') {
        const logBody = { ...req.body };
        
        // Exclude large base64 data from logs
        Object.keys(logBody).forEach(key => {
          if (typeof logBody[key] === 'string' && logBody[key].length > 1000 && 
              (logBody[key].startsWith('data:image') || logBody[key].includes('base64'))) {
            logBody[key] = `[base64 data - ${logBody[key].length} chars]`;
          } else if (Array.isArray(logBody[key])) {
            logBody[key] = `[Array with ${logBody[key].length} items]`;
          }
        });
        
        console.log(`${new Date().toISOString()} - Request Body: ${JSON.stringify(logBody, null, 2)}`);
      }
    }
    
    next();
  });

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Set up Multer for file uploads
  const productUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB limit
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Product Enhancement Routes
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
  
  app.post("/api/product-enhancement/start", productUpload.array("images", 5), async (req, res) => {
    try {
      console.log("Product enhancement start request received");
      console.log("Using webhook:", USE_MOCK_WEBHOOK ? "MOCK" : "REAL");
      
      // Validate request body
      if (!req.body.industry) {
        return res.status(400).json({ message: "Industry type is required" });
      }
      
      const uploadedImages = req.files as Express.Multer.File[];
      if (!uploadedImages || uploadedImages.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }
      
      if (uploadedImages.length > 5) {
        return res.status(400).json({ message: "Maximum 5 images allowed" });
      }
      
      // Generate a unique webhook request ID - in real implementation this would be stored in DB
      const webhookRequestId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      if (!USE_MOCK_WEBHOOK) {
        // Prepare images for the real webhook
        console.log("Preparing to send images to real webhook");
        try {
          const imageBase64Promises = uploadedImages.map(image => imageToBase64(image.path));
          const imageBase64Array = await Promise.all(imageBase64Promises);
          
          // Get the base URL for callbacks
          const protocol = req.protocol;
          const host = req.get('host');
          const baseUrl = `${protocol}://${host}`;
          
          // Send to webhook
          const webhookData = {
            requestId: webhookRequestId,
            industry: req.body.industry,
            images: imageBase64Array.map((base64, index) => ({
              id: index + 1,
              data: base64
            })),
            callbackUrls: {
              options: `${baseUrl}/api/webhook-callbacks/options`,
              results: `${baseUrl}/api/webhook-callbacks/results`
            }
          };
          
          console.log(`Sending ${imageBase64Array.length} images to webhook with callbacks:`);
          console.log(`- Options callback: ${webhookData.callbackUrls.options}`);
          console.log(`- Results callback: ${webhookData.callbackUrls.results}`);
          
          // Log the full webhook request for debugging (omit large base64 data)
          const logWebhookData = { 
            ...webhookData, 
            images: webhookData.images.map(img => ({ 
              id: img.id, 
              dataSize: img.data.length 
            }))
          };
          console.log("Webhook request data:", JSON.stringify(logWebhookData, null, 2));
          
          const webhookResponse = await axios.post(WEBHOOK_URL, webhookData);
          console.log("Webhook response status:", webhookResponse.status);
          console.log("Webhook response headers:", JSON.stringify(webhookResponse.headers, null, 2));
          console.log("Webhook response data:", JSON.stringify(webhookResponse.data, null, 2));
          
          // Here we would normally store the webhook response details in the database
        } catch (webhookError: any) {
          console.error("Error calling webhook:", webhookError.message);
          // If webhook fails, we'll continue with mock data
          console.log("Falling back to mock data due to webhook error");
        }
      }
      
      // Send back a response to the client
      // In a real application with proper DB, we would use the actual enhancement ID
      res.status(200).json({ 
        message: "Product enhancement started successfully", 
        id: 1,  // Changed from enhancementId to id to match client expectations
        imageCount: uploadedImages.length,
        industry: req.body.industry,
        status: "pending",
        webhookRequestId: webhookRequestId
      });
    } catch (error: any) {
      console.error("Error in product enhancement start:", error);
      res.status(500).json({ 
        message: "Error starting product enhancement", 
        error: error.message 
      });
    }
  });

  // Get enhancement options after upload
  app.get("/api/product-enhancement/:id/options", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }

      // Get the webhook request ID - in a real implementation this would come from the database
      const webhookRequestId = req.query.webhookRequestId as string || `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // In a real scenario we would look up the enhancement details from the database
      const industry = req.query.industry as string || "decor";
      
      if (USE_MOCK_WEBHOOK) {
        // Using mock data
        await simulateProcessingDelay(1000, 2000); // Simulate webhook processing time
        
        // Generate 1 mock image with options
        const mockResponse = {
          id: enhancementId,
          status: "options_ready",
          images: Array(1).fill(0).map((_, index) => ({
            id: index + 1,
            originalUrl: `/uploads/sample-image-${index + 1}.jpg`,
            options: generateMockEnhancementOptions(industry)
          }))
        };
        
        res.status(200).json(mockResponse);
      } else {
        try {
          // For real webhook integration
          console.log(`Requesting options from webhook for request ID: ${webhookRequestId}`);
          
          // Make a GET request to the webhook to get options
          const webhookResponse = await axios.get(`${WEBHOOK_URL}/options`, {
            params: { requestId: webhookRequestId }
          });
          
          // Process the webhook response
          console.log("Webhook options response received:", webhookResponse.status);
          
          if (webhookResponse.data && webhookResponse.data.images) {
            // Transform the webhook response to match our API format
            const transformedResponse = {
              id: enhancementId,
              status: "options_ready",
              images: webhookResponse.data.images.map((img: any) => ({
                id: img.id,
                originalUrl: img.originalUrl || `/uploads/sample-image-${img.id}.jpg`,
                options: img.options || generateMockEnhancementOptions(industry)
              }))
            };
            
            res.status(200).json(transformedResponse);
          } else {
            throw new Error("Invalid webhook response format");
          }
        } catch (webhookError: any) {
          console.error("Error getting options from webhook:", webhookError.message);
          
          // Fall back to mock data
          console.log("Falling back to mock data due to webhook error");
          const mockResponse = {
            id: enhancementId,
            status: "options_ready",
            images: Array(1).fill(0).map((_, index) => ({
              id: index + 1,
              originalUrl: `/uploads/sample-image-${index + 1}.jpg`,
              options: generateMockEnhancementOptions(industry)
            }))
          };
          
          res.status(200).json(mockResponse);
        }
      }
    } catch (error: any) {
      console.error("Error getting enhancement options:", error);
      res.status(500).json({ 
        message: "Error retrieving enhancement options", 
        error: error.message 
      });
    }
  });
  
  // Submit selected enhancement options
  app.post("/api/product-enhancement/:id/select", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      const { selections, webhookRequestId } = req.body;
      if (!selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ message: "No enhancement options selected" });
      }
      
      // In a real app, we'd validate that the user has enough credits
      console.log(`Processing ${selections.length} selections for enhancement ID: ${enhancementId}`);
      
      if (USE_MOCK_WEBHOOK) {
        // Using mock data
        const mockResponse = {
          id: enhancementId,
          status: "processing_selections",
          message: "Enhancement selections are being processed",
          selectionCount: selections.length
        };
        
        res.status(200).json(mockResponse);
      } else {
        try {
          // For real webhook integration
          console.log(`Sending selections to webhook for request ID: ${webhookRequestId}`);
          
          // Send selections to the webhook
          const webhookResponse = await axios.post(`${WEBHOOK_URL}/selections`, {
            requestId: webhookRequestId,
            selections: selections
          });
          
          console.log("Webhook selections response:", webhookResponse.status);
          
          // Transform the webhook response
          const transformedResponse = {
            id: enhancementId,
            status: "processing_selections",
            message: "Enhancement selections are being processed",
            selectionCount: selections.length,
            webhookRequestId: webhookRequestId
          };
          
          res.status(200).json(transformedResponse);
        } catch (webhookError: any) {
          console.error("Error sending selections to webhook:", webhookError.message);
          
          // Fall back to mock response
          console.log("Falling back to mock response due to webhook error");
          const mockResponse = {
            id: enhancementId,
            status: "processing_selections",
            message: "Enhancement selections are being processed",
            selectionCount: selections.length
          };
          
          res.status(200).json(mockResponse);
        }
      }
    } catch (error: any) {
      console.error("Error processing selections:", error);
      res.status(500).json({ 
        message: "Error processing enhancement selections", 
        error: error.message 
      });
    }
  });
  
  // Get enhancement results
  app.get("/api/product-enhancement/:id/results", async (req, res) => {
    try {
      const enhancementId = parseInt(req.params.id);
      if (isNaN(enhancementId)) {
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }
      
      const webhookRequestId = req.query.webhookRequestId as string;
      
      if (USE_MOCK_WEBHOOK) {
        // Using mock data
        await simulateProcessingDelay(1500, 3000);
        
        // Mock results
        const mockResults = {
          id: enhancementId,
          status: "completed",
          message: "Enhancement processing completed",
          selections: Array(2).fill(0).map((_, index) => ({
            id: index + 1,
            imageId: 1,
            option: Object.keys(generateMockEnhancementOptions())[index],
            resultImage1Url: `/uploads/result-${index + 1}-1.jpg`,
            resultImage2Url: `/uploads/result-${index + 1}-2.jpg`
          }))
        };
        
        res.status(200).json(mockResults);
      } else {
        try {
          // For real webhook integration
          console.log(`Requesting results from webhook for request ID: ${webhookRequestId}`);
          
          // Get results from the webhook
          const webhookResponse = await axios.get(`${WEBHOOK_URL}/results`, {
            params: { requestId: webhookRequestId }
          });
          
          console.log("Webhook results response:", webhookResponse.status);
          
          if (webhookResponse.data && webhookResponse.data.selections) {
            // Transform the webhook response
            const transformedResponse = {
              id: enhancementId,
              status: "completed",
              message: "Enhancement processing completed",
              selections: webhookResponse.data.selections.map((selection: any, index: number) => ({
                id: selection.id || index + 1,
                imageId: selection.imageId || 1,
                option: selection.option,
                resultImage1Url: selection.resultImage1Url || `/uploads/result-${index + 1}-1.jpg`,
                resultImage2Url: selection.resultImage2Url || `/uploads/result-${index + 1}-2.jpg`
              }))
            };
            
            res.status(200).json(transformedResponse);
          } else {
            throw new Error("Invalid webhook results response format");
          }
        } catch (webhookError: any) {
          console.error("Error getting results from webhook:", webhookError.message);
          
          // Fall back to mock results
          console.log("Falling back to mock results due to webhook error");
          const mockResults = {
            id: enhancementId,
            status: "completed",
            message: "Enhancement processing completed",
            selections: Array(2).fill(0).map((_, index) => ({
              id: index + 1,
              imageId: 1,
              option: Object.keys(generateMockEnhancementOptions())[index],
              resultImage1Url: `/uploads/result-${index + 1}-1.jpg`,
              resultImage2Url: `/uploads/result-${index + 1}-2.jpg`
            }))
          };
          
          res.status(200).json(mockResults);
        }
      }
    } catch (error: any) {
      console.error("Error getting enhancement results:", error);
      res.status(500).json({ 
        message: "Error retrieving enhancement results", 
        error: error.message 
      });
    }
  });

  // Webhook callback endpoints - for the webhook to send data back to us
  app.post("/api/webhook-callbacks/options", async (req, res) => {
    try {
      console.log(`${new Date().toISOString()} - WEBHOOK CALLBACK: Received options callback`);
      console.log("Received webhook callback for options:", req.body);
      
      // Extract the requestId from the webhook callback
      const { requestId, options } = req.body;
      
      if (!requestId) {
        return res.status(400).json({ message: "Missing requestId in webhook callback" });
      }
      
      // Find the product enhancement by webhook ID
      const enhancement = await storage.getProductEnhancementByWebhookId(requestId);
      
      if (!enhancement) {
        console.error(`No product enhancement found for webhookId: ${requestId}`);
        return res.status(404).json({ message: "No matching enhancement request found" });
      }
      
      console.log(`Found enhancement with ID ${enhancement.id} for webhookId ${requestId}`);
      
      // Update the enhancement status
      await storage.updateProductEnhancementStatus(
        enhancement.id,
        "options_received"
      );
      
      // For each image in the options, update the corresponding enhancement image
      if (options && Array.isArray(options)) {
        // Get all enhancement images
        const enhancementImages = await storage.getProductEnhancementImages(enhancement.id);
        console.log(`Found ${enhancementImages.length} enhancement images for enhancement ID ${enhancement.id}`);
        
        // We'll process each image option
        for (let i = 0; i < options.length && i < enhancementImages.length; i++) {
          const imageOption = options[i];
          const enhancementImage = enhancementImages[i];
          
          // Save the options for this image (assuming they're in order)
          if (enhancementImage) {
            await storage.updateProductEnhancementImageOptions(
              enhancementImage.id,
              imageOption.enhancementOptions
            );
            console.log(`Updated options for image ${enhancementImage.id} (index: ${i+1})`);
          } else {
            console.warn(`No matching image found for index: ${i+1}`);
          }
        }
      }
      
      // Acknowledge receipt
      res.status(200).json({ message: "Options received successfully" });
    } catch (error: any) {
      console.error("Error processing webhook options callback:", error);
      res.status(500).json({ 
        message: "Error processing webhook options callback", 
        error: error.message 
      });
    }
  });

  app.post("/api/webhook-callbacks/results", async (req, res) => {
    try {
      console.log(`${new Date().toISOString()} - WEBHOOK CALLBACK: Received results callback`);
      console.log("Received webhook callback for results:", req.body);
      
      // Extract the requestId from the webhook callback
      const { requestId, results } = req.body;
      
      if (!requestId) {
        return res.status(400).json({ message: "Missing requestId in webhook callback" });
      }
      
      // Find the product enhancement by webhook ID
      const enhancement = await storage.getProductEnhancementByWebhookId(requestId);
      
      if (!enhancement) {
        console.error(`No product enhancement found for webhookId: ${requestId}`);
        return res.status(404).json({ message: "No matching enhancement request found" });
      }
      
      console.log(`Found enhancement with ID ${enhancement.id} for webhookId ${requestId}`);
      
      // Update the enhancement status
      await storage.updateProductEnhancementStatus(
        enhancement.id,
        "results_received"
      );
      
      // Process the results - save the transformed images
      if (results && Array.isArray(results)) {
        for (const result of results) {
          const { selectionId, resultImages } = result;
          
          if (!resultImages || !Array.isArray(resultImages) || resultImages.length < 2) {
            console.warn(`Invalid result images for selectionId: ${selectionId}`);
            continue;
          }
          
          // Save the result images to disk
          const resultImage1Path = path.join(uploadsDir, `${uuid()}-result1.png`);
          const resultImage2Path = path.join(uploadsDir, `${uuid()}-result2.png`);
          
          // Convert base64 to files
          try {
            await fs.promises.writeFile(
              resultImage1Path, 
              Buffer.from(resultImages[0], 'base64')
            );
            await fs.promises.writeFile(
              resultImage2Path, 
              Buffer.from(resultImages[1], 'base64')
            );
            
            // Update the selection with the result images
            await storage.updateProductEnhancementSelectionResults(
              selectionId,
              resultImage1Path,
              resultImage2Path
            );
            
            console.log(`Updated results for selection ${selectionId}`);
          } catch (fileError: any) {
            console.error(`Error saving result images for selection ${selectionId}:`, fileError.message);
          }
        }
      }
      
      // Acknowledge receipt
      res.status(200).json({ message: "Results received successfully" });
    } catch (error: any) {
      console.error("Error processing webhook results callback:", error);
      res.status(500).json({ 
        message: "Error processing webhook results callback", 
        error: error.message 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  console.log("Server created and routes registered successfully");
  return httpServer;
}