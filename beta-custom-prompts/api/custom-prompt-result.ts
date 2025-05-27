
import { NextApiRequest, NextApiResponse } from 'next';

interface TransformationResult {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  timestamp: string;
  metadata?: {
    processingTime: number;
    model: string;
    userId?: string;
  };
}

// In-memory storage for demo (in production, use a database)
const transformationResults = new Map<string, TransformationResult>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id, userId } = query;

  if (method === 'GET') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing transformation ID' });
    }

    const result = transformationResults.get(id);
    if (!result) {
      return res.status(404).json({ error: 'Transformation result not found' });
    }

    // Optional user filtering
    if (userId && result.metadata?.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.status(200).json(result);
  }

  if (method === 'POST') {
    const { 
      originalImageUrl, 
      transformedImageUrl, 
      prompt, 
      enhancedPrompt,
      processingTime,
      model,
      userId 
    } = req.body;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing transformation ID' });
    }

    if (!originalImageUrl || !transformedImageUrl || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: originalImageUrl, transformedImageUrl, prompt' 
      });
    }

    const result: TransformationResult = {
      id: id as string,
      originalImageUrl,
      transformedImageUrl,
      prompt,
      enhancedPrompt,
      timestamp: new Date().toISOString(),
      metadata: {
        processingTime: processingTime || 0,
        model: model || 'gpt-image-01',
        userId
      }
    };

    transformationResults.set(id as string, result);

    return res.status(200).json({
      success: true,
      result
    });
  }

  if (method === 'DELETE') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing transformation ID' });
    }

    const deleted = transformationResults.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transformation result not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Transformation result deleted'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
