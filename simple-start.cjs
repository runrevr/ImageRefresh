const { execSync } = require('child_process');
const express = require('express');
const path = require('path');

// Start Express server to serve static content
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting ImageRefresh application...');

// First build the client
try {
  console.log('Building frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build complete');
} catch (error) {
  console.error('⚠️ Frontend build failed:', error.message);
  // Continue anyway to serve what we can
}

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For client-side routing, serve the index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
  console.log(`Open your application in the Replit webview`);
});