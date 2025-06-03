#!/usr/bin/env node

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDevServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  
  // Register API routes first
  const httpServer = await registerRoutes(app);
  
  // Use Vite's middleware
  app.use(vite.middlewares);
  
  const port = process.env.PORT || 5000;
  
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Development server running on http://localhost:${port}`);
  });
}

createDevServer().catch(console.error);