import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Print a header to the console
console.log('========================================');
console.log('🚀 Starting Image Transformation Server');
console.log('========================================');

// Start the backend server
console.log('Starting backend server...');
const backendServer = spawn('node', ['--loader=tsx', 'server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit'
});

backendServer.on('error', (err) => {
  console.error(`Backend server error: ${err}`);
});

// Give the backend a moment to start up
setTimeout(() => {
  // Start the frontend server
  console.log('Starting frontend server...');
  const frontendServer = spawn('npx', ['vite'], {
    stdio: 'inherit'
  });

  frontendServer.on('error', (err) => {
    console.error(`Frontend server error: ${err}`);
    process.exit(1);
  });

  console.log('Both servers are now running!');
  console.log('To access your site, click the "Show" button at the top of Replit.');
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  backendServer.kill();
  process.exit();
});