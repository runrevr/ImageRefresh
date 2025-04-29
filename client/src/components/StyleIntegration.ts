/**
 * This file handles the integration between the Ideas page styles and the Home page transformation
 * It provides utility functions to retrieve saved styles and apply them to image transformations
 */

// Define a type for the saved style
export interface SavedStyle {
  prompt: string;
  title: string;
  category: string;
}

/**
 * Saves a style to localStorage for future use
 */
export function saveStyle(style: SavedStyle): void {
  localStorage.setItem('selectedStyle', JSON.stringify(style));
}

/**
 * Retrieves a saved style from localStorage
 * Returns null if no style is saved
 */
export function getSavedStyle(): SavedStyle | null {
  const savedStyleJson = localStorage.getItem('selectedStyle');
  if (!savedStyleJson) return null;
  
  try {
    return JSON.parse(savedStyleJson) as SavedStyle;
  } catch (error) {
    console.error('Error parsing saved style:', error);
    return null;
  }
}

/**
 * Clears the saved style from localStorage
 */
export function clearSavedStyle(): void {
  localStorage.removeItem('selectedStyle');
}

/**
 * Checks if a style is saved in localStorage
 */
export function hasSavedStyle(): boolean {
  return localStorage.getItem('selectedStyle') !== null;
}

/**
 * The integration with the home page works as follows:
 * 
 * 1. When a user clicks "Use This Style" on the Ideas page:
 *    - The style (prompt, title, category) is saved to localStorage using saveStyle()
 * 
 * 2. When the user navigates to the Home page:
 *    - Check if a style is saved using hasSavedStyle()
 *    - If yes, get the style using getSavedStyle()
 *    - Auto-populate the prompt field with the saved prompt
 *    - Optionally display a notification that a style is being applied
 *    - After applying the style, clear it using clearSavedStyle() to avoid reapplying it
 */

// Example usage in Home page component:
/*
import { useEffect } from 'react';
import { getSavedStyle, clearSavedStyle, hasSavedStyle } from '@/components/StyleIntegration';
import { useToast } from "@/hooks/use-toast";

function HomePageComponent() {
  const [prompt, setPrompt] = useState<string>('');
  const { toast } = useToast();
  
  // Check for saved style on component mount
  useEffect(() => {
    if (hasSavedStyle()) {
      const savedStyle = getSavedStyle();
      if (savedStyle) {
        // Set the prompt from the saved style
        setPrompt(savedStyle.prompt);
        
        // Notify the user that a style is being applied
        toast({
          title: `Applying "${savedStyle.title}" style`,
          description: `The ${savedStyle.category} style will be applied to your next image.`,
        });
        
        // Clear the saved style to avoid reapplying it
        clearSavedStyle();
      }
    }
  }, []);
  
  // Rest of component...
}
*/