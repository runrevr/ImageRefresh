// Simple script to start the server directly
// Skip sharp installation, which might be causing issues
// The script specifically installs React instead

import { spawn } from 'child_process';
import fs from 'fs';

// Create logs dir if needed
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

// Create or clear the log file
fs.writeFileSync('./logs/workflow.log', `Server start: ${new Date().toISOString()}\n`);

function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  console.log(message);
  fs.appendFileSync('./logs/workflow.log', entry);
}

// First run normal npm install (not sharp)
log('Starting the server with npm run dev...');

const dev = spawn('npm', ['run', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development' }
});

dev.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  fs.appendFileSync('./logs/workflow.log', output);
});

dev.stderr.on('data', (data) => {
  const output = data.toString();
  process.stderr.write(output);
  fs.appendFileSync('./logs/workflow.log', `ERROR: ${output}`);
});

dev.on('error', (err) => {
  log(`Failed to start process: ${err.message}`);
});

dev.on('close', (code) => {
  log(`Process exited with code ${code}`);
});