import { Router } from 'express';

// Create a simple status endpoint to test API functionality
export function setupTestStatusRoute() {
  const router = Router();
  
  router.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      openai_configured: !!process.env.OPENAI_API_KEY,
      database_configured: !!process.env.DATABASE_URL
    });
  });

  return router;
}