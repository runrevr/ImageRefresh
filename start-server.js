const { spawn } = require('child_process');
const path = require('path');

console.log('Starting AI Image Transformation Server...');

// Start the server with proper environment
const serverProcess = spawn('node', ['server/index.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});