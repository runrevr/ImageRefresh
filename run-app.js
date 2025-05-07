// This script sets up the client environment and starts the server
// with port 5001 to avoid conflicts
import { execSync } from 'child_process';
import fs from 'fs';

// Create .env file in client directory
console.log('Creating client/.env file with API URL...');
fs.writeFileSync('./client/.env', 'VITE_API_BASE_URL=http://localhost:5001');

// Install sharp if needed (for image processing)
console.log('Installing sharp for image processing...');
try {
  execSync('npm install sharp', { stdio: 'inherit' });
} catch (error) {
  console.warn('Warning: Sharp installation may have issues:', error.message);
}

// Start the server with PORT=5001
console.log('Starting server on port 5001...');
try {
  execSync('PORT=5001 NODE_ENV=development tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Server startup error:', error);
  process.exit(1);
}