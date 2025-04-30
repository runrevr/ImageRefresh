/**
 * Type definitions for the centralized data structure of categories, styles, and prompts
 */

export interface Category {
  id: string;           // Unique identifier
  name: string;         // Display name
  description: string;  // Brief description
  icon?: string;        // Icon name from lucide-react
  styles: Style[];      // Array of styles within this category
}

export interface Style {
  id: string;            // Unique identifier
  name: string;          // Display name 
  description: string;   // Brief description
  category: string;      // ID of parent category (reference)
  prompt: string;        // Transformation prompt text
  previewImage: string;  // Path to example image (after transformation)
  beforeImage?: string;  // Optional "before" example 
  afterImage?: string;   // Optional "after" example (same as previewImage if not specified)
  featured?: boolean;    // Flag for featured styles
  new?: boolean;         // Flag for newly added styles
  popular?: boolean;     // Flag for popular styles
  tags?: string[];       // Optional tags for filtering
}

export interface DataStructure {
  categories: Category[];
}

// Helper type for accessing a style by ID
export type StyleLookup = {
  [key: string]: Style;
};

// Helper functions

/**
 * Get a flat array of all styles across all categories
 */
export function getAllStyles(data: DataStructure): Style[] {
  return data.categories.flatMap(category => category.styles);
}

/**
 * Create a lookup object to quickly access styles by ID
 */
export function createStyleLookup(data: DataStructure): StyleLookup {
  const lookup: StyleLookup = {};
  
  getAllStyles(data).forEach(style => {
    lookup[style.id] = style;
  });
  
  return lookup;
}

/**
 * Get all styles from a specific category
 */
export function getStylesByCategory(data: DataStructure, categoryId: string): Style[] {
  const category = data.categories.find(c => c.id === categoryId);
  return category ? category.styles : [];
}

/**
 * Get featured styles across all categories
 */
export function getFeaturedStyles(data: DataStructure): Style[] {
  return getAllStyles(data).filter(style => style.featured);
}

/**
 * Get new styles across all categories
 */
export function getNewStyles(data: DataStructure): Style[] {
  return getAllStyles(data).filter(style => style.new);
}

/**
 * Get popular styles across all categories
 */
export function getPopularStyles(data: DataStructure): Style[] {
  return getAllStyles(data).filter(style => style.popular);
}

/**
 * Get styles by tag
 */
export function getStylesByTag(data: DataStructure, tag: string): Style[] {
  return getAllStyles(data).filter(style => style.tags?.includes(tag));
}