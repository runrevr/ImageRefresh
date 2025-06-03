import type { Express, Request, Response } from "express";
import { storage } from "./storage.js";

export function setupAPIProxy(app: Express) {
  // Handle both URL patterns: /api/user-images/:userId and /api/user-images?fingerprint=...
  app.use('/api/user-images*', (req: Request, res: Response) => {
    console.log(`[API-PROXY] Intercepting: ${req.method} ${req.originalUrl}`);
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    handleUserImagesRequest(req, res);
  });
}

async function handleUserImagesRequest(req: Request, res: Response) {
  console.log(`[API-PROXY] Processing request: ${req.originalUrl}`);
  console.log(`[API-PROXY] Path params:`, req.params);
  console.log(`[API-PROXY] Query params:`, req.query);
  
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    let userId: number;
    
    // Handle /api/user-images/:userId pattern
    if (req.params.userId) {
      userId = parseInt(req.params.userId, 10);
    }
    // Handle /api/user-images?fingerprint=... pattern
    else if (req.query.fingerprint) {
      console.log(`[API-PROXY] Fingerprint-based request: ${req.query.fingerprint}`);
      // For fingerprint requests, try to get user from fingerprint
      try {
        const user = await storage.getUserByFingerprint(req.query.fingerprint as string);
        if (user && user.id) {
          userId = Number(user.id); // Ensure it's a number
          console.log(`[API-PROXY] Found user ${userId} for fingerprint`);
        } else {
          console.log(`[API-PROXY] No user found for fingerprint, using default user 6`);
          userId = 6; // Default fallback for development
        }
      } catch (fpError) {
        console.log(`[API-PROXY] Fingerprint lookup failed:`, fpError);
        console.log(`[API-PROXY] Using default user ID 6`);
        userId = 6; // Default fallback for development
      }
    }
    // Default fallback for development
    else {
      console.log(`[API-PROXY] No user ID or fingerprint provided, using default`);
      userId = 6;
    }
    
    if (isNaN(userId) || userId <= 0) {
      console.log(`[API-PROXY] Invalid user ID: ${userId}`);
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