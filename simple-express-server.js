const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from project root
app.use(express.static(__dirname));

// Serve the image test page as the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'image-test.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log('View your site in the Replit webview');
});