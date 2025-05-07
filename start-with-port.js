// Custom starter script that uses a different port
import { spawn } from 'child_process';
import { createServer } from 'http';

// First check if port 5000 is available
const testServer = createServer();
const PORT = 5001; // Alternate port

try {
  testServer.listen(5000, '0.0.0.0');
  testServer.close();
  
  console.log('Port 5000 is available! Starting server normally...');
  // Start the server on the default port
  process.env.PORT = 5000;
  runServer();
} catch (e) {
  console.log('Port 5000 is in use! Starting on alternate port: ' + PORT);
  // Start the server on the alternate port
  process.env.PORT = PORT;
  runServer();
}

function runServer() {
  // Run the development server
  const server = spawn('node', ['--experimental-specifier-resolution=node', '--loader=tsx', 'server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: 'inherit'
  });
  
  server.on('error', (error) => {
    console.error('Error starting server:', error);
    process.exit(1);
  });
  
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.kill();
    process.exit(0);
  });
}