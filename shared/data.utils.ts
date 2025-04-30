/**
 * Utility functions for working with the centralized data structure
 */

import { DataStructure, Category, Style, StyleLookup, getAllStyles, createStyleLookup } from './data.types';

// Re-export types for convenience
export type { Category, Style };
import data from './data.json';

// Cast the imported JSON to our TypeScript type
const typedData = data as unknown as DataStructure;

/**
 * Get all available categories
 * @returns Array of all categories
 */
export function getCategories(): Category[] {
  return typedData.categories;
}

/**
 * Get a category by ID
 * @param categoryId The ID of the category to retrieve
 * @returns The category object or undefined if not found
 */
export function getCategory(categoryId: string): Category | undefined {
  return typedData.categories.find(category => category.id === categoryId);
}

/**
 * Get all styles across all categories
 * @returns Array of all styles
 */
export function getStyles(): Style[] {
  return getAllStyles(typedData);
}

/**
 * Get styles for a specific category
 * @param categoryId The ID of the category
 * @returns Array of styles in the category
 */
export function getStylesByCategory(categoryId: string): Style[] {
  const category = getCategory(categoryId);
  return category ? category.styles : [];
}

/**
 * Get a style by ID
 * @param styleId The ID of the style to retrieve
 * @returns The style object or undefined if not found
 */
export function getStyle(styleId: string): Style | undefined {
  // Create a lookup object for efficient style retrieval
  const styleLookup: StyleLookup = createStyleLookup(typedData);
  return styleLookup[styleId];
}

/**
 * Get featured styles
 * @param limit Optional limit on the number of styles to return
 * @returns Array of featured styles
 */
export function getFeaturedStyles(limit?: number): Style[] {
  const featuredStyles = getStyles().filter(style => style.featured);
  return limit ? featuredStyles.slice(0, limit) : featuredStyles;
}

/**
 * Get new styles
 * @param limit Optional limit on the number of styles to return
 * @returns Array of new styles
 */
export function getNewStyles(limit?: number): Style[] {
  const newStyles = getStyles().filter(style => style.new);
  return limit ? newStyles.slice(0, limit) : newStyles;
}

/**
 * Get popular styles
 * @param limit Optional limit on the number of styles to return
 * @returns Array of popular styles
 */
export function getPopularStyles(limit?: number): Style[] {
  const popularStyles = getStyles().filter(style => style.popular);
  return limit ? popularStyles.slice(0, limit) : popularStyles;
}

/**
 * Get styles by tag
 * @param tag The tag to filter by
 * @param limit Optional limit on the number of styles to return
 * @returns Array of styles with the specified tag
 */
export function getStylesByTag(tag: string, limit?: number): Style[] {
  const taggedStyles = getStyles().filter(style => style.tags?.includes(tag));
  return limit ? taggedStyles.slice(0, limit) : taggedStyles;
}

/**
 * Search for styles by keyword
 * @param keyword The keyword to search for
 * @param limit Optional limit on the number of styles to return
 * @returns Array of styles matching the search criteria
 */
export function searchStyles(keyword: string, limit?: number): Style[] {
  const searchTerm = keyword.toLowerCase();
  
  const matchingStyles = getStyles().filter(style => 
    style.name.toLowerCase().includes(searchTerm) ||
    style.description.toLowerCase().includes(searchTerm) ||
    style.prompt.toLowerCase().includes(searchTerm) ||
    style.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  );
  
  return limit ? matchingStyles.slice(0, limit) : matchingStyles;
}

/**
 * Get a random style
 * @param categoryId Optional category to limit selection to
 * @returns A random style
 */
export function getRandomStyle(categoryId?: string): Style {
  const stylesToChooseFrom = categoryId 
    ? getStylesByCategory(categoryId)
    : getStyles();
  
  const randomIndex = Math.floor(Math.random() * stylesToChooseFrom.length);
  return stylesToChooseFrom[randomIndex];
}

export default {
  getCategories,
  getCategory,
  getStyles,
  getStylesByCategory,
  getStyle,
  getFeaturedStyles,
  getNewStyles,
  getPopularStyles,
  getStylesByTag,
  searchStyles,
  getRandomStyle,
};