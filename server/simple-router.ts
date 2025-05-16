/**
 * Simple routes added to ensure client-side compatibility
 */

import express, { Router } from 'express';

// Create a router for our simple endpoints
export function setupSimpleRouter(): Router {
  const router = express.Router();

  // Credits endpoints - both versions for backward compatibility
  router.get("/api/credits/:id", (req, res) => {
    console.log(`Credits endpoint accessed for ID: ${req.params.id}`);
    res.json({
      credits: 5,
      paidCredits: 0,
      freeCreditsUsed: false
    });
  });

  router.get("/api/user-credits/:id", (req, res) => {
    console.log(`User credits endpoint accessed for ID: ${req.params.id}`);
    res.json({
      credits: 5,
      paidCredits: 0,
      freeCreditsUsed: false
    });
  });
  
  // Add the enhance-prompt endpoint to fix the AI enhancement button
  router.post("/api/enhance-prompt", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      console.log(`Enhancing prompt: ${prompt}`);
      
      // Import OpenAI
      const OpenAI = await import("openai");
      
      // Initialize OpenAI client
      const openai = new OpenAI.default({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Enhanced prompt with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert prompt engineer that helps enhance image transformation prompts for OpenAI DALL-E.
              Your task is to enhance the user's prompt by adding details, while keeping the original intent.
              You should NOT add anything that contradicts the original intent.
              NEVER change the style or category of transformation requested.
              Keep your response ONLY to the enhanced prompt text with no explanations.`
          },
          {
            role: "user", 
            content: `Please enhance this image transformation prompt: "${prompt}"`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      const enhancedPrompt = response.choices[0]?.message?.content?.trim() || prompt;
      
      console.log(`Enhanced prompt: ${enhancedPrompt}`);
      
      res.json({
        originalPrompt: prompt,
        enhancedPrompt
      });
    } catch (error: any) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ 
        message: "Error enhancing prompt", 
        error: error.message 
      });
    }
  });
  
  return router;
}
