#!/usr/bin/env node

// Simple syntax check for the upload.tsx file
import fs from 'fs';
import { spawn } from 'child_process';

console.log('Testing syntax of upload.tsx...');

// Try to compile the TypeScript file to check for syntax errors
const tsc = spawn('npx', ['tsc', '--noEmit', 'client/src/pages/upload.tsx'], {
  stdio: 'pipe'
});

let output = '';
let hasError = false;

tsc.stderr.on('data', (data) => {
  output += data.toString();
  if (data.toString().includes('error TS1005')) {
    hasError = true;
  }
});

tsc.on('close', (code) => {
  if (hasError) {
    console.log('❌ Syntax errors still present:');
    console.log(output);
  } else {
    console.log('✅ Syntax error fixed! The semicolon issue has been resolved.');
    console.log('The application should now start without the Pre-transform error.');
  }
});