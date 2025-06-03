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
import PromptInput, { 
  TransformationType,
  CartoonSubcategory,
  ProductSubcategory,
  OtherSubcategory,
  CARTOON_STYLES,
  PAINTING_STYLES, 
  ERA_STYLES,
  OTHER_STYLES
} from "@/components/PromptInput";

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

  // Style selection states for PromptInput
  const [selectedStyle, setSelectedStyle] = useState<TransformationType>('cartoon');
  const [selectedCartoonSubcategory, setSelectedCartoonSubcategory] = useState<CartoonSubcategory>('kids');
  const [selectedProductSubcategory, setSelectedProductSubcategory] = useState<ProductSubcategory>('pure-catalog');
  const [selectedOtherSubcategory, setSelectedOtherSubcategory] = useState<OtherSubcategory>('funny');

  // Load saved style on component mount
  useEffect(() => {
    if (hasSavedStyle()) {
      const savedStyle = getSavedStyle();
      if (savedStyle) {
        setSelectedStyle(savedStyle.transformationType);
        if (savedStyle.cartoonSubcategory) {
          setSelectedCartoonSubcategory(savedStyle.cartoonSubcategory);
        }
        if (savedStyle.productSubcategory) {
          setSelectedProductSubcategory(savedStyle.productSubcategory);
        }
        if (savedStyle.otherSubcategory) {
          setSelectedOtherSubcategory(savedStyle.otherSubcategory);
        }
      }
    }
  }, []);

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

  const handleImageUpload = (imageUrl: string, fileName: string) => {
    setUploadedImage(imageUrl);
    setOriginalImageFileName(fileName);
    setCurrentStep(Step.Prompt);
    setErrorMessage(null);
  };

  const handlePromptSubmit = async (prompt: string) => {
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

  const handlePromptWithPresets = async () => {
    if (!uploadedImage) return;

    const presetPrompt = generatePresetPrompt();
    await handlePromptSubmit(presetPrompt);
  };

  const generatePresetPrompt = (): string => {
    switch (selectedStyle) {
      case 'cartoon':
        const cartoonStyle = CARTOON_STYLES[selectedCartoonSubcategory];
        return cartoonStyle?.suggestedPrompt || "Transform into a cartoon style";

      case 'product':
        const mapping = {
          'pure-catalog': { key: 'pureCatalog' },
          'lifestyle': { key: 'lifestyle' },
          'enhanced': { key: 'enhanced' },
          'artistic': { key: 'artistic' },
          'historical': { key: 'historical' },
          'animation': { key: 'animation' }
        };

        const productMapping = mapping[selectedProductSubcategory as keyof typeof mapping];
        if (productMapping) {
          return `Transform this product image into ${selectedProductSubcategory} style. Create a professional, high-quality transformation that enhances the product presentation.`;
        }
        return "Transform into a professional product style";

      case 'painting':
        const paintingMapping = {
          'renaissance': { key: 'renaissance' },
          'impressionist': { key: 'impressionist' },
          'expressionist': { key: 'expressionist' },
          'abstract': { key: 'abstract' },
          'watercolor': { key: 'watercolor' },
          'oil': { key: 'oil' }
        };
        return "Transform into a beautiful painting style";

      case 'era':
        const eraMapping = {
          'medieval': { key: 'medieval' },
          'victorian': { key: 'victorian' },
          '1920s': { key: 'twenties' },
          '1950s': { key: 'fifties' },
          '1980s': { key: 'eighties' },
          'futuristic': { key: 'futuristic' }
        };
        return "Transform into a historical era style";

      case 'other':
        const otherMapping = {
          'funny': { key: 'funny' },
          'scary': { key: 'scary' },
          'elegant': { key: 'elegant' },
          'minimalist': { key: 'minimalist' },
          'vintage': { key: 'vintage' },
          'modern': { key: 'modern' },
          'babyMode': { key: 'babyMode' },
          'coloringBook': { key: 'coloringBook' }
        };

        const otherMappingResult = otherMapping[selectedOtherSubcategory as keyof typeof otherMapping];
        if (otherMappingResult) {
          return OTHER_STYLES[otherMappingResult.key as keyof typeof OTHER_STYLES]?.suggestedPrompt || "Transform the image in a fun style";
        }
        return "Transform the image in an artistic style";

      case 'kids-real':
        return "Transform this children's drawing into a realistic photographic image. Maintain the composition, characters, and key elements from the drawing, but render them in a photorealistic style with natural lighting, proper proportions, and detailed textures. Keep the original colors as a guide but enhance them to look realistic. Add appropriate environmental details and background elements that complement the drawing's theme. The final image should look like a professional photograph that brings the child's drawing to life while preserving its creative essence and charm.";

      default:
        return "Transform the image in an artistic style";
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
              <ImageUploader 
                  onImageUploaded={handleImageUpload}
                  userCredits={userCredits}
                  onShowSignupModal={() => setShowSignupModal(true)}
                />
            </div>
          )}

          {currentStep === Step.Prompt && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Choose Your Transformation Style
                </h2>

                {/* Two-Tab Header */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-white border border-gray-200 rounded-2xl p-2 shadow-lg max-w-2xl mx-auto">
                    <button
                      className={
                        `flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ` +
                        (selectedTransformation !== 'custom' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                      }
                      onClick={() => setSelectedTransformation('animation')}
                    >
                      <div className={`text-2xl mb-1 ${selectedTransformation !== 'custom' ? 'animate-pulse' : ''}`}>
                        🖼️
                      </div>
                      <div className="text-sm font-semibold">Transform Image</div>
                      <div className="text-xs opacity-80 text-center leading-tight">
                        Quick AI styles
                      </div>
                    </button>

                    <button
                      className={
                        `flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ` +
                        (selectedTransformation === 'custom' 
                          ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')
                      }
                      onClick={() => setSelectedTransformation('custom')}
                    >
                      <div className={`text-2xl mb-1 ${selectedTransformation === 'custom' ? 'animate-pulse' : ''}`}>
                        ✨
                      </div>
                      <div className="text-sm font-semibold">Custom Prompt</div>
                      <div className="text-xs opacity-80 text-center leading-tight">
                        Your own ideas
                      </div>
                    </button>
                  </div>
                </div>

                {selectedTransformation === 'animation' ? (
                  <div>
                    <PromptInput
                      selectedStyle={selectedStyle}
                      setSelectedStyle={setSelectedStyle}
                      selectedCartoonSubcategory={selectedCartoonSubcategory}
                      setSelectedCartoonSubcategory={setSelectedCartoonSubcategory}
                      selectedProductSubcategory={selectedProductSubcategory}
                      setSelectedProductSubcategory={setSelectedProductSubcategory}
                      selectedOtherSubcategory={selectedOtherSubcategory}
                      setSelectedOtherSubcategory={setSelectedOtherSubcategory}
                    />

                    <div className="flex justify-center mt-8">
                      <RainbowButton onClick={handlePromptWithPresets} className="px-8 py-3">
                        Transform Image
                      </RainbowButton>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe how you want to transform your image:
                      </label>
                      <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="e.g., Transform this into a watercolor painting with soft brushstrokes and vibrant colors..."
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex justify-center">
                      <RainbowButton 
                        onClick={() => handlePromptSubmit(userPrompt)} 
                        className="px-8 py-3"
                        disabled={!userPrompt.trim()}
                      >
                        Transform Image
                      </RainbowButton>
                    </div>
                  </div>
                )}

                {uploadedImage && (
                  <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 mb-4">Preview of your uploaded image:</p>
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="max-w-xs mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}

                {errorMessage && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-center">{errorMessage}</p>
                  </div>
                )}
              </div>
            </div>
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