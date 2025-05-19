import { Router, Request, Response } from 'express';

/**
 * Create webhook test routes
 * This provides endpoints for testing the N8N webhook connection and fallback functionality
 */
export function setupWebhookTestRoutes() {
  const router = Router();

  // Endpoint to test local fallback API
  router.post('/test-webhook', (req: Request, res: Response) => {
    try {
      console.log('Received webhook test request:', req.body);
      
      // Return the request body and some additional data for verification
      res.status(200).json({
        success: true,
        message: 'Webhook test received successfully',
        timestamp: new Date().toISOString(),
        receivedData: req.body,
        source: 'local-fallback-api'
      });
    } catch (error) {
      console.error('Error handling webhook test:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing webhook test',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // CORS preflight handling specifically for the webhook routes
  router.options('/test-webhook', (req: Request, res: Response) => {
    // Set CORS headers for preflight requests
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.status(200).end();
  });

  // Test connection endpoint
  router.post('/test-connection', (req: Request, res: Response) => {
    try {
      console.log('Test connection request received:', {
        timestamp: new Date().toISOString(),
        body: req.body,
        headers: req.headers
      });

      // Return success to confirm the connection is working
      res.status(200).json({
        success: true,
        message: 'Connection established successfully',
        timestamp: new Date().toISOString(),
        connectionType: 'local-api'
      });
    } catch (error) {
      console.error('Error in test connection:', error);
      res.status(500).json({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return router;
}