import { execSync } from 'child_process';

// Kill any process running on port 5000
try {
  console.log('Checking for processes using port 5000...');
  const pid = execSync("lsof -t -i:5000").toString().trim();
  if (pid) {
    console.log(`Killing process ${pid} on port 5000`);
    execSync(`kill -9 ${pid}`);
  }
} catch (e) {
  console.log('No process found on port 5000 or error checking:', e.message);
}

// Start the application
try {
  console.log('Starting application...');
  execSync('NODE_ENV=development tsx server/index.ts', { stdio: 'inherit' });
} catch (e) {
  console.error('Error starting application:', e.message);
  process.exit(1);
}