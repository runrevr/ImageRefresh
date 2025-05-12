const fs = require('fs');

// Check if the hair care variation is working correctly
const testIndustryNames = [
  "Hair Care",
  "Haircare",
  "hair",
  "HAIR CARE",
  "Hare Care",  // Intentional typo to test
  "haircare products"
];

// Write output to a log file
fs.writeFileSync('hair-care-debug.log', `Testing industry name matching at ${new Date().toISOString()}\n`);

// Simple function to simulate the industry name matching logic
function matchesHairCare(industry) {
  const normalizedIndustry = industry.toLowerCase().trim();
  const hairCareVariations = ["hair care", "haircare", "hair", "hair products", "shampoo"];
  
  // Check exact match
  if (hairCareVariations.includes(normalizedIndustry)) {
    return `✓ EXACT MATCH: "${normalizedIndustry}" is in the predefined list`;
  }
  
  // Check partial containment (bidirectional)
  if (hairCareVariations.some(v => normalizedIndustry.includes(v) || v.includes(normalizedIndustry))) {
    return `✓ PARTIAL MATCH: "${normalizedIndustry}" contains or is contained by a predefined variation`;
  }
  
  return `✗ NO MATCH: "${normalizedIndustry}" doesn't match any hair care variations`;
}

// Test each industry name
for (const industry of testIndustryNames) {
  const result = matchesHairCare(industry);
  const logEntry = `Testing "${industry}": ${result}\n`;
  fs.appendFileSync('hair-care-debug.log', logEntry);
  console.log(logEntry);
}

// Added special case for "Hare Care" (typo)
const typoExample = "Hare Care";
const chars = typoExample.split('');
fs.appendFileSync('hair-care-debug.log', `\nCharacter analysis for "${typoExample}":\n`);
for (let i = 0; i < chars.length; i++) {
  fs.appendFileSync('hair-care-debug.log', `Position ${i}: '${chars[i]}' (ASCII: ${chars[i].charCodeAt(0)})\n`);
}

// Add Levenshtein distance to check similarity
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

// Compare "Hare Care" to our variations
const variants = ["hair care", "haircare", "hair", "hair products", "shampoo"];
fs.appendFileSync('hair-care-debug.log', `\nLevenshtein distances for "${typoExample.toLowerCase()}":\n`);
for (const variant of variants) {
  const distance = levenshteinDistance(typoExample.toLowerCase(), variant);
  fs.appendFileSync('hair-care-debug.log', `Distance to "${variant}": ${distance}\n`);
}

console.log('Debug check completed - see hair-care-debug.log for results');