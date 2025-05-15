// Script to start the application with both server and client
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory names
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Clear existing log files
const logFilePath = path.join(logsDir, 'app.log');
fs.writeFileSync(logFilePath, ''); // Clear log file

console.log('🚀 Starting ImageRefresh application...');

// Function to write to log file
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage);
  console.log(message);
}

// Start the application using Node with tsx
const appProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '5000'
  }
});

writeLog('📡 Starting server and client...');

// Handle app process stdout
appProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  writeLog(`🖥️ App: ${output}`);
});

// Handle app process stderr
appProcess.stderr.on('data', (data) => {
  const output = data.toString().trim();
  writeLog(`⚠️ App Error: ${output}`);
});

// Handle app process exit
appProcess.on('exit', (code) => {
  writeLog(`📴 App process exited with code ${code}`);
});

// Handle errors
appProcess.on('error', (error) => {
  writeLog(`🛑 Error starting app: ${error.message}`);
});

// Handle process termination
process.on('SIGINT', () => {
  writeLog('👋 Shutting down...');
  appProcess.kill('SIGINT');
  process.exit(0);
});

// Keep the script running
console.log('✅ Application started successfully!');
console.log('🌐 Visit http://localhost:5000 to access the application');
console.log('📝 Logs being written to:', logFilePath);
console.log('⚠️ Press Ctrl+C to stop the application');