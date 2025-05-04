const { exec } = require('child_process');
const command = 'NODE_ENV=development tsx server/index.ts';

console.log(`Starting application with command: ${command}`);

const process = exec(command);

process.stdout.on('data', (data) => {
  console.log(data.toString());
});

process.stderr.on('data', (data) => {
  console.error(data.toString());
});

process.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});