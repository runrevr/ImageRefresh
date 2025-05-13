import { Router } from 'express';
import OpenAI from 'openai';

export function setupTestOpenAIRoutes() {
  const router = Router();
  
  // Test OpenAI API key endpoint
  router.get('/api/test-openai', async (req, res) => {
    try {
      // Check if API key exists
      const apiKey = process.env.OPENAI_API_KEY || '';
      const hasValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'OpenAI API key is not configured',
          details: 'No API key found in environment variables'
        });
      }

      if (!hasValidFormat) {
        return res.status(400).json({
          success: false,
          message: 'OpenAI API key has invalid format',
          details: `Key should start with "sk-" and be at least 20 characters (Found: ${apiKey.substring(0, 4)}...)`
        });
      }

      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey
      });

      // Make a minimal API call to verify connectivity
      console.log('Testing OpenAI API with a minimal request...');
      const modelsList = await openai.models.list();
      
      // Successfully connected to OpenAI API
      return res.json({
        success: true,
        message: 'OpenAI API key is properly configured and working',
        details: {
          key_format: 'valid',
          api_connected: true,
          models_available: modelsList.data.length,
          first_few_models: modelsList.data.slice(0, 3).map(model => model.id)
        }
      });
    } catch (error: any) {
      console.error('Error testing OpenAI connection:', error);
      
      // Detailed error response
      return res.status(500).json({
        success: false,
        message: 'Error connecting to OpenAI API',
        details: error.message,
        status: error.status,
        type: error.type,
        code: error.code
      });
    }
  });

  return router;
}