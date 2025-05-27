
// Custom AI Prompts Configuration
// This is completely separate from existing product lab

export const CUSTOM_AI_CONFIG = {
  // Copy your product workflow URL here
  WORKFLOW_URL: process.env.PRODUCT_WORKFLOW_URL || 'your-workflow-url-here',
  API_KEY: process.env.PRODUCT_API_KEY || 'your-api-key-here',
  
  // Feature settings
  MAX_PROMPT_LENGTH: 500,
  ENABLE_PROMPT_ENHANCEMENT: true,
  
  // API endpoints (new ones, not existing)
  ENDPOINTS: {
    TRANSFORM: '/api/beta/custom-prompt-transform',
    STATUS: '/api/beta/custom-prompt-status',
    RESULT: '/api/beta/custom-prompt-result'
  }
};

export default CUSTOM_AI_CONFIG;
