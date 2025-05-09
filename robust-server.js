// A more robust server starter with error handling and auto-restart
import { spawn } from 'child_process';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file setup
const logFile = './logs/server.log';
fs.writeFileSync(logFile, `Server start: ${new Date().toISOString()}\n`);

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(logFile, formattedMessage);
}

// Function to start the server
function startServer() {
  log('Starting server...');
  
  // Start the server with NODE_ENV=development
  const serverProcess = spawn('tsx', ['server/index.ts'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Handle standard output
  serverProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
    fs.appendFileSync(logFile, data);
  });
  
  // Handle error output
  serverProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
    fs.appendFileSync(logFile, `ERROR: ${data}`);
  });
  
  // Handle process exit
  serverProcess.on('close', (code) => {
    log(`Server process exited with code ${code}`);
    
    // Restart server if it crashes
    if (code !== 0) {
      log('Server crashed. Restarting in 3 seconds...');
      setTimeout(startServer, 3000);
    }
  });
  
  // Handle process errors
  serverProcess.on('error', (err) => {
    log(`Failed to start server: ${err.message}`);
    log('Attempting restart in 3 seconds...');
    setTimeout(startServer, 3000);
  });
  
  return serverProcess;
}

// Start the server initially
const serverInstance = startServer();

// Handle script termination
process.on('SIGINT', () => {
  log('Received SIGINT. Shutting down server...');
  serverInstance.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM. Shutting down server...');
  serverInstance.kill();
  process.exit(0);
});