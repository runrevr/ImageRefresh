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

// Constants for transformation types
export const TRANSFORMATION_TYPES = {
  REMOVE_BACKGROUND: 'remove-background',
  ENHANCE_LIGHTING: 'enhance-lighting',
  LIFESTYLE_CONTEXT: 'lifestyle-context',
  SOCIAL_MEDIA_READY: 'social-media-ready',
  E_COMMERCE_PACK: 'e-commerce-pack',
  SEASONAL_THEME: 'seasonal-theme',
};

// Sample enhancement options (to be replaced with dynamic data from backend)
export const ENHANCEMENT_OPTIONS = [
  {
    id: TRANSFORMATION_TYPES.REMOVE_BACKGROUND,
    name: 'Remove Background',
    description: 'Isolate product with clean white background and subtle shadow',
    industry: 'all',
    creditCost: 1,
    prompt: 'Remove the background from this product image and replace it with a clean white background. Add a subtle shadow beneath the product for depth. Ensure the product edges are crisp and well-defined.'
  },
  {
    id: TRANSFORMATION_TYPES.ENHANCE_LIGHTING,
    name: 'Enhance Lighting',
    description: 'Improve product visibility with professional studio lighting',
    industry: 'all',
    creditCost: 1,
    prompt: 'Enhance this product image with professional studio lighting. Add soft key lights to highlight the product\'s best features, rim lighting to define edges, and fill lights to soften shadows. Enhance colors for better vibrancy while maintaining natural appearance.'
  },
  {
    id: TRANSFORMATION_TYPES.LIFESTYLE_CONTEXT,
    name: 'Lifestyle Context',
    description: 'Place product in realistic lifestyle setting',
    industry: 'all',
    creditCost: 2,
    prompt: 'Place this product in a natural lifestyle environment. Integrate it seamlessly with realistic shadows and reflections that match the environment\'s lighting. Ensure the product remains the focal point while the setting provides context and atmosphere.'
  },
  {
    id: TRANSFORMATION_TYPES.SOCIAL_MEDIA_READY,
    name: 'Social Media Ready',
    description: 'Optimize for social media with trendy elements and space for text',
    industry: 'all',
    creditCost: 2,
    prompt: 'Transform this product into a highly shareable, scroll-stopping image optimized for social media. Create a visually striking composition with vibrant colors, perfect for Instagram or Pinterest. Add stylish negative space for text overlay and ensure the product pops against a carefully designed background.'
  },
  {
    id: TRANSFORMATION_TYPES.E_COMMERCE_PACK,
    name: 'E-commerce Pack',
    description: 'Create multiple angles/views optimized for online stores',
    industry: 'retail,fashion,home goods',
    creditCost: 3,
    prompt: 'Create a professional e-commerce presentation of this product. Generate multiple angles of the same product optimized for online stores, including front view, side view, and detail shots. Use consistent lighting and a clean background suitable for e-commerce platforms.'
  },
  {
    id: TRANSFORMATION_TYPES.SEASONAL_THEME,
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
 * @param {Object} options - Configuration options
 * @param {number} options.initialCredits - Initial number of credits available
 * @param {Function} options.onCreditChange - Callback when credits change
 * @returns {Object} Methods and state for image transformations
 */
export const useProductImageLab = (options = {}) => {
  const { 
    initialCredits = 10,
    onCreditChange = () => {}
  } = options;
  
  const [availableCredits, setAvailableCredits] = useState(initialCredits);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [transformedImages, setTransformedImages] = useState([]);
  
  // Update the parent component when credits change
  useEffect(() => {
    onCreditChange(availableCredits);
  }, [availableCredits, onCreditChange]);
  
  /**
   * Handle file uploads
   * @param {FileList} files - Files from input element
   * @returns {Promise<Array>} - Array of uploaded image objects
   */
  const handleImageUpload = async (files) => {
    try {
      setError(null);
      const imageFiles = Array.from(files);
      
      // Process each file to get a URL and metadata
      const processedImages = imageFiles.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }));
      
      setUploadedImages(prev => [...prev, ...processedImages]);
      return processedImages;
    } catch (err) {
      setError('Error uploading images: ' + err.message);
      console.error('Error uploading images:', err);
      return [];
    }
  };
  
  /**
   * Get available enhancements for a specific industry
   * @param {string} industry - Industry name
   * @returns {Array} - Filtered enhancement options
   */
  const getEnhancementsForIndustry = (industry) => {
    if (!industry) return ENHANCEMENT_OPTIONS;
    
    return ENHANCEMENT_OPTIONS.filter(option => 
      option.industry === 'all' || 
      option.industry.split(',').some(ind => industry.toLowerCase().includes(ind))
    );
  };
  
  /**
   * Process image transformation
   * @param {Object} params - Transformation parameters
   * @param {string} params.imageId - ID of the image to transform
   * @param {string} params.transformationType - Type of transformation to apply
   * @param {string} params.customPrompt - Optional custom prompt overriding the default
   * @returns {Promise<Object>} - Transformed image result
   */
  const transformImage = async (params) => {
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
    
    // Check if user has enough credits
    if (availableCredits < transformOption.creditCost) {
      throw new Error(`Not enough credits. Required: ${transformOption.creditCost}, Available: ${availableCredits}`);
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // In a real implementation, this would call an API endpoint
      // For demonstration purposes, we'll use a timeout to simulate processing
      
      // Prepare the form data that would be sent to an API
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('prompt', customPrompt || transformOption.prompt);
      formData.append('transformationType', transformationType);
      
      // This would be where the API call happens in a real implementation
      // const response = await fetch('/api/transform-image', {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock result (in production, would be from the API response)
      const result = {
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
      
      // Deduct credits
      setAvailableCredits(prev => prev - transformOption.creditCost);
      
      // Add to transformed images
      setTransformedImages(prev => [...prev, result]);
      
      return result;
    } catch (err) {
      setError('Error transforming image: ' + err.message);
      console.error('Error transforming image:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Process multiple transformations at once
   * @param {Array} transformations - Array of transformation requests
   * @returns {Promise<Array>} - Results of all transformations
   */
  const batchTransformImages = async (transformations) => {
    // Calculate total credit cost
    const totalCreditCost = transformations.reduce((total, transform) => {
      const option = ENHANCEMENT_OPTIONS.find(opt => opt.id === transform.transformationType);
      return total + (option?.creditCost || 0);
    }, 0);
    
    // Check if user has enough credits
    if (availableCredits < totalCreditCost) {
      throw new Error(`Not enough credits. Required: ${totalCreditCost}, Available: ${availableCredits}`);
    }
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // Process each transformation sequentially
      const results = [];
      for (const transform of transformations) {
        const result = await transformImage(transform);
        results.push(result);
      }
      
      return results;
    } catch (err) {
      setError('Error processing batch transformations: ' + err.message);
      console.error('Error processing batch transformations:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Add credits to the user's account
   * @param {number} amount - Number of credits to add
   */
  const addCredits = (amount) => {
    if (!amount || amount <= 0) return;
    setAvailableCredits(prev => prev + amount);
  };
  
  /**
   * Reset the state of the lab
   */
  const resetLab = () => {
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
  };
  
  return {
    // State
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    
    // Methods
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab,
    
    // Constants
    enhancementOptions: ENHANCEMENT_OPTIONS,
  };
};

export default useProductImageLab;