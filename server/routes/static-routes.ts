import { Router } from 'express';
import path from 'path';
import fs from 'fs';

// Create router to serve static HTML pages directly
export function setupStaticRoutes() {
  const router = Router();
  
  // Serve the product-image-lab.html page directly
  router.get('/product-image-lab-html', (req, res) => {
    const htmlPath = path.join(process.cwd(), 'public', 'product-image-lab.html');
    
    if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send('Product Image Lab page not found. Please check if product-image-lab.html exists in the public directory.');
    }
  });
  
  return router;
}