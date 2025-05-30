/**
 * FixedProductImageLab.tsx
 * A simplified version of the Product Image Lab with fixes for:
 * 1. Credit system (preventing duplicate deductions)
 * 2. Error handling (graceful recovery from API errors)
 * 3. Test mode functionality
 */

import { useState, useEffect, useRef } from 'react';
import { 
  useProductImageLab, 
  ENHANCEMENT_OPTIONS, 
  TransformationType,
  TransformationOption,
  UploadedImage,
  TransformationResult
} from '../product-image-lab';
import '../product-image-lab.css';
import { useToast } from '@/hooks/use-toast';
import WebhookTester from './WebhookTester';
import { useCredits } from '@/hooks/useCredits';

// Types
interface TabState {
  activeTab: 'upload' | 'generate';
}

interface TransformationSelection {
  [imageId: string]: string[];
}

interface ProductImageLabProps {
  initialCredits?: number;
  onCreditChange?: (credits: number) => void;
  testMode?: boolean;
}

/**
 * Product Image Lab Component
 * A simplified version with fixes for credit system and error handling
 */
export default function FixedProductImageLab({ 
  initialCredits = 10, 
  onCreditChange = () => {}, 
  testMode = false 
}: ProductImageLabProps) {
  const { toast } = useToast();

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Admin panel states
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [adminTestMode, setAdminTestMode] = useState<boolean>(testMode);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});

  // Check URL for debug mode parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('debug') === 'true') {
        setShowDebugInfo(true);
      }
    }
  }, []);

  // Get user credits using consistent method
  const [userCredits, setUserCredits] = useState<{
    totalCredits: number;
    paidCredits: number;
    freeCreditsUsed: boolean;
  }>({ totalCredits: 0, paidCredits: 0, freeCreditsUsed: true });

  // Fetch user credits when user changes
  useEffect(() => {
    // Assuming you have a way to get the user ID (e.g., from context or props)
    // Replace 'user.id' with the actual way to get the user ID
    const userId = 'user-id-placeholder'; // Replace with actual user ID
    if (userId) {
      fetch(`/api/credits/${userId}`)
        .then(res => res.json())
        .then(data => {
          setUserCredits({
            totalCredits: data.totalCredits || data.credits || 0,
            paidCredits: data.paidCredits || 0,
            freeCreditsUsed: data.freeCreditsUsed || false
          });
        })
        .catch(error => {
          console.error('Error fetching credits:', error);
        });
    }
  }, []);

  // Initialize product image lab hook
  const {
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    isTestModeEnabled,
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab,
    setTestMode
  } = useProductImageLab({ 
    initialCredits,
    onCreditChange,
    testMode: adminTestMode,
    webhookUrl: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9',
    optionsEndpoint: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/options',
    selectionsEndpoint: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/selections',
    resultsEndpoint: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/results',
    generateEndpoint: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/generate'
  });

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);

  // Update status when lab is processing or encounters an error
  useEffect(() => {
    if (isProcessing) {
      setStatus('Processing your images. This may take a moment...');
      setStatusType('loading');
    } else if (error) {
      setStatus(`Error: ${error}`);
      setStatusType('error');

      // Show toast for errors
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    } else {
      setStatus('');
      setStatusType('normal');
    }
  }, [isProcessing, error, toast]);

  // Toggle admin panel (dev-only feature)
  const toggleAdminPanel = () => {
    setShowAdminPanel(prev => !prev);
  };

  // Toggle test mode (admin feature)
  const toggleTestMode = (enabled: boolean) => {
    setAdminTestMode(enabled);
    setTestMode(enabled);

    toast({
      title: enabled ? "Test Mode Enabled" : "Test Mode Disabled",
      description: enabled ? "Credit checks will be bypassed" : "Normal credit checks restored",
      variant: enabled ? "default" : "default"
    });
  };

  // Reset the lab (admin feature)
  const handleResetLab = () => {
    resetLab();
    setSelections({});
    setShowOptions(false);
    setShowResults(false);

    toast({
      title: "Lab Reset",
      description: "Product Image Lab has been reset",
    });
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Limit number of uploads
      if (uploadedImages.length + files.length > 5) {
        toast({
          title: "Upload Limit",
          description: `You can upload a maximum of 5 images. Please remove some images first.`,
          variant: "destructive"
        });
        return;
      }

      setStatusType('loading');
      setStatus('Uploading images...');

      const uploaded = await handleImageUpload(files);

      setStatus(`Successfully uploaded ${uploaded.length} image${uploaded.length !== 1 ? 's' : ''}`);
      setStatusType('success');

      if (uploaded.length > 0) {
        setShowOptions(true);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setStatus(`Error uploading files: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
    }
  };

  // Handle industry selection
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIndustry(e.target.value);
  };

  // Toggle transformation selection
  const toggleTransformation = (imageId: string, transformationType: string) => {
    setSelections(prev => {
      const currentSelections = prev[imageId] || [];
      const updatedSelections = currentSelections.includes(transformationType)
        ? currentSelections.filter(t => t !== transformationType)
        : [...currentSelections, transformationType];

      return {
        ...prev,
        [imageId]: updatedSelections
      };
    });
  };

  // Calculate required credits based on selections
  useEffect(() => {
    let total = 0;

    Object.values(selections).forEach(transformationTypes => {
      transformationTypes.forEach(type => {
        const option = ENHANCEMENT_OPTIONS.find(o => o.id === type);
        if (option) {
          total += option.creditCost;
        }
      });
    });

    setCreditsRequired(total);
  }, [selections]);

  // Apply selected transformations
  const applyTransformations = async () => {
    if (Object.keys(selections).length === 0) {
      toast({
        title: "No Selections",
        description: "Please select at least one enhancement to apply",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create transformation requests from selections
      const requests: Array<{ imageId: string, transformationType: TransformationType, customPrompt?: string }> = [];

      Object.entries(selections).forEach(([imageId, transformationTypes]) => {
        transformationTypes.forEach(type => {
          requests.push({
            imageId,
            transformationType: type as TransformationType,
            // Add industry or additional info to prompt if provided
            customPrompt: industry || additionalInfo 
              ? `${ENHANCEMENT_OPTIONS.find(o => o.id === type)?.prompt || ''} Industry: ${industry}. ${additionalInfo}`
              : undefined
          });
        });
      });

      setProcessing(true);
      setStatusType('loading');
      setStatus('Processing transformations. This may take a moment...');

      // Process all transformations in sequence
      for (const request of requests) {
        await transformImage(request);
      }

      setProcessing(false);
      setShowResults(true);
      setStatusType('success');
      setStatus('All transformations completed successfully!');

      // Reset selections after processing
      setSelections({});

    } catch (error) {
      console.error('Error applying transformations:', error);

      setProcessing(false);
      setStatusType('error');
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred during transformation'}`);

      toast({
        title: "Transformation Error",
        description: error instanceof Error ? error.message : 'An error occurred during transformation',
        variant: "destructive"
      });
    }
  };
    // Fetch credits using the useCredits hook
    const creditsData = useCredits();

  return (
    <div className="product-lab-container">
      <div className="product-lab-header">
        <h1 className="product-lab-title">Product Image Lab</h1>
        <p className="product-lab-subtitle">Transform your product images with AI-powered enhancements</p>

        {/* Double-click to show admin panel (developer feature) */}
        <div 
          onDoubleClick={toggleAdminPanel}
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            padding: '5px',
            cursor: 'default'
          }}
        >
          {/* Test mode indicator */}
          {isTestModeEnabled && (
            <div style={{ 
              background: '#ff9800', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              TEST MODE
            </div>
          )}
        </div>

        {/* Credits display */}
        <div className="product-lab-credits">
          Available Credits: <span className="product-lab-credits-value">{availableCredits}</span>
        </div>
      </div>

      {/* Admin Panel (hidden by default) */}
      {showAdminPanel && (
        <div className="product-lab-card" style={{ marginBottom: '1rem', background: '#f8f8f8', borderLeft: '4px solid #ddd' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Admin Controls</h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Test Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="test-mode-toggle" style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                Test Mode:
              </label>
              <input 
                id="test-mode-toggle"
                type="checkbox" 
                checked={adminTestMode} 
                onChange={(e) => toggleTestMode(e.target.checked)}
              />
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                (Credit checks will be bypassed)
              </span>
            </div>

            {/* Webhook Tester */}
            <div style={{ width: '100%', margin: '1rem 0' }}>
              <WebhookTester 
                webhookUrl="https://www.n8nemma.live/webhook-dbf2c53a"
                onResult={(success, data) => {
                  if (success) {
                    setDebugInfo(prev => ({
                      ...prev,
                      webhookTest: {
                        success: true,
                        data,
                        timestamp: new Date().toISOString()
                      }
                    }));
                  } else {
                    setDebugInfo(prev => ({
                      ...prev,
                      webhookTest: {
                        success: false,
                        error: data,
                        timestamp: new Date().toISOString()
                      }
                    }));
                  }
                }}
              />
            </div>

            {/* Debug Info Section */}
            {showDebugInfo && (
              <div style={{ width: '100%', marginTop: '1rem' }}>
                <h4 style={{ margin: '0.5rem 0', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>N8N Webhook Configuration</h4>
                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <div><strong>Main Webhook URL:</strong> https://www.n8nemma.live/webhook-dbf2c53a</div>
                  <div><strong>Options Endpoint:</strong> https://www.n8nemma.live/webhook-options-dbf2c53a</div>
                  <div><strong>Selections Endpoint:</strong> https://www.n8nemma.live/webhook-selections-dbf2c53a</div>
                  <div><strong>Results Endpoint:</strong> https://www.n8nemma.live/webhook-results-dbf2c53a</div>
                  <div><strong>Generate Endpoint:</strong> https://www.n8nemma.live/webhook-generate-dbf2c53a</div>
                </div>

                <h4 style={{ margin: '0.5rem 0', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Debug Information</h4>
                <div style={{ 
                  background: '#f0f0f0', 
                  padding: '1rem', 
                  borderRadius: '4px', 
                  maxHeight: '300px', 
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  whiteSpace: 'pre-wrap'
                }}>
                  {JSON.stringify(debugInfo, null, 2) || 'No debug information available yet. Use the "Test N8N Connection" button to populate this section.'}
                </div>
              </div>
            )}

            {/* Reset Lab Button */}
            <button 
              className="product-lab-button product-lab-button-default"
              onClick={handleResetLab}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', marginRight: '0.5rem' }}
            >
              Reset Lab
            </button>

            {/* Test N8N Connection Button */}
            <button 
              className="product-lab-button product-lab-button-default"
              onClick={() => {
                setStatusType('loading');
                setStatus('Testing connection to N8N webhook...');

                // For debugging
                console.log('Testing N8N webhook connection to:', 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/test');

                // Test the N8N webhook connection
                fetch('https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/test', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  mode: 'cors',
                  credentials: 'include',
                  body: JSON.stringify({ test: true })
                })
                .then(response => {
                  console.log('N8N webhook test response status:', response.status);

                  if (response.ok) {
                    setStatusType('success');
                    setStatus('Successfully connected to N8N webhook!');
                    toast({
                      title: "Connection Successful",
                      description: "Connected to N8N webhook service"
                    });
                  } else {
                    setStatusType('error');
                    setStatus(`Connection failed with status: ${response.status}`);
                    toast({
                      title: "Connection Failed",
                      description: `Failed to connect to N8N webhook: ${response.statusText}`,
                      variant: "destructive"
                    });
                  }

                  // Store results in debug info
                  setDebugInfo(prev => ({
                    ...prev,
                    n8nTestConnection: {
                      url: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/test',
                      status: response.status,
                      statusText: response.statusText,
                      timestamp: new Date().toISOString()
                    }
                  }));
                })
                .catch(error => {
                  console.error('N8N connection test failed:', error);
                  setStatusType('error');
                  setStatus('Unable to connect to N8N webhook. Check browser console for details.');
                  toast({
                    title: "Connection Error",
                    description: "Failed to connect to N8N webhook. This could be due to CORS restrictions.",
                    variant: "destructive"
                  });

                  // Store error in debug info
                  setDebugInfo(prev => ({
                    ...prev,
                    n8nTestError: {
                      url: 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9/test',
                      error: error instanceof Error ? error.message : 'Unknown error',
                      timestamp: new Date().toISOString()
                    }
                  }));
                });
              }}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem', marginRight: '0.5rem' }}
            >
              Test N8N Connection
            </button>

            {/* Toggle Debug Info Button */}
            <button 
              className="product-lab-button product-lab-button-default"
              onClick={() => setShowDebugInfo(prev => !prev)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
            >
              {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="product-lab-tabs">
        <button 
          className={`product-lab-tab ${tabState.activeTab === 'upload' ? 'product-lab-tab-active' : ''}`}
          onClick={() => setTabState({ activeTab: 'upload' })}
        >
          Upload Images
        </button>
        <button 
          className={`product-lab-tab ${tabState.activeTab === 'generate' ? 'product-lab-tab-active' : ''}`}
          onClick={() => setTabState({ activeTab: 'generate' })}
          disabled={true} // Temporarily disabled
        >
          Generate Images
        </button>
      </div>

      {/* Main Content Area */}
      <div className="product-lab-content">
        {/* Upload Tab */}
        {tabState.activeTab === 'upload' && (
          <div className="product-lab-card">
            <h2>Upload Product Images</h2>
            <p>Upload product images to enhance with AI transformations.</p>

            {/* Upload Form */}
            <form ref={uploadFormRef} className="product-lab-form">
              <div className="product-lab-form-group">
                <label htmlFor="product-images">Product Images:</label>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  id="product-images" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <div className="product-lab-form-help">
                  Upload up to 5 images (PNG, JPG)
                </div>
              </div>

              <div className="product-lab-form-group">
                <label htmlFor="industry">Industry (Optional):</label>
                <select 
                  id="industry" 
                  value={industry} 
                  onChange={handleIndustryChange}
                  disabled={isProcessing}
                >
                  <option value="">Select Industry</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="electronics">Electronics</option>
                  <option value="home_decor">Home Decor</option>
                  <option value="beauty">Beauty & Cosmetics</option>
                  <option value="food">Food & Beverage</option>
                  <option value="sports">Sports & Fitness</option>
                  <option value="jewelry">Jewelry & Accessories</option>
                  <option value="toys">Toys & Games</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="product-lab-form-group">
                <label htmlFor="additional-info">Additional Information (Optional):</label>
                <textarea 
                  id="additional-info" 
                  value={additionalInfo} 
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Add any specific details about your products..."
                  rows={3}
                  disabled={isProcessing}
                />
              </div>
            </form>

            {/* Status Message */}
            {status && (
              <div className={`product-lab-status product-lab-status-${statusType}`}>
                {status}
              </div>
            )}

            {/* Uploaded Images Display */}
            {uploadedImages.length > 0 && (
              <div className="product-lab-uploaded-images">
                <h3>Uploaded Images</h3>
                <div className="product-lab-image-grid">
                  {uploadedImages.map(image => (
                    <div key={image.id} className="product-lab-image-item">
                      <img 
                        src={image.url} 
                        alt={`Product ${image.id}`} 
                        className="product-lab-image"
                      />
                      <div className="product-lab-image-info">
                        {image.file.name} ({Math.round(image.file.size / 1024)} KB)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhancement Options */}
            {showOptions && uploadedImages.length > 0 && (
              <div className="product-lab-enhancement-options">
                <h3>Enhancement Options</h3>
                <p>Select enhancements to apply to your images:</p>

                {/* Image selection tabs */}
                <div className="product-lab-image-tabs">
                  {uploadedImages.map((image, index) => (
                    <button 
                      key={image.id}
                      className={`product-lab-image-tab ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      Image {index + 1}
                    </button>
                  ))}
                </div>

                {/* Show only the selected image with its enhancement options */}
                {uploadedImages[selectedImageIndex] && (
                  <div className="product-lab-image-enhancements" style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                    <div className="product-lab-image-preview" style={{ flex: '0 0 200px' }}>
                      <img 
                        src={uploadedImages[selectedImageIndex].url} 
                        alt={`Product ${uploadedImages[selectedImageIndex].id}`} 
                        className="product-lab-image-small"
                        style={{ width: '100%', height: 'auto', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <div style={{ marginTop: '5px', fontSize: '0.9rem', color: '#666' }}>
                        {uploadedImages[selectedImageIndex].file.name}
                      </div>
                    </div>

                    <div className="product-lab-enhancement-list" style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                      {ENHANCEMENT_OPTIONS.map(option => (
                        <div 
                          key={option.id} 
                          className="product-lab-enhancement-option"
                          style={{ 
                            padding: '10px', 
                            border: '1px solid #ddd', 
                            borderRadius: '6px',
                            background: (selections[uploadedImages[selectedImageIndex].id] || []).includes(option.id) ? '#f0f7ff' : '#fff',
                            boxShadow: (selections[uploadedImages[selectedImageIndex].id] || []).includes(option.id) ? '0 0 0 2px #3e97ff' : 'none'
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                            <input 
                              type="checkbox" 
                              checked={(selections[uploadedImages[selectedImageIndex].id] || []).includes(option.id)}
                              onChange={() => toggleTransformation(uploadedImages[selectedImageIndex].id, option.id)}
                              disabled={isProcessing}
                              style={{ marginRight: '8px' }}
                            />
                            <span className="product-lab-enhancement-name" style={{ fontWeight: 'bold', flex: '1' }}>
                              {option.name}
                            </span>
                            <span className="product-lab-enhancement-cost" style={{ backgroundColor: '#3e97ff', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '0.8rem' }}>
                              {option.creditCost} credit{option.creditCost !== 1 ? 's' : ''}
                            </span>
                          </label>
                          <div className="product-lab-enhancement-description" style={{ fontSize: '0.9rem', color: '#555' }}>
                            {option.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credit Summary and Submit */}
                <div className="product-lab-credit-summary">
                  <div className="product-lab-credits-required">
                    Credits Required: <span>{creditsRequired}</span>
                  </div>
                  <div className="product-lab-credits-available">
                    Credits Available: <span>{availableCredits}</span>
                  </div>

                  <button 
                    className="product-lab-button product-lab-button-primary"
                    onClick={applyTransformations}
                    disabled={isProcessing || creditsRequired === 0 || (!isTestModeEnabled && creditsRequired > availableCredits)}
                  >
                    {isProcessing ? 'Processing...' : 'Apply Enhancements'}
                  </button>

                  {!isTestModeEnabled && creditsRequired > availableCredits && (
                    <div className="product-lab-credit-warning">
                      You don't have enough credits for the selected enhancements.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transformation Results */}
            {showResults && transformedImages.length > 0 && (
              <div className="product-lab-results">
                <h3>Transformation Results</h3>
                <div className="product-lab-image-grid">
                  {transformedImages.map(result => (
                    <div key={result.id} className="product-lab-result-item">
                      <div className="product-lab-image-comparison">
                        <div className="product-lab-image-before">
                          <div className="product-lab-image-label">Before</div>
                          <img 
                            src={result.originalImage.url} 
                            alt="Original" 
                            className="product-lab-image"
                          />
                        </div>

                        <div className="product-lab-image-after">
                          <div className="product-lab-image-label">After</div>
                          <img 
                            src={result.transformedImageUrl} 
                            alt="Transformed" 
                            className="product-lab-image"
                          />
                        </div>
                      </div>

                      <div className="product-lab-result-info">
                        <h4>{result.transformationName}</h4>
                        <p>Applied: {new Date(result.completedAt).toLocaleString()}</p>
                        <a 
                          href={result.transformedImageUrl} 
                          download={`transformed-${result.originalImageId}.png`}
                          className="product-lab-download-link"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab (Placeholder, to be implemented later) */}
        {tabState.activeTab === 'generate' && (
          <div className="product-lab-card">
            <h2>Generate Product Images</h2>
            <p>Create AI-generated product images from descriptions.</p>
            <div className="product-lab-coming-soon">
              This feature is coming soon!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}