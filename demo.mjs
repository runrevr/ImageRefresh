// Demo script to start the application
import { spawn } from 'child_process';

console.log('Starting ImageRefresh application...');

// Run npm dev script
const npm = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

npm.on('error', (error) => {
  console.error('Failed to start application:', error);
});

console.log('Demo server started. The application should be available at http://localhost:5000');
console.log('Press Ctrl+C to stop the server');