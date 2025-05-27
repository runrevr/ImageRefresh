import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ImageUploader from "@/components/ImageUploader";
import PromptInput from "@/components/PromptInput";
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

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
  Edit,
}

// Import transformation types from PromptInput
import { 
  TransformationType,
  CartoonSubcategory,
  ProductSubcategory,
  OtherSubcategory,
} from "@/components/PromptInput";

// User credits state type
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function UploadPage() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [secondTransformedImage, setSecondTransformedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState<boolean>(true);
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationType | null>(null);
  const [currentTransformation, setCurrentTransformation] = useState<any>(null); // Track current transformation data including DB ID
  const [hasTriedAnotherPrompt, setHasTriedAnotherPrompt] = useState<boolean>(false); // Track if user has already tried another prompt
  
  // Update local user state when auth user changes
  useEffect(() => {
    if (authUser) {
      setUserCredits({
        id: authUser.id,
        freeCreditsUsed: authUser.freeCreditsUsed,
        paidCredits: authUser.paidCredits
      });
    } else {
      // For demo purposes when no user is authenticated, create a default guest user
      setUserCredits({
        id: 1,  // Use ID 1 as a default guest user
        freeCreditsUsed: false,
        paidCredits: 100  // Give demo users plenty of credits
      });
    }
  }, [authUser]);

  // Fetch user credits and OpenAI configuration on component mount
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (!userCredits) return;

      try {
        const response = await apiRequest("GET", `/api/credits/${userCredits.id}`);
        const data = await response.json();
        setUserCredits(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            freeCreditsUsed: data.freeCreditsUsed,
            paidCredits: data.paidCredits,
            id: prevState.id
          };
        });
      } catch (error) {
        console.error("Error fetching user credits:", error);
        // Don't show an error toast as this is a background refresh
      }
    };

    const fetchOpenAIConfig = async () => {
      try {
        const response = await apiRequest("GET", "/api/config");
        const data = await response.json();
        setIsOpenAIConfigured(data.openaiConfigured);
      } catch (error) {
        console.error("Error fetching configuration:", error);
        // Don't show an error toast as this is a background refresh
      }
    };

    fetchUserCredits();
    fetchOpenAIConfig();
  }, [userCredits?.id]);

  // Check for saved style from Ideas page
  const [savedStyle, setSavedStyle] = useState<{
    prompt: string;
    title: string;
    category: string;
  } | null>(null);

  // Flag to trigger auto-submission after uploading image with a selected style
  const [autoSubmitStyle, setAutoSubmitStyle] = useState<boolean>(false);

  // When a user uploads an image, check if they previously selected a style from the Ideas page
  const handleUpload = (imagePath: string, imageUrl: string) => {
    console.log("Image uploaded, path:", imagePath);
    console.log("Image URL:", imageUrl);

    // Validate inputs
    if (!imagePath || !imageUrl) {
      console.error("Invalid image path or URL received in handleUpload");
      toast({
        title: "Upload Error",
        description: "Could not process the uploaded image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setOriginalImage(imageUrl);
    setOriginalImagePath(imagePath);

    // Check if there's a saved style from the Ideas page
    if (hasSavedStyle()) {
      const style = getSavedStyle();
      if (style) {
        console.log("Found saved style:", style);
        setSavedStyle(style);

        // Set the primary transformation category based on style category
        if (style.category) {
          console.log("Setting primary category to", style.category, "from saved style");
          setSelectedTransformation(style.category as TransformationType);
        }

        // Move to the prompt step with the saved style
        setCurrentStep(Step.Prompt);
        
        // Flag that we should auto-submit after loading
        setAutoSubmitStyle(true);
        
        // Clear the saved style so it's not used again
        clearSavedStyle();
      }
    } else {
      // No saved style, just go to prompt step
      setCurrentStep(Step.Prompt);
    }
  };

  // When prompt is submitted, transform the image
  const handlePromptSubmit = async (
    promptText: string,
    imageSize: string = "square",
  ) => {
    if (!originalImagePath) {
      toast({
        title: "Missing Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    if (!promptText || promptText.trim().length === 0) {
      toast({
        title: "Missing Prompt",
        description: "Please provide a prompt for the transformation.",
        variant: "destructive",
      });
      return;
    }

    // Log the full prompt for debugging
    const promptLength = promptText?.length || 0;
    const promptPreview = promptText ? promptText.substring(0, 50) + "..." : "empty";
    console.log("Full prompt being sent:", promptText);

    setPrompt(promptText);
    setCurrentStep(Step.Processing);

    // Reset the flag when submitting a new transformation
    setHasTriedAnotherPrompt(false);

    // Scroll to top to see the processing state
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      // Log the full request details
      console.log("Sending transformation request with data:", {
        originalImagePath,
        prompt: promptText,
        promptLength: promptText?.length || 0,
        userId: userCredits?.id,
        imageSize: imageSize,
      });

      if (!originalImagePath) {
        console.error("Missing originalImagePath. Upload may not have completed properly.");
        throw new Error("Missing image path. Please upload an image again.");
      }

      if (!promptText || promptText.trim().length === 0) {
        console.error("Empty prompt text");
        throw new Error("Missing prompt text. Please provide a description for the transformation.");
      }

      console.log("Processing image transformation...");

      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath,
        prompt: promptText,
        userId: userCredits?.id,
        imageSize: imageSize,
      });

      // Check if the transformation was successful
      if (response.ok) {
        console.log("Image transformation completed successfully");

        try {
          // Try to parse as JSON first
          const data = await response.json();
          
          // Check if the response contains what we need
          if (data.transformedImageUrl) {
            // Set the transformed image URL from the response
            setTransformedImage(data.transformedImageUrl);
            
            // Store transformation data for potential later edits
            setCurrentTransformation({
              id: data.transformationId,
              prompt: promptText,
              transformedImageUrl: data.transformedImageUrl
            });
            
            // Move to the result step
            setCurrentStep(Step.Result);
            
            // If user had free credits available and used one, update the state
            if (userCredits && !userCredits.freeCreditsUsed) {
              setUserCredits(prev => {
                if (!prev) return null;
                return { ...prev, freeCreditsUsed: true };
              });
            } else if (userCredits && userCredits.paidCredits > 0) {
              // If they used a paid credit, decrement the count
              setUserCredits(prev => {
                if (!prev) return null;
                return { ...prev, paidCredits: prev.paidCredits - 1 };
              });
              
              // Log the updated credit count
              console.log("Credits updated:", userCredits.paidCredits - 1);
            }
          } else if (data.status === "processing" && data.transformationId) {
            // Transformation is still processing, we need to poll for status
            console.log("Transformation is processing, ID:", data.transformationId);
            
            // Store the transformation ID
            const transformationId = data.transformationId;
            
            // Set up polling for the transformation status
            const maxAttempts = 30; // 90 seconds max wait time (30 attempts * 3 seconds)
            
            const checkStatus = async () => {
              try {
                const statusResponse = await apiRequest(
                  "GET",
                  `/api/transform/${transformationId}/status`
                );
                
                if (!statusResponse.ok) {
                  console.error("Error checking transformation status");
                  toast({
                    title: "Status Check Failed",
                    description: "Unable to check transformation status. Please try again.",
                    variant: "destructive",
                  });
                  setCurrentStep(Step.Prompt);
                  return true; // stop polling on error
                }
                
                const statusData = await statusResponse.json();
                
                if (statusData.status === "completed" && statusData.transformedImageUrl) {
                  console.log("Transformation completed:", statusData);
                  
                  // Set the transformed image URL
                  setTransformedImage(statusData.transformedImageUrl);
                  
                  // Store transformation data
                  setCurrentTransformation({
                    id: transformationId,
                    prompt: promptText,
                    transformedImageUrl: statusData.transformedImageUrl
                  });
                  
                  // Move to result step
                  setCurrentStep(Step.Result);
                  
                  // Update user credits
                  if (userCredits && !userCredits.freeCreditsUsed) {
                    setUserCredits(prev => {
                      if (!prev) return null;
                      return { ...prev, freeCreditsUsed: true };
                    });
                  } else if (userCredits && userCredits.paidCredits > 0) {
                    setUserCredits(prev => {
                      if (!prev) return null;
                      return { ...prev, paidCredits: prev.paidCredits - 1 };
                    });
                    
                    console.log("Credits updated:", userCredits.paidCredits - 1);
                  }
                  
                  return true; // stop polling
                }
                
                if (statusData.status === "failed") {
                  console.error("Transformation failed:", statusData.message);
                  toast({
                    title: "Transformation Failed",
                    description: statusData.message || "Failed to transform the image. Please try again.",
                    variant: "destructive",
                  });
                  setCurrentStep(Step.Prompt);
                  return true; // stop polling
                }
                
                console.log("Transformation still processing...");
                return false; // continue polling
              } catch (error) {
                console.error("Error polling transformation status:", error);
                toast({
                  title: "Error checking status",
                  description: "There was a problem checking your transformation status. Please try again.",
                  variant: "destructive",
                });
                setCurrentStep(Step.Prompt);
                return true; // stop polling on error
              }
            };

            // Start polling (every 3 seconds)
            let attempts = 0;

            const pollTimer = setInterval(async () => {
              attempts++;
              try {
                const isDone = await checkStatus();
                if (isDone || attempts >= maxAttempts) {
                  clearInterval(pollTimer);

                  if (attempts >= maxAttempts && !isDone) {
                    console.error("Transformation polling timed out");

                    // Store transformation ID to allow checking later
                    if (data.transformationId) {
                      // Save to localStorage for retrieval later
                      try {
                        const pendingTransformations = JSON.parse(localStorage.getItem('pendingTransformations') || '[]');
                        pendingTransformations.push({
                          id: data.transformationId,
                          timestamp: new Date().toISOString(),
                          prompt: promptText?.substring(0, 100) + '...'
                        });
                        localStorage.setItem('pendingTransformations', JSON.stringify(pendingTransformations));
                      } catch (e) {
                        console.error("Error storing pending transformation", e);
                      }
                    }

                    toast({
                      title: "Transformation in progress",
                      description: "Your transformation is still processing. You can check your account page later to see the results.",
                    });
                    setCurrentStep(Step.Prompt);
                  }
                }
              } catch (error) {
                clearInterval(pollTimer);
                console.error("Error in polling loop:", error);
              }
            }, 3000);
          } else {
            // No transformation ID or image URL - something went wrong
            console.error("Missing required data in server response");
            toast({
              title: "Missing Data",
              description: "The server response is missing required information. Please try again.",
              variant: "destructive",
            });
            setCurrentStep(Step.Prompt);
          }
        } catch (jsonError) {
          // If JSON parsing fails, it might be an image
          console.warn("Failed to parse response as JSON, attempting to use as image URL");
          // Assuming the response is the image URL
          setTransformedImage(response.url); // Use the URL directly
          setCurrentStep(Step.Result);
        }
      } else {
        try {
          // Get error response as JSON
          const data = await response.json();
          // Check for specific error types
          console.error("Server returned error response:", data);
          if (data.error === "content_safety") {
            toast({
              title: "Content Safety Alert",
              description:
                "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Transformation failed",
              description: data.message || "An unknown error occurred during transformation",
              variant: "destructive",
            });
          }
          setCurrentStep(Step.Prompt);
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          toast({
            title: "Transformation failed",
            description: "An error occurred during transformation. Please try again.",
            variant: "destructive",
          });
          setCurrentStep(Step.Prompt);
        }
      }
    } catch (error: any) {
      console.error("Error transforming image:", error);
      let errorMessage = "An error occurred during transformation. Please try again.";

      // Handle some common errors more specifically
      if (error.message && error.message.includes("OpenAI") && error.message.includes("This model's maximum context length")) {
        errorMessage = "Your prompt is too long for the AI model. Please use a shorter description.";
      } else if (error.message && error.message.includes("401")) {
        errorMessage = "Error connecting to the AI service. Please check your API key configuration.";
      } else if (error.message && error.message.includes("gpt-4-vision")) {
        errorMessage = "Your OpenAI account needs organization verification to use the gpt-image-1 model. This is a new model with limited access.";
      } else if (error.message && error.message.includes("No image URL returned")) {
        errorMessage = "The gpt-image-1 model is not available for your account. This model requires organization verification with OpenAI.";
      } else if (error.message && error.message.includes("safety system")) {
        errorMessage = "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.";
      }

      toast({
        title: "Transformation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentStep(Step.Prompt);
    }
  };

  const handleTryAgain = () => {
    // Only allow trying another prompt if they haven't tried one already
    if (hasTriedAnotherPrompt) {
      toast({
        title: "Limit Reached",
        description:
          "You've already tried another prompt for this image. Please start a new transformation to try more options.",
        variant: "default",
      });
      return;
    }

    // Set the flag to indicate they've now tried another prompt
    setHasTriedAnotherPrompt(true);
    setPrompt("");
    setCurrentStep(Step.Prompt);
  };

  const handleNewImage = () => {
    setOriginalImage(null);
    setOriginalImagePath(null);
    setTransformedImage(null);
    setSecondTransformedImage(null); // Clear second transformed image
    setPrompt("");
    setSelectedTransformation(null);
    setHasTriedAnotherPrompt(false);
    setCurrentStep(Step.Upload);
  };

  // Handle starting edit process
  const handleStartEdit = () => {
    console.log("Starting edit with originalImage:", originalImage);
    console.log("Original image path:", originalImagePath);
    console.log("Transformed image:", transformedImage);
    setCurrentStep(Step.Edit);
  };

  // Handle edit submission
  const handleEditSubmit = async (
    editPrompt: string,
    imageSize: string = "1024x1024",
  ) => {
    setPrompt(editPrompt);
    setCurrentStep(Step.Processing);

    // Scroll to top to see the processing state
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      if (!transformedImage) {
        throw new Error("Missing transformed image for edit");
      }

      // Extract the file name from the transformed image URL path for use in our API call
      const transformedImagePath = transformedImage.startsWith("/")
        ? transformedImage.substring(1) // Remove leading slash if present
        : transformedImage;

      console.log("Using transformed image for edit:", transformedImagePath);

      // Extract transformation ID (which is stored in the database) if it exists from the previous API call
      // This needs to be the actual DB record ID, not the timestamp in the filename
      const previousTransformationId = currentTransformation?.id || null;

      console.log("Previous transformation ID:", previousTransformationId);

      // Send the edit request - using the transformed image as the base for editing
      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath: transformedImagePath, // Use the transformed image as the new base
        prompt: editPrompt,
        userId: userCredits?.id,
        imageSize: imageSize,
        isEdit: true, // Flag that this is an edit of a previous transformation
        previousTransformationId: previousTransformationId, // Include the previous transformation ID if available
      });

      // Process the response
      if (response.ok) {
        console.log("Edit transformation completed successfully");

        try {
          const data = await response.json();

          if (data.transformedImageUrl) {
            // Store the original transformed image before replacing it
            setSecondTransformedImage(transformedImage);
            
            // Update the transformed image with the new edited version
            setTransformedImage(data.transformedImageUrl);
            
            // Update current transformation data
            setCurrentTransformation({
              id: data.transformationId,
              prompt: editPrompt,
              transformedImageUrl: data.transformedImageUrl
            });
            
            // Move to the result step
            setCurrentStep(Step.Result);
            
            // If user had free credits available and used one, update the state
            if (userCredits && !userCredits.freeCreditsUsed) {
              setUserCredits(prev => {
                if (!prev) return null;
                return { ...prev, freeCreditsUsed: true };
              });
            } else if (userCredits && userCredits.paidCredits > 0) {
              // If they used a paid credit, decrement the count
              setUserCredits(prev => {
                if (!prev) return null;
                return { ...prev, paidCredits: prev.paidCredits - 1 };
              });
              
              console.log("Credits updated:", userCredits.paidCredits - 1);
            }
          } else {
            // Missing data in the response
            console.error("Missing transformed image URL in edit response");
            toast({
              title: "Edit Failed",
              description: "Missing data in server response. Please try again.",
              variant: "destructive",
            });
            setCurrentStep(Step.Edit);
          }
        } catch (jsonError) {
          console.error("Error parsing JSON from edit response:", jsonError);
          toast({
            title: "Edit Failed",
            description: "Error processing server response. Please try again.",
            variant: "destructive",
          });
          setCurrentStep(Step.Edit);
        }
      } else {
        // Handle error response
        try {
          const data = await response.json();
          console.error("Server returned error response for edit:", data);
          
          if (data.error === "content_safety") {
            toast({
              title: "Content Safety Alert",
              description: "Your edit request was rejected by our safety system. Please try a different prompt that is more appropriate for all audiences.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Edit Failed",
              description: data.message || "An unknown error occurred during editing",
              variant: "destructive",
            });
          }
          setCurrentStep(Step.Edit);
        } catch (parseError) {
          console.error("Failed to parse error response for edit:", parseError);
          toast({
            title: "Edit Failed",
            description: "An error occurred during editing. Please try again.",
            variant: "destructive",
          });
          setCurrentStep(Step.Edit);
        }
      }
    } catch (error: any) {
      console.error("Error during edit transformation:", error);
      
      // More specific error messages
      let errorMessage = "An error occurred during editing. Please try again.";
      
      if (error.message && error.message.includes("safety system")) {
        errorMessage = "Your edit request was rejected by our safety system. Please try a different prompt that is more appropriate for all audiences.";
      }
      
      toast({
        title: "Edit Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentStep(Step.Edit);
    }
  };

  // Apply a preset transformation style
  const handlePresetTransformation = async (presetPrompt: string, imageSize: string = "square") => {
    if (!originalImagePath) {
      toast({
        title: "Missing Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setPrompt(presetPrompt);
    setCurrentStep(Step.Processing);

    // Scroll to top to see the processing state
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      console.log("Applying preset transformation with prompt:", presetPrompt);
      console.log("Image size:", imageSize);

      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath,
        prompt: presetPrompt,
        userId: userCredits?.id,
        imageSize,
      });

      if (response.ok) {
        console.log("Preset transformation completed successfully");
        const data = await response.json();

        if (data.transformedImageUrl) {
          setTransformedImage(data.transformedImageUrl);
          
          // Store transformation data
          setCurrentTransformation({
            id: data.transformationId,
            prompt: presetPrompt,
            transformedImageUrl: data.transformedImageUrl
          });
          
          setCurrentStep(Step.Result);
          
          // Update user credit status
          if (userCredits && !userCredits.freeCreditsUsed) {
            setUserCredits(prev => {
              if (!prev) return null;
              return { ...prev, freeCreditsUsed: true };
            });
          } else if (userCredits && userCredits.paidCredits > 0) {
            setUserCredits(prev => {
              if (!prev) return null;
              return { ...prev, paidCredits: prev.paidCredits - 1 };
            });
            
            console.log("Credits updated:", userCredits.paidCredits - 1);
          }
        } else {
          console.error("Missing transformed image URL in preset response");
          toast({
            title: "Transformation Failed",
            description: "Missing data in server response. Please try again.",
            variant: "destructive",
          });
          setCurrentStep(Step.Prompt);
        }
      } else {
        const data = await response.json();
        console.error("Server returned error for preset transformation:", data);
        
        if (data.error === "content_safety") {
          toast({
            title: "Content Safety Alert",
            description:
              "Your request was rejected by our safety system. Please try a different style that is more appropriate for all audiences.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Transformation failed",
            description: data.message,
            variant: "destructive",
          });
        }
        setCurrentStep(Step.Upload);
      }
    } catch (error) {
      console.error("Error applying preset transformation:", error);

      // Extract error message
      const errorMessage =
        error instanceof Error
          ? error.message.includes("safety system")
            ? "Your request was rejected by our safety system. Please try a different style that is more appropriate for all audiences."
            : error.message
          : "Failed to apply transformation";

      toast({
        title: "Transformation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentStep(Step.Upload);
    }
  };

  // Auto-submit when a style is pre-selected
  useEffect(() => {
    if (autoSubmitStyle && savedStyle && currentStep === Step.Prompt) {
      // Reset the flag
      setAutoSubmitStyle(false);
      
      // Auto-submit with the saved style prompt
      setTimeout(() => {
        handlePromptSubmit(savedStyle.prompt);
      }, 300);
    }
  }, [autoSubmitStyle, savedStyle, currentStep]);
  
  // Reset scroll position when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Extract any parameters from the URL
  const [location] = useLocation();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const uploadedImagePath = urlParams.get('image');
    
    if (uploadedImagePath) {
      console.log("Found image path in URL params:", uploadedImagePath);
      // TODO: Handle this case if needed - fetch the image or set a flag
    }
  }, [location]);

  return (
    <div className="text-gray-800 min-h-screen flex flex-col bg-gray-50">
      <Navbar
        freeCredits={!userCredits?.freeCreditsUsed ? 1 : 0}
        paidCredits={userCredits?.paidCredits || 0}
      />

      <main className="flex-1 container mx-auto px-4 py-8 mt-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Wizard Flow */}
          <div
            id="uploader"
            className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-10"
          >
            {currentStep === Step.Upload && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-3 text-gray-900">
                    Transform Your Photos with AI Magic ✨
                  </h2>
                  <p className="text-lg text-gray-600">
                    Turn ordinary photos into extraordinary art in seconds
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Works best with clear, well-lit photos
                  </p>
                </div>
                <ImageUploader onImageUploaded={handleUpload} />
              </div>
            )}

            {currentStep === Step.Prompt && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-3 text-center">
                  Describe Your Transformation
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-medium mb-2">Original Image</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-48 md:h-64 flex items-center justify-center bg-gray-50">
                      {originalImage ? (
                        <img
                          src={originalImage}
                          alt="Original"
                          className="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          No image uploaded
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={handleNewImage}
                      >
                        Upload Different Image
                      </Button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <PromptInput
                      originalImage={originalImage || ""}
                      onSubmit={handlePromptSubmit}
                      onBack={handleNewImage}
                      selectedTransformation={selectedTransformation}
                      savedStyle={savedStyle}
                      defaultPrompt={prompt}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === Step.Processing && (
              <ProcessingState 
                originalImage={originalImage || ""} 
                onCancel={() => setCurrentStep(Step.Prompt)} 
              />
            )}

            {currentStep === Step.Result && transformedImage && (
              <ResultView
                originalImage={originalImage || ""}
                transformedImage={transformedImage}
                secondTransformedImage={secondTransformedImage}
                prompt={prompt}
                onEditImage={handleStartEdit}
                onTryAgain={handleTryAgain}
                onNewImage={handleNewImage}
                freeCredits={userCredits?.freeCreditsUsed ? 0 : 1}
                paidCredits={userCredits?.paidCredits || 0}
                canEdit={true}
              />
            )}

            {currentStep === Step.Edit && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-3 text-center">
                  Edit Your Transformation
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="w-full md:w-1/3">
                    <h3 className="text-lg font-medium mb-2">Current Image</h3>
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-48 md:h-64 flex items-center justify-center bg-gray-50">
                      {transformedImage ? (
                        <img
                          src={transformedImage}
                          alt="Current"
                          className="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <div className="text-gray-400 text-center p-4">
                          No image available
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <RainbowButton 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => setCurrentStep(Step.Result)}
                      >
                        Cancel Edit
                      </RainbowButton>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <EditPrompt
                      originalImage={originalImage || ""}
                      transformedImage={transformedImage || ""}
                      initialPrompt={prompt}
                      onSubmit={handleEditSubmit}
                      onSkip={() => setCurrentStep(Step.Result)}
                      editsUsed={0}
                      freeCreditsUsed={userCredits?.freeCreditsUsed || false}
                      paidCredits={userCredits?.paidCredits || 0}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}