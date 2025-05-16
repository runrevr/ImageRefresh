/**
 * Simple server starter script for our Image Transformation application
 */
const { exec } = require('child_process');
const path = require('path');

console.log('Starting Image Transformation application...');

// Start the Express server
const server = exec('node server/index.js', {
  cwd: process.cwd(),
  env: { ...process.env, PORT: 3000 }
});

// Forward stdout and stderr to the console
server.stdout.on('data', (data) => {
  console.log(`[Server] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[Server Error] ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

console.log('Server started on port 3000');
console.log('Visit http://localhost:3000 to use the application');