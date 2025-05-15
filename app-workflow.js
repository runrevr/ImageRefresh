// Simple script to start the application via npm run dev
// This allows us to create a Replit workflow for the app
console.log('Starting application...');

// Import the required modules
const { spawn } = require('child_process');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadPath = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Start the application using npm run dev
console.log('Starting development server with npm run dev...');
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle errors
child.on('error', (error) => {
  console.error('Failed to start the server:', error);
  process.exit(1);
});

// Handle process exit
child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});