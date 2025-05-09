// Simple script to run node directly (skip the sharp installation)
import { spawn } from 'child_process';

// Run npm run dev directly
const proc = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});