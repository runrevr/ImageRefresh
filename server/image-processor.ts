import fs from 'fs';
import path from 'path';

/**
 * Prepare image for GPT-image-01 edit endpoint
 * - Ensures proper format for edit API
 * - Converts to base64 when needed
 */
export function prepareImageForEdit(imagePath: string): { 
  imagePath: string, 
  base64: string,
  mimeType: string 
} {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Read image as buffer and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    
    // Determine MIME type based on file extension
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/png'; // Default to PNG
    
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }
    
    console.log(`[Image Processor] Prepared ${path.basename(imagePath)} for edit (${mimeType})`);
    
    return {
      imagePath,
      base64,
      mimeType
    };
    
  } catch (error) {
    console.error('[Image Processor] Error preparing image:', error);
    throw new Error(`Failed to prepare image: ${error}`);
  }
}

/**
 * Create enhanced prompt for edit mode
 */
export function createEditPrompt(basePrompt: string, productContext?: string): string {
  const contextPrefix = productContext 
    ? `For this ${productContext}: ` 
    : 'Edit this product photo: ';
    
  return contextPrefix + basePrompt;
}