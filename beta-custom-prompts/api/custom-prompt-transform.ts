
import { NextApiRequest, NextApiResponse } from 'next';
import { CUSTOM_AI_CONFIG } from '../utils/config.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, customPrompt, userId } = req.body;
    
    if (!imageBase64 || !customPrompt) {
      return res.status(400).json({ error: 'Missing required parameters: imageBase64 and customPrompt' });
    }

    // Validate prompt length
    if (customPrompt.length > CUSTOM_AI_CONFIG.MAX_PROMPT_LENGTH) {
      return res.status(400).json({ 
        error: `Prompt too long. Maximum ${CUSTOM_AI_CONFIG.MAX_PROMPT_LENGTH} characters allowed.` 
      });
    }

    console.log('Custom AI Prompt Transform Request:', {
      promptLength: customPrompt.length,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // Enhanced prompt processing if enabled
    let finalPrompt = customPrompt;
    if (CUSTOM_AI_CONFIG.ENABLE_PROMPT_ENHANCEMENT) {
      // Add creative enhancement to the custom prompt
      finalPrompt = `Create a stunning, professional transformation: ${customPrompt}. Enhance with artistic flair while maintaining the core concept.`;
    }

    // Call OpenAI API for image transformation
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CUSTOM_AI_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-01",
        image: imageBase64,
        prompt: finalPrompt,
        response_format: "b64_json",
        size: "1024x1024",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const transformedImageBase64 = data.data[0].b64_json;

    return res.status(200).json({
      success: true,
      transformedImageUrl: `data:image/jpeg;base64,${transformedImageBase64}`,
      originalPrompt: customPrompt,
      enhancedPrompt: finalPrompt,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Custom AI Transform Error:', error);
    return res.status(500).json({
      error: 'Failed to transform image with custom prompt',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
