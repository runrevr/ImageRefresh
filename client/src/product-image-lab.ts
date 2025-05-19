/**
 * Product Image Lab - Core functionality for product image transformations
 * 
 * This module provides functionality for:
 * - Handling image uploads
 * - Processing product image transformations
 * - Managing credit usage
 * - Interfacing with OpenAI's image transformation APIs
 */

import { useState, useEffect, useRef } from 'react';

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
  optionsEndpoint?: string;
  selectionsEndpoint?: string;
  resultsEndpoint?: string;
  generateEndpoint?: string;
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
  isSimulationMode: boolean;
  debugInfo: Record<string, any>;
  handleImageUpload: (files: FileList) => Promise<UploadedImage[]>;
  getEnhancementsForIndustry: (industry: string) => TransformationOption[];
  transformImage: (params: TransformationRequest) => Promise<TransformationResult>;
  batchTransformImages: (transformations: TransformationRequest[]) => Promise<TransformationResult[]>;
  addCredits: (amount: number) => void;
  resetLab: () => void;
  setTestMode: (enabled: boolean) => void;
  setSimulationMode: (enabled: boolean) => void;
  testApiConnection: () => Promise<boolean>;
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
    webhookUrl = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9',
    optionsEndpoint = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/options',
    selectionsEndpoint = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/selections',
    resultsEndpoint = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/results',
    generateEndpoint = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/generate',
    testMode = false,
    simulateApiCalls = true // Default to true for safer operation
  } = options;
  
  const [availableCredits, setAvailableCredits] = useState<number>(initialCredits);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [transformedImages, setTransformedImages] = useState<TransformationResult[]>([]);
  const [isTestModeEnabled, setIsTestModeEnabled] = useState<boolean>(testMode);
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(simulateApiCalls);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  
  // Track transactions to prevent duplicate credit deductions
  const [pendingTransactions, setPendingTransactions] = useState<Record<string, boolean>>({});
  
  // Track last credit update to prevent excessive calls
  const lastCreditUpdate = useRef<number>(availableCredits);
  
  // Update the parent component when credits change - with debounce
  useEffect(() => {
    // Update the ref to the current value
    lastCreditUpdate.current = availableCredits;
    
    // Use a small timeout to debounce rapid credit changes
    const timeoutId = setTimeout(() => {
      onCreditChange(availableCredits);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
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
    
    // Log the transformation attempt
    console.log(`Starting transformation for image: ${imageId}, type: ${transformationType}`);
    
    try {
      // Find the image and transformation option
      const image = uploadedImages.find(img => img.id === imageId);
      const transformOption = ENHANCEMENT_OPTIONS.find(opt => opt.id === transformationType);
      
      if (!image) {
        console.error(`Image with ID ${imageId} not found`);
        setError(`Image not found. Please try re-uploading the image.`);
        throw new Error(`Image with ID ${imageId} not found`);
      }
      
      if (!transformOption) {
        console.error(`Transformation type ${transformationType} not found`);
        setError(`Enhancement type not found. Please select a different enhancement.`);
        throw new Error(`Transformation type ${transformationType} not found`);
      }
      
      // Check if user has enough credits (bypass check if in test mode)
      if (!isTestModeEnabled && availableCredits < transformOption.creditCost) {
        const errorMessage = `Not enough credits. Required: ${transformOption.creditCost}, Available: ${availableCredits}`;
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      setIsProcessing(true);
      setError(null);
      
      // Track whether we're using simulation mode
      let isSimulated = isSimulationMode;
      let transformedImageUrl = '';
      
      // Store debug info for this transformation
      setDebugInfo(prev => ({
        ...prev,
        currentTransformation: {
          imageId,
          transformationType,
          prompt: customPrompt || transformOption.prompt,
          timestamp: new Date().toISOString(),
          simulationMode: isSimulated,
          testMode: isTestModeEnabled
        }
      }));
      
      // Prepare the form data for API calls
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('prompt', customPrompt || transformOption.prompt);
      formData.append('transformationType', transformationType);
      
      // If we're not in simulation mode, try to call the actual API
      if (!isSimulated) {
        try {
          console.log(`Attempting API call to ${webhookUrl} for image transformation`);
          
          // Add timeout for API calls
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            console.error('API call timed out after 15 seconds');
            setError('The transformation request timed out. Please try again.');
          }, 15000); // 15 second timeout
          
          // First try the N8N webhook endpoint
          let response;
          try {
            // Add CORS handling for external APIs
            response = await fetch(webhookUrl, {
              method: 'POST',
              body: formData,
              signal: controller.signal,
              mode: 'cors',
              credentials: 'include',  // Include credentials like cookies if needed
              headers: {
                'Accept': 'application/json'
              }
            });
          } catch (corsError) {
            console.error('CORS or network error with N8N endpoint:', corsError);
            
            // Try fallback to local API if N8N endpoint fails
            console.log('Attempting fallback to local API endpoint');
            const localApiUrl = '/api/webhooks/transform-image';
            
            try {
              response = await fetch(localApiUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal
              });
              
              console.log('Successfully connected to local API fallback');
            } catch (localApiError) {
              console.error('Local API fallback also failed:', localApiError);
              throw new Error('Unable to connect to transformation service. Please try again later.');
            }
          }
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            // API returned an error - log and switch to simulation
            const errorText = await response.text();
            console.error(`API error (${response.status}): ${errorText}`);
            
            // Set a user-friendly error message
            if (response.status === 0 || response.status === 404) {
              setError('Unable to connect to the transformation service. Check your network connection.');
            } else if (response.status === 429) {
              setError('Too many requests. Please try again in a moment.');
            } else if (response.status >= 500) {
              setError('The transformation service is currently unavailable. Please try again later.');
            } else {
              setError(`Error ${response.status}: ${response.statusText || 'Unknown error'}`);
            }
            
            // Fall back to simulation mode
            console.log('Falling back to simulation mode due to API error');
            isSimulated = true;
          } else {
            // Success - try to parse response
            try {
              const data = await response.json();
              transformedImageUrl = data.transformedImageUrl;
              
              // Clear any previous errors
              setError(null);
              
              console.log('API call successful, got transformed image URL');
            } catch (parseError) {
              // JSON parse error - log and switch to simulation
              console.error('Failed to parse API response:', parseError);
              
              setError('Received an invalid response from the server. Please try again.');
              
              // Fall back to simulation mode
              console.log('Falling back to simulation mode due to parsing error');
              isSimulated = true;
            }
          }
        } catch (apiError) {
          // Network error or other fetch issue - log and switch to simulation
          console.error('API call failed:', apiError);
          
          // Set user-friendly error message based on error type
          if (apiError instanceof DOMException && apiError.name === 'AbortError') {
            setError('The transformation request timed out. Please try again later.');
          } else {
            // Provide specific error message about N8N webhook connection
            setError('Unable to connect to the N8N transformation service. This might be due to CORS restrictions or network issues. Falling back to simulation mode.');
          }
          
          // Fall back to simulation mode
          console.log('Falling back to simulation mode due to network/fetch error');
          isSimulated = true;
        }
      }
      
      // If we're in simulation mode (either by choice or as a fallback)
      if (isSimulated) {
        console.log('Using simulation mode for image transformation');
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In simulation mode, just use the original image URL
        transformedImageUrl = image.url;
        
        // Log simulation in debug info
        setDebugInfo(prev => ({
          ...prev,
          simulationUsed: {
            reason: isSimulationMode ? 'Manual simulation mode enabled' : 'Fallback after API failure',
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      // Create the result object
      const result: TransformationResult = {
        id: `result-${Date.now()}`,
        originalImageId: imageId,
        transformationType,
        originalImage: image,
        transformationName: transformOption.name,
        transformedImageUrl: transformedImageUrl || image.url, // Fallback to original if empty
        creditCost: transformOption.creditCost,
        prompt: customPrompt || transformOption.prompt,
        completedAt: new Date().toISOString()
      };
      
      // Log completion
      console.log(`Transformation completed for image: ${imageId}, type: ${transformationType}`);
      
      // Create a unique transaction ID for this transformation
      const transactionId = `${imageId}-${transformationType}-${Date.now()}`;
      
      // Only deduct credits if:
      // 1. Not in test mode AND
      // 2. Not using simulation mode OR (simulation mode was a fallback but we still want to charge) AND
      // 3. Transaction hasn't been processed yet
      if (!isTestModeEnabled && 
          (!isSimulated || !isSimulationMode) && 
          !pendingTransactions[transactionId]) {
        
        // Mark this transaction as processed
        setPendingTransactions(prev => ({
          ...prev,
          [transactionId]: true
        }));
        
        console.log(`Deducting ${transformOption.creditCost} credits (Transaction: ${transactionId})`);
        setAvailableCredits(prev => prev - transformOption.creditCost);
      } else {
        console.log('No credits deducted (test mode, simulation mode, or already processed)');
      }
      
      // Store the transformation result
      setDebugInfo(prev => ({
        ...prev,
        lastCompletedTransformation: {
          result,
          timestamp: new Date().toISOString(),
          simulationMode: isSimulated
        }
      }));
      
      // Check for duplicates before adding to transformed images
      setTransformedImages(prev => {
        // Check if we already have this transformation
        if (prev.some(item => 
          item.originalImageId === imageId && 
          item.transformationType === transformationType)) {
          console.log('Skipping duplicate transformation result');
          return prev;
        }
        return [...prev, result];
      });
      
      return result;
    } catch (err) {
      // Handle all errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing transformation';
      console.error('Transformation error:', errorMessage);
      
      // Store error in debug info
      setDebugInfo(prev => ({
        ...prev,
        lastTransformationError: {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Make sure error is set
      setError(errorMessage);
      
      // Re-throw for upstream handling
      throw err;
    } finally {
      // Always reset processing state
      setIsProcessing(false);
    }
  };
  
  /**
   * Process multiple transformations at once
   * @param transformations - Array of transformation requests
   * @returns Results of all transformations
   */
  const batchTransformImages = async (transformations: TransformationRequest[]): Promise<TransformationResult[]> => {
    console.log(`Starting batch transformation with ${transformations.length} requests`);
    
    try {
      // Calculate total credit cost
      const totalCreditCost = transformations.reduce((total, transform) => {
        const option = ENHANCEMENT_OPTIONS.find(opt => opt.id === transform.transformationType);
        return total + (option?.creditCost || 0);
      }, 0);
      
      // Log batch information
      setDebugInfo(prev => ({
        ...prev,
        batchStartInfo: {
          transformationCount: transformations.length,
          totalCreditCost,
          timestamp: new Date().toISOString(),
          testMode: isTestModeEnabled,
          simulationMode: isSimulationMode
        }
      }));
      
      // Check if user has enough credits (bypass check if in test mode)
      if (!isTestModeEnabled && availableCredits < totalCreditCost) {
        const errorMessage = `Not enough credits. Required: ${totalCreditCost}, Available: ${availableCredits}`;
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      setIsProcessing(true);
      setError(null);
      
      // Process each transformation sequentially
      const results: TransformationResult[] = [];
      const failures: Array<{request: TransformationRequest, error: string}> = [];
      
      // Attempt to process all transformations, collecting successes and failures
      for (const transform of transformations) {
        try {
          // Log the current transformation being processed
          console.log(`Processing transformation for imageId: ${transform.imageId}, type: ${transform.transformationType}`);
          
          const result = await transformImage(transform);
          results.push(result);
          
          // Log success
          console.log(`Successfully processed transformation for imageId: ${transform.imageId}`);
        } catch (transformError) {
          // Log failure but continue with other transformations
          const errorMessage = transformError instanceof Error ? transformError.message : 'Unknown transformation error';
          console.error(`Transformation failed for imageId: ${transform.imageId}:`, errorMessage);
          
          // Add to failures list
          failures.push({
            request: transform,
            error: errorMessage
          });
        }
      }
      
      // Log batch completion
      setDebugInfo(prev => ({
        ...prev,
        batchCompleteInfo: {
          successCount: results.length,
          failureCount: failures.length,
          timestamp: new Date().toISOString(),
          failures: failures.length > 0 ? failures : undefined
        }
      }));
      
      // If we have any results but also failures, show a partial success message
      if (results.length > 0 && failures.length > 0) {
        setError(`${failures.length} of ${transformations.length} transformations failed. Partial results are shown.`);
      } 
      // If all failed, show a more serious error
      else if (results.length === 0 && failures.length > 0) {
        const errorMessage = `All ${failures.length} transformations failed. Please check the image files and try again.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log(`Batch transformation completed: ${results.length} successes, ${failures.length} failures`);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing batch transformations';
      setError(errorMessage);
      console.error('Error processing batch transformations:', err);
      
      // Log the batch error
      setDebugInfo(prev => ({
        ...prev,
        batchError: {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString()
        }
      }));
      
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
  
  /**
   * Set simulation mode
   * @param enabled - Whether simulation mode should be enabled
   */
  const setSimulationMode = (enabled: boolean): void => {
    setIsSimulationMode(enabled);
    
    // Log simulation mode change to debug info
    setDebugInfo(prev => ({
      ...prev,
      simulationModeChange: {
        enabled,
        timestamp: new Date().toISOString()
      }
    }));
  };
  
  /**
   * Test API connection to verify N8N webhook is accessible
   * @returns Promise resolving to true if successful, false if failed
   */
  const testApiConnection = async (): Promise<boolean> => {
    try {
      console.log(`Testing API connection to ${webhookUrl}`);
      
      // Add test info to debug
      setDebugInfo(prev => ({
        ...prev,
        apiConnectionTest: {
          url: webhookUrl,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }
      }));
      
      // Create controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Make a simple OPTIONS request to check endpoint availability
      const response = await fetch(webhookUrl, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        apiConnectionTest: {
          ...prev.apiConnectionTest,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          statusText: response.statusText
        }
      }));
      
      return response.ok;
    } catch (err) {
      console.error('API connection test failed:', err);
      
      // Log error to debug info
      setDebugInfo(prev => ({
        ...prev,
        apiConnectionTest: {
          ...prev.apiConnectionTest,
          status: 'error',
          error: err instanceof Error ? err.message : String(err)
        }
      }));
      
      return false;
    }
  };
  
  return {
    // State
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    isTestModeEnabled,
    isSimulationMode,
    debugInfo,
    
    // Methods
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab,
    setTestMode,
    setSimulationMode,
    testApiConnection,
    
    // Constants
    enhancementOptions: ENHANCEMENT_OPTIONS,
  };
};

export default useProductImageLab;