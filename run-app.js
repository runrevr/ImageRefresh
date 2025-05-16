/**
 * Simple application starter for image transformation app
 */
import { exec } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting Image Transformation Application...');

// Environment setup
process.env.NODE_ENV = 'development';

// Start the server
const server = exec('tsx server/index.ts', {
  cwd: __dirname,
  env: { ...process.env }
});

// Log server output
server.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

server.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});