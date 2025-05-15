/**
 * Server Startup Script
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting ImageRefresh application server...');

// Kill any existing node processes that might be running our server
try {
  require('child_process').execSync('pkill -f "server/index.ts"');
  console.log('Killed existing server processes');
} catch (e) {
  // No existing processes, that's fine
}

// Give a moment for ports to be released
setTimeout(() => {
  // Run the server using tsx for TypeScript support
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: '5000'
    }
  });

  // Handle server events
  server.on('error', (err) => {
    console.error('Failed to start server:', err);
  });

  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.kill('SIGINT');
    process.exit(0);
  });
}, 1000);
