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
    },
    "hair care": {
      "natural_ingredients": {
        name: "Natural Ingredients Showcase",
        description: "Highlight the natural ingredients with botanical elements around your product"
      },
      "bathroom_context": {
        name: "Bathroom Context",
        description: "Show your hair care products in a modern, elegant bathroom setting"
      },
      "results_visualization": {
        name: "Results Visualization",
        description: "Display the expected hair results from using your product"
      },
      "moisturizing_effect": {
        name: "Moisturizing Effect",
        description: "Visualize the moisturizing and nourishing effects with water elements"
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
  
  // Generate two new file paths based on the original path but with unique names
  // Extract the file extension (e.g., .jpg, .png)
  const extIndex = originalImagePath.lastIndexOf('.');
  const extension = extIndex > 0 ? originalImagePath.substring(extIndex) : '.jpg';
  const basePath = originalImagePath.substring(0, extIndex > 0 ? extIndex : originalImagePath.length);
  
  // Create unique result paths with a timestamp and option identifier
  const timestamp = Date.now();
  const safeOptionName = selectedOption.toLowerCase().replace(/\s+/g, '-');
  
  const resultImage1Path = `${basePath}-result1-${safeOptionName}-${timestamp}${extension}`;
  const resultImage2Path = `${basePath}-result2-${safeOptionName}-${timestamp}${extension}`;
  
  // Copy the original file to the result paths to simulate transformed images
  const fs = require('fs');
  try {
    fs.copyFileSync(originalImagePath, resultImage1Path);
    fs.copyFileSync(originalImagePath, resultImage2Path);
    console.log(`Created mock result images at ${resultImage1Path} and ${resultImage2Path}`);
  } catch (err) {
    console.error(`Error creating mock result images: ${err}`);
  }
  
  return {
    resultImage1Path,
    resultImage2Path
  };
}

/**
 * Mock function to simulate webhook processing delay
 */
export async function simulateProcessingDelay(minMs = 1000, maxMs = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
}