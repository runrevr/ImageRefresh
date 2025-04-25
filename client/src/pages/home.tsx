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
import HeroCarousel from '@/components/HeroCarousel';
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

// Import transformation types from PromptInput
import { TransformationType, CartoonSubcategory, ProductSubcategory, OtherSubcategory } from '@/components/PromptInput';

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
        {/* Hero Section - Carousel Style */}
        {currentStep === Step.Upload && !showUploadForm && (
          <>
            <HeroCarousel onCreateClick={() => setShowUploadForm(true)} />
            
            {!isOpenAIConfigured && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                <p>OpenAI API key is not configured. Some features may not work properly.</p>
              </div>
            )}
            
            {/* Feature Highlights */}
            <div className="w-full bg-gray-800 py-12 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                <div className="rounded-xl overflow-hidden relative group h-80">
                  {/* Background image with overlay */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300"></div>
                  <img 
                    src="/images/features/product-photo.jpg" 
                    alt="Product Photography" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Product Photography</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Transform everyday product shots into professional studio quality photos with enhanced lighting and composition.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          setShowUploadForm(true);
                          scrollToUploader();
                          setSelectedTransformation('product');
                        }}
                      >
                        Try it now
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden relative group h-80">
                  {/* Background image with overlay */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300"></div>
                  <img 
                    src="/images/features/cartoon.jpg" 
                    alt="Cartoon Style" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Cartoon Style</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Convert your photos into vibrant, stylized cartoon illustrations with playful characters and expressive details.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          setShowUploadForm(true);
                          scrollToUploader();
                          setSelectedTransformation('cartoon');
                        }}
                      >
                        Try it now
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl overflow-hidden relative group h-80">
                  {/* Background image with overlay */}
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300"></div>
                  <img 
                    src="/images/features/custom.jpg" 
                    alt="Custom Transformations" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path>
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">Custom Transformations</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Create any artistic style you can imagine with our advanced AI, from classical paintings to futuristic designs.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          setShowUploadForm(true);
                          scrollToUploader();
                          setSelectedTransformation('custom');
                        }}
                      >
                        Try it now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Example Transformations Section */}
            <TransformationExamples onExampleClick={() => setShowUploadForm(true)} />
            
            {/* Pricing Section */}
            <PricingSection userId={user.id} />
            
            {/* FAQ Section */}
            <FaqSection />
            
            {/* Final CTA */}
            <CtaSection onClick={() => {
              setShowUploadForm(true);
              scrollToUploader();
            }} />
          </>
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
              <PromptInput 
                originalImage={originalImage} 
                onSubmit={handlePromptSubmit} 
                onBack={handleNewImage}
                selectedTransformation={selectedTransformation}
              />
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