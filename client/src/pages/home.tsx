import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Navbar from '@/components/Navbar';
import ImageUploader from '@/components/ImageUploader';
import PromptInput from '@/components/PromptInput';
import ProcessingState from '@/components/ProcessingState';
import ResultView from '@/components/ResultView';
import EditPrompt from '@/components/EditPrompt';
import TransformationExamples from '@/components/TransformationExamples';
import PricingSection from '@/components/PricingSection';
import FaqSection from '@/components/FaqSection';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
  Edit
}

// Possible transformation types
type TransformationType = 'cartoon' | 'product' | 'custom';

// Default user state - in a real app this would come from authentication
const DEFAULT_USER = {
  id: 1,
  freeCreditsUsed: false,
  paidCredits: 0
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [user, setUser] = useState(DEFAULT_USER);
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState<boolean>(true);
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationType | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch user credits and OpenAI configuration on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const response = await apiRequest('GET', `/api/credits/${user.id}`);
        const data = await response.json();
        setUser(prev => ({ ...prev, freeCreditsUsed: data.freeCreditsUsed, paidCredits: data.paidCredits }));
      } catch (error) {
        console.error('Error fetching user credits:', error);
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await apiRequest('GET', '/api/config');
        const data = await response.json();
        setIsOpenAIConfigured(data.openaiConfigured);
      } catch (error) {
        console.error('Error fetching configuration:', error);
      }
    };

    fetchUserCredits();
    fetchConfig();
  }, []);

  const handleUpload = (imagePath: string, imageUrl: string) => {
    setOriginalImage(imageUrl);
    setOriginalImagePath(imagePath);
    
    // Always go to the prompt step regardless of preset selection
    // This allows users to customize prompts for preset transformations
    setCurrentStep(Step.Prompt);
  };

  const handlePromptSubmit = async (promptText: string, imageSize: string = "1024x1024") => {
    setPrompt(promptText);
    setCurrentStep(Step.Processing);

    try {
      const response = await apiRequest('POST', '/api/transform', {
        originalImagePath,
        prompt: promptText,
        userId: user.id,
        imageSize: imageSize
      });

      const data = await response.json();
      
      if (response.ok) {
        setTransformedImage(data.transformedImageUrl);
        setCurrentStep(Step.Result);
        
        // Refresh user credits
        const creditsResponse = await apiRequest('GET', `/api/credits/${user.id}`);
        const creditsData = await creditsResponse.json();
        setUser(prev => ({ 
          ...prev, 
          freeCreditsUsed: creditsData.freeCreditsUsed, 
          paidCredits: creditsData.paidCredits 
        }));
      } else {
        toast({
          title: "Transformation failed",
          description: data.message,
          variant: "destructive"
        });
        setCurrentStep(Step.Prompt);
      }
    } catch (error: any) {
      console.error('Error transforming image:', error);
      
      // Check for OpenAI model verification errors
      let errorMessage = "There was an error processing your image. Please try again.";
      
      if (error.message && error.message.includes("organization verification")) {
        errorMessage = "Your OpenAI account needs organization verification to use the gpt-image-1 model. This is a new model with limited access.";
      } else if (error.message && error.message.includes("No image URL returned")) {
        errorMessage = "The gpt-image-1 model is not available for your account. This model requires organization verification with OpenAI.";
      }
      
      toast({
        title: "Transformation Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setCurrentStep(Step.Prompt);
    }
  };

  const handleTryAgain = () => {
    setPrompt('');
    setCurrentStep(Step.Prompt);
  };

  const handleNewImage = () => {
    setOriginalImage(null);
    setOriginalImagePath(null);
    setTransformedImage(null);
    setPrompt('');
    setSelectedTransformation(null);
    setCurrentStep(Step.Upload);
    setShowUploadForm(false);
  };

  const handleCancel = () => {
    setCurrentStep(Step.Prompt);
  };

  // Handle starting edit process
  const handleStartEdit = () => {
    console.log("Starting edit with originalImage:", originalImage);
    console.log("Original image path:", originalImagePath);
    console.log("Transformed image:", transformedImage);
    setCurrentStep(Step.Edit);
  };

  // Handle edit submission
  const handleEditSubmit = async (editPrompt: string, imageSize: string = "1024x1024") => {
    setPrompt(editPrompt);
    setCurrentStep(Step.Processing);

    try {
      // Send the edit request - always using the original uploaded image
      const response = await apiRequest('POST', '/api/transform', {
        originalImagePath, // We use the original image path, not the transformed image path
        prompt: editPrompt,
        userId: user.id,
        imageSize: imageSize,
        isEdit: true, // Flag to indicate this is an edit
        previousTransformation: transformedImage // Pass the previous transformation path for reference only
      });

      const data = await response.json();
      
      if (response.ok) {
        // Replace the transformed image with the edited version
        setTransformedImage(data.transformedImageUrl);
        setCurrentStep(Step.Result);
        
        // Refresh user credits
        const creditsResponse = await apiRequest('GET', `/api/credits/${user.id}`);
        const creditsData = await creditsResponse.json();
        setUser(prev => ({ 
          ...prev, 
          freeCreditsUsed: creditsData.freeCreditsUsed, 
          paidCredits: creditsData.paidCredits 
        }));
      } else {
        toast({
          title: "Edit failed",
          description: data.message,
          variant: "destructive"
        });
        // Go back to result step with the original transformation
        setCurrentStep(Step.Result);
      }
    } catch (error: any) {
      console.error('Error editing image:', error);
      
      let errorMessage = "There was an error editing your image. Please try again.";
      toast({
        title: "Edit Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setCurrentStep(Step.Result);
    }
  };

  // Skip the edit and keep the current transformation
  const handleSkipEdit = () => {
    setCurrentStep(Step.Result);
  };

  // Handle preset transformations (cartoon, product photography, etc.)
  const handlePresetTransformation = async (presetType: TransformationType) => {
    if (!originalImagePath) {
      toast({
        title: "No image selected",
        description: "Please upload an image first to use preset transformations.",
        variant: "destructive"
      });
      return;
    }
    
    // Set the selected transformation
    setSelectedTransformation(presetType as TransformationType);
    
    // Set a default image size for presets (square format)
    const imageSize = "1024x1024";
    
    setCurrentStep(Step.Processing);
    
    try {
      console.log(`Applying ${presetType} preset transformation`);
      const response = await apiRequest('POST', '/api/transform', {
        originalImagePath,
        userId: user.id,
        preset: presetType,
        imageSize,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTransformedImage(data.transformedImageUrl);
        setCurrentStep(Step.Result);
        setPrompt(data.prompt);
        
        // Refetch user credits
        const creditsResponse = await apiRequest('GET', `/api/credits/${user.id}`);
        const creditsData = await creditsResponse.json();
        setUser(prevUser => ({
          ...prevUser,
          freeCreditsUsed: creditsData.freeCreditsUsed,
          paidCredits: creditsData.paidCredits
        }));
      } else {
        toast({
          title: "Transformation failed",
          description: data.message,
          variant: "destructive"
        });
        setCurrentStep(Step.Upload);
      }
    } catch (error) {
      console.error("Error applying preset transformation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply transformation",
        variant: "destructive",
      });
      setCurrentStep(Step.Upload);
    }
  };

  // Function to scroll to uploader section
  const scrollToUploader = () => {
    const uploaderElement = document.getElementById('uploader');
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar freeCredits={!user.freeCreditsUsed ? 1 : 0} paidCredits={user.paidCredits} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section - Traditional Landing Page Style */}
        {currentStep === Step.Upload && !showUploadForm && (
          <section className="py-16 flex flex-col items-center text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
              Transform Your Photos with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload any photo and watch our AI transform it into something extraordinary. No design skills needed.
            </p>
            <div className="text-md bg-blue-50 text-blue-700 p-4 rounded-md inline-flex items-center mb-8">
              <i className="fas fa-info-circle mr-2"></i>
              Your first transformation is free! No credit card required.
            </div>
            
            <Button 
              className="bg-black text-white hover:bg-black/80 text-lg px-8 py-6 rounded-lg shadow-lg transform transition hover:scale-105" 
              onClick={() => setShowUploadForm(true)}
            >
              Create Now
            </Button>
            
            {!isOpenAIConfigured && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                <p>OpenAI API key is not configured. Some features may not work properly.</p>
              </div>
            )}
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Cartoon Style</h3>
                <p className="text-gray-600">Transform your photos into vibrant cartoon illustrations with bold outlines and vivid colors.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Product Photography</h3>
                <p className="text-gray-600">Create professional product photos with perfect lighting, clean backgrounds, and commercial quality.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Custom Transformations</h3>
                <p className="text-gray-600">Describe exactly what you want, and our AI will bring your vision to life with amazing detail.</p>
              </div>
            </div>
          </section>
        )}
        
        {/* Inline Upload Form & Main Wizard Flow */}
        {(showUploadForm || currentStep !== Step.Upload) && (
          <div id="uploader" className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-10 max-w-3xl mx-auto">
            {currentStep === Step.Upload && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Photo</h2>
                <ImageUploader onImageUploaded={handleUpload} />
                <div className="mt-4 text-center">
                  <Button 
                    variant="outline" 
                    className="text-black border-black mt-4"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === Step.Prompt && originalImage && (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-center">Choose Transformation Style</h2>
                  <p className="text-center text-gray-600">Select a transformation style or create your own custom transformation</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Button 
                    variant="outline" 
                    className={`
                      ${selectedTransformation === "cartoon" 
                        ? "bg-black text-white hover:bg-black hover:text-white" 
                        : "bg-white text-black hover:bg-gray-50"
                      } 
                      border-black border-2 shadow-md py-6 h-auto
                    `}
                    onClick={() => {
                      if (selectedTransformation === "cartoon") {
                        setSelectedTransformation(null);
                      } else {
                        setSelectedTransformation("cartoon");
                      }
                    }}
                  >
                    Cartoon Style
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`
                      ${selectedTransformation === "product" 
                        ? "bg-black text-white hover:bg-black hover:text-white" 
                        : "bg-white text-black hover:bg-gray-50"
                      } 
                      border-black border-2 shadow-md py-6 h-auto
                    `}
                    onClick={() => {
                      if (selectedTransformation === "product") {
                        setSelectedTransformation(null);
                      } else {
                        setSelectedTransformation("product");
                      }
                    }}
                  >
                    Product Photography
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`
                      ${selectedTransformation === "custom" 
                        ? "bg-black text-white hover:bg-black hover:text-white" 
                        : "bg-white text-black hover:bg-gray-50"
                      } 
                      border-black border-2 shadow-md py-6 h-auto
                    `}
                    onClick={() => {
                      if (selectedTransformation === "custom") {
                        setSelectedTransformation(null);
                      } else {
                        setSelectedTransformation("custom");
                      }
                    }}
                  >
                    Custom Transformation
                  </Button>
                </div>
                
                <PromptInput 
                  originalImage={originalImage} 
                  onSubmit={handlePromptSubmit} 
                  onBack={handleNewImage}
                  selectedTransformation={selectedTransformation}
                />
              </>
            )}
            
            {currentStep === Step.Processing && originalImage && (
              <ProcessingState 
                originalImage={originalImage} 
                onCancel={handleCancel}
              />
            )}
            
            {currentStep === Step.Result && originalImage && transformedImage && (
              <ResultView
                originalImage={originalImage}
                transformedImage={transformedImage}
                onTryAgain={handleTryAgain}
                onNewImage={handleNewImage}
                onEditImage={handleStartEdit}
                prompt={prompt}
                freeCredits={!user.freeCreditsUsed ? 1 : 0}
                paidCredits={user.paidCredits}
                canEdit={true}
              />
            )}
            
            {currentStep === Step.Edit && originalImage && transformedImage && (
              <EditPrompt
                originalImage={originalImage}
                transformedImage={transformedImage}
                initialPrompt={prompt}
                onSubmit={handleEditSubmit}
                onSkip={handleSkipEdit}
              />
            )}
          </div>
        )}

        <TransformationExamples onExampleClick={scrollToUploader} />
        <PricingSection userId={user.id} />
        <FaqSection />
        <CtaSection onClick={scrollToUploader} />
      </main>

      <Footer />
    </div>
  );
}