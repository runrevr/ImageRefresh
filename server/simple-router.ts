/**
 * Simple routes added to ensure client-side compatibility
 */

import express, { Router } from 'express';

// Create a router for our simple endpoints
export function setupSimpleRouter(): Router {
  const router = express.Router();

  // Configuration endpoint
  router.get("/api/config", (req, res) => {
    console.log("Config endpoint accessed");
    res.json({
      featureFlags: {
        newUI: true
      },
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
      maxUploadSize: 10 * 1024 * 1024 // 10MB
    });
  });

  // Credits endpoints - both versions for backward compatibility
  router.get("/api/credits/:id", (req, res) => {
    console.log(`Credits endpoint accessed for ID: ${req.params.id}`);
    res.json({
      credits: 5,
      paidCredits: 0,
      freeCreditsUsed: false
    });
  });

  router.get("/api/user-credits/:id", (req, res) => {
    console.log(`User credits endpoint accessed for ID: ${req.params.id}`);
    res.json({
      credits: 5,
      paidCredits: 0,
      freeCreditsUsed: false
    });
  });
  
  return router;
}
