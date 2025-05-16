/**
 * Simple starter script for the development server
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting the Image Transformation App development server...');

// Set the environment variable for development
process.env.NODE_ENV = 'development';

// Start the development server using tsx
const devProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env },
  cwd: __dirname
});

// Handle process exit
devProcess.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
});