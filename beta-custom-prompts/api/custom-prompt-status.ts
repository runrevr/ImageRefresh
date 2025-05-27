
import { NextApiRequest, NextApiResponse } from 'next';

interface TransformationStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string;
  error?: string;
  timestamp: string;
}

// In-memory storage for demo (in production, use a database)
const transformationStatuses = new Map<string, TransformationStatus>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;

  if (method === 'GET') {
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing transformation ID' });
    }

    const status = transformationStatuses.get(id);
    if (!status) {
      return res.status(404).json({ error: 'Transformation not found' });
    }

    return res.status(200).json(status);
  }

  if (method === 'POST') {
    const { status, progress, result, error } = req.body;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing transformation ID' });
    }

    const transformationStatus: TransformationStatus = {
      id: id as string,
      status: status || 'queued',
      progress: progress || 0,
      result,
      error,
      timestamp: new Date().toISOString()
    };

    transformationStatuses.set(id as string, transformationStatus);

    return res.status(200).json({
      success: true,
      status: transformationStatus
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
