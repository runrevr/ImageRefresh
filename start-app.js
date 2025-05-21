/**
 * Script to start the application for testing
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Starting the application in development mode...');

// Set the NODE_ENV environment variable to development
process.env.NODE_ENV = 'development';

// Start the server using tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

console.log('Server process started with PID:', server.pid);

// Handle server process events
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server process:', err);
});

// Log a message when the script ends
process.on('SIGINT', () => {
  console.log('Received SIGINT signal. Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});