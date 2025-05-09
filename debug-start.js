// This script is a wrapper around the main server startup
// It adds error handling and detailed logging
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'app-debug.log');
fs.writeFileSync(logFile, `Application startup: ${new Date().toISOString()}\n`);

function log(message) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
}

// Start the app without sharp installation
log('Starting application...');
const app = spawn('node', ['--trace-warnings', '--unhandled-rejections=strict', '-r', 'dotenv/config', './server/index.ts'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: {
    ...process.env,
    NODE_ENV: 'development',
    DEBUG: '*',
    NODE_OPTIONS: '--trace-warnings'
  }
});

app.stdout.on('data', (data) => {
  process.stdout.write(data);
  fs.appendFileSync(logFile, data);
});

app.stderr.on('data', (data) => {
  process.stderr.write(data);
  fs.appendFileSync(logFile, `[ERROR] ${data}`);
});

app.on('error', (err) => {
  log(`Failed to start application: ${err.message}`);
});

app.on('close', (code) => {
  log(`Application process exited with code ${code}`);
});