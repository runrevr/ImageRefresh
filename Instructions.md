# Implementation Plan: Unified Data Structure for Categories, Styles, and Prompts

## Overview
Create a centralized data structure to manage categories, styles, and prompts across multiple pages of the ImageRefresh application.

## Goals
- Maintain a single source of truth for all transformation options
- Simplify updates to styles and prompts
- Standardize metadata for consistent display across the application
- Support both grid views (Ideas page) and selection views (Prompt input)

## File Structure
- Create `data.json` in the shared directory to be accessible by both client and server code
- Create a TypeScript interface file `data.types.ts` with proper type definitions

## Data Model

```typescript
// The hierarchical structure will be:
interface Category {
  id: string;          // Unique identifier
  name: string;        // Display name
  description: string; // Brief description
  icon?: string;       // Icon name (if applicable)
  styles: Style[];     // Array of styles within this category
}

interface Style {
  id: string;           // Unique identifier
  name: string;         // Display name 
  description: string;  // Brief description
  category: string;     // ID of parent category
  prompt: string;       // Transformation prompt text
  previewImage: string; // Path to example image
  beforeImage?: string; // Optional "before" example 
  afterImage?: string;  // Optional "after" example
  featured?: boolean;   // Flag for featured styles
  new?: boolean;        // Flag for newly added styles
  popular?: boolean;    // Flag for popular styles
  tags?: string[];      // Optional tags for filtering
}
```

## Categories to Include
1. Artistic Styles
2. Era Transformations
3. Media Transformations
4. Cultural Styles
5. Special Effects

## Implementation Steps
1. Create `data.types.ts` with proper TypeScript interfaces
2. Create `data.json` with the full dataset
3. Add utility functions to access and filter the data
4. Update references in components to use the centralized data

## Benefits
- Easier maintenance
- Consistent styling information
- Single point of update when adding new styles
- Better type safety with TypeScript interfaces