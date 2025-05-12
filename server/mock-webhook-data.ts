/**
 * This file contains mock data to simulate webhook responses for testing the product enhancement feature
 * In a production environment, these would be real responses from the external webhook service
 */

/**
 * Helper function for Levenshtein distance (fuzzy matching)
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1).fill(0).map(() => Array(a.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Generates mock enhancement options for an image based on the industry
 */
export function generateMockEnhancementOptions(industry?: string) {
  console.log(`\n======= GENERATING EXACTLY 5 OPTIONS FOR INDUSTRY: "${industry}" =======`);
  
  // Base options available for all industries (always returning exactly 5)
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
    // Hair care options - with variations to catch different user inputs
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
    },
    "haircare": {
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
    },
    "hair": {
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
    },
    // Additional hair care variations
    "hair products": {
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
    },
    "shampoo": {
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
  
  // Debug print industry and available keys
  console.log(`Mock data request - Industry: "${industry}", Available keys:`, Object.keys(industryOptions));
  
  // Check if we have an industry and normalize it
  if (industry) {
    const normalizedIndustry = industry.toLowerCase().trim();
    console.log(`Normalized industry: "${normalizedIndustry}"`);
    
    // Special handling for "hair care" variations
    const hairCareVariations = ["hair care", "haircare", "hair", "hair products", "shampoo"];
    
    // First try exact or substring match
    const exactMatch = hairCareVariations.some(v => normalizedIndustry.includes(v) || v.includes(normalizedIndustry));
    
    // If no exact match, try fuzzy matching with Levenshtein distance
    const MAX_DISTANCE = 2; // Allow up to 2 character differences (typos)
    const fuzzyMatch = !exactMatch && hairCareVariations.some(v => {
      const distance = levenshteinDistance(normalizedIndustry, v);
      return distance <= MAX_DISTANCE;
    });
    
    if (exactMatch || fuzzyMatch) {
      console.log(`Matched industry as hair care product: "${normalizedIndustry}" using ${exactMatch ? 'pattern matching' : 'fuzzy matching'}`);
      console.log(`Exact match: ${exactMatch}, Fuzzy match: ${fuzzyMatch}`);
      
      // For hair care, create exactly 5 specialized options
      const hairCareOptions = {
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
        },
        "premium_packaging": {
          name: "Premium Packaging Showcase",
          description: "Highlight your product's premium packaging with luxurious materials and textures"
        }
      };
      
      console.log(`Created exactly 5 hair care specific options: ${Object.keys(hairCareOptions).join(", ")}`);
      
      return hairCareOptions;
    }
    
    // Check if we have options for this industry
    if (industryOptions[normalizedIndustry]) {
      console.log(`Found industry options for: ${normalizedIndustry}`);
      
      // Extract exactly 5 options from the combined set
      const specificOptions = industryOptions[normalizedIndustry];
      
      // If we have at least 5 specific options, return them
      if (Object.keys(specificOptions).length >= 5) {
        // Take the first 5 options
        const fiveOptions: Record<string, {name: string, description: string}> = {};
        const keys = Object.keys(specificOptions);
        for (let i = 0; i < 5 && i < keys.length; i++) {
          const key = keys[i];
          fiveOptions[key] = specificOptions[key];
        }
        console.log(`Returning exactly 5 industry-specific options: ${Object.keys(fiveOptions).join(", ")}`);
        return fiveOptions;
      }
      
      // If we don't have 5 specific options, fill in with base options
      const combinedOptions = { ...baseOptions, ...specificOptions };
      const fiveOptions: Record<string, {name: string, description: string}> = {};
      const keys = Object.keys(combinedOptions);
      for (let i = 0; i < 5 && i < keys.length; i++) {
        const key = keys[i];
        // Use type assertion to avoid TypeScript error
        fiveOptions[key] = combinedOptions[key as keyof typeof combinedOptions];
      }
      console.log(`Returning exactly 5 combined options: ${Object.keys(fiveOptions).join(", ")}`);
      return fiveOptions;
    } else {
      console.log(`No industry options found for: ${normalizedIndustry}`);
      
      // Try to find partial matches
      for (const key of Object.keys(industryOptions)) {
        if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
          console.log(`Found partial industry match: "${key}" for "${normalizedIndustry}"`);
          const specificOptions = industryOptions[key];
          
          // Take the first 5 options
          const fiveOptions: Record<string, {name: string, description: string}> = {};
          const keys = Object.keys(specificOptions);
          for (let i = 0; i < 5 && i < keys.length; i++) {
            const key = keys[i];
            fiveOptions[key] = specificOptions[key];
          }
          console.log(`Returning exactly 5 partially matched options: ${Object.keys(fiveOptions).join(", ")}`);
          return fiveOptions;
        }
      }
    }
  }
  
  // Return exactly 5 base options if no industry match
  const fiveOptions: Record<string, {name: string, description: string}> = {};
  const keys = Object.keys(baseOptions);
  for (let i = 0; i < 5 && i < keys.length; i++) {
    const key = keys[i];
    // Type assertion to avoid TypeScript error
    fiveOptions[key] = baseOptions[key as keyof typeof baseOptions];
  }
  console.log(`Returning exactly 5 default options: ${Object.keys(fiveOptions).join(", ")}`);
  return fiveOptions;
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
  const fs = require('fs');
  const path = require('path');
  
  // Verify original image exists
  if (!fs.existsSync(originalImagePath)) {
    console.error(`Original image not found at path: ${originalImagePath}`);
    // Return the original path as fallback
    return {
      resultImage1Path: originalImagePath,
      resultImage2Path: originalImagePath
    };
  }
  
  // Get the uploads directory path
  const uploadsDir = path.dirname(originalImagePath);
  
  // Generate unique filenames for result images
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = path.extname(originalImagePath);
  const baseFilename = path.basename(originalImagePath, extension);
  const safeOptionName = (selectedOption || 'option').toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  const resultImage1Path = path.join(uploadsDir, `${baseFilename}-result1-${safeOptionName}-${timestamp}-${random}${extension}`);
  const resultImage2Path = path.join(uploadsDir, `${baseFilename}-result2-${safeOptionName}-${timestamp}-${random}${extension}`);
  
  try {
    // Copy the original file to the result paths to simulate transformed images
    fs.copyFileSync(originalImagePath, resultImage1Path);
    fs.copyFileSync(originalImagePath, resultImage2Path);
    console.log(`Created mock result images at ${resultImage1Path} and ${resultImage2Path}`);
  } catch (err) {
    console.error(`Error creating mock result images: ${err}`);
    // Return the original path as fallback
    return {
      resultImage1Path: originalImagePath,
      resultImage2Path: originalImagePath
    };
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