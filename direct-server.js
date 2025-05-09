// Direct server starter - no dependencies or complex logic
import { execSync } from 'child_process';

console.log('💻 Starting server directly...');

try {
  // Run npm dev directly
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Server failed to start:', error.message);
}