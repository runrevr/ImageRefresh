// Configure environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import Anthropic from '@anthropic-ai/sdk';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runCleanupTasks } from "./cleanup";
import { demoAccessMiddleware } from "./demo-access-control";
import { setupAuth } from "./auth";
import cookieParser from "cookie-parser";
import { setupTestRoutes } from "./routes/test-route";
import { setupOpenAITestRoutes } from "./openai-test-route";
import { setupSimpleRouter } from "./simple-router";
import { setupWebhookTestRoutes } from "./routes/webhook-test";
import { setupStaticRoutes } from "./routes/static-routes";
import { setupProductImageLabRoutes } from "./routes/product-image-lab-routes";
import { setupAnthropicTestRoutes } from "./routes/anthropic-test";
import uploadEnhanceApiRoutes from "./routes/upload-enhance-api";
import fs from 'fs';
import path from 'path';

// Create a debug logger that writes to stdout and a file
const DEBUG_LOG_PATH = path.join(process.cwd(), 'logs', 'debug.log');

// Ensure the logs directory exists
if (!fs.existsSync(path.dirname(DEBUG_LOG_PATH))) {
  fs.mkdirSync(path.dirname(DEBUG_LOG_PATH), { recursive: true });
}
// Make sure the logs directory exists
if (!fs.existsSync(path.join(process.cwd(), 'logs'))) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
}
// Clear the log file
fs.writeFileSync(DEBUG_LOG_PATH, '');

// Create global debug function
global.debugLog = function(...args: any[]) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // Write to stdout
  process.stdout.write(logMessage);

  // Append to log file
  fs.appendFileSync(DEBUG_LOG_PATH, logMessage);
};

// Load environment variables from .env file
dotenv.config();

// Add environment variable debug logs
console.log('Environment Configuration:');
console.log(`API Key: ${process.env.ACTIVECAMPAIGN_API_KEY ? 'Set' : 'Not set'}`);
console.log(`Base URL: ${process.env.ACTIVECAMPAIGN_BASE_URL || 'Not set'}`);
console.log(`USE_MOCK_WEBHOOK: ${process.env.USE_MOCK_WEBHOOK || 'Not set'}`);

// Set ActiveCampaign API credentials
process.env.ACTIVECAMPAIGN_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY || '1579e89bd0548efef9178b71b72c6a85d641f3ebc7806d86d6154c41a9a67af6c360fdc6';
process.env.ACTIVECAMPAIGN_BASE_URL = process.env.ACTIVECAMPAIGN_BASE_URL || 'https://thecollectivealchemy.api-us1.com';
process.env.ACTIVECAMPAIGN_MEMBERSHIP_LIST = process.env.ACTIVECAMPAIGN_MEMBERSHIP_LIST || '';

// Tags for different user tiers
process.env.ACTIVECAMPAIGN_FREE_USER_TAG = process.env.ACTIVECAMPAIGN_FREE_USER_TAG || 'free';
process.env.ACTIVECAMPAIGN_CORE_USER_TAG = process.env.ACTIVECAMPAIGN_CORE_USER_TAG || 'core';
process.env.ACTIVECAMPAIGN_PLUS_USER_TAG = process.env.ACTIVECAMPAIGN_PLUS_USER_TAG || 'plus';
process.env.ACTIVECAMPAIGN_TRIAL_TAG = process.env.ACTIVECAMPAIGN_TRIAL_TAG || 'trial';

// Custom fields
process.env.ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD = process.env.ACTIVECAMPAIGN_MEMBERSHIP_STATUS_FIELD || 'Membership Status';

const app = express();

// Add CORS middleware to allow frontend to connect to backend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve uploaded files as static content
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API key test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date()
  });
});

// Setup authentication (passport, sessions, etc.)
setupAuth(app);

// Set up webhook test routes for N8N integration
app.use('/api', setupWebhookTestRoutes());

// Create a special middleware just for debugging request bodies
app.use((req, res, next) => {
  // Only log POST requests to specific endpoints
  if (req.method === 'POST' && req.path === '/api/transform') {
    console.log('\n\n==== TRANSFORM REQUEST BODY ====');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    console.log('================================\n\n');

    // Write to debug log file as well
    fs.appendFileSync(DEBUG_LOG_PATH, `\n\n==== TRANSFORM REQUEST [${new Date().toISOString()}] ====\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `URL: ${req.url}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Headers: ${JSON.stringify(req.headers, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Body: ${JSON.stringify(req.body, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `Query: ${JSON.stringify(req.query, null, 2)}\n`);
    fs.appendFileSync(DEBUG_LOG_PATH, `================================\n\n`);
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;

    // Special logging for errors on transform endpoint
    if (path === '/api/transform' && bodyJson && bodyJson.message) {
      console.log('\n\n==== TRANSFORM RESPONSE ERROR ====');
      console.log('Status:', res.statusCode);
      console.log('Error:', bodyJson.message);
      console.log('Full response:', JSON.stringify(bodyJson, null, 2));
      console.log('================================\n\n');

      // Write to debug log file
      fs.appendFileSync(DEBUG_LOG_PATH, `\n\n==== TRANSFORM RESPONSE ERROR [${new Date().toISOString()}] ====\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Status: ${res.statusCode}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Error: ${bodyJson.message}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `Full response: ${JSON.stringify(bodyJson, null, 2)}\n`);
      fs.appendFileSync(DEBUG_LOG_PATH, `================================\n\n`);
    }

    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Register main routes
  const server = await registerRoutes(app);

  // Register test routes
  app.use(setupTestRoutes());

  // Register OpenAI test routes
  app.use(setupOpenAITestRoutes());

  // Register simple compatibility routes
  app.use(setupSimpleRouter());

  // Register static HTML routes
  app.use(setupStaticRoutes());

  // Register Product Image Lab routes
  app.use(setupProductImageLabRoutes());

  // Register Anthropic API test routes
  app.use('/api', setupAnthropicTestRoutes());

  // CRITICAL: Direct route handlers to bypass Vite completely
  app.post('/api/generate-edit-prompt', async (req, res) => {
    console.log(`[DIRECT API] Edit prompt endpoint hit - bypassing Vite!`);

    try {
      const { idea_title, idea_description, is_chaos_concept } = req.body;

      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
      }

      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: is_chaos_concept ? 1.0 : 0.8,
        messages: [{
          role: "user",
          content: `Create an edit prompt for GPT-image-01 based on this concept:

Title: ${idea_title}
Description: ${idea_description}
Type: ${is_chaos_concept ? 'CHAOS CONCEPT - GO WILD!' : 'Professional/Lifestyle'}

Generate ${is_chaos_concept ? '100-120' : '80-100'} words describing exactly how to edit the product image.

${is_chaos_concept ? 
  'UNLEASH CREATIVE CHAOS! Start with product accuracy then EXPLODE into impossible surreal madness!' : 
  'Create a professional, realistic scene with natural lighting and authentic environments.'}

Respond with ONLY the edit prompt text, no formatting, no JSON, no explanation.`
        }]
      });

      const editPrompt = (message.content[0] as any).text.trim();

      console.log(`[DIRECT API] Generated edit prompt successfully`);

      res.json({
        success: true,
        edit_prompt: editPrompt
      });

    } catch (error) {
      console.error('[DIRECT API] Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Add debugging middleware for API routes
  app.use('/api', (req, res, next) => {
    console.log(`[API DEBUG] ${req.method} ${req.path} - Request received`);
    console.log(`[API DEBUG] Full URL: ${req.originalUrl}`);
    console.log(`[API DEBUG] Headers:`, req.headers);
    next();
  });

  // Register Upload Enhance API routes
  app.use('/api', uploadEnhanceApiRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 5000;
  const altPorts = [3001, 8080, 8000]; // Alternative ports to try if main port is busy

  // Beta Custom Prompts Feature (Safe Integration)
  if (process.env.ENABLE_CUSTOM_PROMPTS === 'true') {
    try {
      const customPromptRoutes = await import('../beta-custom-prompts/api/routes.js');
      app.use('/api/beta', customPromptRoutes.default);

      // Serve the custom prompt page
      app.get('/custom-prompts-beta', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'beta-custom-prompts/components/customPromptUpload.html'));
      });

      // Serve the JavaScript file
      app.get('/beta-custom-prompts/components/customPromptScript.js', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'beta-custom-prompts/components/customPromptScript.js'));
      });

      // Serve the CSS file
      app.get('/beta-custom-prompts/styles/customPromptStyles.css', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'beta-custom-prompts/styles/customPromptStyles.css'));
      });

      console.log('Custom Prompts Beta feature enabled');
    } catch (error) {
      console.error('Failed to load custom prompts routes:', error);
    }
  }

  // Import custom prompts beta routes if enabled
  if (process.env.ENABLE_CUSTOM_PROMPTS_BETA === 'true') {
    try {
      const customPromptsRoutes = require('../beta-custom-prompts/api/routes');
      app.use('/api/beta', customPromptsRoutes.default || customPromptsRoutes);
      console.log('Custom Prompts Beta feature enabled');

      // Serve the rainbow HTML interface for /custom-prompts-beta
      app.get('/custom-prompts-beta', (req, res) => {
        const htmlPath = path.join(process.cwd(), 'beta-custom-prompts', 'components', 'customPromptUpload.html');
        if (fs.existsSync(htmlPath)) {
          res.sendFile(htmlPath);
        } else {
          res.status(404).send('Custom prompts beta page not found');
        }
      });

      // Serve static files for the beta custom prompts
      app.use('/beta-custom-prompts', express.static(path.join(process.cwd(), 'beta-custom-prompts')));

      // Add basic test endpoint to verify routes are working
      app.get('/api/beta/test', (req, res) => {
        res.json({ success: true, message: 'Custom prompts beta API is working' });
      });

    } catch (error) {
      console.error('Failed to load custom prompts routes:', error.message);
      console.error('Error details:', error);
    }
  } else {
    console.log('Custom Prompts Beta feature disabled');
  }

  // Function to start server with port fallback
  function startServer(port: number, altPorts: number[]) {
    const server = app.listen(port, '0.0.0.0', () => {
      log(`Server running on http://0.0.0.0:${port}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        log(`Port ${port} is busy, trying alternative ports...`);
        if (altPorts.length > 0) {
          const nextPort = altPorts.shift()!;
          startServer(nextPort, altPorts);
        } else {
          log('No more alternative ports available. Exiting.');
          process.exit(1);
        }
      } else {
        throw err;
      }
    });

    // Cleanup function for graceful shutdown
    runCleanupTasks();
  }

  // start with the default port and fallback to alternatives
  startServer(port, altPorts);
})();