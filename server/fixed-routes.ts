import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";

// Fixed user images API endpoint with proper JSON response
export function setupUserImagesRoute(app: Express) {
  app.get('/api/user-images/:userId', async (req: Request, res: Response) => {
    console.log(`[FIXED-API] Request: GET /api/user-images/${req.params.userId}`);
    
    // Ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const userId = parseInt(req.params.userId, 10);
      console.log(`[FIXED-API] Parsed userId: ${userId}`);

      if (isNaN(userId) || userId <= 0) {
        console.log(`[FIXED-API] Invalid userId: ${req.params.userId}`);
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid user ID' 
        });
      }

      console.log(`[FIXED-API] Calling storage.getUserImages(${userId})`);
      const images = await storage.getUserImages(userId);
      console.log(`[FIXED-API] Found ${images.length} images`);

      const response = {
        success: true,
        count: images.length,
        images: images,
        userId: userId,
        timestamp: new Date().toISOString()
      };

      console.log(`[FIXED-API] Sending response with ${images.length} images`);
      return res.status(200).json(response);
      
    } catch (error) {
      console.error(`[FIXED-API] Error:`, error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch user images',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}