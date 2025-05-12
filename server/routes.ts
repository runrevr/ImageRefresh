import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { generateMockEnhancementOptions, simulateProcessingDelay, generateMockEnhancementResults } from "./mock-webhook-data";

export async function registerRoutes(app: Express): Promise<Server> {
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
  app.post("/api/product-enhancement/start", productUpload.array("images", 5), async (req, res) => {
    try {
      console.log("Product enhancement start request received");
      console.log("DEBUG: Storage object type:", typeof storage);
      console.log("DEBUG: Available storage methods:", Object.keys(storage).join(", "));
      
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
      
      // Direct approach bypassing storage layer for testing
      res.status(200).json({ 
        message: "Product enhancement started successfully", 
        id: 1,  // Changed from enhancementId to id to match client expectations
        imageCount: uploadedImages.length,
        industry: req.body.industry,
        status: "pending"
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

      // For now, we just mock the response with test data
      await simulateProcessingDelay(1000, 2000); // Simulate webhook processing time
      
      // Let's use the industry from the job - but in our case just mock it
      const industry = "decor"; // This would come from the database in a full implementation
      
      // Generate 5 mock images with options
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
      
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections) || selections.length === 0) {
        return res.status(400).json({ message: "No enhancement options selected" });
      }
      
      // For demo purposes, just accept the selections and return a success response
      const mockResponse = {
        id: enhancementId,
        status: "processing_selections",
        message: "Enhancement selections are being processed",
        selectionCount: selections.length
      };
      
      res.status(200).json(mockResponse);
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
      
      // Simulate processing delay
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
    } catch (error: any) {
      console.error("Error getting enhancement results:", error);
      res.status(500).json({ 
        message: "Error retrieving enhancement results", 
        error: error.message 
      });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}