// Simple Express server to serve the application
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client/dist')));

// Serve all routes to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`View your application at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  
  // Build the client first
  console.log('Building the client application...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit'
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Client build completed successfully!');
      console.log('Your application should now be accessible.');
    } else {
      console.error(`Client build failed with code ${code}`);
    }
  });
});