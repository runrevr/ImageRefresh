import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
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
import AccountNeededDialog from '@/components/AccountNeededDialog';
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
  const [showAccountNeededDialog, setShowAccountNeededDialog] = useState<boolean>(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
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
  
  // Scroll to top when uploadForm appears
  useEffect(() => {
    if (showUploadForm) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showUploadForm]);
  
  // Check for email collection status on component mount
  useEffect(() => {
    const emailCollected = localStorage.getItem('emailCollected');
    const collectedEmail = localStorage.getItem('collectedEmail');
    
    if (emailCollected === 'true' && collectedEmail) {
      setStoredEmail(collectedEmail);
    }
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
    
    // Clear email collection status
    localStorage.removeItem('emailCollected');
    localStorage.removeItem('collectedEmail');
    setStoredEmail(null);
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
    // First scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Then scroll to the uploader element
    const uploaderElement = document.getElementById('uploader');
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Function to handle Upload button clicks with account check
  const handleUploadClick = () => {
    // If the user has previously used the email collection feature, show account dialog
    if (storedEmail) {
      setShowAccountNeededDialog(true);
    } else {
      setShowUploadForm(true);
    }
  };
  
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar freeCredits={!user.freeCreditsUsed ? 1 : 0} paidCredits={user.paidCredits} />
      
      {/* Account Needed Dialog */}
      <AccountNeededDialog 
        open={showAccountNeededDialog}
        onClose={() => setShowAccountNeededDialog(false)}
        email={storedEmail}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section - Carousel Style */}
        {currentStep === Step.Upload && !showUploadForm && (
          <>
            <HeroCarousel onCreateClick={handleUploadClick} />
            
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
                    src="/images/features/product-sunset.png" 
                    alt="Product Photography" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">

                    <h3 className="text-2xl font-bold mb-3 text-white">Product Photography</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Transform everyday product shots into professional studio quality photos with enhanced lighting and composition.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation('product');
                          }
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
                    src="/images/features/lego-cartoon.png" 
                    alt="Cartoon Style" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">

                    <h3 className="text-2xl font-bold mb-3 text-white">Cartoon Style</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Convert your photos into vibrant, stylized cartoon illustrations with playful characters and expressive details.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation('cartoon');
                          }
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
                    src="/images/features/custom-deer.png" 
                    alt="Custom Transformations" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">

                    <h3 className="text-2xl font-bold mb-3 text-white">Custom Transformations</h3>
                    <p className="text-gray-100 mb-4 max-w-xs">Turn ordinary photos into viral-worthy images with our advanced AI. Create any style from classical paintings to eye-catching social media content.</p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button 
                        variant="outline" 
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation('custom');
                          }
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
            <TransformationExamples onExampleClick={() => {
              if (storedEmail) {
                setShowAccountNeededDialog(true);
              } else {
                setShowUploadForm(true);
              }
            }} />
            
            {/* Pricing Section */}
            <PricingSection userId={user.id} />
            
            {/* FAQ Section */}
            <FaqSection />
            
            {/* Final CTA */}
            <CtaSection onClick={() => {
              if (storedEmail) {
                setShowAccountNeededDialog(true);
              } else {
                setShowUploadForm(true);
                scrollToUploader();
              }
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
                    className="text-white border-white mt-4"
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
      </main>

      <Footer />
    </div>
  );
}