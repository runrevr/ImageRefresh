/**
 * Product Image Lab - Core functionality for product image transformations
 * 
 * This module provides functionality for:
 * - Handling image uploads
 * - Processing product image transformations
 * - Managing credit usage
 * - Interfacing with OpenAI's image transformation APIs
 */

import { useState, useEffect } from 'react';

// Enums and Constants
export enum TransformationType {
  REMOVE_BACKGROUND = 'remove-background',
  ENHANCE_LIGHTING = 'enhance-lighting',
  LIFESTYLE_CONTEXT = 'lifestyle-context',
  SOCIAL_MEDIA_READY = 'social-media-ready',
  E_COMMERCE_PACK = 'e-commerce-pack',
  SEASONAL_THEME = 'seasonal-theme',
}

// Type Definitions
export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface TransformationOption {
  id: TransformationType;
  name: string;
  description: string;
  industry: string;
  creditCost: number;
  prompt: string;
}

export interface TransformationResult {
  id: string;
  originalImageId: string;
  transformationType: TransformationType;
  originalImage: UploadedImage;
  transformationName: string;
  transformedImageUrl: string;
  creditCost: number;
  prompt: string;
  completedAt: string;
}

export interface TransformationRequest {
  imageId: string;
  transformationType: TransformationType;
  customPrompt?: string;
}

export interface ProductImageLabOptions {
  initialCredits?: number;
  onCreditChange?: (credits: number) => void;
  webhookUrl?: string;
  testMode?: boolean;
  simulateApiCalls?: boolean; // Flag to simulate API calls instead of making real ones
}

export interface ProductImageLabHook {
  availableCredits: number;
  isProcessing: boolean;
  error: string | null;
  uploadedImages: UploadedImage[];
  transformedImages: TransformationResult[];
  isTestModeEnabled: boolean;
  debugInfo: Record<string, any>;
  handleImageUpload: (files: FileList) => Promise<UploadedImage[]>;
  getEnhancementsForIndustry: (industry: string) => TransformationOption[];
  transformImage: (params: TransformationRequest) => Promise<TransformationResult>;
  batchTransformImages: (transformations: TransformationRequest[]) => Promise<TransformationResult[]>;
  addCredits: (amount: number) => void;
  resetLab: () => void;
  setTestMode: (enabled: boolean) => void;
  enhancementOptions: TransformationOption[];
}

// Sample enhancement options
export const ENHANCEMENT_OPTIONS: TransformationOption[] = [
  {
    id: TransformationType.REMOVE_BACKGROUND,
    name: 'Remove Background',
    description: 'Isolate product with clean white background and subtle shadow',
    industry: 'all',
    creditCost: 1,
    prompt: 'Remove the background from this product image and replace it with a clean white background. Add a subtle shadow beneath the product for depth. Ensure the product edges are crisp and well-defined.'
  },
  {
    id: TransformationType.ENHANCE_LIGHTING,
    name: 'Enhance Lighting',
    description: 'Improve product visibility with professional studio lighting',
    industry: 'all',
    creditCost: 1,
    prompt: 'Enhance this product image with professional studio lighting. Add soft key lights to highlight the product\'s best features, rim lighting to define edges, and fill lights to soften shadows. Enhance colors for better vibrancy while maintaining natural appearance.'
  },
  {
    id: TransformationType.LIFESTYLE_CONTEXT,
    name: 'Lifestyle Context',
    description: 'Place product in realistic lifestyle setting',
    industry: 'all',
    creditCost: 2,
    prompt: 'Place this product in a natural lifestyle environment. Integrate it seamlessly with realistic shadows and reflections that match the environment\'s lighting. Ensure the product remains the focal point while the setting provides context and atmosphere.'
  },
  {
    id: TransformationType.SOCIAL_MEDIA_READY,
    name: 'Social Media Ready',
    description: 'Optimize for social media with trendy elements and space for text',
    industry: 'all',
    creditCost: 2,
    prompt: 'Transform this product into a highly shareable, scroll-stopping image optimized for social media. Create a visually striking composition with vibrant colors, perfect for Instagram or Pinterest. Add stylish negative space for text overlay and ensure the product pops against a carefully designed background.'
  },
  {
    id: TransformationType.E_COMMERCE_PACK,
    name: 'E-commerce Pack',
    description: 'Create multiple angles/views optimized for online stores',
    industry: 'retail,fashion,home goods',
    creditCost: 3,
    prompt: 'Create a professional e-commerce presentation of this product. Generate multiple angles of the same product optimized for online stores, including front view, side view, and detail shots. Use consistent lighting and a clean background suitable for e-commerce platforms.'
  },
  {
    id: TransformationType.SEASONAL_THEME,
    name: 'Seasonal Theme',
    description: 'Add seasonal elements (holiday, summer, etc.) to product images',
    industry: 'retail,food,gift',
    creditCost: 2,
    prompt: 'Add seasonal elements to this product image that enhance its appeal. Incorporate tasteful, contextually appropriate seasonal decorations or backgrounds while ensuring the product remains the clear focus. Create an atmosphere that evokes the current or upcoming season.'
  }
];

/**
 * Custom hook for managing product image transformations
 * 
 * @param options - Configuration options
 * @returns Methods and state for image transformations
 */
export const useProductImageLab = (options: ProductImageLabOptions = {}): ProductImageLabHook => {
  const { 
    initialCredits = 10,
    onCreditChange = () => {},
    webhookUrl = '/api/webhooks/transform-image',
    testMode = false
  } = options;
  
  const [availableCredits, setAvailableCredits] = useState<number>(initialCredits);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [transformedImages, setTransformedImages] = useState<TransformationResult[]>([]);
  const [isTestModeEnabled, setIsTestModeEnabled] = useState<boolean>(testMode);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  // Update the parent component when credits change
  useEffect(() => {
    onCreditChange(availableCredits);
  }, [availableCredits, onCreditChange]);
  
  /**
   * Handle file uploads
   * @param files - Files from input element
   * @returns Array of uploaded image objects
   */
  const handleImageUpload = async (files: FileList): Promise<UploadedImage[]> => {
    try {
      setError(null);
      const imageFiles = Array.from(files);
      
      // Process each file to get a URL and metadata
      const processedImages: UploadedImage[] = imageFiles.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }));
      
      setUploadedImages(prev => [...prev, ...processedImages]);
      return processedImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading images';
      setError(errorMessage);
      console.error('Error uploading images:', err);
      return [];
    }
  };
  
  /**
   * Get available enhancements for a specific industry
   * @param industry - Industry name
   * @returns Filtered enhancement options
   */
  const getEnhancementsForIndustry = (industry: string): TransformationOption[] => {
    if (!industry) return ENHANCEMENT_OPTIONS;
    
    return ENHANCEMENT_OPTIONS.filter(option => 
      option.industry === 'all' || 
      option.industry.split(',').some(ind => industry.toLowerCase().includes(ind.trim()))
    );
  };
  
  /**
   * Process image transformation
   * @param params - Transformation parameters
   * @returns Transformed image result
   */
  const transformImage = async (params: TransformationRequest): Promise<TransformationResult> => {
    const { imageId, transformationType, customPrompt = null } = params;
    
    // Find the image and transformation option
    const image = uploadedImages.find(img => img.id === imageId);
    const transformOption = ENHANCEMENT_OPTIONS.find(opt => opt.id === transformationType);
    
    if (!image) {
      throw new Error(`Image with ID ${imageId} not found`);
    }
    
    if (!transformOption) {
      throw new Error(`Transformation type ${transformationType} not found`);
    }
    
    // Check if user has enough credits (bypass check if in test mode)
    if (!isTestModeEnabled && availableCredits < transformOption.creditCost) {
      throw new Error(`Not enough credits. Required: ${transformOption.creditCost}, Available: ${availableCredits}`);
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // In a real implementation, this would call an API endpoint
      // Prepare the form data that would be sent to an API
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('prompt', customPrompt || transformOption.prompt);
      formData.append('transformationType', transformationType);
      
      // This would be the actual API call in a production environment
      // const response = await fetch(webhookUrl, {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock result (in production, would be from the API response)
      const result: TransformationResult = {
        id: `result-${Date.now()}`,
        originalImageId: imageId,
        transformationType,
        originalImage: image,
        transformationName: transformOption.name,
        // In a real implementation, this would be the URL from the API response
        transformedImageUrl: image.url, // Using original as placeholder
        creditCost: transformOption.creditCost,
        prompt: customPrompt || transformOption.prompt,
        completedAt: new Date().toISOString()
      };
      
      // Deduct credits (skip if in test mode)
      if (!isTestModeEnabled) {
        setAvailableCredits(prev => prev - transformOption.creditCost);
      }
      
      // Store debug info
      setDebugInfo(prev => ({
        ...prev,
        lastTransformation: {
          type: transformationType,
          prompt: customPrompt || transformOption.prompt,
          timestamp: new Date().toISOString(),
          creditCost: transformOption.creditCost,
          testMode: isTestModeEnabled
        }
      }));
      
      // Add to transformed images
      setTransformedImages(prev => [...prev, result]);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error transforming image';
      setError(errorMessage);
      console.error('Error transforming image:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Process multiple transformations at once
   * @param transformations - Array of transformation requests
   * @returns Results of all transformations
   */
  const batchTransformImages = async (transformations: TransformationRequest[]): Promise<TransformationResult[]> => {
    // Calculate total credit cost
    const totalCreditCost = transformations.reduce((total, transform) => {
      const option = ENHANCEMENT_OPTIONS.find(opt => opt.id === transform.transformationType);
      return total + (option?.creditCost || 0);
    }, 0);
    
    // Check if user has enough credits (bypass check if in test mode)
    if (!isTestModeEnabled && availableCredits < totalCreditCost) {
      throw new Error(`Not enough credits. Required: ${totalCreditCost}, Available: ${availableCredits}`);
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Process each transformation sequentially
      const results: TransformationResult[] = [];
      for (const transform of transformations) {
        const result = await transformImage(transform);
        results.push(result);
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing batch transformations';
      setError(errorMessage);
      console.error('Error processing batch transformations:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Add credits to the user's account
   * @param amount - Number of credits to add
   */
  const addCredits = (amount: number): void => {
    if (!amount || amount <= 0) return;
    setAvailableCredits(prev => prev + amount);
  };
  
  /**
   * Reset the state of the lab
   */
  const resetLab = (): void => {
    // Clean up object URLs to prevent memory leaks
    uploadedImages.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    
    setUploadedImages([]);
    setTransformedImages([]);
    setError(null);
    setIsProcessing(false);
    setDebugInfo({});
  };
  
  /**
   * Set test mode
   * @param enabled - Whether test mode should be enabled
   */
  const setTestMode = (enabled: boolean): void => {
    setIsTestModeEnabled(enabled);
    
    // Log test mode change to debug info
    setDebugInfo(prev => ({
      ...prev,
      testModeChange: {
        enabled,
        timestamp: new Date().toISOString()
      }
    }));
  };
  
  return {
    // State
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    isTestModeEnabled,
    debugInfo,
    
    // Methods
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab,
    setTestMode,
    
    // Constants
    enhancementOptions: ENHANCEMENT_OPTIONS,
  };
};

export default useProductImageLab;