import { exec } from 'child_process';

// First, let's find out if npm run dev without sharp works
console.log('Starting application in debug mode...');

exec('NODE_ENV=development tsx server/index.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});