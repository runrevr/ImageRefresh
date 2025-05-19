import { useState, useEffect, useRef } from 'react';
import { 
  useProductImageLab, 
  ENHANCEMENT_OPTIONS, 
  TransformationType,
  TransformationOption,
  UploadedImage,
  TransformationResult,
  TransformationRequest
} from '../product-image-lab';
import '../product-image-lab.css';
import Navbar from '@/components/Navbar';
import GlobalFooter from '@/components/Footer';
import ProductImageErrorBoundary from '@/components/ProductImageErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Types
interface TabState {
  activeTab: 'upload' | 'generate';
}

interface TransformationSelection {
  [imageId: string]: string[];
}

interface AuthCredits {
  free: number;
  paid: number;
}

/**
 * Error handler that logs errors and notifies the user
 */
function useErrorHandler() {
  const { toast } = useToast();
  
  return (error: Error) => {
    console.error("Product Image Lab Error:", error);
    toast({
      title: "Error Occurred",
      description: "An error occurred in the Product Image Lab. Please try again.",
      variant: "destructive"
    });
  };
}

/**
 * ProductImageLab Page Component
 * A standalone page for product image transformations
 * Includes error handling, simulation mode, and comprehensive debugging
 */
export default function ProductImageLabPage() {
  const errorHandler = useErrorHandler();
  
  // Auth and credits
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock credits for development - in production this would come from your auth context
  const credits: AuthCredits = { free: 5, paid: 5 };
  
  // Get available credits
  const availableUserCredits: number = credits?.free + credits?.paid || 0;
  
  // Check URL for test mode parameter
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });
  
  // Determine if user is admin (would normally come from user roles)
  const isAdmin = user?.email?.includes('admin') || user?.username?.includes('admin') || false;
  
  // Initialize test mode from URL parameter
  const initialTestMode = searchParams.get('testMode') === 'true';
  const initialSimulationMode = searchParams.get('simulationMode') === 'true';
  
  // State management
  const [tabState, setTabState] = useState<TabState>({ activeTab: 'upload' });
  const [industry, setIndustry] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<string>('');
  const [selections, setSelections] = useState<TransformationSelection>({});
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [numImages, setNumImages] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [statusType, setStatusType] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [creditsRequired, setCreditsRequired] = useState<number>(0);
  
  // Admin panel states
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);
  const [testCredits, setTestCredits] = useState<number>(100);
  const [adminTestMode, setAdminTestMode] = useState<boolean>(initialTestMode);
  
  // File input references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFormRef = useRef<HTMLFormElement>(null);
  const generateFormRef = useRef<HTMLFormElement>(null);
  
  // N8N webhook URL
  const webhookUrl = 'https://www.n8nemma.live/webhook-test/dbf2c53a-616d-4ba7-8934-38fa5e881ef9';  const maxUploads = 5;
  
  // Initialize product image lab hook with error handling
  const {
    availableCredits,
    isProcessing,
    error,
    uploadedImages,
    transformedImages,
    isTestModeEnabled,
    isSimulationMode,
    debugInfo,
    handleImageUpload,
    getEnhancementsForIndustry,
    transformImage,
    batchTransformImages,
    addCredits,
    resetLab,
    setTestMode,
    setSimulationMode,
    testApiConnection
  } = useProductImageLab({ 
    initialCredits: availableUserCredits,
    testMode: initialTestMode,
    simulateApiCalls: initialSimulationMode,
    onCreditChange: (newCredits: number): void => {
      // Here you would update the user's credits in your backend
      console.log('Credits updated:', newCredits);
      
      // In a real implementation, you would make an API call to update credits
      // For example:
      // apiRequest('/api/credits/update', { method: 'POST', body: { credits: newCredits } });
    }
  });
  
  // Toggle test mode
  const toggleTestMode = (enabled: boolean): void => {
    setAdminTestMode(enabled);
    setTestMode(enabled);
    
    toast({
      title: enabled ? "Test Mode Enabled" : "Test Mode Disabled",
      description: enabled 
        ? "Credits will not be consumed during operations" 
        : "Credits will be consumed normally during operations",
      variant: enabled ? "default" : "destructive"
    });
  };
  
  // Toggle simulation mode
  const toggleSimulationMode = (enabled: boolean): void => {
    setSimulationMode(enabled);
    
    toast({
      title: enabled ? "Simulation Mode Enabled" : "Simulation Mode Disabled",
      description: enabled 
        ? "API calls will be simulated without contacting the N8N webhook" 
        : "Real API calls will be made to the N8N webhook",
      variant: enabled ? "default" : "destructive"
    });
  };
  
  // Handle setting test credits
  const handleSetTestCredits = (): void => {
    addCredits(testCredits - availableCredits);
    
    toast({
      title: "Credits Updated",
      description: `Available credits set to ${testCredits}`,
    });
  };
  
  // Test API connection to N8N webhook
  const handleTestApiConnection = async (): Promise<void> => {
    setStatus('Testing API connection...');
    setStatusType('loading');
    
    try {
      const connected = await testApiConnection();
      
      if (connected) {
        setStatus('API connection successful');
        setStatusType('success');
        toast({
          title: "API Connection Successful",
          description: "Connection to N8N webhook verified",
        });
      } else {
        setStatus('API connection failed');
        setStatusType('error');
        toast({
          title: "API Connection Failed",
          description: "Unable to connect to N8N webhook. Using simulation mode instead.",
          variant: "destructive"
        });
        
        // Enable simulation mode if connection fails
        setSimulationMode(true);
      }
    } catch (err) {
      setStatus('API connection test failed');
      setStatusType('error');
      toast({
        title: "API Test Error",
        description: "Error testing connection. Using simulation mode instead.",
        variant: "destructive"
      });
      console.error('API connection test error:', err);
      
      // Enable simulation mode if connection fails
      setSimulationMode(true);
    }
  };
  
  // Update status when there's an error or processing change
  useEffect(() => {
    if (error) {
      setStatus(error);
      setStatusType('error');
    } else if (isProcessing) {
      setStatus('Processing...');
      setStatusType('loading');
    }
  }, [error, isProcessing]);
  
  // Toggle active tab
  const switchTab = (tab: 'upload' | 'generate'): void => {
    setTabState({ activeTab: tab });
  };
  
  // Open file selector
  const openFileSelector = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Process uploaded files
  const processUploadedFiles = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;
    
    setProcessing(true);
    setStatus('Uploading images...');
    setStatusType('loading');
    
    try {
      if (uploadedImages.length + files.length > maxUploads) {
        toast({
          title: "Too many images",
          description: `You can only upload a maximum of ${maxUploads} images`,
          variant: "destructive"
        });
        return;
      }
      
      await handleImageUpload(files);
      
      setStatus('Images uploaded successfully');
      setStatusType('success');
      
      toast({
        title: "Images Uploaded",
        description: `${files.length} image${files.length !== 1 ? 's' : ''} uploaded successfully`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading images';
      setStatus(`Upload failed: ${errorMessage}`);
      setStatusType('error');
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  // Toggle selection of a transformation option
  const toggleOptionSelection = (imageId: string, optionId: string) => {
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
        totalCredits += option?.creditCost || 0;
      });
    });
    
    setCreditsRequired(totalCredits);
  }, [selections]);
  
  // Handle upload form submission
  const handleUploadSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (Object.keys(selections).length === 0) {
      toast({
        title: "No transformations selected",
        description: "Please select at least one transformation option",
        variant: "destructive"
      });
      return;
    }
    
    if (!isTestModeEnabled && availableUserCredits < creditsRequired) {
      toast({
        title: "Not enough credits",
        description: `You need ${creditsRequired} credits for these transformations. You have ${availableUserCredits} credits.`,
        variant: "destructive"
      });
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
          // Convert string ID to enum type
          const transformationType = 
            Object.values(TransformationType).find(type => type === optionId) as TransformationType;
          
          if (transformationType) {
            transformationRequests.push({
              imageId,
              transformationType,
            });
          }
        }
      }
      
      // Process transformations in batch
      // This will either use real API calls or simulation mode based on configuration
      await batchTransformImages(transformationRequests);
      
      setStatus('Transformations completed successfully');
      setStatusType('success');
      setShowResults(true);
      setProcessing(false);
      
      toast({
        title: "Success",
        description: "Transformations completed successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error processing transformations';
      setStatus(`Error: ${errorMessage}`);
      setStatusType('error');
      setProcessing(false);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Handle generate form submission
  const handleGenerateSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!description) {
      toast({
        title: "Description required",
        description: "Please provide a description of the images you want to generate",
        variant: "destructive"
      });
      return;
    }
    
    const generationCost = numImages;
    
    if (!isTestModeEnabled && availableUserCredits < generationCost) {
      toast({
        title: "Not enough credits",
        description: `You need ${generationCost} credits to generate ${numImages} image${numImages !== 1 ? 's' : ''}. You have ${availableUserCredits} credits.`,
        variant: "destructive"
      });
      return;
    }
    
    setStatus('Generating images...');
    setStatusType('loading');
    setProcessing(true);
    
    try {
      // In a real implementation, this would call the N8N webhook
      // You would send a POST request to webhookUrl with the generation data
      
      // Simulate API call with a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create placeholder generated images for demonstration
      const generatedFiles = [];
      for (let i = 0; i < numImages; i++) {
        const placeholderUrl = `https://via.placeholder.com/500x500/f0f0f0/333333?text=Generated+Image+${i+1}`;
        
        // Create a blob from placeholder
        const response = await fetch(placeholderUrl);
        const blob = await response.blob();
        const file = new File([blob], `generated-image-${i+1}.jpg`, { type: 'image/jpeg' });
        generatedFiles.push(file);
      }
      
      // Process the generated files
      await handleImageUpload(generatedFiles as unknown as FileList);
      
      setStatus('Images generated successfully');
      setStatusType('success');
      setProcessing(false);
      switchTab('upload');
      
      toast({
        title: "Images Generated",
        description: `${numImages} image${numImages !== 1 ? 's' : ''} generated successfully. You can now select transformation options.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error generating images';
      setStatus(`Generation failed: ${errorMessage}`);
      setStatusType('error');
      setProcessing(false);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  // Reset the component
  const resetComponent = (): void => {
    resetLab();
    setSelections({});
    setIndustry('');
    setAdditionalInfo('');
    setShowPrompt(false);
    setCustomPrompt('');
    setDescription('');
    setNumImages(1);
    setShowResults(false);
    setStatus('');
    setStatusType('idle');
    setCreditsRequired(0);
    
    toast({
      title: "Reset",
      description: "Product Image Lab has been reset",
    });
  };
  
  return (
    <ProductImageErrorBoundary onError={errorHandler}>
      <div className="min-h-screen flex flex-col">
        <Navbar freeCredits={credits?.free || 0} paidCredits={credits?.paid || 0} />
        
        <main className="flex-grow pt-20">
          <div className="product-lab-container">
            <div className="product-lab-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="product-lab-title">Product Image Lab</h1>
                
                {(isAdmin || isTestModeEnabled) && (
                  <button 
                    className="product-lab-button product-lab-button-default"
                    onClick={() => setShowAdminPanel(!showAdminPanel)}
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
                  >
                    {showAdminPanel ? 'Hide Admin Panel' : 'Show Admin Panel'}
                  </button>
                )}
              </div>
              
              <p className="product-lab-subtitle">
                Transform and enhance your product images with AI
                
                {isTestModeEnabled && (
                  <span style={{ 
                    marginLeft: '10px',
                    background: '#ff7b54', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    TEST MODE
                  </span>
                )}
                
                {isSimulationMode && (
                  <span style={{ 
                    marginLeft: '10px',
                    background: '#4c9aff', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    SIMULATION MODE
                  </span>
                )}
              </p>
              
              {/* Admin Control Panel */}
              {showAdminPanel && (isAdmin || isTestModeEnabled) && (
                <div className="product-lab-card" style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#f8f9fa',
                  border: '1px solid #ccc',
                  borderLeft: '4px solid #ff7b54'
                }}>
                  <h3 style={{ marginTop: 0 }}>Admin Controls</h3>
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ marginBottom: '0.5rem' }}>
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
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <label htmlFor="simulation-mode-toggle" style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>
                          Simulation Mode:
                        </label>
                        <input 
                          id="simulation-mode-toggle"
                          type="checkbox" 
                          checked={isSimulationMode}
                          onChange={(e) => toggleSimulationMode(e.target.checked)}
                        />
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                          (N8N webhook calls will be simulated)
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label htmlFor="test-credits" style={{ fontWeight: 'bold' }}>Set Credits:</label>
                        <input 
                          id="test-credits"
                          type="number" 
                          style={{ width: '5rem', padding: '0.25rem' }}
                          value={testCredits}
                          onChange={(e) => setTestCredits(parseInt(e.target.value) || 0)}
                          min="0"
                        />
                        <button 
                          className="product-lab-button product-lab-button-primary"
                          onClick={handleSetTestCredits}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <button 
                        className="product-lab-button product-lab-button-default"
                        onClick={resetComponent}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      >
                        Reset Lab
                      </button>
                    </div>
                  </div>
                  
                  {/* API Connection Test */}
                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ margin: '0.5rem 0' }}>API Connection</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="product-lab-button product-lab-button-default"
                        onClick={handleTestApiConnection}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      >
                        Test API Connection
                      </button>
                      
                      <button 
                        className="product-lab-button product-lab-button-default"
                        onClick={() => {
                          console.log('Debug info cleared');
                          toast({
                            title: "Debug Info Cleared",
                            description: "Debug information has been reset"
                          });
                        }}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                      >
                        Clear Debug Info
                      </button>
                    </div>
                  </div>
                  
                  {/* Debug Info Display */}
                  {Object.keys(debugInfo || {}).length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ margin: '0.5rem 0' }}>Debug Information</h4>
                      <pre style={{ 
                        background: '#f0f0f0', 
                        padding: '0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem',
                        maxHeight: '200px',
                        overflow: 'auto'
                      }}>
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="product-lab-card">
              <div className="product-lab-credit-info">
                <p>You have <strong>{availableUserCredits}</strong> credits remaining.</p>
                {creditsRequired > 0 && (
                  <p>Selected transformations will use <strong>{creditsRequired}</strong> credits.</p>
                )}
              </div>
              
              {/* Status display */}
              {status && (
                <div className={`product-lab-status product-lab-status-${statusType}`}>
                  <p>{status}</p>
                </div>
              )}
              
              {/* Tab Navigation */}
              <div className="product-lab-tabs">
                <button 
                  className={`product-lab-tab ${tabState.activeTab === 'upload' ? 'product-lab-tab-active' : ''}`}
                  onClick={() => switchTab('upload')}
                >
                  Upload Images
                </button>
                <button 
                  className={`product-lab-tab ${tabState.activeTab === 'generate' ? 'product-lab-tab-active' : ''}`}
                  onClick={() => switchTab('generate')}
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
                        placeholder="Add any specific details about your products or brand that will help create better transformations"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                      />
                    </div>
                    
                    <div className="product-lab-form-group product-lab-file-upload">
                      <div className="product-lab-upload-container">
                        <div className="product-lab-upload-box" onClick={openFileSelector}>
                          <div className="product-lab-upload-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                          </div>
                          <p className="product-lab-upload-text">Drag & drop product images or click to browse</p>
                          <p className="product-lab-upload-subtext">Supports JPG, PNG, and WebP up to 5MB</p>
                        </div>
                      </div>
                      <input 
                        id="product-images"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        onChange={(e) => processUploadedFiles(e.target.files)}
                        style={{ display: 'none' }}
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
                    </div>
                    
                    <div className="product-lab-form-group">
                      <label className="product-lab-label" htmlFor="description">Describe the Product Image You Want</label>
                      <textarea 
                        id="description"
                        className="product-lab-textarea"
                        placeholder="Describe the product image you want to generate in detail"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={5}
                      />
                      <p className="product-lab-help-text">Be specific about product details, style, background, etc.</p>
                    </div>
                    
                    <div className="product-lab-form-group">
                      <label className="product-lab-label" htmlFor="num-images">Number of Images to Generate</label>
                      <div className="product-lab-number-input">
                        <input 
                          id="num-images"
                          type="range" 
                          min="1" 
                          max="4" 
                          value={numImages}
                          onChange={(e) => setNumImages(parseInt(e.target.value))}
                        />
                        <span>{numImages}</span>
                      </div>
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
            </div>
            
            {/* Transformation Options */}
            {uploadedImages.length > 0 && tabState.activeTab === 'upload' && (
              <div className="product-lab-card">
                <h2>Select Transformations for Your Images</h2>
                
                <div className="product-lab-transformations">
                  {uploadedImages.map((image: UploadedImage) => {
                    const enhancementOptions: TransformationOption[] = getEnhancementsForIndustry(industry);
                    
                    return (
                      <div key={image.id} className="product-lab-card" style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                          <img 
                            src={image.url} 
                            alt={image.name || 'Product image'} 
                            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }}
                          />
                          <div>
                            <h3>{image.name || 'Product Image'}</h3>
                            
                            <div className="product-lab-form-group">
                              {enhancementOptions.map((option: TransformationOption) => (
                                <div key={option.id} style={{ marginBottom: '10px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal', cursor: 'pointer' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={selections[image.id]?.includes(option.id) || false}
                                      onChange={() => toggleOptionSelection(image.id, option.id)}
                                      style={{ marginRight: '10px' }}
                                    />
                                    <div>
                                      <strong>{option.name}</strong> <span style={{ color: '#6b7280' }}>({option.creditCost} credit{option.creditCost > 1 ? 's' : ''})</span>
                                      <p style={{ margin: '2px 0 0 0', fontSize: '0.9em', color: '#6b7280' }}>{option.description}</p>
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="product-lab-flex" style={{ justifyContent: 'space-between' }}>
                  <button 
                    className="product-lab-button product-lab-button-secondary"
                    onClick={() => setShowPrompt(!showPrompt)}
                  >
                    {showPrompt ? 'Hide Custom Prompt' : 'Add Custom Prompt'}
                  </button>
                  
                  <button 
                    className="product-lab-button product-lab-button-primary"
                    onClick={(e) => handleUploadSubmit(e as any)}
                    disabled={processing || Object.keys(selections).length === 0}
                  >
                    Create Transformations
                  </button>
                </div>
              </div>
            )}
            
            {/* Results Section */}
            {showResults && transformedImages.length > 0 && (
              <div className="product-lab-card">
                <h2>Transformation Results</h2>
                
                {transformedImages.map((result: TransformationResult) => {
                  const originalImage = uploadedImages.find((img: UploadedImage) => img.id === result.originalImageId);
                  
                  if (!originalImage) return null;
                  
                  return (
                    <div key={result.id} className="product-lab-card" style={{ marginBottom: '15px' }}>
                      <h3>{result.transformationName}</h3>
                      
                      <div className="product-lab-comparison">
                        <div className="product-lab-comparison-item">
                          <img 
                            src={originalImage.url} 
                            alt="Original image" 
                          />
                          <h3>Original Image</h3>
                        </div>
                        <div className="product-lab-comparison-item">
                          <img 
                            src={result.transformedImageUrl} 
                            alt="Transformed image" 
                          />
                          <h3>Transformed Image</h3>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <p><strong>Prompt used:</strong></p>
                        <p style={{ fontStyle: 'italic', color: '#6b7280' }}>{result.prompt}</p>
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <a 
                          href={result.transformedImageUrl} 
                          download={`${originalImage.name?.replace(/\.[^/.]+$/, '') || 'transformed'}_${result.transformationType}.jpg`}
                          className="product-lab-button product-lab-button-secondary"
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Download Image
                        </a>
                      </div>
                    </div>
                  );
                })}
                
                <div className="product-lab-flex" style={{ justifyContent: 'space-between', marginTop: '20px' }}>
                  <button 
                    className="product-lab-button product-lab-button-default"
                    onClick={resetComponent}
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
        
        <GlobalFooter />
      </div>
    </ProductImageErrorBoundary>
  );
}