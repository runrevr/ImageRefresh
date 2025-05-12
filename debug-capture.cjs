const fs = require('fs');
const { execSync } = require('child_process');

// Record console.log output
const origLog = console.log;
console.log = function() {
  const args = Array.from(arguments);
  const msg = args.join(' ');
  fs.appendFileSync('console-debug.log', msg + '\n');
  origLog.apply(console, arguments);
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

// Check if the console is capturing the debug logs
console.log("\n======= TESTING CONSOLE OUTPUT =======");
console.log('Debug capture completed');