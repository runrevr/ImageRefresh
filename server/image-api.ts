import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";

export function setupImageAPI(app: Express) {
  // Dedicated user images endpoint with priority routing
  app.get('/api/user-images/:userId', async (req: Request, res: Response) => {
    console.log(`[IMAGE-API] Request: GET /api/user-images/${req.params.userId}`);
    
    // Set explicit JSON headers
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
      const userId = parseInt(req.params.userId, 10);
      
      if (isNaN(userId) || userId <= 0) {
        console.log(`[IMAGE-API] Invalid userId: ${req.params.userId}`);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid user ID' 
        });
      }

      console.log(`[IMAGE-API] Fetching images for user ${userId}`);
      const images = await storage.getUserImages(userId);
      console.log(`[IMAGE-API] Found ${images.length} images`);

      const response = {
        success: true,
        count: images.length,
        userId: userId,
        images: images,
        timestamp: new Date().toISOString()
      };

      console.log(`[IMAGE-API] Returning ${images.length} images`);
      return res.status(200).json(response);
      
    } catch (error) {
      console.error(`[IMAGE-API] Error:`, error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user images',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Health check for API
  app.get('/api/images/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      service: 'image-api',
      timestamp: new Date().toISOString()
    });
  });
}