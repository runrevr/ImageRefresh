// Simple script to run the development server

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to log both to console and to a file
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file
  fs.appendFileSync('server-debug.log', logMessage + '\n');
}

// Make sure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  writeLog('Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Start the server using npm run dev
writeLog('Starting development server...');
const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    PORT: 3000,
    NODE_ENV: 'development'
  }
});

// Handle stdout
server.stdout.on('data', (data) => {
  writeLog(`[SERVER]: ${data.toString().trim()}`);
});

// Handle stderr
server.stderr.on('data', (data) => {
  writeLog(`[SERVER ERROR]: ${data.toString().trim()}`);
});

// Handle server exit
server.on('close', (code) => {
  writeLog(`Server process exited with code ${code}`);
});

// Listen for SIGINT (Ctrl+C) to cleanly shut down the server
process.on('SIGINT', () => {
  writeLog('Received SIGINT. Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

writeLog('Server startup script is running. Press Ctrl+C to stop.');