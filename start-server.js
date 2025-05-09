// Simple script to start the server from a web request
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Create a simple Express app
const app = express();

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Endpoint to start the server
app.post('/start-server', (req, res) => {
    console.log('Received request to start server');
    
    // Kill any existing server processes
    try {
        const killServer = spawn('pkill', ['-f', 'tsx server/index.ts']);
        killServer.on('close', (code) => {
            console.log(`Killed existing servers with code ${code}`);
            
            // Start the server
            startServer();
            res.send('Server starting...');
        });
    } catch (error) {
        console.error('Error killing server:', error);
        
        // Start the server anyway
        startServer();
        res.send('Server starting (with possible errors)...');
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.send('OK');
});

// Function to start the main server
function startServer() {
    console.log('Starting main server...');
    
    const server = spawn('tsx', ['server/index.ts'], {
        env: { ...process.env, NODE_ENV: 'development' },
        detached: true,
        stdio: 'ignore'
    });
    
    server.unref();
    
    console.log('Server started with PID:', server.pid);
}

// Start the helper app on port 8000
const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Helper app running at http://0.0.0.0:${PORT}`);
});