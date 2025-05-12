import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logFile = join(__dirname, 'hair-care-debug.log');

// Log a test message
fs.appendFileSync(logFile, `\n\nDebug test at ${new Date().toISOString()}\n`);

// Try to generate options directly without importing from storage
import { generateMockEnhancementOptions } from './server/mock-webhook-data.js';

try {
  // Try to generate options for "hair care"
  const options = generateMockEnhancementOptions("hair care");
  fs.appendFileSync(logFile, `Options for "hair care": ${JSON.stringify(options, null, 2)}\n`);
  
  // Try with other variations
  const options2 = generateMockEnhancementOptions("haircare");
  fs.appendFileSync(logFile, `Options for "haircare": ${JSON.stringify(options2, null, 2)}\n`);
  
  // Test the special handling
  const options3 = generateMockEnhancementOptions("Hair Care Products");
  fs.appendFileSync(logFile, `Options for "Hair Care Products": ${JSON.stringify(options3, null, 2)}\n`);
  
} catch (err) {
  fs.appendFileSync(logFile, `Error: ${err.message}\n${err.stack}\n`);
}