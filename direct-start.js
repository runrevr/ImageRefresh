// Simple script to start the server directly
const { execSync } = require('child_process');

try {
  console.log('Starting server with direct command...');
  
  // First make sure sharp is installed
  execSync('npm install sharp', { stdio: 'inherit' });
  
  // Then start the server directly with the environment variable set
  execSync('NODE_ENV=development tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting server:', error);
}