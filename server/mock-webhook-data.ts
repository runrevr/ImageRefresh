/**
 * This file contains mock data to simulate webhook responses for testing the product enhancement feature
 * In a production environment, these would be real responses from the external webhook service
 */

/**
 * Generates mock enhancement options for an image
 */
export function generateMockEnhancementOptions() {
  return {
    "lighting_enhancement": {
      name: "Professional Lighting",
      description: "Enhanced lighting that highlights product details and creates a professional studio look"
    },
    "background_removal": {
      name: "Clean Background",
      description: "Remove the background for a clean, professional product presentation"
    },
    "lifestyle_context": {
      name: "Lifestyle Context",
      description: "Show your product in a realistic lifestyle setting for better customer connection"
    },
    "color_enhancement": {
      name: "Color Optimization",
      description: "Vibrant, true-to-life colors that make your product stand out"
    },
    "detail_highlight": {
      name: "Detail Focus",
      description: "Highlight key product features and details that customers care about"
    }
  };
}

/**
 * Generates mock enhancement results for testing
 */
export function generateMockEnhancementResults(originalImagePath: string, selectedOption: string) {
  // In a real implementation, these would be paths to transformed images
  // For testing, we'll just use the original image path with some modifications
  const originalPathWithoutExt = originalImagePath.replace(/\.[^/.]+$/, "");
  const resultImage1Path = `${originalPathWithoutExt}-${selectedOption}-result1.jpg`;
  const resultImage2Path = `${originalPathWithoutExt}-${selectedOption}-result2.jpg`;
  
  return {
    resultImage1Path: originalImagePath, // For testing, use original image
    resultImage2Path: originalImagePath, // For testing, use original image
  };
}

/**
 * Mock function to simulate webhook processing delay
 */
export async function simulateProcessingDelay(minMs = 2000, maxMs = 5000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}