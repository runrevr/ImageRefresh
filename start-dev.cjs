/**
 * Simple script to start the development server
 */

const { execSync } = require('child_process');

console.log('Starting application in development mode...');

try {
  // Run the development server
  execSync('NODE_ENV=development npx tsx server/index.ts', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting the server:', error.message);
  process.exit(1);
}