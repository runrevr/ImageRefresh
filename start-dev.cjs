/**
 * Simple script to start the development server
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting the development server...');

// Start the server using npm run dev
const dev = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

dev.on('error', (error) => {
  console.error('Failed to start development server:', error);
});

console.log('Development server started!');