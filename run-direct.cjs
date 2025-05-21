const { exec } = require('child_process');

console.log('Starting application directly...');

// Run the application in development mode
exec('NODE_ENV=development npx tsx server/index.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});

console.log('Server starting process initiated.');
console.log('Please wait a moment while the server starts...');
console.log('Once running, click the "Show" button at the top of Replit to view the site.');