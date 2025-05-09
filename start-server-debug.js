// Simple script to start the server with detailed error handling
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import express from 'express';

// Configure verbose environment
process.env.NODE_ENV = 'development';
process.env.DEBUG = '*';

// Initialize log file
const logFile = path.join(process.cwd(), 'server-debug.log');
fs.writeFileSync(logFile, `Server startup debug log: ${new Date().toISOString()}\n`);

function log(message) {
  const logMessage = `[${new Date().toISOString()}] ${message}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
}

// Load dotenv
log('Loading environment variables...');
dotenv.config();
log('Environment variables loaded');

try {
  // Create basic Express app
  log('Creating Express app...');
  const app = express();
  log('Express app created');

  // Start server
  log('Starting server...');
  const server = app.listen(5000, '0.0.0.0', () => {
    log('Server started successfully on port 5000');
    log('Visit: http://localhost:5000/');
  });

  // Handle server errors
  server.on('error', (error) => {
    log(`SERVER ERROR: ${error.message}`);
    log(error.stack);
  });
} catch (error) {
  log(`FATAL ERROR: ${error.message}`);
  log(error.stack);
}