const fs = require('fs');

// Check if the hair care variation is working correctly with our new fuzzy matching
const testIndustryNames = [
  "Hair Care",
  "Haircare",
  "hair",
  "HAIR CARE",
  "Hare Care",  // Should now match with fuzzy matching
  "haircare products",
  "haare care",
  "hare kare"   // This might be too different
];

// Write output to a log file
fs.writeFileSync('hair-care-fuzzy-match.log', `Testing industry name matching with fuzzy matching at ${new Date().toISOString()}\n`);

// Levenshtein distance function for fuzzy matching
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));
  
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

// Simple function to simulate the improved industry name matching logic
function matchesHairCareImproved(industry) {
  const normalizedIndustry = industry.toLowerCase().trim();
  const hairCareVariations = ["hair care", "haircare", "hair", "hair products", "shampoo"];
  
  // Check exact match or substring
  const exactMatch = hairCareVariations.some(v => normalizedIndustry.includes(v) || v.includes(normalizedIndustry));
  if (exactMatch) {
    return `✓ EXACT MATCH: "${normalizedIndustry}" matches a predefined variation`;
  }
  
  // Check fuzzy match with Levenshtein distance
  const MAX_DISTANCE = 2; // Allow up to 2 character differences (typos)
  const fuzzyMatchVariation = hairCareVariations.find(v => {
    const distance = levenshteinDistance(normalizedIndustry, v);
    return distance <= MAX_DISTANCE;
  });
  
  if (fuzzyMatchVariation) {
    const distance = levenshteinDistance(normalizedIndustry, fuzzyMatchVariation);
    return `✓ FUZZY MATCH: "${normalizedIndustry}" is similar to "${fuzzyMatchVariation}" (distance: ${distance})`;
  }
  
  return `✗ NO MATCH: "${normalizedIndustry}" is too different from any hair care variations`;
}

// Test each industry name
for (const industry of testIndustryNames) {
  const result = matchesHairCareImproved(industry);
  const logEntry = `Testing "${industry}": ${result}\n`;
  fs.appendFileSync('hair-care-fuzzy-match.log', logEntry);
  console.log(logEntry);
}

console.log('Debug check completed - see hair-care-fuzzy-match.log for results');