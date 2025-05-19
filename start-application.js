/**
 * Simple script to start the application
 * Run with: node start-application.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting the application...');

// Start the application using npm run dev
const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

devProcess.on('error', (error) => {
  console.error('Failed to start the application:', error);
});

console.log('Application started! Access it at the URL shown in the console.');
console.log('To test the fixed Product Image Lab, navigate to /fixed-product-lab in your browser.');