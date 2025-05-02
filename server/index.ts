import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { runCleanupTasks } from "./cleanup";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Log ActiveCampaign configuration
console.log('ActiveCampaign Configuration:');
console.log(`API Key: ${process.env.ACTIVECAMPAIGN_API_KEY ? 'Set' : 'Not set'}`);
console.log(`Base URL: ${process.env.ACTIVECAMPAIGN_BASE_URL || 'Not set'}`);

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
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
  const server = await registerRoutes(app);

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Run cleanup once at startup
    runCleanupTasks()
      .then(() => log('Initial cleanup tasks completed'))
      .catch(err => console.error('Error during initial cleanup:', err));
    
    // Schedule daily cleanup (86400000 ms = 24 hours)
    const CLEANUP_INTERVAL = 86400000;
    setInterval(() => {
      log('Running scheduled cleanup tasks...');
      runCleanupTasks()
        .then(() => log('Scheduled cleanup tasks completed'))
        .catch(err => console.error('Error during scheduled cleanup:', err));
    }, CLEANUP_INTERVAL);
  });
})();
