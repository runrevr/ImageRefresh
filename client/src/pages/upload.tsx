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
import SignupRequiredModal from "@/components/SignupRequiredModal";

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
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

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

  // Auto-submit functionality removed - styles are now just pre-filled

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

        // Clear the saved style so it's not used again
        clearSavedStyle();
      }

      // Always go to prompt step to show categories
      setCurrentStep(Step.Prompt);
    }
  };

  // Check if user has credits available
  const checkCreditsAndAuth = () => {
    // For non-authenticated users, we'll let the server determine credit status
    // and handle the popup in the error handling
    if (!authUser) {
      return true; // Let server check credits
    } else {
      // For authenticated users, check their credit status
      if (userCredits && userCredits.freeCreditsUsed && userCredits.paidCredits <= 0) {
        toast({
          title: "No Credits Available",
          description: "You need to purchase credits to continue creating transformations.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
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

    // Check credits and authentication before proceeding
    if (!checkCreditsAndAuth()) {
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

      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImagePath,
          prompt: promptText,
          userId: userCredits?.id,
          imageSize: imageSize,
        }),
      });

      // Handle both success and error responses
      try {
        const data = await response.json();

        // Check if the transformation was successful
        if (response.ok) {
          console.log("Image transformation completed successfully");

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
        } else {
          // Handle error responses
          console.error("Server returned error response:", data);
          if (data.error === "content_safety") {
            toast({
              title: "Content Safety Alert",
              description:
                "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.",
              variant: "destructive",
            });
          } else if (data.error === "credit_required") {
            if (!authUser) {
              // Show signup modal for non-authenticated users who need credits
              console.log("Showing signup modal for guest user who needs credits");
              setShowSignupModal(true);
              setCurrentStep(Step.Prompt);
              return; // Don't show additional error toast
            } else {
              // For authenticated users, show regular error message
              toast({
                title: "No Credits Available",
                description: "You need to purchase credits to continue creating transformations.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Transformation failed",
              description: data.message || "An unknown error occurred during transformation",
              variant: "destructive",
            });
          }
          setCurrentStep(Step.Prompt);
        }
      } catch (jsonError) {
        console.error("Failed to parse response as JSON:", jsonError);
        toast({
          title: "Transformation failed",
          description: "An error occurred during transformation. Please try again.",
          variant: "destructive",
        });
        setCurrentStep(Step.Prompt);
      }
    } catch (fetchError: any) {
      console.error("Fetch error for /api/transform:", fetchError);
      console.error("Error transforming image:", fetchError);

      // Check if this is a fetch response that we haven't handled yet
      if (fetchError.response && !fetchError.response.ok) {
        try {
          const errorData = await fetchError.response.json();
          console.error("Server returned error response:", errorData);

          if (errorData.error === "credit_required") {
            if (!authUser) {
              // Show signup modal for non-authenticated users who need credits
              console.log("Showing signup modal for guest user who needs credits");
              setShowSignupModal(true);
              setCurrentStep(Step.Prompt);
              return; // Don't show additional error toast
            } else {
              // For authenticated users, show regular error message
              toast({
                title: "No Credits Available",
                description: "You need to purchase credits to continue creating transformations.",
                variant: "destructive",
              });
            }
          } else {
            toast({
              title: "Transformation failed",
              description: errorData.message || "An unknown error occurred during transformation",
              variant: "destructive",
            });
          }
          setCurrentStep(Step.Prompt);
          return;
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }
      }

      let errorMessage = "An error occurred during transformation. Please try again.";

      // Handle some common errors more specifically
      if (fetchError.message && fetchError.message.includes("OpenAI") && fetchError.message.includes("This model's maximum context length")) {
        errorMessage = "Your prompt is too long for the AI model. Please use a shorter description.";
      } else if (fetchError.message && fetchError.message.includes("401")) {
        errorMessage = "Error connecting to the AI service. Please check your API key configuration.";
      } else if (fetchError.message && fetchError.message.includes("gpt-4-vision")) {
        errorMessage = "Your OpenAI account needs organization verification to use the gpt-image-1 model. This is a new model with limited access.";
      } else if (fetchError.message && fetchError.message.includes("No image URL returned")) {
        errorMessage = "The gpt-image-1 model is not available for your account. This model requires organization verification with OpenAI.";
      } else if (fetchError.message && fetchError.message.includes("safety system")) {
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

  // Auto-submit functionality removed - just pre-fill the form and let user click Transform

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

                {/* Two-Tab Header */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-white border border-gray-200 rounded-2xl p-2 shadow-lg max-w-2xl mx-auto">
                    <button
                      className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ${
                        selectedTransformation !== 'custom' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('animation')}
                    >
                      <div className={`text-2xl mb-1 ${selectedTransformation !== 'custom' ? 'animate-pulse' : ''}`}>
                        🖼️
                      </div>
                      <div className="text-sm font-semibold">Transform Image</div>
                      <div className="text-xs opacity-80 text-center leading-tight">
                        Upload a photo and choose from preset styles
                      </div>
                    </button>
                    <button
                      className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ${
                        selectedTransformation === 'custom' 
                          ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('custom')}
                    >
                      <div className={`text-2xl mb-1 ${selectedTransformation === 'custom' ? 'animate-pulse' : ''}`}>
                        ✨
                      </div>
                      <div className="text-sm font-semibold">Custom Prompt</div>
                      <div className="text-xs opacity-80 text-center leading-tight">
                        Describe your own unique transformation
                      </div>
                    </button>
                  </div>
                </div>

                {/* Custom Prompt UI */}
                {selectedTransformation === 'custom' && (
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200">
                      <div className="text-center mb-8">
                        <div className="text-4xl mb-4">✨</div>
                        <h2 className="text-3xl font-bold mb-3 text-gray-900">
                          Create From Your Imagination
                        </h2>
                        <p className="text-lg text-gray-600">
                          Describe what you want to create and let AI bring it to life
                        </p>
                      </div>

                      <div className="mb-8">
                        <textarea
                          className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"                  placeholder="Example: A majestic dragon flying over a crystal city at sunset, photorealistic style, 8kquality..."
                          value=""
                          onChange={() => {}}
                        />
                      </div>

                      <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900">Try these ideas:</h3>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { emoji: "🐱", text: "Cyberpunk Cat" },
                            { emoji: "🧚", text: "Fantasy Scene" },
                            { emoji: "🚀", text: "Space Adventure" },
                            { emoji: "☕", text: "Steampunk Cafe" }
                          ].map((idea, index) => (
                            <button
                              key={index}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                              onClick={() => {}}
                            >
                              <span>{idea.emoji}</span>
                              <span className="text-sm font-medium">{idea.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg">
                        <span className="text-lg">💡</span>
                        <p className="text-sm">
                          Tip: You can also upload an image to use as reference for your custom prompt
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTransformation !== 'custom' && (
                  <>
                    <ImageUploader onImageUploaded={handleUpload} />

                    {/* Category Selection Section - Show before upload */}
                    <div className="mt-12 mb-12">
                      <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Choose Your Style Category</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {/* Fun/Viral Category */}
                        <button
                          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedTransformation === 'other' 
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTransformation('other')}
                        >
                          <div className="text-3xl mb-2">✨</div>
                          <div className="text-sm font-semibold text-gray-900">Fun/Viral</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            Creative transformations for social sharing
                          </div>
                        </button>

                        {/* Pop Culture Category */}
                        <button
                          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedTransformation === 'historical' 
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTransformation('historical')}
                        >
                          <div className="text-3xl mb-2">🕰️</div>
                          <div className="text-sm font-semibold text-gray-900">Pop Culture</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            Through the decades and eras
                          </div>
                        </button>

                        {/* Animation Category */}
                        <button
                          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedTransformation === 'animation' 
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTransformation('animation')}
                        >
                          <div className="text-3xl mb-2">🎬</div>
                          <div className="text-sm font-semibold text-gray-900">Animation</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            Cartoon and animated styles
                          </div>
                        </button>

                        {/* Artistic Category */}
                        <button
                          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedTransformation === 'artistic' 
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTransformation('artistic')}
                        >
                          <div className="text-3xl mb-2">🎨</div>
                          <div className="text-sm font-semibold text-gray-900">Artistic</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            Paintings and artistic styles
                          </div>
                        </button>

                        {/* Kids Real Category */}
                        <button
                          className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                            selectedTransformation === 'kids-real' 
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedTransformation('kids-real')}
                        >
                          <div className="text-3xl mb-2">👶</div>
                          <div className="text-sm font-semibold text-gray-900">Kids Drawing</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            Turn into kids drawing style
                          </div>
                        </button>

                        {/* Browse All Styles */}
                        <button
                          className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#84CC16] hover:bg-[#84CC16]/5 transition-all duration-300"
                          onClick={() => window.location.href = '/ideas'}
                        >
                          <div className="text-3xl mb-2">👀</div>
                          <div className="text-sm font-semibold text-gray-900">Browse All</div>
                          <div className="text-xs text-gray-600 text-center mt-1">
                            See all available styles
                          </div>
                        </button>
                      </div>
                    </div>

                    
                  </>
                )}

                </div>
              )}

            {currentStep === Step.Prompt && (
              <div className="max-w-3xl mx-auto">
                {/* Uploaded Image Display */}
                {originalImage && (
                  <div className="mb-8">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Uploaded Image</h3>
                      <p className="text-gray-600">Great! Now choose a style category to transform your image.</p>
                    </div>

                    <div className="relative max-w-md mx-auto mb-4">
                      <img 
                        src={originalImage} 
                        alt="Uploaded image" 
                        className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                      />
                    </div>

                    <div className="text-center">
                      <button 
                        onClick={handleNewImage}
                        className="text-[#06B6D4] hover:text-[#06B6D4]/80 text-sm font-medium underline"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                )}

                {/* Category Selection Section - Now appears after upload */}
                <div className="mb-12">
                  <h3 className="text-xl font-semibold text-center mb-6 text-gray-900">Choose Your Style Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {/* Fun/Viral Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'other' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('other')}
                    >
                      <div className="text-3xl mb-2">✨</div>
                      <div className="text-sm font-semibold text-gray-900">Fun/Viral</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Creative transformations for social sharing
                      </div>
                    </button>

                    {/* Pop Culture Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'historical' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('historical')}
                    >
                      <div className="text-3xl mb-2">🕰️</div>
                      <div className="text-sm font-semibold text-gray-900">Pop Culture</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Through the decades and eras
                      </div>
                    </button>

                    {/* Animation Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'animation' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('animation')}
                    >
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="text-sm font-semibold text-gray-900">Animation</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Cartoon and animated styles
                      </div>
                    </button>

                    {/* Artistic Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'artistic' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('artistic')}
                    >
                      <div className="text-3xl mb-2">🎨</div>
                      <div className="text-sm font-semibold text-gray-900">Artistic</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Paintings and artistic styles
                      </div>
                    </button>

                    {/* Kids Real Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'kids-real' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('kids-real')}
                    >
                      <div className="text-3xl mb-2">👶</div>
                      <div className="text-sm font-semibold text-gray-900">Kids Drawing</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        Turn into kids drawing style
                      </div>
                    </button>

                    {/* Browse All Styles */}
                    <button
                      className="flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#84CC16] hover:bg-[#84CC16]/5 transition-all duration-300"
                      onClick={() => window.location.href = '/ideas'}
                    >
                      <div className="text-3xl mb-2">👀</div>
                      <div className="text-sm font-semibold text-gray-900">Browse All</div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        See all available styles
                      </div>
                    </button>
                  </div>
                </div>

                <PromptInput
                  originalImage={originalImage}
                  selectedTransformation={selectedTransformation}
                  savedStyle={savedStyle}
                  onPromptSubmit={handlePromptSubmit}
                  onNewImage={handleNewImage}
                />
              </div>
            )}

            {currentStep === Step.Processing && (
              <ProcessingState originalImage={originalImage} prompt={prompt} />
            )}

            {currentStep === Step.Result && (
              <ResultView
                originalImage={originalImage}
                transformedImage={transformedImage}
                secondTransformedImage={secondTransformedImage}
                prompt={prompt}
                onTryAgain={handleTryAgain}
                onNewImage={handleNewImage}
                onStartEdit={handleStartEdit}
              />
            )}

            {currentStep === Step.Edit && (
              <EditPrompt
                originalImage={originalImage}
                transformedImage={transformedImage}
                prompt={prompt}
                onEditSubmit={handleEditSubmit}
                onNewImage={handleNewImage}
              />
            )}
          </div>

          {/* Bottom Navigation & Credits */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Powered by AI - Create stunning visuals in seconds
            </p>
            {/* Conditionally render the link based on authentication status */}
            {authUser ? (
              <a href="/account" className="text-blue-500 hover:underline text-sm">
                Manage Account & Credits
              </a>
            ) : (
              <Button variant="link" onClick={() => setShowSignupModal(true)}>
                Signup to Save
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Signup Required Modal */}
      <SignupRequiredModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </div>
  );
}