import { spawn } from 'child_process';

console.log('🚀 Starting Image Transformation Server for Replit');

// Start the frontend Vite server with host flag to make it accessible
console.log('Starting Vite server...');
const viteServer = spawn('npx', ['vite', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

viteServer.on('error', (err) => {
  console.error(`Vite server error: ${err}`);
  process.exit(1);
});

// In a separate terminal window, start the backend server
setTimeout(() => {
  console.log('Starting backend API server...');
  
  const backendServer = spawn('tsx', ['server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
  });

  backendServer.on('error', (err) => {
    console.error(`Backend server error: ${err}`);
    process.exit(1);
  });

  console.log('✅ Application is now running!');
  console.log('Frontend: http://0.0.0.0:3000');
  console.log('Backend API: http://localhost:5000');
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  process.exit();
});