
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

// Transform endpoint that matches frontend expectation
router.post('/custom-prompt-transform', (req, res) => {
  console.log('Custom prompt transform endpoint hit');
  console.log('Request body:', req.body);
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing prompt parameter' 
      });
    }

    // Create a mock result for now
    const resultId = `transform_${Date.now()}`;
    const result = {
      id: resultId,
      status: 'completed' as const,
      originalImage: 'uploaded_image',
      processedImage: 'mock_processed_image_url',
      prompt: prompt,
      timestamp: Date.now()
    };
    
    setResult(resultId, result);
    
    // Simulate processing delay
    setTimeout(() => {
      result.status = 'completed';
      result.processedImage = `https://example.com/processed/${resultId}.png`;
      setResult(resultId, result);
    }, 2000);
    
    res.json({ 
      success: true, 
      resultId: resultId,
      message: 'Transform request received and processing started' 
    });
    
  } catch (error) {
    console.error('Transform error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during transformation' 
    });
  }
});

export default router;
