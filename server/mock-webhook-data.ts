/**
 * This file contains mock data to simulate webhook responses for testing the product enhancement feature
 * In a production environment, these would be real responses from the external webhook service
 */

/**
 * Generates mock enhancement options for an image based on the industry
 */
export function generateMockEnhancementOptions(industry?: string) {
  // Base options available for all industries
  const baseOptions = {
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
  
  // Industry-specific options
  const industryOptions: Record<string, Record<string, {name: string, description: string}>> = {
    "fashion": {
      "model_visualization": {
        name: "Model Visualization",
        description: "Show your apparel on professional models for better size/fit understanding"
      },
      "fabric_detail": {
        name: "Fabric Detail Enhancement",
        description: "Highlight the texture and quality of the fabric used in your apparel"
      }
    },
    "electronics": {
      "feature_callout": {
        name: "Feature Callouts",
        description: "Highlight key technical features with professional callouts and annotations"
      },
      "size_comparison": {
        name: "Size Comparison",
        description: "Show the product with common objects to help customers understand its dimensions"
      }
    },
    "food": {
      "appetite_appeal": {
        name: "Appetite Appeal",
        description: "Enhance colors and textures to make food items look more appetizing"
      },
      "plating_enhancement": {
        name: "Professional Plating",
        description: "Show your food items with professional plating and garnishes"
      }
    },
    "home": {
      "room_context": {
        name: "Room Context",
        description: "Show your products in beautifully designed room settings"
      },
      "material_highlight": {
        name: "Material Quality",
        description: "Highlight the quality and texture of materials used in your home goods"
      }
    }
  };
  
  // Combine base options with industry-specific ones if available
  if (industry && industryOptions[industry.toLowerCase()]) {
    return { ...baseOptions, ...industryOptions[industry.toLowerCase()] };
  }
  
  return baseOptions;
}

/**
 * Generates a set of industry options for the enhancement webhook
 */
export function getIndustryOptions() {
  return [
    "Fashion",
    "Electronics",
    "Food",
    "Home",
    "Beauty",
    "Sports",
    "Automotive",
    "Toys",
    "Office",
    "Other"
  ];
}

/**
 * Generates mock enhancement results for testing
 */
export function generateMockEnhancementResults(originalImagePath: string, selectedOption: string) {
  // In a real implementation, these would be paths to transformed images
  // For testing, we'll just use the original image path
  
  return {
    resultImage1Path: originalImagePath, // For testing, use original image
    resultImage2Path: originalImagePath, // For testing, use original image
  };
}

/**
 * Mock function to simulate webhook processing delay
 */
export async function simulateProcessingDelay(minMs = 1000, maxMs = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}