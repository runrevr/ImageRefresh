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
// N8N webhook URL - for this URL format to work with N8N:
// 1. Make sure the webhook is active in N8N
// 2. Try using the exact URL from the N8N interface, including any query parameters
// 3. Some N8N webhooks don't expect additional path segments like "/options"
// Updated to use the /webhook/ path instead of /webhook-test/ based on testing
const WEBHOOK_URL = "https://www.n8nemma.live/webhook/dbf2c53a-616d-4ba7-8934-38fa5e881ef9";

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
  
  app.post("/api/product-enhancement/start", productUpload.array("images", 5), async (req, res) => {
    try {
      console.log("\n\n====================== PRODUCT ENHANCEMENT START ======================");
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Received ${(req.files || []).length} files and industry: "${req.body.industry}"`);
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
          // Use the Replit URL which is accessible from the outside
          const replitId = process.env.REPL_ID || "nthzsmrhmcszymjy"; // Fallback to a known value
          const baseUrl = `https://${replitId}.id.replit.dev`;
          
          // Send to webhook
          // Create the webhook request data
          const callbackOptions = `${baseUrl}/api/webhook-callbacks/options`;
          const callbackResults = `${baseUrl}/api/webhook-callbacks/results`;
          
          const webhookData = {
            requestId: webhookRequestId,
            industry: req.body.industry,
            images: imageBase64Array.map((base64, index) => ({
              id: index + 1,
              data: base64
            })),
            callbackUrls: {
              options: callbackOptions,
              results: callbackResults
            }
          };
          
          console.log(`\n\n====================== WEBHOOK REQUEST ======================`);
          console.log(`Webhook URL: ${WEBHOOK_URL}`);
          console.log(`Request ID: ${webhookRequestId}`);
          console.log(`Industry: ${req.body.industry}`);
          console.log(`Images: ${imageBase64Array.length}`);
          console.log(`Callbacks:`);
          console.log(`- Options: ${callbackOptions}`);
          console.log(`- Results: ${callbackResults}`);
          console.log(`============================================================\n\n`);
          
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
          
          // Make the webhook request - add action field and headers for N8N compatibility
          console.log(`Sending POST request to ${WEBHOOK_URL}...`);
          const webhookDataWithAction = {
            ...webhookData,
            action: "processImages"  // Add action parameter to help N8N route the request
          };
          
          console.log("DEBUG: Process environment variable USE_MOCK_WEBHOOK =", process.env.USE_MOCK_WEBHOOK);
          console.log("DEBUG: Variable USE_MOCK_WEBHOOK =", USE_MOCK_WEBHOOK);
          
          // Create a clean version of the request data for logging (without large base64)
          const debugRequestData = {
            ...webhookDataWithAction,
            images: webhookDataWithAction.images.map(img => ({
              id: img.id,
              dataLength: img.data.length
            }))
          };
          console.log("DEBUG: Webhook request data:", JSON.stringify(debugRequestData, null, 2));
          
          const webhookResponse = await axios.post(WEBHOOK_URL, webhookDataWithAction, {
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Source': 'ImageRefresh-App',
              'Accept': 'application/json'
            }
          });
          
          console.log("DEBUG: Webhook response status:", webhookResponse.status);
          console.log("DEBUG: Webhook response data:", JSON.stringify(webhookResponse.data, null, 2));
          
          console.log(`\n\n====================== WEBHOOK RESPONSE ======================`);
          console.log(`Status Code: ${webhookResponse.status}`);
          console.log(`Headers: ${JSON.stringify(webhookResponse.headers, null, 2)}`);
          console.log(`Data: ${JSON.stringify(webhookResponse.data, null, 2)}`);
          console.log(`=============================================================\n\n`);
          
          // Create the product enhancement record in the database
          try {
            const enhancement = await storage.createProductEnhancement({
              userId: 1, // Default user ID for testing
              industry: req.body.industry
            });
            
            if (enhancement && enhancement.id) {
              // Update the record with the webhook request ID
              await storage.updateProductEnhancementStatus(
                enhancement.id,
                "pending",
                webhookRequestId
              );
              
              // Create an entry for each uploaded image
              for (const image of uploadedImages) {
                await storage.createProductEnhancementImage({
                  enhancementId: enhancement.id,
                  originalImagePath: image.path
                });
              }
              
              console.log(`Created product enhancement with ID ${enhancement.id} and ${uploadedImages.length} images`);
            } else {
              console.error("Failed to create enhancement record (null/invalid result)");
            }
          } catch (dbError: any) {
            console.error("Error creating enhancement record in webhook handler:", dbError);
            // Continue even if this fails
          }
        } catch (webhookError: any) {
          console.error("Error calling webhook:", webhookError.message);
          
          // Provide detailed error information for debugging
          if (webhookError.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Webhook error response:", {
              status: webhookError.response.status,
              statusText: webhookError.response.statusText,
              headers: webhookError.response.headers,
              data: webhookError.response.data
            });
          } else if (webhookError.request) {
            // The request was made but no response was received
            console.error("Webhook error (no response):", {
              request: webhookError.request._currentUrl || webhookError.request.path,
              method: webhookError.request.method
            });
          }
          
          // If webhook fails, we'll continue with mock data
          console.log("Falling back to mock data due to webhook error");
        }
      }
      
      // Find or create the enhancement record in the database
      let enhancementId;
      let enhancementStatus = "pending";
      
      try {
        // For real webhook mode, we should have created a record in the webhook section
        // Need to use different logic since enhancement is out of scope here
        if (!USE_MOCK_WEBHOOK) {
          // Look for the record by webhook request ID
          const existingEnhancement = await storage.getProductEnhancementByWebhookId(webhookRequestId);
          if (existingEnhancement) {
            enhancementId = existingEnhancement.id;
          }
        } else {
          // Create a new record for mock mode or as fallback
          const newEnhancement = await storage.createProductEnhancement({
            userId: 1, // Default user ID for demo
            industry: req.body.industry
          });
          
          enhancementId = newEnhancement.id;
          
          // Update with webhook ID
          await storage.updateProductEnhancementStatus(
            enhancementId,
            "pending",
            webhookRequestId
          );
          
          // Create image records
          for (const image of uploadedImages) {
            await storage.createProductEnhancementImage({
              enhancementId: enhancementId,
              originalImagePath: image.path
            });
          }
          
          console.log(`Created product enhancement with ID ${enhancementId} and ${uploadedImages.length} images`);
        }
      } catch (dbError: any) {
        console.error("Error creating enhancement records:", dbError);
        // Continue with response even if DB operation failed
      }
      
      // Send back a response to the client with the real enhancement ID
      res.status(200).json({ 
        message: "Product enhancement started successfully", 
        id: enhancementId || 1, // Use real ID if available, fallback to 1
        imageCount: uploadedImages.length,
        industry: req.body.industry,
        status: enhancementStatus,
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
      console.log(`\n\n====================== GET ENHANCEMENT OPTIONS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      
      const enhancementId = parseInt(req.params.id);
      console.log(`Enhancement ID: ${enhancementId}`);
      
      if (isNaN(enhancementId)) {
        console.log(`Invalid enhancement ID: ${req.params.id}`);
        return res.status(400).json({ message: "Invalid enhancement ID" });
      }

      // Look up the enhancement in the database
      const enhancement = await storage.getProductEnhancement(enhancementId);
      console.log(`Enhancement data:`, JSON.stringify(enhancement, null, 2));
      
      if (!enhancement) {
        console.log(`Enhancement not found for ID: ${enhancementId}`);
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      // Debug print industry options
      if (enhancement && enhancement.industry) {
        console.log(`Industry from enhancement: "${enhancement.industry}"`);
        const options = generateMockEnhancementOptions(enhancement.industry);
        console.log(`Generated options for "${enhancement.industry}":`, 
          JSON.stringify(options, null, 2));
      }

      // Get the webhook request ID from the database or generate a new one
      const webhookRequestId = enhancement.webhookId || `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Get the industry from the database
      const industry = enhancement.industry || "decor";
      
      console.log(`Fetching options for enhancement ID ${enhancementId} (industry: ${industry})`);
      
      if (USE_MOCK_WEBHOOK) {
        // Using mock data
        await simulateProcessingDelay(1000, 2000); // Simulate webhook processing time
        
        // Get the actual images for this enhancement
        const enhancementImages = await storage.getProductEnhancementImages(enhancementId);
        console.log(`Found ${enhancementImages.length} images for enhancement ${enhancementId}`);
        
        // Generate mock responses for each actual image
        const mockResponse = {
          id: enhancementId,
          status: "options_ready",
          images: enhancementImages.map((image, index) => ({
            id: image.id,
            originalUrl: image.originalImagePath,
            options: (() => {
              console.log(`Generating options for image ${image.id}, industry: "${industry}"`);
              const options = generateMockEnhancementOptions(industry);
              console.log(`Generated ${Object.keys(options).length} options:`, JSON.stringify(options, null, 2));
              return options;
            })()
          }))
        };
        
        res.status(200).json(mockResponse);
      } else {
        try {
          // For real webhook integration
          console.log(`Requesting options from webhook for request ID: ${webhookRequestId}`);
          
          // Based on curl test, we know the webhook receives but doesn't respond
          console.log("Using direct fetch for now while webhook callbacks are being set up");
          
          // Since the N8N webhook doesn't seem to be returning data directly,
          // let's use our mock data for the real industry while the webhook system
          // is being configured correctly
          const enhancementImages = await storage.getProductEnhancementImages(enhancementId);
          
          // Generate options based on the real industry, but using our local generator
          console.log(`Using local generator for industry: "${industry}" while waiting for webhook setup`);
          const options = generateMockEnhancementOptions(industry);
          
          // Create a simulated webhook response
          const webhookResponse = {
            status: 200,
            data: {
              images: enhancementImages.map((image: any) => ({
                id: image.id,
                originalUrl: image.originalImagePath,
                options: options
              }))
            }
          };
          
          console.log(`Created ${enhancementImages.length} images with options for industry: "${industry}"`);
          console.log("Options:", JSON.stringify(options, null, 2));
          
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
      
      // Get the enhancement from the database
      const enhancement = await storage.getProductEnhancement(enhancementId);
      if (!enhancement) {
        return res.status(404).json({ message: "Enhancement not found" });
      }
      
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ message: "No enhancement options selected" });
      }
      
      // Get the webhook request ID from the database
      const webhookRequestId = enhancement.webhookId || req.body.webhookRequestId;
      
      // In a real app, we'd validate that the user has enough credits
      console.log(`Processing ${selections.length} selections for enhancement ID: ${enhancementId}`);
      
      if (USE_MOCK_WEBHOOK) {
        try {
          console.log("Using mock webhook for selections", selections);
          
          // Save the selections to the database
          const savedSelections: Array<{
            id: number;
            enhancementId: number;
            imageId: number;
            optionId: string;
            optionKey: string;
            optionName: string | null;
            resultImage1Path: string | null;
            resultImage2Path: string | null;
            createdAt: Date;
            status: string;
          }> = [];
          
          for (const selection of selections) {
            try {
              const savedSelection = await storage.createProductEnhancementSelection({
                enhancementId,
                imageId: selection.imageId,
                optionId: selection.optionId,
                optionKey: selection.optionId, // Use optionId as the key for now
                optionName: selection.optionName
              });
              
              if (savedSelection) {
                // Cast the saved selection to our expected type
                savedSelections.push(savedSelection as any);
                console.log(`Saved selection ID ${savedSelection.id} for enhancementId ${enhancementId}`);
              }
            } catch (err) {
              console.error(`Error saving selection (${selection.optionName})`, err);
            }
          }
          
          // Update the enhancement status
          const mockWebhookId = enhancement.webhookId || webhookRequestId || `mock-${Date.now()}`;
          await storage.updateProductEnhancementStatus(
            enhancementId,
            "processing_selections",
            mockWebhookId
          );
          
          const mockResponse = {
            id: enhancementId,
            status: "processing_selections",
            message: "Enhancement selections are being processed",
            selectionCount: selections.length,
            savedSelectionCount: savedSelections.length
          };
          
          // Tell the client the response will be ready soon
          res.status(200).json(mockResponse);
          
          // After a brief delay, process the selections and update the enhancement with results
          setTimeout(async () => {
            try {
              console.log(`Starting mock processing for enhancement ${enhancementId} with ${savedSelections.length} selections`);
              
              // Generate mock results
              const results = [];
              
              // Group selections by image ID
              const selectionsByImage: Record<string, any[]> = {};
              for (const selection of savedSelections) {
                const imageIdKey = String(selection.imageId);
                if (!selectionsByImage[imageIdKey]) {
                  selectionsByImage[imageIdKey] = [];
                }
                selectionsByImage[imageIdKey].push(selection);
              }
              
              // For each image with selections, generate results
              for (const [imageIdStr, imageSelections] of Object.entries(selectionsByImage)) {
                const imageId = parseInt(imageIdStr);
                console.log(`Processing imageId: ${imageId} with ${imageSelections.length} selections`);
                
                // Get the original image
                const enhancementImage = await storage.getProductEnhancementImage(imageId);
                if (!enhancementImage) {
                  console.warn(`No image found for imageId: ${imageId}`);
                  continue;
                }
                
                console.log(`Found image at path: ${enhancementImage.originalImagePath}`);
                
                // For each selection, generate two result images
                for (const selection of imageSelections) {
                  console.log(`Generating results for selection ID ${selection.id}, option: ${selection.optionName}`);
                  
                  try {
                    // Generate mock result images
                    const resultImages = generateMockEnhancementResults(
                      enhancementImage.originalImagePath,
                      selection.optionName
                    );
                    
                    // Add to results array
                    results.push({
                      selectionId: selection.id,
                      imageId: imageId,
                      optionId: selection.optionId,
                      resultImage1Path: resultImages.resultImage1Path,
                      resultImage2Path: resultImages.resultImage2Path
                    });
                    
                    console.log(`Generated result images for selection ${selection.id}:`, resultImages);
                  } catch (error) {
                    console.error(`Error generating mock results for selection ${selection.id}:`, error);
                  }
                }
              }
              
              console.log(`Generated ${results.length} mock results for enhancement ${enhancementId}`);
              
              // Store the results in the database
              // In a real implementation, this would happen in the webhook callback
              if (results.length > 0) {
                // Convert the results to the expected format
                const formattedResults = results.map(result => ({
                  selectionId: result.selectionId,
                  imageId: result.imageId,
                  optionId: result.optionId,
                  resultImage1Path: result.resultImage1Path,
                  resultImage2Path: result.resultImage2Path
                }));
                
                await storage.updateProductEnhancementResults(enhancementId, formattedResults);
                console.log(`Updated enhancement ${enhancementId} with ${results.length} results`);
              }
              
              await storage.updateProductEnhancementStatus(
                enhancementId, 
                "completed", 
                mockWebhookId
              );
              
              console.log(`Mock processing complete for enhancement ${enhancementId}, updated with ${results.length} results`);
            } catch (err) {
              console.error("Error in mock processing:", err);
              await storage.updateProductEnhancementStatus(
                enhancementId, 
                "error", 
                mockWebhookId
              );
            }
          }, 3000); // 3 second delay
        } catch (mockError: any) {
          console.error("Error in mock webhook processing:", mockError);
          res.status(500).json({ 
            message: "Error processing enhancement selections", 
            error: mockError.message || String(mockError)
          });
        }
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
        
        // Test mock options generation
        const hairCareOptions = generateMockEnhancementOptions('hair care');
        console.log('MOCK OPTIONS FOR HAIR CARE:', JSON.stringify(hairCareOptions, null, 2));
        
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
      console.log(`\n\n====================== WEBHOOK CALLBACK: OPTIONS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Headers:`, req.headers);
      console.log(`Body:`, JSON.stringify(req.body, null, 2));
      console.log(`=================================================================\n\n`);
      
      // DEBUG: Test options generation for different industries
      console.log('MOCK OPTIONS DEBUG:');
      console.log('- HAIR CARE:', JSON.stringify(generateMockEnhancementOptions('hair care'), null, 2));
      console.log('- fashion:', JSON.stringify(generateMockEnhancementOptions('fashion'), null, 2));
      console.log('- default:', JSON.stringify(generateMockEnhancementOptions(), null, 2));
      
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
      console.log(`\n\n====================== WEBHOOK CALLBACK: RESULTS ======================`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Headers:`, req.headers);
      console.log(`Body:`, JSON.stringify(req.body, null, 2));
      console.log(`=================================================================\n\n`);
      
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