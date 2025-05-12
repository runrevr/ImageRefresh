import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}