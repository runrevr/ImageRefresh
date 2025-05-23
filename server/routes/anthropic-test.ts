
import express from 'express';
import { anthropicService } from '../anthropic-service';

export function setupAnthropicTestRoutes() {
  const router = express.Router();

  router.get('/test-anthropic', async (req, res) => {
    try {
      // Check if API key is set
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({
          success: false,
          message: 'ANTHROPIC_API_KEY is not set in environment variables'
        });
      }
      
      // Simple test prompt
      const result = await anthropicService.generateCompletion(
        'Write a short paragraph about AI image enhancement.'
      );
      
      return res.json({
        success: true,
        message: 'Anthropic API connection successful!',
        data: result
      });
    } catch (error: any) {
      console.error('Anthropic API test failed:', error);
      return res.status(500).json({
        success: false,
        message: `Anthropic API test failed: ${error.message}`,
        error: error.response?.data || error.message
      });
    }
  });

  return router;
}
