// Custom prompt result handler
export interface CustomPromptResult {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  originalImage: string;
  processedImage?: string;
  prompt: string;
  timestamp: number;
}

// In-memory storage for demo purposes
const results = new Map<string, CustomPromptResult>();

export function getResult(id: string): CustomPromptResult | null {
  return results.get(id) || null;
}

export function setResult(id: string, result: CustomPromptResult): void {
  results.set(id, result);
}

export function getAllResults(): CustomPromptResult[] {
  return Array.from(results.values());
}

export function deleteResult(id: string): boolean {
  return results.delete(id);
}