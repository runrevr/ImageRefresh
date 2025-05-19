/**
 * Product Image Lab - Core functionality for product image transformations
 *
 * This module provides functionality for:
 * - Handling image uploads
 * - Processing product image transformations with OpenAI gpt-image-01
 * - Managing credit usage
 */

import { useState, useEffect, useRef } from "react";

// Enums and Constants
export enum TransformationType {
  REMOVE_BACKGROUND = "remove-background",
  ENHANCE_LIGHTING = "enhance-lighting",
  LIFESTYLE_CONTEXT = "lifestyle-context",
  SOCIAL_MEDIA_READY = "social-media-ready",
  E_COMMERCE_PACK = "e-commerce-pack",
  SEASONAL_THEME = "seasonal-theme",
}

// Type Definitions
export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  url: string;
  uploadedAt: string;
  base64?: string; // Add base64 for OpenAI API
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
  transformImage: (
    params: TransformationRequest,
  ) => Promise<TransformationResult>;
  batchTransformImages: (
    transformations: TransformationRequest[],
  ) => Promise<TransformationResult[]>;
  addCredits: (amount: number) => void;
  resetLab: () => void;
  setTestMode: (enabled: boolean) => void;
  setSimulationMode: (enabled: boolean) => void;
  testApiConnection: () => Promise<boolean>;
  enhancementOptions: TransformationOption[];
}

export interface OpenAIImageResponse {
  transformedImageUrl: string;
  prompt: string;
}

// Sample enhancement options
export const ENHANCEMENT_OPTIONS: TransformationOption[] = [
  {
    id: TransformationType.REMOVE_BACKGROUND,
    name: "Remove Background",
    description:
      "Isolate product with clean white background and subtle shadow",
    industry: "all",
    creditCost: 1,
    prompt:
      "Remove the background from this product image and replace it with a clean white background. Add a subtle shadow beneath the product for depth. Ensure the product edges are crisp and well-defined. The product must remain EXACTLY as shown in the original image. Do not modify the product's shape, color, size, or details in any way.",
  },
  {
    id: TransformationType.ENHANCE_LIGHTING,
    name: "Enhance Lighting",
    description: "Improve product visibility with professional studio lighting",
    industry: "all",
    creditCost: 1,
    prompt:
      "Enhance this product image with professional studio lighting. Add soft key lights to highlight the product's best features, rim lighting to define edges, and fill lights to soften shadows. Enhance colors for better vibrancy while maintaining natural appearance. The product must remain EXACTLY as shown in the original image. Only improve the lighting, not the product itself.",
  },
  {
    id: TransformationType.LIFESTYLE_CONTEXT,
    name: "Lifestyle Context",
    description: "Place product in realistic lifestyle setting",
    industry: "all",
    creditCost: 2,
    prompt:
      "Place this product in a natural lifestyle environment. Integrate it seamlessly with realistic shadows and reflections that match the environment's lighting. The product must remain EXACTLY as shown - do not modify, resize, recolor or reinterpret the product in any way. Only change the environment around it, keeping the product as the focal point.",
  },
  {
    id: TransformationType.SOCIAL_MEDIA_READY,
    name: "Social Media Ready",
    description:
      "Optimize for social media with trendy elements and space for text",
    industry: "all",
    creditCost: 2,
    prompt:
      "Transform this product into a highly shareable, scroll-stopping image optimized for social media. Create a visually striking composition with vibrant colors, perfect for Instagram or Pinterest. Add stylish negative space for text overlay. The product itself must remain EXACTLY as shown in the original - do not modify the product, only enhance the presentation around it.",
  },
  {
    id: TransformationType.E_COMMERCE_PACK,
    name: "E-commerce Pack",
    description: "Create multiple angles/views optimized for online stores",
    industry: "retail,fashion,home goods",
    creditCost: 3,
    prompt:
      "Create a professional e-commerce presentation of this product. Generate multiple angles of the same product optimized for online stores, including front view, side view, and detail shots. Use consistent lighting and a clean background suitable for e-commerce platforms. The product must remain EXACTLY as shown - do not modify, resize, recolor or reinterpret the product in any way.",
  },
  {
    id: TransformationType.SEASONAL_THEME,
    name: "Seasonal Theme",
    description:
      "Add seasonal elements (holiday, summer, etc.) to product images",
    industry: "retail,food,gift",
    creditCost: 2,
    prompt:
      "Add seasonal elements to this product image that enhance its appeal. Incorporate tasteful, contextually appropriate seasonal decorations or backgrounds while ensuring the product remains the clear focus. The product itself must remain EXACTLY as shown in the original - do not modify, resize, recolor or reinterpret the product in any way. Only add seasonal elements around it.",
  },
];

/**
 * Custom hook for managing product image transformations
 *
 * @param options - Configuration options
 * @returns Methods and state for image transformations
 */
export const useProductImageLab = (
  options: ProductImageLabOptions = {},
): ProductImageLabHook => {
  const {
    initialCredits = 1,
    onCreditChange = () => {},
    testMode = false,
    simulateApiCalls = false, // Set to false by default for using real API calls
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
   * File to base64
   * @param file - File object
   * @returns Promise with base64 string
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
      const timestamp = Date.now(); // Use same timestamp for batch to avoid duplication
      const processedImagesPromises = imageFiles.map(async (file, index) => {
        // Convert file to base64 for API calls
        const base64 = await fileToBase64(file);

        return {
          id: `upload-${timestamp}-${index}`,
          file,
          name: file.name,
          url: URL.createObjectURL(file),
          base64,
          uploadedAt: new Date().toISOString(),
        };
      });

      const processedImages = await Promise.all(processedImagesPromises);

      // Replace existing images to prevent duplication
      setUploadedImages(processedImages);
      return processedImages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error uploading images";
      setError(errorMessage);
      console.error("Error uploading images:", err);
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

    return ENHANCEMENT_OPTIONS.filter(
      (option) =>
        option.industry === "all" ||
        option.industry
          .split(",")
          .some((ind) => industry.toLowerCase().includes(ind.trim())),
    );
  };

  /**
   * Call OpenAI for image transformation using gpt-image-01
   * @param imageBase64 - Base64 encoded image
   * @param prompt - Transformation prompt
   * @returns Transformed image URL
   */
  const callOpenAIImage01 = async (
    imageBase64: string,
    prompt: string
  ): Promise<OpenAIImageResponse> => {
    try {
      console.log("Calling OpenAI gpt-image-01 API for image transformation");

      // Log the call for debugging
      setDebugInfo((prev) => ({
        ...prev,
        openaiApiCall: {
          timestamp: new Date().toISOString(),
          model: "gpt-image-01",
          promptLength: prompt.length,
          imageSize: Math.round((imageBase64.length * 3) / 4), // Approximate size calculation
        },
      }));

      // Make API call to the server endpoint which will call OpenAI
      const response = await fetch("/api/product-lab/transform-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          prompt,
          model: "gpt-image-01",
        }),
      });

      if (!response.ok) {
        // Handle API error
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `API error: ${response.status}`;

        console.error("OpenAI API error:", errorMessage);
        throw new Error(errorMessage);
      }

      // Parse the response
      const data = await response.json();

      // Log successful response
      setDebugInfo((prev) => ({
        ...prev,
        openaiApiResponse: {
          timestamp: new Date().toISOString(),
          status: "success",
          model: "gpt-image-01",
        },
      }));

      return {
        transformedImageUrl: data.transformedImageUrl || `data:image/jpeg;base64,${data.base64Image}`,
        prompt,
      };
    } catch (error) {
      // Log API error
      console.error("OpenAI API error:", error);

      setDebugInfo((prev) => ({
        ...prev,
        openaiApiError: {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
          model: "gpt-image-01",
        },
      }));

      throw error;
    }
  };

  /**
   * Process image transformation
   * @param params - Transformation parameters
   * @returns Transformed image result
   */
  const transformImage = async (
    params: TransformationRequest,
  ): Promise<TransformationResult> => {
    const { imageId, transformationType, customPrompt = null } = params;

    // Log the transformation attempt
    console.log(
      `Starting transformation for image: ${imageId}, type: ${transformationType}`,
    );

    try {
      // Find the image and transformation option
      const image = uploadedImages.find((img) => img.id === imageId);
      const transformOption = ENHANCEMENT_OPTIONS.find(
        (opt) => opt.id === transformationType,
      );

      if (!image) {
        console.error(`Image with ID ${imageId} not found`);
        setError(`Image not found. Please try re-uploading the image.`);
        throw new Error(`Image with ID ${imageId} not found`);
      }

      if (!transformOption) {
        console.error(`Transformation type ${transformationType} not found`);
        setError(
          `Enhancement type not found. Please select a different enhancement.`,
        );
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
      let transformedImageUrl = "";

      // Store debug info for this transformation
      setDebugInfo((prev) => ({
        ...prev,
        currentTransformation: {
          imageId,
          transformationType,
          prompt: customPrompt || transformOption.prompt,
          timestamp: new Date().toISOString(),
          simulationMode: isSimulated,
          testMode: isTestModeEnabled,
          model: "gpt-image-01",
        },
      }));

      // If we're not in simulation mode, call the OpenAI API
      if (!isSimulated) {
        try {
          console.log(
            `Attempting OpenAI gpt-image-01 API call for image transformation: ${transformationType}`,
          );

          // Make sure we have base64 data
          if (!image.base64) {
            throw new Error("Image base64 data is missing");
          }

          // Call OpenAI gpt-image-01 API
          const result = await callOpenAIImage01(
            image.base64,
            customPrompt || transformOption.prompt
          );

          transformedImageUrl = result.transformedImageUrl;

          // Clear any previous errors
          setError(null);

          console.log("OpenAI gpt-image-01 transformation successful");
        } catch (apiError) {
          // API error - log and switch to simulation
          console.error("OpenAI API call failed:", apiError);

          // Set user-friendly error message
          setError(
            `Error processing image transformation: ${apiError instanceof Error ? apiError.message : "Unknown error"}. Falling back to simulation mode.`,
          );

          // Fall back to simulation mode
          isSimulated = true;
          setIsSimulationMode(true);

          // Log fallback to simulation
          setDebugInfo((prev) => ({
            ...prev,
            fallbackToSimulation: {
              timestamp: new Date().toISOString(),
              reason: apiError instanceof Error ? apiError.message : String(apiError),
              originalMode: isSimulationMode,
            },
          }));
        }
      }

      // If we're in simulation mode or the API call failed, generate a placeholder URL
      if (isSimulated) {
        // In a real app, we'd use a better simulation - for now just use a random image
        transformedImageUrl = `https://picsum.photos/seed/${imageId}-${transformationType}/800/800`;

        // Log simulation
        setDebugInfo((prev) => ({
          ...prev,
          simulatedTransformation: {
            timestamp: new Date().toISOString(),
            imageId,
            transformationType,
            simulatedUrl: transformedImageUrl,
          },
        }));

        console.log(
          "Using simulated transformation URL:",
          transformedImageUrl,
        );
      }

      // Create a transaction ID to track credit deduction
      const transactionId = `${imageId}-${transformationType}-${Date.now()}`;
      setPendingTransactions((prev) => ({ ...prev, [transactionId]: true }));

      try {
        // Deduct credits if not in test mode
        if (!isTestModeEnabled && !pendingTransactions[transactionId]) {
          console.log(
            `Deducting ${transformOption.creditCost} credits for transformation`,
          );
          setAvailableCredits((prev) => prev - transformOption.creditCost);
        } else if (isTestModeEnabled) {
          console.log("Test mode enabled - no credits deducted");
        }

        // Create transformation result
        const result: TransformationResult = {
          id: `transform-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          originalImageId: imageId,
          transformationType,
          originalImage: image,
          transformationName: transformOption.name,
          transformedImageUrl,
          creditCost: transformOption.creditCost,
          prompt: customPrompt || transformOption.prompt,
          completedAt: new Date().toISOString(),
        };

        // Add to transformed images
        setTransformedImages((prev) => [...prev, result]);

        console.log("Transformation completed successfully");
        return result;
      } finally {
        // Clear the pending transaction
        setPendingTransactions((prev) => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });
      }
    } catch (err) {
      console.error("Error in transformImage:", err);

      // Log error to debug info
      setDebugInfo((prev) => ({
        ...prev,
        transformError: {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
          model: "gpt-image-01",
        },
      }));

      // Make sure error is set
      setError(err instanceof Error ? err.message : "Unknown error");

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
  const batchTransformImages = async (
    transformations: TransformationRequest[],
  ): Promise<TransformationResult[]> => {
    console.log(
      `Starting batch transformation with ${transformations.length} requests`,
    );

    try {
      // Calculate total credit cost
      const totalCreditCost = transformations.reduce((total, transform) => {
        const option = ENHANCEMENT_OPTIONS.find(
          (opt) => opt.id === transform.transformationType,
        );
        return total + (option?.creditCost || 0);
      }, 0);

      // Log batch information
      setDebugInfo((prev) => ({
        ...prev,
        batchStartInfo: {
          transformationCount: transformations.length,
          totalCreditCost,
          timestamp: new Date().toISOString(),
          testMode: isTestModeEnabled,
          simulationMode: isSimulationMode,
          model: "gpt-image-01",
        },
      }));

      // Check if user has enough credits (bypass check in test mode)
      if (!isTestModeEnabled && availableCredits < totalCreditCost) {
        const errorMessage = `Not enough credits for batch transformation. Required: ${totalCreditCost}, Available: ${availableCredits}`;
        console.error(errorMessage);
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Process each transformation sequentially
      const results: TransformationResult[] = [];
      for (const transform of transformations) {
        try {
          const result = await transformImage(transform);
          results.push(result);
        } catch (err) {
          console.error(`Error processing transformation ${transform.imageId}:`, err);
          // Continue processing other transformations
        }
      }

      // Log batch completion
      setDebugInfo((prev) => ({
        ...prev,
        batchCompleteInfo: {
          timestamp: new Date().toISOString(),
          successCount: results.length,
          failureCount: transformations.length - results.length,
        },
      }));

      return results;
    } catch (err) {
      console.error("Error in batch transformation:", err);

      // Log batch error
      setDebugInfo((prev) => ({
        ...prev,
        batchError: {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
        },
      }));

      // Make sure error is set
      setError(err instanceof Error ? err.message : "Unknown error in batch transformation");

      // Re-throw for upstream handling
      throw err;
    }
  };

  /**
   * Add credits to the account
   * @param amount - Amount of credits to add
   */
  const addCredits = (amount: number): void => {
    if (amount <= 0) {
      console.warn("Cannot add non-positive credit amount:", amount);
      return;
    }

    console.log(`Adding ${amount} credits`);
    setAvailableCredits((prev) => prev + amount);

    // Log credit addition
    setDebugInfo((prev) => ({
      ...prev,
      creditAddition: {
        timestamp: new Date().toISOString(),
        amount,
        newTotal: availableCredits + amount,
      },
    }));
  };

  /**
   * Reset the lab state
   */
  const resetLab = (): void => {
    console.log("Resetting lab state");

    // Clear uploaded images URL objects
    uploadedImages.forEach((img) => {
      if (img.url && img.url.startsWith("blob:")) {
        URL.revokeObjectURL(img.url);
      }
    });

    // Reset all state
    setUploadedImages([]);
    setTransformedImages([]);
    setError(null);
    setIsProcessing(false);
    setPendingTransactions({});

    // Log reset
    setDebugInfo((prev) => ({
      ...prev,
      labReset: {
        timestamp: new Date().toISOString(),
      },
    }));
  };

  /**
   * Toggle test mode
   * @param enabled - Whether to enable test mode
   */
  const setTestMode = (enabled: boolean): void => {
    console.log(`${enabled ? "Enabling" : "Disabling"} test mode`);
    setIsTestModeEnabled(enabled);

    // Log test mode change
    setDebugInfo((prev) => ({
      ...prev,
      testModeChange: {
        timestamp: new Date().toISOString(),
        enabled,
      },
    }));
  };

  /**
   * Toggle simulation mode
   * @param enabled - Whether to enable simulation mode
   */
  const setSimulationMode = (enabled: boolean): void => {
    console.log(`${enabled ? "Enabling" : "Disabling"} simulation mode`);
    setIsSimulationMode(enabled);

    // Log simulation mode change
    setDebugInfo((prev) => ({
      ...prev,
      simulationModeChange: {
        timestamp: new Date().toISOString(),
        enabled,
      },
    }));
  };

  /**
   * Test API connection to ensure the OpenAI integration is working
   * @returns Whether the connection was successful
   */
  const testApiConnection = async (): Promise<boolean> => {
    try {
      console.log("Testing OpenAI API connection...");

      // Log API test
      setDebugInfo((prev) => ({
        ...prev,
        apiConnectionTest: {
          timestamp: new Date().toISOString(),
          status: "in_progress",
          endpoint: "/api/product-lab/test-connection",
        },
      }));

      // Make a simple API call to test the connection
      const response = await fetch("/api/product-lab/test-connection", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      // Get response text first - handle this with a separate try-catch
      let responseText = "Could not read response text";
      try {
        responseText = await response.text();
      } catch (err) {
        console.error("Error reading response text:", err);
      }
      
      // Then log API test result
      setDebugInfo((prev) => ({
        ...prev,
        apiConnectionTest: {
          ...prev.apiConnectionTest,
          status: response.ok ? "success" : "failed",
          statusCode: response.status,
          response: responseText,
        },
      }));

      if (!response.ok) {
        console.error(`API connection test failed with status: ${response.status}`);
        setError(`API connection test failed: ${response.status}`);
        setIsSimulationMode(true);
      } else {
        console.log("API connection test successful");
        setError(null);
      }

      return response.ok;
    } catch (err) {
      console.error("API connection test completely failed:", err);

      // Log error to debug info
      setDebugInfo((prev) => ({
        ...prev,
        apiConnectionTest: {
          ...prev.apiConnectionTest,
          status: "critical_error",
          error: err instanceof Error ? err.message : String(err),
        },
      }));

      // Enable simulation mode on failure
      setIsSimulationMode(true);
      console.log("API test failed with error. Enabling simulation mode.");

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