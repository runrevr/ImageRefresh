// Simple keep-alive script to run the application more reliably
import { exec } from 'child_process';

// Standard dev command
console.log('Starting application with npm run dev...');
exec('npm run dev');