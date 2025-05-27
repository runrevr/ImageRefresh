
import { Router } from 'express';
import { getResult, setResult, getAllResults } from './custom-prompt-result';
import { getStatus } from './custom-prompt-status';

const router = Router();

// Get result by ID
router.get('/result/:id', (req, res) => {
  const { id } = req.params;
  const result = getResult(id);
  
  if (!result) {
    return res.status(404).json({ error: 'Result not found' });
  }
  
  res.json(result);
});

// Get all results
router.get('/results', (req, res) => {
  const results = getAllResults();
  res.json(results);
});

// Get status
router.get('/status/:id', (req, res) => {
  const { id } = req.params;
  const status = getStatus(id);
  res.json(status);
});

// Transform endpoint (placeholder)
router.post('/transform', (req, res) => {
  const { imageUrl, prompt } = req.body;
  
  // Create a mock result for now
  const resultId = `result_${Date.now()}`;
  const result = {
    id: resultId,
    status: 'pending' as const,
    originalImage: imageUrl,
    prompt: prompt,
    timestamp: Date.now()
  };
  
  setResult(resultId, result);
  
  res.json({ success: true, resultId });
});

export default router;
