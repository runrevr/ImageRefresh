#!/usr/bin/env node
import express from "express";
import { spawn } from "child_process";
import { createServer } from "http";

const app = express();
const server = createServer(app);
const PORT = 5050;

// Start the main application
console.log("Starting main application server...");
const subprocess = spawn("npx", ["tsx", "server/index.ts"], {
  stdio: "inherit",
  shell: true,
});

subprocess.on("error", (err) => {
  console.error("Failed to start application:", err);
  process.exit(1);
});

// If the child process exits, exit this process as well
subprocess.on("exit", (code) => {
  console.log(`Application process exited with code ${code}`);
  process.exit(code);
});

// This server is just a placeholder to keep the script running
server.listen(PORT, () => {
  console.log(`Animation Demo available at: /demo`);
  console.log(`Server running at http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  subprocess.kill();
  server.close(() => {
    process.exit(0);
  });
});
