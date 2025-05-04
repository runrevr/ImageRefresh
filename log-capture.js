const { spawn } = require('child_process');
const fs = require('fs');

// Create a logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

// Create a log file
const logStream = fs.createWriteStream('./logs/server.log', { flags: 'a' });

console.log('Starting server with log capture...');

// First install sharp
const install = spawn('npm', ['install', 'sharp']);

install.stdout.pipe(logStream);
install.stderr.pipe(logStream);

install.on('close', (code) => {
  console.log(`npm install sharp exited with code ${code}`);
  logStream.write(`npm install sharp exited with code ${code}\n`);
  
  // Start the dev script
  const server = spawn('npm', ['run', 'dev']);
  
  // Pipe stdout and stderr to the log file
  server.stdout.pipe(logStream);
  server.stderr.pipe(logStream);
  
  // Also log to console
  server.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  server.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    logStream.write(`Server process exited with code ${code}\n`);
    logStream.end();
  });
});