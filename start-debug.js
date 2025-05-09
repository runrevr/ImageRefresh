import { spawn } from 'child_process';
import fs from 'fs';

// Create logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

// Clear any existing log file
fs.writeFileSync('./logs/app-debug.log', '');

console.log('Starting application in debug mode...');

// Start the application
const child = spawn('npm', ['run', 'dev'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

// Log stdout to console and file
child.stdout.on('data', (data) => {
  const message = data.toString();
  process.stdout.write(message);
  fs.appendFileSync('./logs/app-debug.log', message);
});

// Log stderr to console and file with special formatting
child.stderr.on('data', (data) => {
  const message = data.toString();
  process.stderr.write(`ERROR: ${message}`);
  fs.appendFileSync('./logs/app-debug.log', `ERROR: ${message}`);
});

// Handle process exit
child.on('close', (code) => {
  const message = `Child process exited with code ${code}\n`;
  console.log(message);
  fs.appendFileSync('./logs/app-debug.log', message);
});

// Handle process errors
child.on('error', (err) => {
  const message = `Failed to start child process: ${err}\n`;
  console.error(message);
  fs.appendFileSync('./logs/app-debug.log', message);
});