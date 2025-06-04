import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";

export function setupAPIProxy(app: Express) {
  // Direct API proxy that bypasses all other middleware
  app.use('/api/user-images/:userId', (req: Request, res: Response) => {
    console.log(`[API-PROXY] Intercepting: ${req.method} ${req.originalUrl}`);
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    handleUserImagesRequest(req, res);
  });
}

async function handleUserImagesRequest(req: Request, res: Response) {
  console.log(`[API-PROXY] Processing user images request for user ${req.params.userId}`);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId) || userId <= 0) {
      console.log(`[API-PROXY] Invalid user ID: ${req.params.userId}`);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid user ID' 
      });
    }

    console.log(`[API-PROXY] Fetching images for user ${userId}`);
    const images = await storage.getUserImages(userId);
    console.log(`[API-PROXY] Retrieved ${images.length} images from storage`);

    const response = {
      success: true,
      count: images.length,
      userId: userId,
      images: images,
      timestamp: new Date().toISOString()
    };

    console.log(`[API-PROXY] Sending JSON response with ${images.length} images`);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('[API-PROXY] Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}