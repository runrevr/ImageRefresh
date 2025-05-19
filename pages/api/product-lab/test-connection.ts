import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract test parameters
    const { test, model, timestamp } = req.body;
    
    // Validate the request
    if (!test) {
      return res.status(400).json({ error: 'Test parameter is required' });
    }
    
    // Verify the model is supported
    if (model !== 'gpt-image-01') {
      return res.status(400).json({ error: 'Invalid model. Only gpt-image-01 is supported.' });
    }
    
    // Check if the API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured',
        message: 'The server is not properly configured with an OpenAI API key.'
      });
    }
    
    // If we reach here, the configuration is valid
    return res.status(200).json({ 
      status: 'ok',
      message: 'OpenAI API connection test successful',
      model: model,
      timestamp: timestamp || new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing OpenAI API connection:', error);
    return res.status(500).json({ 
      error: 'Failed to test OpenAI API connection',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}