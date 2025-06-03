/**
 * Product Image Lab - Core functionality for product image transformations
 *
 * This module provides functionality for:
 * - Handling image uploads
 * - Processing product image transformations with OpenAI gpt-image-01
 * - Managing credit usage
 */

import { useState, useEffect, useRef } from "react";

// Helper function to generate device fingerprint for guest users
const generateFingerprint = async (): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

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
  userId?: number; // User ID for authentication
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
    userId,
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
      
      // Check if user is authenticated or has guest fingerprint for real uploads
      if (!isTestModeEnabled && !userId) {
        // For guest users, we'll proceed with fingerprint-based tracking
        console.log("Guest user attempting upload - proceeding with fingerprint tracking");
      }

      const imageFiles = Array.from(files);

      // Process each file to get a URL and metadata
      const timestamp = Date.now(); // Use same timestamp for batch to avoid duplication
      const processedImagesPromises = imageFiles.map(async (file, index) => {
        // Convert file to base64 for API calls
        const base64 = await fileToBase64(file);

        // For test mode or simulation, just create local objects
        if (isTestModeEnabled || isSimulationMode) {
          return {
            id: `upload-${timestamp}-${index}`,
            file,
            name: file.name,
            url: URL.createObjectURL(file),
            base64,
            uploadedAt: new Date().toISOString(),
          };
        }

        // For real uploads, use the secured backend endpoint
        const formData = new FormData();
        formData.append('image', file);
        
        if (userId) {
          formData.append('userId', userId.toString());
        } else {
          // For guest users, add fingerprint for tracking
          const fingerprint = await generateFingerprint();
          formData.append('fingerprint', fingerprint);
        }

        const headers: Record<string, string> = {};
        if (!userId) {
          // Add fingerprint header for guest users
          const fingerprint = await generateFingerprint();
          headers['x-fingerprint'] = fingerprint;
        }

        const response = await fetch('/api/product-image-lab/upload', {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Upload failed');
        }

        const uploadResult = await response.json();
        
        return {
          id: uploadResult.file.id,
          file,
          name: file.name,
          url: uploadResult.file.url,
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

          // Check authentication for real transformations
          if (!isTestModeEnabled && !userId) {
            console.log("Guest user attempting transformation - proceeding with fingerprint tracking");
          }

          // Prepare headers and body for the request
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };

          const requestBody: any = {
            imageId,
            transformationType: transformationType,
            options: {
              imageBase64: image.base64,
              prompt: customPrompt || transformOption.prompt,
              model: "gpt-image-01",
            },
          };

          if (userId) {
            requestBody.userId = userId;
          } else {
            // For guest users, add fingerprint for tracking
            const fingerprint = await generateFingerprint();
            headers['x-fingerprint'] = fingerprint;
            requestBody.fingerprint = fingerprint;
          }

          // Call the secured Product Lab transformation endpoint
          const response = await fetch("/api/product-image-lab/transform", {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Transformation failed: ${response.status}`;
            throw new Error(errorMessage);
          }

          const transformResult = await response.json();
          const result = {
            transformedImageUrl: transformResult.transformation?.transformedUrl || image.url,
            prompt: customPrompt || transformOption.prompt,
          };

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
          console.log("Falling back to simulation mode due to API error");
          isSimulated = true;
        }
      }

      // If we're in simulation mode (either by choice or as a fallback)
      if (isSimulated) {
        console.log("Using simulation mode for image transformation");

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In simulation mode, just use the original image URL
        transformedImageUrl = image.url;

        // Log simulation in debug info
        setDebugInfo((prev) => ({
          ...prev,
          simulationUsed: {
            reason: isSimulationMode
              ? "Manual simulation mode enabled"
              : "Fallback after API failure",
            timestamp: new Date().toISOString(),
            model: "gpt-image-01",
          },
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
        completedAt: new Date().toISOString(),
      };

      // Log completion
      console.log(
        `Transformation completed for image: ${imageId}, type: ${transformationType}`,
      );

      // Create a unique transaction ID for this transformation
      const transactionId = `${imageId}-${transformationType}-${Date.now()}`;

      // Only deduct credits if:
      // 1. Not in test mode AND
      // 2. Not using simulation mode OR (simulation mode was a fallback but we still want to charge) AND
      // 3. Transaction hasn't been processed yet
      if (
        !isTestModeEnabled &&
        (!isSimulated || !isSimulationMode) &&
        !pendingTransactions[transactionId]
      ) {
        // Mark this transaction as processed
        setPendingTransactions((prev) => ({
          ...prev,
          [transactionId]: true,
        }));

        console.log(
          `Deducting ${transformOption.creditCost} credits (Transaction: ${transactionId})`,
        );
        setAvailableCredits((prev) => prev - transformOption.creditCost);
      } else {
        console.log(
          "No credits deducted (test mode, simulation mode, or already processed)",
        );
      }

      // Store the transformation result
      setDebugInfo((prev) => ({
        ...prev,
        lastCompletedTransformation: {
          result,
          timestamp: new Date().toISOString(),
          simulationMode: isSimulated,
          model: "gpt-image-01",
        },
      }));

      // Check for duplicates before adding to transformed images
      setTransformedImages((prev) => {
        // Check if we already have this transformation
        if (
          prev.some(
            (item) =>
              item.originalImageId === imageId &&
              item.transformationType === transformationType,
          )
        ) {
          console.log("Skipping duplicate transformation result");
          return prev;
        }
        return [...prev, result];
      });

      return result;
    } catch (err) {
      // Handle all errors
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error processing transformation";
      console.error("Transformation error:", errorMessage);

      // Store error in debug info
      setDebugInfo((prev) => ({
        ...prev,
        lastTransformationError: {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
          model: "gpt-image-01",
        },
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
      const failures: Array<{ request: TransformationRequest; error: string }> =
        [];

      // Attempt to process all transformations, collecting successes and failures
      for (const transform of transformations) {
        try {
          // Log the current transformation being processed
          console.log(
            `Processing transformation for imageId: ${transform.imageId}, type: ${transform.transformationType}`,
          );

          const result = await transformImage(transform);
          results.push(result);

          // Log success
          console.log(
            `Successfully processed transformation for imageId: ${transform.imageId}`,
          );
        } catch (transformError) {
          // Log failure but continue with other transformations
          const errorMessage =
            transformError instanceof Error
              ? transformError.message
              : "Unknown transformation error";
          console.error(
            `Transformation failed for imageId: ${transform.imageId}:`,
            errorMessage,
          );

          // Add to failures list
          failures.push({
            request: transform,
            error: errorMessage,
          });
        }
      }

      // Log batch completion
      setDebugInfo((prev) => ({
        ...prev,
        batchCompleteInfo: {
          successCount: results.length,
          failureCount: failures.length,
          timestamp: new Date().toISOString(),
          failures: failures.length > 0 ? failures : undefined,
          model: "gpt-image-01",
        },
      }));

      // If we have any results but also failures, show a partial success message
      if (results.length > 0 && failures.length > 0) {
        setError(
          `${failures.length} of ${transformations.length} transformations failed. Partial results are shown.`,
        );
      }
      // If all failed, show a more serious error
      else if (results.length === 0 && failures.length > 0) {
        const errorMessage = `All ${failures.length} transformations failed. Please check the image files and try again.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      console.log(
        `Batch transformation completed: ${results.length} successes, ${failures.length} failures`,
      );
      return results;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error processing batch transformations";
      setError(errorMessage);
      console.error("Error processing batch transformations:", err);

      // Log the batch error
      setDebugInfo((prev) => ({
        ...prev,
        batchError: {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
          model: "gpt-image-01",
        },
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
    setAvailableCredits((prev) => prev + amount);
  };

  /**
   * Reset the state of the lab
   */
  const resetLab = (): void => {
    // Clean up object URLs to prevent memory leaks
    uploadedImages.forEach((img) => {
      if (img.url.startsWith("blob:")) {
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
    setDebugInfo((prev) => ({
      ...prev,
      testModeChange: {
        enabled,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  /**
   * Set simulation mode
   * @param enabled - Whether simulation mode should be enabled
   */
  const setSimulationMode = (enabled: boolean): void => {
    setIsSimulationMode(enabled);

    // Log simulation mode change to debug info
    setDebugInfo((prev) => ({
      ...prev,
      simulationModeChange: {
        enabled,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  /**
   * Test API connection to OpenAI
   * @returns Promise resolving to true if successful, false if failed
   */
  const testApiConnection = async (): Promise<boolean> => {
    try {
      console.log(`Testing OpenAI gpt-image-01 API connection`);

      // Add test info to debug
      setDebugInfo((prev) => ({
        ...prev,
        apiConnectionTest: {
          endpoint: "/api/openai/test-connection",
          timestamp: new Date().toISOString(),
          status: "pending",
          model: "gpt-image-01",
        },
      }));

      // Skip the actual API call in simulation mode
      if (isSimulationMode) {
        console.log("Simulation mode active - skipping actual API call");

        // Update debug info for simulation
        setDebugInfo((prev) => ({
          ...prev,
          apiConnectionTest: {
            ...prev.apiConnectionTest,
            status: "simulated",
            simulated: true,
          },
        }));

        return true;
      }

      // Test OpenAI connection through server endpoint
      const response = await fetch("/api/openai/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          model: "gpt-image-01",
          timestamp: new Date().toISOString(),
        }),
      });

      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        apiConnectionTest: {
          ...prev.apiConnectionTest,
          status: response.ok ? "success" : "error",
          statusCode: response.status,
          statusText: response.statusText,
          response: response.ok ? "success" : "failed",
        },
      }));

      if (!response.ok) {
        // If the API test fails, enable simulation mode
        setSimulationMode(true);
        console.log("API test failed. Enabling simulation mode.");
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
      setSimulationMode(true);
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