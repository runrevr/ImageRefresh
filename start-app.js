// Simple node script to start the application without sharp
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file for debugging
const logFile = path.join(logsDir, 'app-start.log');
fs.writeFileSync(logFile, `App start: ${new Date().toISOString()}\n`);

// Log function
function log(message) {
  const logEntry = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log(message);
}

// Start the application
log('Starting application with npm run dev...');

const devProcess = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle stdout
devProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  fs.appendFileSync(logFile, output);
});

// Handle stderr
devProcess.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write('\x1b[31m' + output + '\x1b[0m'); // Red color for errors
  fs.appendFileSync(logFile, `ERROR: ${output}`);
});

// Handle process exit
devProcess.on('close', (code) => {
  const message = `Process exited with code ${code}`;
  log(message);
  if (code !== 0) {
    log('The application failed to start properly. Check logs for details.');
  }
});

// Handle errors
devProcess.on('error', (err) => {
  log(`Failed to start process: ${err.message}`);
});