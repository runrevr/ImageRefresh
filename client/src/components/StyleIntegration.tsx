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
  id?: string;  // ID is optional, since it may not be provided in all cases
}

// Local storage key for the saved style
const SAVED_STYLE_KEY = 'transformationStyle';

/**
 * Save a style to local storage
 * @param style The style to save
 */
export function saveStyle(style: SavedStyle): void {
  localStorage.setItem(SAVED_STYLE_KEY, JSON.stringify(style));
}

/**
 * Check if a style is saved in local storage
 * @returns Boolean indicating if a style is saved
 */
export function hasSavedStyle(): boolean {
  return localStorage.getItem(SAVED_STYLE_KEY) !== null;
}

/**
 * Get the saved style from local storage
 * @returns The saved style or null if none exists
 */
export function getSavedStyle(): SavedStyle | null {
  const savedStyle = localStorage.getItem(SAVED_STYLE_KEY);
  if (savedStyle) {
    return JSON.parse(savedStyle) as SavedStyle;
  }
  return null;
}

/**
 * Clear the saved style from local storage
 */
export function clearSavedStyle(): void {
  localStorage.removeItem(SAVED_STYLE_KEY);
}