// Simple script to start the application
import { spawn } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting application...');
const child = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: process.env
});

child.on('error', (error) => {
  console.error('Failed to start process:', error);
});

process.on('SIGINT', () => {
  console.log('Stopping application...');
  child.kill('SIGINT');
  process.exit(0);
});