// Script to start both the API server and client
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting Image Transformation Application...');

// Create logs directory if it doesn't exist
const logsDir = `${__dirname}/logs`;
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = `${__dirname}/uploads`;
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start server with Node
const serverProcess = spawn('node', ['server/express-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '5000',
    NODE_ENV: 'development'
  }
});

console.log('Server process started with PID:', serverProcess.pid);

serverProcess.on('error', (error) => {
  console.error('Failed to start server process:', error);
});

// Clean up child processes when this script exits
process.on('SIGINT', () => {
  console.log('Stopping all processes...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('exit', () => {
  console.log('Exiting and cleaning up...');
  serverProcess.kill();
});