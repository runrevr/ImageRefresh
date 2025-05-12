const fs = require('fs');

// Log a test message
fs.appendFileSync('hair-care-debug.log', `\n\nDebug test at ${new Date().toISOString()}\n`);

// Create a simplified version of the mock function to test
function generateMockEnhancementOptions(industry) {
  // Base options available for all industries
  const baseOptions = {
    "lighting_enhancement": {
      name: "Professional Lighting",
      description: "Enhanced lighting that highlights product details"
    },
    "background_removal": {
      name: "Clean Background",
      description: "Remove the background for a clean presentation"
    }
  };
  
  // Log the input industry
  fs.appendFileSync('hair-care-debug.log', `Industry input: "${industry}"\n`);
  
  // Hair care specific options
  const hairCareOptions = {
    "natural_ingredients": {
      name: "Natural Ingredients Showcase",
      description: "Highlight the natural ingredients with botanical elements"
    },
    "bathroom_context": {
      name: "Bathroom Context",
      description: "Show your products in a bathroom setting"
    },
    "results_visualization": {
      name: "Results Visualization",
      description: "Display the expected hair results from using your product"
    },
    "moisturizing_effect": {
      name: "Moisturizing Effect",
      description: "Visualize the moisturizing and nourishing effects"
    }
  };
  
  // Check if we have an industry and normalize it
  if (industry) {
    const normalizedIndustry = industry.toLowerCase().trim();
    fs.appendFileSync('hair-care-debug.log', `Normalized industry: "${normalizedIndustry}"\n`);
    
    // Special handling for "hair care" variations
    const hairCareVariations = ["hair care", "haircare", "hair", "hair products", "shampoo"];
    if (hairCareVariations.some(v => normalizedIndustry.includes(v))) {
      fs.appendFileSync('hair-care-debug.log', `Matched as hair care product: "${normalizedIndustry}"\n`);
      const combinedOptions = { ...baseOptions, ...hairCareOptions };
      fs.appendFileSync('hair-care-debug.log', `Combined options: ${Object.keys(combinedOptions).length} keys\n`);
      return combinedOptions;
    }
    
    fs.appendFileSync('hair-care-debug.log', `Not matched as hair care\n`);
  }
  
  // Return base options if no match
  fs.appendFileSync('hair-care-debug.log', `Returning base options\n`);
  return baseOptions;
}

// Test with various industry inputs
fs.appendFileSync('hair-care-debug.log', `\n======= TESTING INDUSTRY MATCHING =======\n`);

const testIndustries = [
  "hair care",
  "Hair Care",
  "haircare",
  "Hair",
  "Shampoo",
  "hair products",
  "Hair Care Products",
  "random industry"
];

for (const industry of testIndustries) {
  fs.appendFileSync('hair-care-debug.log', `\n--- Testing "${industry}" ---\n`);
  const options = generateMockEnhancementOptions(industry);
  fs.appendFileSync('hair-care-debug.log', `Result: ${Object.keys(options).length} options\n`);
  fs.appendFileSync('hair-care-debug.log', `Option keys: ${Object.keys(options).join(', ')}\n`);
}