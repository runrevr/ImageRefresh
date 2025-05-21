// Start the application server
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

console.log('Starting application server...');

try {
  // Make sure the uploads directory exists
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }

  // Run the server in development mode
  execSync('NODE_ENV=development tsx server/index.ts', {
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Error starting application:', error);
  process.exit(1);
}