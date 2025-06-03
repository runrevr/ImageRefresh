import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ImageUploader from "@/components/ImageUploader";
import ProcessingState from "@/components/ProcessingState";
import ResultView from "@/components/ResultView";
import EditPrompt from "@/components/EditPrompt";
import Footer from "@/components/Footer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import {
  getSavedStyle,
  clearSavedStyle,
  hasSavedStyle,
  type SavedStyle
} from "@/components/StyleIntegration";
import SignupRequiredModal from "@/components/SignupRequiredModal";

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
  Edit,
}

// Import transformation types and style definitions from PromptInput
import PromptInput from "@/components/PromptInput";

// User credits state type
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [originalImageFileName, setOriginalImageFileName] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [transformedImages, setTransformedImages] = useState<string[]>([]);
  const [secondTransformedImage, setSecondTransformedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedTransformation, setSelectedTransformation] = useState<'animation' | 'custom'>('animation');

  // Current transformation data
  const [currentTransformation, setCurrentTransformation] = useState<{
    id: string;
    prompt: string;
    transformedImageUrl: string;
    originalImageUrl: string;
    originalImageFilename: string;
  } | null>(null);

  

  

  // Fetch user credits when authenticated
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await apiRequest(`/api/user-credits?userId=${user.id}`);
          setUserCredits(response);
        } catch (error) {
          console.error("Error fetching user credits:", error);
        }
      }
    };

    fetchUserCredits();
  }, [isAuthenticated, user?.id]);

  const handleImageUpload = (imagePath: string, imageUrl: string) => {
    setUploadedImage(imageUrl);
    setOriginalImageFileName(imagePath);
    setCurrentStep(Step.Prompt);
    setErrorMessage(null);
  };

  const handlePromptSubmit = async (prompt: string, imageSize: string) => {
    if (!uploadedImage) return;

    setUserPrompt(prompt);
    setCurrentStep(Step.Processing);
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await apiRequest('/api/transform', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: uploadedImage,
          prompt,
          userId: user?.id || 'anonymous',
          originalImageFilename: originalImageFileName,
          imageSize,
        }),
      });

      if (response.transformedImageUrls && Array.isArray(response.transformedImageUrls)) {
        setTransformedImages(response.transformedImageUrls);
        if (response.transformedImageUrls.length > 1) {
          setSecondTransformedImage(response.transformedImageUrls[1]);
        }
      } else {
        setTransformedImages([response.transformedImageUrl]);
      }

      if (response.secondTransformedImageUrl) {
        setSecondTransformedImage(response.secondTransformedImageUrl);
      }

      setCurrentTransformation({
        id: response.transformationId,
        prompt: prompt,
        transformedImageUrl: response.transformedImageUrl,
        originalImageUrl: uploadedImage,
        originalImageFilename: originalImageFileName,
      });

      setCurrentStep(Step.Result);
    } catch (error: any) {
      console.error('Transformation error:', error);
      setErrorMessage(error.message || 'An error occurred during transformation');
      setCurrentStep(Step.Prompt);
    } finally {
      setIsProcessing(false);
    }
  };

  

  const handleEditPrompt = (newPrompt: string) => {
    setCurrentStep(Step.Edit);
  };

  const handleEditComplete = (editedImageUrl: string) => {
    setTransformedImages([editedImageUrl]);
    setCurrentStep(Step.Result);
  };

  const handleRestart = () => {
    setCurrentStep(Step.Upload);
    setUploadedImage(null);
    setOriginalImageFileName("");
    setUserPrompt("");
    setTransformedImages([]);
    setSecondTransformedImage(null);
    setErrorMessage(null);
    setCurrentTransformation(null);
    clearSavedStyle();
  };

  const handleBackToPrompt = () => {
    setCurrentStep(Step.Prompt);
    setErrorMessage(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {currentStep === Step.Upload && (
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Transform Your Images with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Upload any image and watch our AI transform it into amazing styles - from cartoons to paintings to historical eras.
              </p>
              <ImageUploader onImageUploaded={handleImageUpload} />
            </div>
          )}

          {currentStep === Step.Prompt && (
            <PromptInput
              originalImage={uploadedImage!}
              onSubmit={handlePromptSubmit}
              onBack={() => setCurrentStep(Step.Upload)}
              selectedTransformation={null}
              defaultPrompt=""
              savedStyle={null}
            />
          )}

          {currentStep === Step.Processing && (
            <ProcessingState />
          )}

          {currentStep === Step.Result && transformedImages.length > 0 && (
            <ResultView
              originalImage={uploadedImage!}
              transformedImages={transformedImages}
              secondTransformedImage={secondTransformedImage}
              prompt={userPrompt}
              onRestart={handleRestart}
              onEdit={handleEditPrompt}
              onBackToPrompt={handleBackToPrompt}
              currentTransformation={currentTransformation}
            />
          )}

          {currentStep === Step.Edit && currentTransformation && (
            <EditPrompt
              transformationId={currentTransformation.id}
              originalPrompt={currentTransformation.prompt}
              originalImage={currentTransformation.originalImageUrl}
              transformedImage={currentTransformation.transformedImageUrl}
              onEditComplete={handleEditComplete}
              onCancel={() => setCurrentStep(Step.Result)}
            />
          )}
        </div>
      </main>

      <Footer />

      <SignupRequiredModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
}