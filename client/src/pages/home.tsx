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
    setCurrentStep(Step.Prompt);
  };

  const handlePromptSubmit = async (promptText: string) => {
    setPrompt(promptText);
    setCurrentStep(Step.Processing);

    try {
      const response = await apiRequest('POST', '/api/transform', {
        originalImagePath,
        prompt: promptText,
        userId: user.id
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
    setCurrentStep(Step.Upload);
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
  const handleEditSubmit = async (editPrompt: string) => {
    setPrompt(editPrompt);
    setCurrentStep(Step.Processing);

    try {
      // Send the edit request - always using the original uploaded image
      const response = await apiRequest('POST', '/api/transform', {
        originalImagePath, // We use the original image path, not the transformed image path
        prompt: editPrompt,
        userId: user.id,
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
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
            Transform Photos with AI
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Upload your photo, describe the transformation you want, and our AI will remix your image into something amazing.
          </p>
          <div className="text-sm bg-blue-50 text-blue-700 p-3 rounded-md inline-flex items-center">
            <i className="fas fa-info-circle mr-2"></i>
            Your first transformation is free! No credit card required.
          </div>
          
          {!isOpenAIConfigured && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
              <p>OpenAI API key is not configured. Some features may not work properly.</p>
            </div>
          )}
          
          <div className="mt-6">
            <Link href="/view-transformation">
              <Button variant="outline" className="hover:bg-primary-50 text-white bg-black">
                View GPT-4o Forest Scene Demo
              </Button>
            </Link>
          </div>
        </section>

        {/* Image Uploader Section */}
        <section id="uploader" className="mb-16">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Stepper header */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <div className={`px-6 py-4 w-1/3 text-center ${currentStep === Step.Upload ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'} font-medium`}>
                  <span className={`${currentStep === Step.Upload ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'} w-6 h-6 inline-flex items-center justify-center rounded-full mr-2`}>
                    1
                  </span>
                  Upload
                </div>
                <div className={`px-6 py-4 w-1/3 text-center ${currentStep === Step.Prompt ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'} font-medium`}>
                  <span className={`${currentStep >= Step.Prompt ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'} w-6 h-6 inline-flex items-center justify-center rounded-full mr-2`}>
                    2
                  </span>
                  Describe
                </div>
                <div className={`px-6 py-4 w-1/3 text-center ${currentStep === Step.Result ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-500'} font-medium`}>
                  <span className={`${currentStep === Step.Result ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'} w-6 h-6 inline-flex items-center justify-center rounded-full mr-2`}>
                    3
                  </span>
                  Result
                </div>
              </div>
            </div>

            {/* Show different components based on current step */}
            {currentStep === Step.Upload && (
              <ImageUploader onImageUploaded={handleUpload} />
            )}
            
            {currentStep === Step.Prompt && (
              <PromptInput 
                originalImage={originalImage!} 
                onSubmit={handlePromptSubmit} 
                onBack={handleNewImage} 
              />
            )}
            
            {currentStep === Step.Processing && (
              <ProcessingState 
                originalImage={originalImage!} 
                onCancel={handleCancel} 
              />
            )}
            
            {currentStep === Step.Result && (
              <ResultView 
                originalImage={originalImage!} 
                transformedImage={transformedImage!} 
                onTryAgain={handleTryAgain} 
                onNewImage={handleNewImage}
                onEditImage={handleStartEdit}
                freeCredits={!user.freeCreditsUsed ? 1 : 0}
                paidCredits={user.paidCredits}
                prompt={prompt}
                canEdit={true}
              />
            )}
            
            {currentStep === Step.Edit && (
              <EditPrompt
                originalImage={originalImage!}
                transformedImage={transformedImage!}
                initialPrompt={prompt}
                onSubmit={handleEditSubmit}
                onSkip={handleSkipEdit}
              />
            )}
          </div>
        </section>

        <TransformationExamples onExampleClick={scrollToUploader} />
        <PricingSection userId={user.id} />
        <FaqSection />
        <CtaSection onClick={scrollToUploader} />
      </main>

      <Footer />
    </div>
  );
}
