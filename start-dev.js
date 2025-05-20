const { exec } = require('child_process');

// Start the development server
console.log('Starting development server...');
const child = exec('npm run dev');

child.stdout.on('data', (data) => {
  console.log(data);
});

child.stderr.on('data', (data) => {
  console.error(data);
});

child.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
});