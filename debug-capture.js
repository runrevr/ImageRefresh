const fs = require('fs');
const { execSync } = require('child_process');

// Redirect console output for a few seconds
console.log = function() {
  const args = Array.from(arguments);
  const msg = args.join(' ');
  fs.appendFileSync('console-debug.log', msg + '\n');
};

// Record stdout
try {
  const output = execSync('tail -n 1000 `ls -t /tmp/*.log 2>/dev/null | head -1` 2>/dev/null || echo "No logs found"').toString();
  fs.writeFileSync('tmp-logs.txt', output);
  console.log('Captured logs from /tmp');
} catch (err) {
  console.log('Error capturing /tmp logs:', err.message);
}

// Capture application console
try {
  const output = execSync('ps -ef | grep node').toString();
  fs.writeFileSync('node-processes.txt', output);
  console.log('Captured running node processes');
} catch (err) {
  console.log('Error capturing process list:', err.message);
}

console.log('Debug capture completed');