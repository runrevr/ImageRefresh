
import express from 'express';
import multer from 'multer';
import { handleTransform } from './custom-prompt-transform';
import { checkStatus } from './custom-prompt-status';
import { getResult } from './custom-prompt-result';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Route definitions
router.post('/custom-prompt-transform', upload.single('image'), handleTransform);
router.get('/custom-prompt-status/:jobId', checkStatus);
router.get('/custom-prompt-result/:jobId', getResult);

export default router;
