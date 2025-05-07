// This script starts the server with the alternate port 5001
// to avoid conflicting with other services running on port 5000
const { execSync } = require('child_process');

// Create client .env file for API URL
const fs = require('fs');
fs.writeFileSync('./client/.env', 'VITE_API_BASE_URL=http://localhost:5001');
console.log('Created client/.env file with API base URL');

// Start with port 5001
console.log('Starting server on port 5001...');
try {
  execSync('PORT=5001 NODE_ENV=development tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Server startup error:', error);
  process.exit(1);
}