/**
 * StyleIntegration.tsx
 * Contains interfaces and utilities for integrating pre-defined styles with the 
 * image transformation workflow.
 */

/**
 * Interface representing a saved transformation style
 */
export interface SavedStyle {
  prompt: string;
  title: string;
  category: string;
  id?: string;
}