// Simple script to start the application with NODE_ENV=development
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting Image Transformation Application...');
const serverProcess = spawn('node', ['server/express-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

console.log('Server started with PID:', serverProcess.pid);

serverProcess.on('error', (error) => {
  console.error('Failed to start server process:', error);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});
