import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from project root
app.use(express.static(__dirname));

// Serve the image test page as the homepage
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'image-test.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log('View your site in the Replit webview');
});