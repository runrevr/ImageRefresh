import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Serve static files from the root directory
app.use(express.static('.'));

// Specific routes for the HTML files
app.get('/product-lab', (req, res) => {
  res.sendFile(path.join(__dirname, 'product-image-lab-test.html'));
});

app.get('/product-processor', (req, res) => {
  res.sendFile(path.join(__dirname, 'product-processor-test.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`HTML file server running at http://localhost:${PORT}`);
  console.log(`Access Product Lab at: http://localhost:${PORT}/product-lab`);
  console.log(`Access Product Processor at: http://localhost:${PORT}/product-processor`);
});