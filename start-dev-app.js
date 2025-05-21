/**
 * Simple script to start the development server
 */
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

try {
  console.log('Starting development server...');
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
}