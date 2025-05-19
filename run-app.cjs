/**
 * Application starter script
 * This script starts the development server
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Start the server
console.log('Starting development server...');

// Use npx tsx to run the TypeScript server directly
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Log the process ID for later reference
fs.writeFileSync(path.join(__dirname, 'server.pid'), String(serverProcess.pid));

console.log(`Server started with PID: ${serverProcess.pid}`);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serverProcess.kill();
  process.exit();
});