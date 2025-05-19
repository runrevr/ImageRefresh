import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check if the OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        message: 'OpenAI API key is not configured'
      });
    }
    
    // Make a lightweight request to OpenAI to verify the API key works
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      // If we get here, the API key is valid
      return res.status(200).json({ 
        success: true,
        message: 'OpenAI API connection successful',
        models: 'Available'
      });
    } catch (apiError) {
      console.error('OpenAI API connection test failed:', apiError);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to connect to OpenAI API',
        error: apiError instanceof Error ? apiError.message : String(apiError)
      });
    }
  } catch (error) {
    console.error('Error testing API connection:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error testing API connection',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}