// Simple starter for image transformation app
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting simple image transformation app...');
const serverProcess = spawn('node', ['simple-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

console.log('Simple server starting...');

serverProcess.on('error', (error) => {
  console.error('Failed to start server process:', error);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});