import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { imageBase64, prompt, model } = req.body;
    
    if (!imageBase64 || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Verify the model is gpt-image-01
    if (model !== 'gpt-image-01') {
      return res.status(400).json({ error: 'Invalid model. Only gpt-image-01 is supported.' });
    }
    
    // For initial testing, you can enable this simulation mode
    // while setting up the OpenAI API integration
    const SIMULATION_MODE = false;
    
    if (SIMULATION_MODE) {
      // In simulation mode, just return the original image with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return res.status(200).json({ 
        transformedImageUrl: `data:image/jpeg;base64,${imageBase64}`,
        prompt
      });
    }
    
    // Call OpenAI API with gpt-image-01
    try {
      const response = await fetch('https://api.openai.com/v1/images/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-01",
          image: imageBase64,
          prompt: prompt,
          response_format: "b64_json",
          size: "1024x1024"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Extract the transformed image from the response
      const transformedImageBase64 = data.data[0].b64_json;
      
      return res.status(200).json({ 
        transformedImageUrl: `data:image/jpeg;base64,${transformedImageBase64}`,
        prompt
      });
    } catch (apiError) {
      console.error('OpenAI API error:', apiError);
      return res.status(500).json({ 
        error: 'Failed to call OpenAI API',
        details: apiError instanceof Error ? apiError.message : String(apiError)
      });
    }
  } catch (error) {
    console.error('Error processing transformation:', error);
    return res.status(500).json({ 
      error: 'Failed to transform image',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}