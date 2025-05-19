import React, { useState, useEffect, useRef } from 'react';
import { 
  useProductImageLab, 
  ENHANCEMENT_OPTIONS, 
  TransformationType,
  TransformationOption,
  UploadedImage,
  TransformationResult,
  TransformationRequest
} from '../../hooks/product-lab/product-image-lab';
// Note: You may need to create this CSS file or adjust the import path
import '../../product-image-lab.css';

// Types
interface ProductImageLabProps {
  isVisible: boolean;
  onClose: () => void;
  initialCredits?: number;
  onCreditChange?: (credits: number) => void;
  webhookUrl?: string;
  maxUploads?: number;
}

interface TabState {
  activeTab: 'upload' | 'generate';
}

interface TransformationSelection {
  [imageId: string]: TransformationType[];
}

const ProductImageLab = ({
  isVisible = false,
  onClose,
  initialCredits = 10,
  onCreditChange,
  webhookUrl = '/api/webhooks/transform-image',
  maxUploads = 5
}: ProductImageLabProps) => {
  // State management
  const [tabState, setTabState] = useState<TabState>({ activeTab: 'upload' });
  const [industry, setIndustry] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [generationPrompt, setGenerationPrompt] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(3);
  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'normal' | 'loading' | 'success' | 'error'>('normal');
  const [selections, setSelections] = useState<TransformationSelection>({});
  const [creditsRequired, setCreditsRequired] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const generateFormRef = useRef<HTMLFormElement>(null);
  
  // Initialize product image lab hook
  const {
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab
  } = useProductImageLab({ 
    initialCredits,
    onCreditChange: (newCredits: number): void => {
      if (onCreditChange) {
        onCreditChange(newCredits);
      }
    },
    webhookUrl
  });
  
  // Update status when there's an error or processing change
  useEffect(() => {
    if (error) {
      setStatus(`Error: ${error}`);
      setStatusType('error');
    } else if (isProcessing) {
      setStatus('Processing your request...');
      setStatusType('loading');
    }
  }, [error, isProcessing]);
  
  // Handle tab switching
  const switchTab = (tab: 'upload' | 'generate'): void => {
    setTabState({ activeTab: tab });
  };
  
  // Handle file upload button click
  const triggerFileUpload = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process uploaded files
  const processUploadedFiles = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) {
      setStatus('No files selected');
      return;
    }
    
    if (files.length > maxUploads) {
      setStatus(`Maximum ${maxUploads} files allowed`);
      setStatusType('error');
      return;
    }
    
    setStatus('Processing uploaded images...');
    setStatusType('loading');
    
    try {
      await handleImageUpload(files);
      setStatus('Images uploaded successfully');
      setStatusType('success');
      setShowOptions(true);
    } catch (err) {
      setStatus(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusType('error');
    }
  };
  
  // Handle upload form submission
  const handleUploadSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!industry) {
      setStatus('Please enter your industry or business type');
      setStatusType('error');
      return;
    }
    
    if (fileInputRef.current?.files) {
      await processUploadedFiles(fileInputRef.current.files);
    } else {
      setStatus('Please select files to upload');
      setStatusType('error');
    }
  };
  
  // Handle image generation form submission
  const handleGenerateSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!industry) {
      setStatus('Please enter your industry or business type');
      setStatusType('error');
      return;
    }
    
    if (!generationPrompt) {
      setStatus('Please describe the product image you want to generate');
      setStatusType('error');
      return;
    }
    
    setStatus('Generating images...');
    setStatusType('loading');
    setProcessing(true);
    
    try {
      // Normally this would call an API endpoint to generate images
      // For now, we'll simulate image generation with a delay
      
      // This would be replaced with actual API call to generate images
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create placeholder generated images for demonstration
      const generatedFiles = [];
      const dummyFileList = {
        length: 0,
        item: (index: number) => null,
        [Symbol.iterator]: function* () {
          for (let i = 0; i < this.length; i++) {
            yield this[i];
          }
        }
      } as FileList;
      
      for (let i = 0; i < numImages; i++) {
        const placeholderUrl = `https://via.placeholder.com/500x500/f0f0f0/333333?text=Generated+Image+${i+1}`;
        
        // Create a blob from placeholder
        try {
          const response = await fetch(placeholderUrl);
          const blob = await response.blob();
          const file = new File([blob], `generated-image-${i+1}.jpg`, { type: 'image/jpeg' });
          generatedFiles.push(file);
          Object.defineProperty(dummyFileList, i.toString(), {
            value: file,
            writable: false
          });
          Object.defineProperty(dummyFileList, 'length', {
            value: i + 1,
            writable: true
          });
        } catch (err) {
          console.error("Error creating placeholder image:", err);
        }
      }
      
      // Process the generated files if we have any
      if (dummyFileList.length > 0) {
        await handleImageUpload(dummyFileList);
      } else {
        throw new Error("Failed to create placeholder images");
      }
      
      setStatus('Images generated successfully');
      setStatusType('success');
      setShowOptions(true);
      setProcessing(false);
    } catch (err) {
      setStatus(`Image generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusType('error');
      setProcessing(false);
    }
  };
  
  // Toggle selection of a transformation option
  const toggleOptionSelection = (imageId: string, optionId: TransformationType): void => {
    setSelections(prevSelections => {
      const newSelections = { ...prevSelections };
      
      if (!newSelections[imageId]) {
        newSelections[imageId] = [optionId];
      } else if (newSelections[imageId].includes(optionId)) {
        newSelections[imageId] = newSelections[imageId].filter(id => id !== optionId);
        if (newSelections[imageId].length === 0) {
          delete newSelections[imageId];
        }
      } else {
        newSelections[imageId] = [...newSelections[imageId], optionId];
      }
      
      return newSelections;
    });
  };
  
  // Calculate required credits based on selections
  useEffect(() => {
    let totalCredits = 0;
    
    Object.entries(selections).forEach(([imageId, optionIds]) => {
      optionIds.forEach(optionId => {
        const option = ENHANCEMENT_OPTIONS.find((opt: TransformationOption) => opt.id === optionId);
        if (option) {
          totalCredits += option.creditCost;
        }
      });
    });
    
    setCreditsRequired(totalCredits);
  }, [selections]);
  
  // Process selected transformations
  const processTransformations = async (): Promise<void> => {
    if (Object.keys(selections).length === 0) {
      setStatus('Please select at least one transformation option');
      setStatusType('error');
      return;
    }
    
    if (creditsRequired > availableCredits) {
      setStatus(`Not enough credits. Required: ${creditsRequired}, Available: ${availableCredits}`);
      setStatusType('error');
      return;
    }
    
    setStatus('Processing transformations...');
    setStatusType('loading');
    setProcessing(true);
    
    try {
      // Prepare transformation requests
      const transformationRequests: TransformationRequest[] = [];
      
      for (const [imageId, optionIds] of Object.entries(selections)) {
        for (const optionId of optionIds) {
          transformationRequests.push({
            imageId,
            transformationType: optionId,
          });
        }
      }
      
      // Process transformations in batch
      await batchTransformImages(transformationRequests);
      
      setStatus('Transformations completed successfully');
      setStatusType('success');
      setShowResults(true);
      setProcessing(false);
    } catch (err) {
      setStatus(`Transformation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatusType('error');
      setProcessing(false);
    }
  };
  
  // Reset component
  const resetComponent = (): void => {
    resetLab();
    setIndustry('');
    setAdditionalInfo('');
    setGenerationPrompt('');
    setNumImages(3);
    setStatus('');
    setStatusType('normal');
    setSelections({});
    setCreditsRequired(0);
    setShowOptions(false);
    setShowResults(false);
    
    if (uploadFormRef.current) {
      uploadFormRef.current.reset();
    }
    
    if (generateFormRef.current) {
      generateFormRef.current.reset();
    }
  };
  
  // Don't render if not visible
  if (!isVisible) return null;
  
  return (
    <div className="product-lab-container">
      <div className="product-lab-header">
        <div className="product-lab-flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="product-lab-title">Product Image Lab</h1>
          <button 
            className="product-lab-button product-lab-button-default" 
            onClick={onClose}
            style={{ marginLeft: 'auto' }}
          >
            Close
          </button>
        </div>
        <p className="product-lab-subtitle">Transform and enhance your product images with AI</p>
      </div>
      
      <div className="product-lab-card">
        <div className="product-lab-credit-info">
          <p>You have <strong>{availableCredits}</strong> credits remaining.</p>
          <p>Credits required for selected transformations: <strong>{creditsRequired}</strong></p>
          {creditsRequired > availableCredits && (
            <p className="product-lab-credit-warning">
              You don't have enough credits. Please reduce your selections or purchase more credits.
            </p>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="product-lab-flex" style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <button 
            className={`product-lab-button ${tabState.activeTab === 'upload' ? 'product-lab-button-primary' : 'product-lab-button-default'}`}
            onClick={() => switchTab('upload')}
            style={{ marginRight: '10px', borderRadius: '4px 4px 0 0' }}
          >
            Upload Images
          </button>
          <button 
            className={`product-lab-button ${tabState.activeTab === 'generate' ? 'product-lab-button-primary' : 'product-lab-button-default'}`}
            onClick={() => switchTab('generate')}
            style={{ borderRadius: '4px 4px 0 0' }}
          >
            Generate Images
          </button>
        </div>
        
        {/* Upload Tab Content */}
        {tabState.activeTab === 'upload' && (
          <div>
            <form ref={uploadFormRef} onSubmit={handleUploadSubmit}>
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="industry">Your Industry or Business Type</label>
                <input 
                  id="industry"
                  type="text" 
                  className="product-lab-input"
                  placeholder="e.g., Organic Food Delivery, Luxury Watches, Pet Photography"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
                <p className="product-lab-help-text">Be specific about your business type for better results</p>
              </div>
              
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="additional-info">Additional Information (optional)</label>
                <textarea 
                  id="additional-info"
                  className="product-lab-textarea"
                  placeholder="e.g., target market, branding style, specific product requirements"
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
                <p className="product-lab-help-text">Any details that would help generate better options</p>
              </div>
              
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="product-images">Upload Product Images</label>
                <div 
                  className="product-lab-upload-area"
                  onClick={triggerFileUpload}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto', color: '#6b7280' }}>
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                    <path d="M12 12v9"></path>
                    <path d="m16 16-4-4-4 4"></path>
                  </svg>
                  <p>Drag and drop your product images here<br/>or click to browse</p>
                  <p className="product-lab-help-text">Maximum {maxUploads} images, high-quality for best results</p>
                </div>
                <input 
                  id="product-images"
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  onChange={(e) => processUploadedFiles(e.target.files)}
                  style={{ display: 'none' }}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="product-lab-button product-lab-button-primary"
                disabled={processing}
              >
                Process Images
              </button>
            </form>
          </div>
        )}
        
        {/* Generate Tab Content */}
        {tabState.activeTab === 'generate' && (
          <div>
            <form ref={generateFormRef} onSubmit={handleGenerateSubmit}>
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="generate-industry">Your Industry or Business Type</label>
                <input 
                  id="generate-industry"
                  type="text" 
                  className="product-lab-input"
                  placeholder="e.g., Organic Food Delivery, Luxury Watches, Pet Photography"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
                <p className="product-lab-help-text">Be specific about your business type for better results</p>
              </div>
              
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="generate-additional-info">Additional Business Context (optional)</label>
                <textarea 
                  id="generate-additional-info"
                  className="product-lab-textarea"
                  placeholder="e.g., target market, branding style, color scheme preferences"
                  rows={2}
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
                <p className="product-lab-help-text">Any details that would help generate better images</p>
              </div>
              
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="generation-prompt">Product Description</label>
                <textarea 
                  id="generation-prompt"
                  className="product-lab-textarea"
                  placeholder="Describe the product image you'd like to generate in detail..."
                  rows={4}
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  required
                />
                <p className="product-lab-help-text">Be as detailed as possible for the best results</p>
              </div>
              
              <div className="product-lab-form-group">
                <label className="product-lab-label" htmlFor="num-images">Number of Images to Generate</label>
                <select 
                  id="num-images"
                  className="product-lab-select"
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                >
                  <option value="1">1 Image (1 credit)</option>
                  <option value="2">2 Images (2 credits)</option>
                  <option value="3">3 Images (3 credits)</option>
                  <option value="4">4 Images (4 credits)</option>
                </select>
                <p className="product-lab-help-text">Each image costs 1 credit</p>
              </div>
              
              <button 
                type="submit" 
                className="product-lab-button product-lab-button-primary"
                disabled={processing}
              >
                Generate Images
              </button>
            </form>
          </div>
        )}
        
        {/* Status Message */}
        {status && (
          <div className={`product-lab-status product-lab-status-${statusType}`}>
            {status}
          </div>
        )}
        
        {/* Transformation Options */}
        {showOptions && uploadedImages.length > 0 && (
          <div className="product-lab-result-section">
            <h2>Your Uploaded Images</h2>
            <div className="product-lab-grid">
              {uploadedImages.map((image) => (
                <div key={image.id} className="product-lab-image-card">
                  <img src={image.url} alt={image.name} />
                  <div className="product-lab-image-card-content">
                    <h3>{image.name}</h3>
                    <p>Uploaded: {new Date(image.uploadedAt).toLocaleString()}</p>
                    
                    <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Available Enhancements</h4>
                    {getEnhancementsForIndustry(industry).map((option) => (
                      <div 
                        key={option.id} 
                        className="product-lab-form-group" 
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <label className="product-lab-flex" style={{ alignItems: 'center', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            style={{ marginRight: '0.5rem' }}
                            checked={selections[image.id]?.includes(option.id) || false}
                            onChange={() => toggleOptionSelection(image.id, option.id)}
                          />
                          <div>
                            <strong>{option.name}</strong> ({option.creditCost} credit{option.creditCost > 1 ? 's' : ''})
                            <p className="product-lab-help-text" style={{ margin: '0' }}>{option.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                className="product-lab-button product-lab-button-primary"
                onClick={processTransformations}
                disabled={Object.keys(selections).length === 0 || processing}
              >
                Process Selected Enhancements
              </button>
              <button 
                className="product-lab-button product-lab-button-default"
                onClick={resetComponent}
                disabled={processing}
              >
                Reset
              </button>
            </div>
          </div>
        )}
        
        {/* Transformation Results */}
        {showResults && transformedImages.length > 0 && (
          <div className="product-lab-result-section">
            <h2>Transformation Results</h2>
            <div className="product-lab-grid">
              {transformedImages.map((result) => (
                <div key={result.id} className="product-lab-image-card">
                  <img src={result.transformedImageUrl} alt={`Transformed ${result.originalImage.name}`} />
                  <div className="product-lab-image-card-content">
                    <h3>{result.transformationName}</h3>
                    <p>Applied to: {result.originalImage.name}</p>
                    <div className="product-lab-flex" style={{ marginTop: '1rem' }}>
                      <span className="product-lab-tag">Credit Cost: {result.creditCost}</span>
                      <span className="product-lab-tag">{new Date(result.completedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button 
                className="product-lab-button product-lab-button-success"
                onClick={() => {
                  // Download functionality would go here
                  alert('Download functionality would be implemented here.');
                }}
              >
                Download All
              </button>
              <button 
                className="product-lab-button product-lab-button-default"
                onClick={resetComponent}
              >
                Start New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageLab;