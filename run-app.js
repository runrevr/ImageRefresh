// Simple script to run the application
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ImageRefresh application...');

// Run the server
const server = spawn('node', ['-r', 'tsx/register', 'server/index.ts'], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

// Handle server events
server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});
