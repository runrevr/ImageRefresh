/**
 * Simple routes added to ensure client-side compatibility
 */

import express, { Router } from 'express';

// Create a router for our simple endpoints
export function setupSimpleRouter(): Router {
  const router = express.Router();

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
