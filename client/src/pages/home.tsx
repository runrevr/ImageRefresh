import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ImageUploader from "@/components/ImageUploader";
import PromptInput from "@/components/PromptInput";
import ProcessingState from "@/components/ProcessingState";
import ResultView from "@/components/ResultView";
import EditPrompt from "@/components/EditPrompt";
import TransformationExamples from "@/components/TransformationExamples";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
import AccountNeededDialog from "@/components/AccountNeededDialog";
import trumpMulletImage from "../assets/trump-mullet.png";
import eightyStyleImage from "../assets/80s.png";
import bearDrawingImage from "../assets/bear-drawing.png";
import bearRealImage from "../assets/bear-real.png";
import giraffeDrawingImage from "../assets/giraffe-drawing.png";
import giraffeRealImage from "../assets/giraffe-real.png";
import dogCatDrawingImage from "../assets/dog-and-cat-drawing.png";
import dogCatRealImage from "../assets/dog-and-cat-real.png";
import alicornDrawingImage from "../assets/alicorn-drawing.jpg";
import alicornRealImage from "../assets/alicorn-real.png";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  getSavedStyle,
  clearSavedStyle,
  hasSavedStyle,
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

// We need a local user state to maintain the updated credit information
// This will be initialized with the data from useAuth
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(
    null,
  );
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [secondTransformedImage, setSecondTransformedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const { user: authUser } = useAuth();
  // Initialize local user state with data from auth
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);

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
  const [isOpenAIConfigured, setIsOpenAIConfigured] = useState<boolean>(true);

  const [selectedTransformation, setSelectedTransformation] =
    useState<TransformationType | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [showAccountNeededDialog, setShowAccountNeededDialog] =
    useState<boolean>(false);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [currentTransformation, setCurrentTransformation] = useState<any>(null); // Track current transformation data including DB ID
  const [hasTriedAnotherPrompt, setHasTriedAnotherPrompt] =
    useState<boolean>(false); // Track if user has already tried another prompt
  const { toast } = useToast();

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
      }
    };

    const fetchConfig = async () => {
      try {
        const response = await apiRequest("GET", "/api/config");
        const data = await response.json();
        setIsOpenAIConfigured(data.openaiConfigured);
      } catch (error) {
        console.error("Error fetching configuration:", error);
      }
    };

    fetchUserCredits();
    fetchConfig();
  }, [userCredits]);

  // Scroll to top when uploadForm appears
  useEffect(() => {
    if (showUploadForm) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showUploadForm]);

  // Check for email collection status on component mount
  useEffect(() => {
    const emailCollected = localStorage.getItem("emailCollected");
    const collectedEmail = localStorage.getItem("collectedEmail");

    if (emailCollected === "true" && collectedEmail) {
      setStoredEmail(collectedEmail);
    }
  }, []);

  // Check for showUpload query parameter and show upload form if present
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const showUploadParam = urlParams.get("showUpload");

    // If showUpload=true is present in the URL, automatically show the upload form
    if (showUploadParam === "true") {
      setShowUploadForm(true);
      setTimeout(() => {
        scrollToUploader();
      }, 500);
    }
  }, []);

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
      console.log("Found saved style:", style);
      if (style) {
        // Set the prompt from the saved style
        console.log("Setting prompt from saved style:", style.prompt);
        setPrompt(style.prompt);
        setSavedStyle(style);

        // Notify the user that a style is being applied
        toast({
          title: `"${style.title}" style selected`,
          description: `Your image has been uploaded. Click "Generate" to apply the transformation.`,
        });

        // Clear the saved style to avoid reapplying it
        clearSavedStyle();

        // Since we have a preset style, show the user we're ready to proceed
        // but wait for image upload before submitting
        setCurrentStep(Step.Prompt);
        console.log("Saved the prompt for later submission:", style.prompt);
        return;
      }
    }

    // If no saved style, just go to the prompt step
    setCurrentStep(Step.Prompt);
  };

  const handlePromptSubmit = async (
    promptText: string,
    imageSize: string = "1024x1024",
  ) => {
    console.log("Submitting prompt:", promptText);
    console.log("Image size:", imageSize);
    console.log("Original image path:", originalImagePath);
    console.log("User credits:", userCredits);

    // Validate image path exists before proceeding
    if (!originalImagePath) {
      toast({
        title: "Image Upload Error",
        description: "No image path found. Please try uploading your image again.",
        variant: "destructive",
      });
      setCurrentStep(Step.Upload);
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

      console.log("Full prompt being sent:", promptText);

      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath,
        prompt: promptText,
        userId: userCredits?.id,
        imageSize: imageSize,
      });

      if (response.ok) {
        // First try to parse as JSON in case it's a status response
        try {
          const data = await response.clone().json();
          console.log("Image transformation completed successfully");

          // Implement the defensive extraction logic
          let img1 = "";
          let img2 = "";

          try {
            // Handle the new server response format
            if (data && typeof data.transformedImageUrl === "string") {
              // This is the primary response format we expect now
              img1 = data.transformedImageUrl;
              
              if (data.secondTransformedImageUrl) {
                img2 = data.secondTransformedImageUrl;
              }
              
              // Store transformation data
              setCurrentTransformation({
                id: data.id,
                editsUsed: data.editsUsed || 0,
                transformedImageUrl: data.transformedImageUrl,
                secondTransformedImageUrl: data.secondTransformedImageUrl,
                prompt: data.prompt
              });
              
              setPrompt(data.prompt || promptText);
              
            } 
            // Handle legacy response formats for backward compatibility
            else if (typeof data === "string") {
              img1 = data;
            } else if (data && typeof data.transformedImagePath === "string") {
              img1 = data.transformedImagePath.startsWith("/") ? data.transformedImagePath : "/" + data.transformedImagePath;
              if (data.secondTransformedImagePath) {
                img2 = data.secondTransformedImagePath.startsWith("/") ? data.secondTransformedImagePath : "/" + data.secondTransformedImagePath;
              }
            } else if (data && Array.isArray(data.images)) {
              img1 = data.images[0]?.url || "";
              img2 = data.images[1]?.url || "";
            } else if (data && Array.isArray(data.result)) {
              img1 = data.result[0] || "";
              img2 = data.result[1] || "";
            } else if (data && typeof data.transformedImageUrl === "string") {
              // This is the expected format from server
              img1 = data.transformedImageUrl;
              if (data.secondTransformedImageUrl) {
                img2 = data.secondTransformedImageUrl;
              }
              
              // Store transformation details
              setCurrentTransformation({
                id: data.id,
                editsUsed: data.editsUsed || 0,
                transformedImageUrl: data.transformedImageUrl,
                secondTransformedImageUrl: data.secondTransformedImageUrl,
                prompt: data.prompt || promptText
              });
            } else {
              console.error("Unable to extract image URLs from response");
              toast({
                title: "Processing Issue",
                description: "Unable to display the transformed image. Please try again.",
                variant: "destructive",
              });
            }
          } catch (e: any) {
            console.error("Error extracting image URLs:", e, data);
            toast({
              title: "Processing Error",
              description: "There was an error processing the transformation result. Please try again.",
              variant: "destructive",
            });
          }

          setTransformedImage(img1);
          setSecondTransformedImage(img2);

          // Store transformation data including the database ID
          setCurrentTransformation(data);
          setCurrentStep(Step.Result);

          // Refresh user credits
          const creditsResponse = await apiRequest(
            "GET",
            `/api/credits/${userCredits?.id}`,
          );
          const creditsData = await creditsResponse.json();
          setUserCredits((prevUser) => prevUser ? {
            ...prevUser,
            freeCreditsUsed: creditsData.freeCreditsUsed,
            paidCredits: creditsData.paidCredits,
          } : null);

          if (data.transformationId) {
            // Asynchronous response - we need to poll for the result
            console.log("Transformation started, polling for status...", data.transformationId);

            // Store the transformation ID for polling
            setCurrentTransformation({ id: data.transformationId });

            // Set up polling for transformation status
            // Separate variable to track attempts within the checkStatus function
            let statusCheckAttempts = 0;

            // Define maxAttempts here so it's available in checkStatus
            const pollInterval = 3000;
            const maxAttempts = 60; // 180 seconds max (3 minutes)

            const checkStatus = async () => {
              statusCheckAttempts++; // Track the number of status checks

              try {
                console.log("Checking transformation status...", data.transformationId);
                const statusResponse = await apiRequest(
                  "GET", 
                  `/api/transformation/${data.transformationId}`
                );

                if (!statusResponse.ok) {
                  console.error("Error checking transformation status:", statusResponse.status);
                  throw new Error("Failed to check transformation status");
                }

                const statusData = await statusResponse.json();
                console.log("Transformation status:", statusData);

                // Check for completion or available image paths
                const hasCompletedStatus = statusData.status === "completed";
                const hasTransformedImagePath = !!statusData.transformedImagePath;
                const hasTransformedImageUrl = !!statusData.transformedImageUrl;

                if ((hasCompletedStatus || hasTransformedImagePath) && 
                    (hasTransformedImageUrl || hasTransformedImagePath)) {
                  console.log("Transformation completed:", statusData);

                  // Handle different API response formats
                  const transformedUrl = statusData.transformedImageUrl || 
                    (statusData.transformedImagePath ? `/${statusData.transformedImagePath}` : null);

                  if (transformedUrl) {
                    setTransformedImage(transformedUrl);

                    // Set the second transformed image if it exists
                    const secondUrl = statusData.secondTransformedImageUrl || 
                      (statusData.secondTransformedImagePath ? `/${statusData.secondTransformedImagePath}` : null);

                    if (secondUrl) {
                      console.log("Found second transformed image:", secondUrl);
                      setSecondTransformedImage(secondUrl);
                    } else {
                      setSecondTransformedImage(null);
                    }

                    // Store transformation data
                    setCurrentTransformation(statusData);
                    setCurrentStep(Step.Result);

                    return true; // polling complete
                  }

                  // If we have a completed status but no URL, continue polling a few more times
                  if (hasCompletedStatus && !transformedUrl && statusCheckAttempts < maxAttempts - 5) {
                    console.log("Status is completed but no image URL yet, continuing to poll");
                    return false;
                  }

                  // If we're near the max attempts and still no URL, treat as failure
                  if (!transformedUrl && statusCheckAttempts >= maxAttempts - 5) {
                    console.error("Transformation status is completed but no image URL available");
                    toast({
                      title: "Transformation error",
                      description: "Unable to retrieve the transformed image. Please try again.",
                      variant: "destructive",
                    });
                    setCurrentStep(Step.Prompt);
                    return true; // stop polling
                  }

                  // Refresh user credits
                  const creditsResponse = await apiRequest(
                    "GET",
                    `/api/credits/${userCredits?.id}`,
                  );
                  const creditsData = await creditsResponse.json();
                  setUserCredits((prevUser) => prevUser ? {
                    ...prevUser,
                    freeCreditsUsed: creditsData.freeCreditsUsed,
                    paidCredits: creditsData.paidCredits,
                  } : null);

                  return true; // polling complete
                } else if (statusData.status === "failed") {
                  console.error("Transformation failed:", statusData);
                  toast({
                    title: "Transformation failed",
                    description: statusData.message || "The image transformation failed. Please try again.",
                    variant: "destructive",
                  });
                  setCurrentStep(Step.Prompt);
                  return true; // polling complete
                }

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
                console.error("Error in polling interval:", error);
                clearInterval(pollTimer);
                setCurrentStep(Step.Prompt);
              }
            }, pollInterval);

            // Initial check (don't wait for first interval)
            checkStatus().catch(error => {
              console.error("Error in initial status check:", error);
            });
          } else {
            // No transformation ID or image URL - something went wrong
            console.error("Unexpected response format:", data);
            toast({
              title: "Unexpected response",
              description: "Received an unexpected response from the server. Please try again.",
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
            description: "Could not process server response. Please try again.",
            variant: "destructive",
          });
          setCurrentStep(Step.Prompt);
        }
      }
    } catch (error: any) {
      console.error("Error transforming image:", error);

      // Check for OpenAI model verification errors
      let errorMessage =
        "There was an error processing your image. Please try again.";

      if (
        error.message &&
        error.message.includes("organization verification")
      ) {
        errorMessage =
          "Your OpenAI account needs organization verification to use the gpt-image-1 model. This is a new model with limited access.";
      } else if (
        error.message &&
        error.message.includes("No image URL returned")
      ) {
        errorMessage =
          "The gpt-image-1 model is not available for your account. This model requires organization verification with OpenAI.";
      } else if (error.message && error.message.includes("safety system")) {
        errorMessage =
          "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.";
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
    setCurrentTransformation(null); // Clear current transformation data
    setHasTriedAnotherPrompt(false); // Reset the "tried another prompt" flag
    setCurrentStep(Step.Upload);
    setShowUploadForm(false);

    // Clear email collection status
    localStorage.removeItem("emailCollected");
    localStorage.removeItem("collectedEmail");
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
        isEdit: true, // Flag to indicate this is an edit
        previousTransformation: previousTransformationId, // Pass the extracted transformation ID
      });

      const data = await response.json();

      if (response.ok) {
        // Replace the transformed image with the edited version
        setTransformedImage(data.transformedImageUrl);
        // Store the new transformation data from the edit
        setCurrentTransformation(data);
        setCurrentStep(Step.Result);

        // Refresh user credits
        const creditsResponse = await apiRequest(
          "GET",
          `/api/credits/${userCredits?.id}`,
        );
        const creditsData = await creditsResponse.json();
        setUserCredits((prevUser) => prevUser ? {
          ...prevUser,
          freeCreditsUsed: creditsData.freeCreditsUsed,
          paidCredits: creditsData.paidCredits,
        } : null);
      } else {
        // Check for specific error types
        if (data.error === "content_safety") {
          toast({
            title: "Content Safety Alert",
            description:
              "Your edit request was rejected by our safety system. When making edits: (1) Focus only on color changes or simple visual adjustments, (2) Be very specific like 'Change the hat from blue to red', (3) Avoid requests that could modify character appearance beyond simple color changes.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Edit failed",
            description: data.message,
            variant: "destructive",
          });
        }
        // Go back to result step with the original transformation
        setCurrentStep(Step.Result);
      }
    } catch (error: any) {
      console.error("Error editing image:", error);

      let errorMessage =
        "There was an error editing your image. Please try again.";
      let errorTitle = "Edit Failed";

      if (error.message && error.message.includes("safety system")) {
        errorTitle = "Content Safety Alert";
        errorMessage =
          "Your edit request was rejected by our safety system. When making edits: (1) Focus only on color changes or simple visual adjustments, (2) Be very specific like 'Change the hat from blue to red', (3) Avoid requests that could modify character appearance beyond simple color changes.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      setCurrentStep(Step.Result);
    }
  };

  // Skip the edit and keep the current transformation
  const handleSkipEdit = () => {
    setCurrentStep(Step.Result);
  };

  // Handle preset transformations (cartoon, product photography, etc.)
  const handlePresetTransformation = async (presetType: string) => {
    // Convert string type to TransformationType
    const transformationType = presetType as TransformationType;
    if (!originalImagePath) {
      toast({
        title: "No image selected",
        description:
          "Please upload an image first to use preset transformations.",
        variant: "destructive",
      });
      return;
    }

    // Set the selected transformation
    setSelectedTransformation(transformationType);

    // Set a default image size for presets (square format)
    const imageSize = "1024x1024";

    // Reset the flag when applying a preset transformation
    setHasTriedAnotherPrompt(false);

    setCurrentStep(Step.Processing);

    // Scroll to top to see the processing state
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      console.log(`Applying ${presetType} preset transformation`);
      console.log("Original image path:", originalImagePath);

      // Validate image path is not empty
      if (!originalImagePath) {
        throw new Error("Image path is missing. Please try uploading the image again.");
      }

      const requestData = {
        originalImagePath,
        userId: userCredits?.id,
        preset: presetType,
        imageSize,
      };

      console.log("Sending transformation request with data:", requestData);
      const response = await apiRequest("POST", "/api/transform", requestData);

      const data = await response.json();

      if (response.ok) {
        // Handle the primary transformed image
        if (data.transformedImageUrl) {
          setTransformedImage(data.transformedImageUrl);
        } else {
          console.error("No primary transformed image URL in response");
          throw new Error("Failed to get transformed image");
        }

        // Handle the second transformed image if it exists
        if (data.secondTransformedImageUrl) {
          setSecondTransformedImage(data.secondTransformedImageUrl);
        } else {
          setSecondTransformedImage(null);
        }

        // Store transformation data including the database ID
        setCurrentTransformation(data);
        setCurrentStep(Step.Result);
        setPrompt(data.prompt);

        // Refetch user credits
        const creditsResponse = await apiRequest(
          "GET",
          `/api/credits/${userCredits?.id}`,
        );
        const creditsData = await creditsResponse.json();
        setUserCredits((prevUser) => prevUser ? {
          ...prevUser,
          freeCreditsUsed: creditsData.freeCreditsUsed,
          paidCredits: creditsData.paidCredits,
        } : {
          id: userCredits?.id || 0,
          freeCreditsUsed: creditsData.freeCreditsUsed,
          paidCredits: creditsData.paidCredits,
        });
      } else {
        // Check for specific error types
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

  // Function to scroll to uploader section
  const scrollToUploader = () => {
    // First scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Then scroll to the uploader element
    const uploaderElement = document.getElementById("uploader");
    if (uploaderElement) {
      uploaderElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Function to handle Upload button clicks with account check
  const handleUploadClick = () => {
    // If already logged in, ignore the email storage and clear it
    if (userCredits?.id) {
      localStorage.removeItem("emailCollected");
      localStorage.removeItem("collectedEmail");
      setStoredEmail(null);
      setShowUploadForm(true);
      return;
    }

    // If the user has previously used the email collection feature, show account dialog
    if (storedEmail) {
      setShowAccountNeededDialog(true);
    } else {
      setShowUploadForm(true);
    }
  };

  return (
    <div
      className="text-gray-800 min-h-screen flex flex-col"
      style={{ backgroundColor: "white" }}
    >
      <Navbar
        freeCredits={!userCredits?.freeCreditsUsed ? 1 : 0}
        paidCredits={userCredits?.paidCredits || 0}
      />

      {/* Account Needed Dialog */}
      <AccountNeededDialog
        open={showAccountNeededDialog}
        onClose={() => setShowAccountNeededDialog(false)}
        email={storedEmail}
        isLoggedIn={Boolean(userCredits?.id)}
        remainingCredits={userCredits?.paidCredits || 0}
      />

      <main className="relative w-full" style={{ paddingTop: '4rem' }}>
        {/* Hero Section - Carousel Style */}
        {currentStep === Step.Upload && !showUploadForm && (
          <>
            <HeroCarousel onCreateClick={handleUploadClick} />

            {!isOpenAIConfigured && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                <p>
                  OpenAI API key is not configured. Some features may not work
                  properly.
                </p>
              </div>
            )}

            {/* Mullet Transformation Highlight */}
            <div className="w-full bg-white py-16 mb-0">
              <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
                {/* Left side image (30%) */}
                <div className="w-full md:w-[30%] mb-8 md:mb-0">
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img                      src={trumpMulletImage} 
                      alt="Mullet Transformation Example" 
                      className="w-full h-auto"
                    />
                    <div className="absolute top-3 right-3 bg-[#FF7B54] text-white text-xs font-bold px-2 py-1 rounded-full">
                      FREE & NEW!
                    </div>
                  </div>
                </div>

                {/* Right side content (70%) */}
                <div className="w-full md:w-[70%] md:pl-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-3">
                    Business in the Front, Party in The Back
                  </h2>
                  <h3 className="text-xl text-[#2A7B9B] font-semibold mb-4">
                    Transform Anyone Into a Mullet Legend - Free & New!
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Wonder how you or your friends would rock the iconic mullet? Upload any photo to instantly see magnificent "business in front, party in back" transformations! Our free new feature preserves natural hair color while adding perfect rock-and-roll attitude. Try it now and discover the mullet you were born to wear!
                  </p>
                  <Button
                    className="bg-[#2A7B99B] hover:bg-[#1d5a73] text-white font-bold text-base px-6 py-3"
                    onClick={() => {
                      // If user is logged in, skip email check
                      if (userCredits?.id) {
                        setShowUploadForm(true);
                        scrollToUploader();                        // Set transformation to mullet
                        setSelectedTransformation("other");
                        // Set prompt for mullets
                        setPrompt("Transform this person's hairstyle into an iconic mullet while preserving their natural hair color, facial features, and identity.");
                      } else if (storedEmail) {
                        setShowAccountNeededDialog(true);
                      } else {
                        setShowUploadForm(true);
                        scrollToUploader();
                        // Set transformation to mullet
                        setSelectedTransformation("other");
                        // Set prompt for mullets
                        setPrompt("Transform this person's hairstyle into an iconic mullet while preserving their natural hair color, facial features, and identity.");
                      }
                    }}
                  >
                    UNLEASH THE MULLET
                  </Button>
                </div>
              </div>
            </div>

            {/* 80's Style Transformation Highlight */}
            <div className="w-full bg-[#333333] py-16 mb-0">
              <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
                {/* Left side content (70%) */}
                <div className="w-full md:w-[70%] md:pr-12 order-2 md:order-1">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    Totally Rad 80's Time Machine!
                  </h2>
                  <h3 className="text-xl text-[#FF7B54] font-semibold mb-4">
                    No 80's Pics? No Problem - Turn Back The Clock
                  </h3>
                  <p className="text-gray-200 mb-6 leading-relaxed">
                    Did you crush it in the 80's but don't have a picture to prove to your kids you were hip? Well now you do! Upload any photo and watch as we transform you with big hair, neon colors, and all that awesome 80's style. Time to relive the glory days – totally free!
                  </p>
                  <Button
                    className="bg-[#FF7B54] hover:bg-[#e56c49] text-white font-bold text-base px-6 py-3"
                    onClick={() => {
                      // If user is logged in, skip email check
                      if (userCredits?.id) {
                        setShowUploadForm(true);
                        scrollToUploader();
                        // Set transformation to 80s style
                        setSelectedTransformation("historical");
                        // Set prompt for 80s style
                        setPrompt("Transform this photo into a vibrant 1980s style with big hair, neon colors, and synth-wave aesthetics. Add 80s fashion elements, makeup, and styling while maintaining the person's identity.");
                      } else if (storedEmail) {
                        setShowAccountNeededDialog(true);
                      } else {
                        setShowUploadForm(true);
                        scrollToUploader();
                        // Set transformation to 80s style
                        setSelectedTransformation("historical");
                        // Set prompt for 80s style
                        setPrompt("Transform this photo into a vibrant 1980s style with big hair, neon colors, and synth-wave aesthetics. Add 80s fashion elements, makeup, and styling while maintaining the person's identity.");
                      }
                    }}
                  >
                    FLASHBACK TO THE 80'S
                  </Button>
                </div>

                {/* Right side image (30%) */}
                <div className="w-full md:w-[30%] mb-8 md:mb-0 order-1 md:order-2">
                  <div className="relative rounded-xl overflow-hidden shadow-lg">
                    <img 
                      src={eightyStyleImage} 
                      alt="80s Style Transformation Example" 
                      className="w-full h-auto"
                    />
                    <div className="absolute top-3 right-3 bg-[#FF7B54] text-white text-xs font-bold px-2 py-1 rounded-full">
                      FREE & NEW!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kids Drawing Transformation Section */}
            <div className="w-full bg-white py-16 mb-0">
              <div className="max-w-6xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-3">
                    Turn Children's Drawings Into Magical Reality
                  </h2>
                  <h3 className="text-xl text-[#2A7B9B] font-semibold mb-4">
                    Watch Kids' Imaginations Come to Life - Makes a Perfect Gift!
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                    Transform your child's artwork into stunning, realistic images they'll treasure forever. 
                    Our AI brings imagination to life - from beloved pets to magical creatures.
                  </p>
                </div>

                {/* 4-Column Grid of Before/After Images */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                  {/* Column 1: Bear */}
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={bearDrawingImage} 
                        alt="Child's Drawing of a Bear" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={bearRealImage} 
                        alt="AI Transformed Bear Drawing" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Column 2: Giraffe */}
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={giraffeDrawingImage} 
                        alt="Child's Drawing of a Giraffe" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={giraffeRealImage} 
                        alt="AI Transformed Giraffe Drawing" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Column 3: Dog and Cat */}
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={dogCatDrawingImage} 
                        alt="Child's Drawing of a Dog and Cat" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={dogCatRealImage} 
                        alt="AI Transformed Dog and Cat Drawing" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Column 4: Alicorn */}
                  <div className="flex flex-col space-y-2">
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={alicornDrawingImage} 
                        alt="Child's Drawing of an Alicorn" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                      <img 
                        src={alicornRealImage} 
                        alt="AI Transformed Alicorn Drawing" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button
                    className="bg-[#2A7B9B] hover:bg-[#1d5a73] text-white font-bold text-base px-6 py-3"
                    onClick={() => {
                      window.location.href = "/kids-drawing";
                    }}
                  >
                    EXPLORE KIDS DRAWING TRANSFORMATIONS
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    Perfect for gifts, keepsakes, and fostering children's creativity!
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="w-full bg-[#333333] py-12 mt-0 pt-12">
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
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      Product Photography
                    </h3>
                    <p className="text-gray-100 mb-4 max-w-xs">
                      Transform everyday product shots into professional studio
                      quality photos with enhanced lighting and composition.
                    </p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="outline"
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          // If user is logged in, skip email check
                          if (userCredits?.id) {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("product");
                          } else if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("product");
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
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      Cartoon Style
                    </h3>
                    <p className="text-gray-100 mb-4 max-w-xs">
                      Convert your photos into vibrant, stylized cartoon
                      illustrations with playful characters and expressive
                      details.
                    </p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="outline"
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          // If user is logged in, skip email check
                          if (userCredits?.id) {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("cartoon");
                          } else if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("cartoon");
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
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      Custom Transformations
                    </h3>
                    <p className="text-gray-100 mb-4 max-w-xs">
                      Turn ordinary photos into viral-worthy images with our
                      advanced AI. Create any style from classical paintings to
                      eye-catching social media content.
                    </p>
                    <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        variant="outline"
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        onClick={() => {
                          // If user is logged in, skip email check
                          if (userCredits?.id) {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("custom");
                          } else if (storedEmail) {
                            setShowAccountNeededDialog(true);
                          } else {
                            setShowUploadForm(true);
                            scrollToUploader();
                            setSelectedTransformation("custom");
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
            <TransformationExamples
              onExampleClick={() => {
                // If user is logged in, skip email check
                if (userCredits?.id) {
                  setShowUploadForm(true);
                } else if (storedEmail) {
                  setShowAccountNeededDialog(true);
                } else {
                  setShowUploadForm(true);
                }
              }}
            />

            {/* Pricing Section */}
            <PricingSection userId={userCredits?.id} />

            {/* FAQ Section */}
            <FaqSection />

            {/* Final CTA */}
            <CtaSection
              onClick={() => {
                // If user is logged in, skip email check
                if (userCredits?.id) {
                  setShowUploadForm(true);
                  scrollToUploader();
                } else if (storedEmail) {
                  setShowAccountNeededDialog(true);
                } else {
                  setShowUploadForm(true);
                  scrollToUploader();
                }
              }}
            />
          </>
        )}

        {/* Inline Upload Form & Main Wizard Flow */}
        {(showUploadForm || currentStep !== Step.Upload) && (
          <div
            id="uploader"
            className="bg-white rounded-xl shadow-lg overflow-hidden p-6 mb-10 max-w-3xl mx-auto"
          >
            {currentStep === Step.Upload && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-3 text-center">
                  Upload Your Photo
                </h2>
                <p className="text-red-500 font-medium mb-4 text-center">
                  Not all images with children in them will work with all prompts. AI is very strict about editing kids images (for good reason).
                </p>
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
                selectedTransformation={selectedTransformation as TransformationType | null}
                defaultPrompt={prompt} // Pass the prompt (which may contain savedStyle.prompt)
                savedStyle={savedStyle} // Pass the saved style with category and title
              />
            )}

            {currentStep === Step.Processing && originalImage && (
              <ProcessingState
                originalImage={originalImage}
                onCancel={handleCancel}
                transformationId={currentTransformation?.id}
              />
            )}

            {currentStep === Step.Result &&
              originalImage &&
              transformedImage && (
                <ResultView
                  originalImage={originalImage}
                  transformedImage={transformedImage}
                  secondTransformedImage={secondTransformedImage}
                  onTryAgain={handleTryAgain}
                  onNewImage={handleNewImage}
                  onEditImage={handleStartEdit}
                  prompt={prompt}
                  freeCredits={!userCredits?.freeCreditsUsed ? 1 : 0}
                  paidCredits={userCredits?.paidCredits || 0}
                  canEdit={true}
                  transformationId={currentTransformation?.id?.toString()}
                  editsUsed={currentTransformation?.editsUsed || 0}
                  userId={userCredits?.id}
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