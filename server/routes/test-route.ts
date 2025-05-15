import { Router } from "express";
import path from "path";
import { testOpenAIConnection } from "../openai-service";

export function setupTestRoutes() {
  const router = Router();

  // Simple API test endpoint
  router.get("/api/test", (req, res) => {
    res.json({
      message: "API is working correctly",
      timestamp: new Date().toISOString(),
    });
  });

  // Status endpoint with server information
  router.get("/api/status", (req, res) => {
    // Check for OpenAI API key
    const openaiConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({
      status: "Running",
      environment: process.env.NODE_ENV || "development",
      openaiConfigured,
      timestamp: new Date().toISOString(),
    });
  });

  // OpenAI test endpoint
  router.get("/api/test-openai", async (req, res) => {
    try {
      // Check if API key exists
      const apiKey = process.env.OPENAI_API_KEY || '';
      const hasValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;

      if (!apiKey) {
        return res.status(400).json({
          success: false,
          message: 'OpenAI API key is not configured',
          details: 'No API key found in environment variables'
        });
      }

      if (!hasValidFormat) {
        return res.status(400).json({
          success: false,
          message: 'OpenAI API key has invalid format',
          details: `Key should start with "sk-" and be at least 20 characters`
        });
      }

      // Test actual connection to OpenAI
      const connectionTest = await testOpenAIConnection();
      
      if (!connectionTest.success) {
        return res.status(500).json({
          success: false,
          message: 'OpenAI API key is configured but connection failed',
          details: connectionTest.message
        });
      }

      // Successfully verified API connection
      return res.json({
        success: true,
        message: 'OpenAI API is properly configured and connected',
        details: connectionTest.message
      });
    } catch (error: any) {
      console.error('Error testing OpenAI connection:', error);
      
      // Detailed error response
      return res.status(500).json({
        success: false,
        message: 'Error checking OpenAI API configuration',
        details: error.message
      });
    }
  });

  // Test page
  router.get("/test", (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "public", "test.html"));
  });
  
  // Transform test page
  router.get("/transform-test", (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "public", "transform-test.html"));
  });

  return router;
}