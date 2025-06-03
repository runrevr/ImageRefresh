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

// Import transformation types and style definitions from PromptInput
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
  const [transformedImages, setTransformedImages] = useState<string[]>([]);
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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedImageSize, setSelectedImageSize] = useState<string>('square');

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

            // Handle multiple variations if available
            if (data.transformedImageUrls && data.transformedImageUrls.length > 0) {
              setTransformedImages(data.transformedImageUrls);
              // Set second image if we have multiple variations
              if (data.transformedImageUrls.length > 1) {
                setSecondTransformedImage(data.transformedImageUrls[1]);
              }
            } else {
              setTransformedImages([data.transformedImageUrl]);
            }
            
            // Also handle direct secondTransformedImageUrl from response
            if (data.secondTransformedImageUrl) {
              setSecondTransformedImage(data.secondTransformedImageUrl);
            }

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

                  // Handle multiple variations if available
                  if (statusData.transformedImageUrls && statusData.transformedImageUrls.length > 0) {
                    setTransformedImages(statusData.transformedImageUrls);
                    // Set second image if we have multiple variations
                    if (statusData.transformedImageUrls.length > 1) {
                      setSecondTransformedImage(statusData.transformedImageUrls[1]);
                    }
                  } else {
                    setTransformedImages([statusData.transformedImageUrl]);
                  }

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
    setTransformedImages([]);
    setSecondTransformedImage(null); // Clear second transformed image
    setPrompt("");
    setSelectedTransformation(null);
    setSelectedSubcategory(null);
    setSelectedImageSize('square');
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

  // Handle the "Let's Make Magic" button click
  const handleMakeMagic = async () => {
    if (!selectedSubcategory || !originalImagePath) {
      toast({
        title: "Missing Requirements",
        description: "Please select a style and upload an image first.",
        variant: "destructive",
      });
      return;
    }

    // Map subcategory to detailed professional prompts from PromptInput.tsx
    const getDetailedPrompt = (subcategory: string): string => {
      switch (subcategory) {
        // Animation styles (cartoon category from PromptInput.tsx)
        case 'mario':
          return "Transform into a Super Mario Bros character with authentic Nintendo game aesthetic. Apply the distinctive blocky, geometric art style characteristic of the Super Mario universe with bright, saturated colors and clear visual elements. Convert clothing into Mario-style overalls, gloves, and signature accessories while maintaining the subject's pose and basic proportions. Add iconic Mario elements including the classic cap with 'M' emblem, mustache (if appropriate), and color scheme of red, blue, and brown. Set against backgrounds inspired by Mario game worlds such as green hills with floating blocks, castle courtyards, or simple sky backgrounds with clouds. Apply the cel-shaded, cartoon rendering style that makes characters appear as if they belong in a Nintendo game. The final image should authentically capture the playful, heroic aesthetic of the Super Mario Bros universe while maintaining clear likeness to the original subject.";
        
        case 'minecraft':
          return "Transform into Minecraft character style with the game's distinctive cubic, pixelated aesthetic. Apply blocky geometric shapes to all features while maintaining recognizable human proportions within the Minecraft art style constraints. Convert clothing into Minecraft-appropriate textures with visible pixelation and limited color palette typical of the game. Add characteristic Minecraft elements such as square heads, blocky arms and torso, and simplified facial features rendered in pixel art style. Set against Minecraft world backgrounds featuring cubic terrain, blocky trees, geometric structures, or simple sky backgrounds with cubic clouds. Apply the low-resolution, pixelated rendering style that makes the character appear as if they exist within the Minecraft universe. The final image should authentically capture the geometric, voxel-based aesthetic of Minecraft while maintaining enough detail to recognize the original subject.";
        
        case 'pixar':
          return "Transform into Pixar animation style with the studio's signature 3D computer animation aesthetic. Apply the characteristic Pixar rendering style including smooth surfaces, expressive facial features, and warm, appealing character design. Convert into the slightly stylized human proportions typical of Pixar characters with enhanced expressiveness and appealing simplification. Add Pixar-style clothing with realistic fabric simulation, appropriate textures, and the studio's attention to material detail. Set against backgrounds inspired by Pixar films featuring warm lighting, atmospheric depth, and the studio's signature environmental storytelling. Apply the sophisticated 3D rendering style with subtle subsurface scattering, realistic lighting, and the polished quality characteristic of Pixar's technical excellence. The final image should capture the heartwarming, emotionally engaging quality of Pixar character design while maintaining clear likeness to the original subject.";
        
        case 'trolls':
          return "Transform into DreamWorks Trolls character style with the franchise's distinctive colorful and whimsical aesthetic. Apply the characteristic Trolls rendering style including vibrant gem-like skin tones, expressive large eyes, and the franchise's signature hair-centric design. Convert into Trolls character proportions with enhanced expressiveness and the brand's optimistic, joyful character design approach. Add signature Trolls elements including wild, gravity-defying hair in bright colors, sparkles, gems, and the franchise's distinctive fashion sense. Set against Trolls-world backgrounds featuring bright colors, magical elements, musical themes, and the franchise's celebration of happiness and friendship. Apply the polished 3D animation style with bright lighting, saturated colors, and the energetic quality characteristic of the Trolls universe. The final image should capture the joyful, musical, and friendship-focused spirit of the Trolls franchise while maintaining recognizable features of the original subject.";
        
        case 'princess':
          return "Transform into Disney princess/prince style with elegant royal character design and fairy tale aesthetic. Apply the characteristic Disney animation rendering style including graceful proportions, expressive eyes, and refined facial features typical of Disney royalty. Convert clothing into period-appropriate royal attire with elaborate details, rich fabrics, and accessories befitting Disney royalty including tiaras, jewelry, and elegant garments. Add Disney princess/prince elements such as perfect posture, gentle expressions, and the aspirational quality characteristic of Disney royal characters. Set against fairy tale backgrounds featuring castle environments, magical gardens, romantic settings, or simple gradient backgrounds with sparkles and magical elements. Apply the polished 2D or 3D Disney animation style with soft lighting, appealing character design, and the timeless quality of Disney's royal character tradition. The final image should capture the grace, nobility, and magical quality of Disney royalty while maintaining clear likeness to the original subject.";
        
        case 'superhero':
          return "Transform into superhero character style with dynamic comic book aesthetic and heroic presentation. Apply the characteristic superhero rendering style including idealized proportions, confident posture, and the bold visual language of comic book art. Convert clothing into a custom superhero costume with appropriate colors, symbols, cape (if suitable), and accessories that reflect heroic character design. Add superhero elements including dramatic lighting, action-ready pose, determination in facial expression, and visual effects that suggest superpowers. Set against comic book-inspired backgrounds featuring city skylines, dramatic skies, action scenes, or classic comic book panel layouts with bold colors. Apply the stylized comic book rendering style with bold outlines, dramatic shadows, vibrant colors, and the dynamic energy characteristic of superhero comics. The final image should capture the heroic, inspiring quality of superhero character design while maintaining clear likeness to the original subject.";
        
        case 'lego':
          return "Transform into LEGO minifigure character with authentic LEGO aesthetic and plastic brick construction appearance. Apply the characteristic LEGO rendering style including cylindrical head, C-shaped hands, simplified facial features painted or printed on the head piece, and the distinctive segmented body construction. Convert clothing into LEGO-appropriate designs with printed details, accessories, and color schemes typical of LEGO minifigures. Add authentic LEGO elements including the cylindrical connection studs on the head, simplified but expressive facial expression, and poseable arms and legs characteristic of actual LEGO minifigures. Set against LEGO world backgrounds featuring LEGO brick construction, baseplates, or simple studio photography style backgrounds appropriate for displaying LEGO figures. Apply the plastic toy rendering style with appropriate reflectivity, solid colors, and the manufactured quality characteristic of actual LEGO products. The final image should authentically replicate how the subject would appear if they were manufactured as an actual LEGO minifigure.";

        // Historical styles (era category from PromptInput.tsx)
        case 'western':
          return "Transform into an authentic Old Western (1860s-1890s) character with period-accurate clothing and frontier aesthetic. Apply historically accurate Western styling including leather boots, spurs, wide-brimmed hats, bandanas, vests, chaps, gun belts, and other period-appropriate accessories. Convert clothing to authentic frontier materials like leather, denim, wool, and cotton with appropriate wear and weathering for the harsh frontier life. Add characteristic Western elements such as rugged postures, confident expressions reflecting frontier independence, and styling that suggests life in the American frontier. Set against authentic Western backgrounds including frontier towns, saloons with swinging doors, open ranges with horses, desert landscapes, or rustic indoor settings with period furniture. Apply the visual style reminiscent of classic Western photography and cinema with warm, dusty lighting and the iconic aesthetic of the American frontier era. The final image should authentically capture the rugged, independent spirit of the Old West while maintaining clear likeness to the original subject.";
        
        case 'hiphop':
          return "Transform into authentic 1990s Hip-Hop style reflecting the golden age of the genre and its distinctive cultural aesthetic. Apply period-accurate 90s Hip-Hop styling including baggy jeans, oversized jerseys, bomber jackets, high-top sneakers, gold chains, bucket hats, and other iconic streetwear elements. Convert clothing to authentic 90s materials and brands that defined the era with appropriate colors, patterns, and styling that reflects Hip-Hop culture's influence on fashion. Add characteristic 90s Hip-Hop elements such as confident poses, cultural accessories, hairstyles popular in the era, and styling that reflects the creativity and rebellion of Hip-Hop culture. Set against authentic 90s urban backgrounds including city streets with graffiti, recording studios, basketball courts, or indoor settings with period-appropriate decor and technology. Apply the visual style reminiscent of 90s Hip-Hop photography and music videos with bold lighting, urban aesthetics, and the iconic cultural style of the genre's golden age. The final image should authentically capture the innovative, rebellious spirit of 90s Hip-Hop culture while maintaining clear likeness to the original subject.";
        
        case '80s':
          return "Transform this image into an authentic 1980s version while keeping the exact same environment and setting from the original photo. Preserve all facial features hair texture eye color skin tone and facial structure completely unchanged ensuring the people remain instantly recognizable as themselves. Apply 80s photography characteristics including high saturation film grain slight soft focus and that distinctive 80s flash photography look with warm tones. Update only the clothing to period appropriate 80s fashion like Members Only jackets shoulder pads acid wash denim neon windbreakers leg warmers or power suits while maintaining the original pose and body position. Add subtle 80s styling elements like feathered hair edges teased volume scrunchies headbands or styling gel effects without changing the actual hair color or length. Include period accessories naturally integrated into the scene such as Walkman headphones chunky watches plastic jewelry or wayfarers. Apply an 80s photo filter that mimics the color processing and slight overexposure common in 80s photography. The original background and environment must remain exactly the same just with the vintage photo quality applied. The final result should look like an authentic photo taken in the 1980s in the same location with the same people just dressed and styled for that era.";
        
        case 'disco':
          return "Transform the uploaded photo of a person or couple into a 1970s disco scene, altering only their hair, clothing, and background—do not change any facial features or body proportions. 1. **Isolate regions** - Use the image's hair mask to replace hairstyles. - Use the clothing mask to swap in disco outfits. - Use a background mask to recreate a dance‐floor setting. 2. **Preserve identity** - Keep all facial attributes (skin tone, bone structure, eye color & shape, lip shape, expression) exactly as in the original—no age shifts, no new wrinkles or blemishes. - Maintain original body posture and proportions. 3. **Randomize key disco elements** (choose one per run): - **Hair style:** classic rounded afro | feathered shag with curtain bangs | voluminous blowout waves - **Outfit:** sequin jumpsuit with flared legs | polyester wrap dress with geometric prints | satin shirt with wide collar + bell-bottom trousers - **Accessory:** mirrored aviator sunglasses | wide paisley headband | metallic platform shoes 4. **Background & lighting** - Place the subjects on a reflective dance floor with a spinning disco ball overhead. - Add colored spotlights (amber, magenta, teal) and subtle lens flares. 5. **Seamless integration** - Blend shadows, highlights, and color cast so the new hair, clothes, and background look like one cohesive photograph. 6. **Negative constraints** (do **not**): - Alter any facial detail, skin texture, or age cues. - Change body poses, hand positions, or cropping. - Introduce modern elements (smartphones, modern jewelry, contemporary hairstyles).";
        
        case 'renaissance':
          return "Transform into a Renaissance portrait painting in the style of masters like Leonardo da Vinci or Raphael (1400-1600). Apply oil painting technique with rich, muted color palette and subtle glazing effects. Convert clothing to period Renaissance attire including high collars, elaborate embroidery, velvet, brocade fabrics, ornate jewelry, and formal headwear. Position the subject in a three-quarter view with dignified posture against a dark backdrop or classical architectural elements. Add symbolic Renaissance objects that reflect status or character like books, scientific instruments, religious items, or flora. Apply characteristic Renaissance lighting with soft modeling and sfumato technique creating subtle transitions between light and shadow. The final portrait should convey the solemnity, dignity and intellectual character of Renaissance portraiture while maintaining clear likeness to the original subject.";
        
        case 'victorian':
          return "Transform into an authentic Victorian era (1837-1901) portrait. Apply a vintage photographic style with sepia toning, formal composition, and the slight blur characteristic of early photography's long exposure times. Convert clothing to period-accurate Victorian fashion including high-necked dresses with bustles, corsets, and lace details for women, or formal frock coats, waistcoats, and high collars for men. Add Victorian accessories such as cameo brooches, pocket watches with chains, lace gloves, or walking sticks. Style hair in Victorian fashions including updos with center parts for women or neat side parts with facial hair for men. Set against Victorian backdrops such as formal parlors with heavy drapery, ornate furniture, painted scenic backgrounds, or formal gardens. Position the subject with the stiff, formal poses typical of Victorian photography where subjects had to remain still for long exposures. The final portrait should authentically capture the formal, restrained aesthetic of Victorian photography while maintaining clear likeness to the original subject.";
        
        case 'medieval':
          return "Transform into an authentic medieval portrait set between 1100-1400 CE. Convert into the style of medieval illuminated manuscripts or early Renaissance painting with rich colors, flat perspective, and decorative elements. Update clothing to historically accurate medieval attire including period-appropriate tunics, surcoats, cloaks, or gowns with appropriate layering and construction for the subject's apparent social status. Add medieval accessories such as belts with pouches, simple jewelry, head coverings like coifs or veils, and status-appropriate items. Set against medieval environments featuring castle interiors, countryside with period architecture, or simple colored backgrounds with decorative borders as seen in manuscript illustrations. Include medieval symbolic elements or activities appropriate to the setting such as religious symbols, heraldry, or period-accurate tools/weapons. The final portrait should authentically capture the aesthetic of medieval European art while maintaining recognizable likeness to the original subject.";

        // Artistic styles (painting category from PromptInput.tsx)
        case 'oil':
          return "Transform into an oil painting with rich textures, layered brushwork, and the sophisticated color palette characteristic of master oil painters. Apply traditional oil painting techniques including impasto (thick paint application), glazing for depth, and the luminous quality achieved through multiple paint layers. Convert the image into painterly brushstrokes that show the artist's hand while maintaining photographic accuracy in proportions and likeness. Add the characteristic oil painting elements including visible brush textures, paint buildup in highlights, subtle color variations within each area, and the depth that comes from traditional painting methods. Set against backgrounds painted in classical oil painting style with atmospheric perspective, subtle gradations, and the timeless quality of fine art. Apply the rich, saturated colors and sophisticated light modeling typical of oil painting masters, creating depth through color temperature and value relationships. The final image should capture the prestige and timeless beauty of classical oil painting while maintaining clear likeness to the original subject.";
        
        case 'watercolor':
          return "Transform into watercolor painting with the medium's characteristic transparency, flowing washes, and organic edge quality. Apply traditional watercolor techniques including wet-on-wet bleeding, graduated washes, and the luminous transparency that comes from pigment and water interaction. Convert the image into loose, expressive brushwork that captures essence rather than precise detail while maintaining recognizable likeness. Add characteristic watercolor elements including soft edges, color bleeding, paper texture showing through transparent washes, and the spontaneous quality of water-based media. Set against backgrounds painted in watercolor style with atmospheric washes, subtle color gradations, and areas of untouched paper that add to the medium's charm. Apply the fresh, luminous colors and spontaneous mark-making typical of skilled watercolor artists, creating depth through overlapping transparent layers. The final image should capture the fresh, immediate quality of watercolor painting while maintaining clear likeness to the original subject.";
        
        case 'impressionist':
          return "Transform into Impressionist painting style reminiscent of masters like Monet, Renoir, or Degas (1860s-1880s). Apply the characteristic Impressionist techniques including broken color, visible brushstrokes, and emphasis on light and its changing qualities. Convert the image into loose, energetic brushwork that captures the impression of the moment rather than precise detail while maintaining recognizable features. Add Impressionist elements including dappled light effects, color mixing on the canvas rather than palette, and the sense of movement and life characteristic of the style. Set against backgrounds painted in Impressionist style with attention to natural light, atmospheric effects, and outdoor settings that emphasize the relationship between subject and environment. Apply the bright, pure colors and innovative color relationships typical of Impressionist masters, avoiding black and instead using color to create shadows and depth. The final image should capture the fresh, innovative spirit of Impressionism while maintaining clear likeness to the original subject.";
        
        case 'abstract':
          return "Transform into abstract art style that deconstructs and reimagines the subject through geometric shapes, bold colors, and non-representational elements. Apply abstract art principles including simplification into essential forms, emphasis on color relationships, and dynamic compositional arrangements that create visual impact. Convert recognizable features into abstract elements while maintaining enough visual connection to suggest the original subject through shape, color, or gesture. Add characteristic abstract elements including geometric patterns, bold color blocks, flowing organic shapes, or fragmented forms that create visual interest and emotional response. Set against abstract backgrounds that complement and enhance the subject through color harmony, contrast, or dynamic interaction between positive and negative space. Apply the innovative color palettes and bold mark-making typical of abstract artists, creating depth and interest through pure visual elements rather than realistic representation. The final image should capture the expressive, innovative spirit of abstract art while maintaining some visual connection to the original subject.";
        
        case 'surrealism':
          return "Transform into Pop Surrealism style with dreamlike elements, vibrant colors, and the contemporary fantasy aesthetic that blends traditional surrealism with modern pop culture influences. Apply Pop Surrealism techniques including hyper-detailed rendering, impossible combinations, and the juxtaposition of realistic and fantastical elements. Convert the subject into a dreamlike character with enhanced features, magical elements, and the polished illustration quality characteristic of the movement. Add Pop Surrealism elements including fantasy creatures, impossible architectural elements, floating objects, magical lighting effects, and the detailed, almost hyperreal quality of contemporary illustration. Set against surreal backgrounds featuring impossible landscapes, dreamlike environments, candy-colored skies, or fantastical settings that challenge reality while maintaining visual appeal. Apply the vibrant, saturated colors and precise rendering typical of Pop Surrealism artists, creating a world that's both believable and obviously fantastical. The final image should capture the whimsical, dreamlike quality of Pop Surrealism while maintaining clear likeness to the original subject.";
        
        case 'artdeco':
          return "Transform into Art Deco style (1920s-1930s) with the movement's characteristic geometric patterns, elegant lines, and sophisticated glamour. Apply Art Deco design principles including symmetrical compositions, stylized forms, and the luxurious aesthetic that defined the Jazz Age. Convert the subject into the streamlined, elegant style typical of Art Deco portraiture with emphasis on sophisticated geometry and refined details. Add characteristic Art Deco elements including geometric patterns, metallic accents, stylized rays or sun motifs, and the sleek, modern aesthetic that represented progress and luxury. Set against Art Deco backgrounds featuring geometric architecture, stylized cityscapes, elegant interiors with characteristic furniture and decorative elements, or simple backgrounds with Art Deco pattern work. Apply the sophisticated color palettes typical of the era including gold, silver, black, and rich jewel tones, creating depth through geometric shadow patterns and stylized lighting. The final image should capture the elegance, optimism, and sophisticated style of the Art Deco movement while maintaining clear likeness to the original subject.";

        // Fun/Viral styles (other category from PromptInput.tsx)
        case 'mullets':
          return "Transform the uploaded photo by replacing only the hair region with an iconic mullet hairstyle.\n1. Use the image's hair mask to isolate the hair—do not touch the face, body, clothing, or background.\n2. Match the original hair color, texture, and density exactly.\n3. Randomly choose one of these top-hair styles for each run:\n   - curly, teased volume\n   - short, textured spikes\n   - feathered, classic '80s layers\n   - sleek, modern taper\n4. In every variation, the back must be noticeably longer than the front (\"business in front, party in back\").\n5. Preserve **all** facial attributes exactly as in the original, including:\n   - Skin tone and smoothness (no new wrinkles, age spots, or blemishes)\n   - Facial proportions and bone structure\n   - Eye color, eye shape, lips, and expression\n   - Age appearance (do **not** make the subject look older or younger)\n6. Seamlessly blend shadows, highlights, and lighting so the new hair looks like part of the original photograph.\n\n**Negative constraints** (do **not**):\n- Alter any aspect of the face, skin texture, or age cues.\n- Introduce wrinkles, sagging, or any aging artifacts.\n- Change posture, clothing, background, or cropping.";
        
        case 'hulkamania':
          return "Apply ONLY these specific costume overlays to the uploaded photo. Do NOT alter the person's features:\n\n1. Hair color change:\n   - Change visible hair color to platinum blonde\n   - Apply to all hair showing beneath the bandana\n   - Keep the person's natural hair length and style\n   - If hair is short, keep it short but blonde\n   - If hair is long, keep it long and blonde\n\n2. Red bandana do-rag style:\n   - Place red bandana as a full do-rag covering the top of head\n   - Should cover from forehead to crown like a skull cap\n   - Include 'HULKAMANIA' in bold yellow text across the front\n   - Bandana should have realistic fabric folds and texture\n\n3. Mustache overlay:\n   - ADD a blonde horseshoe mustache as an overlay\n   - Size it proportionally to the person's face\n   - Blend naturally but keep as an addition, not a transformation\n\n4. Clothing replacement:\n   - Replace ONLY the clothing with a yellow tank top\n   - Add 'HULK RULES' in red block letters on the chest\n   - Fit the tank to the person's exact body shape\n\n**CRITICAL PRESERVATION RULES:**\n- Do NOT alter facial features, bone structure, or expressions\n- Keep the person's exact face, just add the mustache\n- Preserve their natural body shape and size completely\n- Maintain their original skin tone and texture\n- The person should still look like themselves in costume\n- NEVER change eyes, eye color, eye shape, or eyelids\n- NEVER alter the nose shape, size, or nostrils\n- NEVER modify teeth, smile, or mouth shape\n\n**ABSOLUTELY DO NOT:**\n- Change face shape or features\n- Alter body proportions or chest size\n- Make the person look more masculine/feminine\n- Age or de-age the person\n- Change their natural build or physique\n- Modify eyes, eye color, nose, or teeth in any way";
        
        case 'baby':
          return "Create a realistic image of a baby that would result from the genetics of the two people in the uploaded photos. The baby should have a balanced blend of facial features from both parents, including eye shape/color, nose, mouth, face shape, and skin tone. Show only the baby in the final image, centered in frame with good lighting against a neutral background. The baby should appear healthy, happy, and around 6-12 months old with a natural expression. Dress the baby in appropriate baby clothing - such as a simple onesie, cute baby outfit, or comfortable infant attire - not attempting to match or replicate the clothing style of the parents. Add subtle details that clearly connect to features from both parent photos without directly copying them.";
        
        case 'future':
          return "Show how the person might look 20 years in the future. Age the face naturally with appropriate wrinkles, hair changes, and subtle physical aging. Maintain their core facial structure and identity while showing realistic aging effects. Keep the same general style and pose.";
        
        case 'ghibli':
          return "Transform into the distinctive Studio Ghibli animation style reminiscent of films by Hayao Miyazaki. Use the characteristic soft, painterly animation style with watercolor-inspired backgrounds and attention to natural elements. Apply the signature Ghibli character design including simplified but expressive faces with large, detailed eyes and minimal facial lines. Update the scene with warm, natural lighting and atmospheric effects like gentle wind or soft shadows. Add Ghibli-inspired environmental details such as lush vegetation, detailed clouds, charming architecture, or magical subtle elements that suggest wonder. Include the sense of movement and liveliness typical of Ghibli films with hair or clothing that appears to flow naturally. The final image should capture the heartfelt, nostalgic quality and connection to nature that characterizes Studio Ghibli's unique aesthetic while maintaining recognizable likeness to the original subject.";
        
        case 'action-figure':
          return "Transform into a highly detailed, collectible action figure presented in professional packaging. Create a realistic toy version with visible plastic texture, molded details, articulation points at major joints, and slight manufacturing imperfections. Design custom blister packaging featuring character artwork, logos, and product details including a character name and special features listed on the card. Add accessory items relevant to the character's identity displayed alongside the figure. Position the packaged figure against a clean background with professional product photography lighting that shows reflections on the plastic packaging. The final image should realistically depict how the subject would appear if manufactured as a premium collectible action figure in unopened retail packaging, presented as a professional product photograph.";
        
        case 'pet-human':
          return "Transform a pet into a human character while preserving the pet's distinctive traits, coloration, and personality. Create a human face and body that incorporates subtle animal features reminiscent of the original pet - such as similar eye color, hair color/pattern matching fur color/pattern, and facial expressions that capture the pet's typical demeanor. Dress the human character in clothing that reflects the pet's personality and status - elegant for dignified pets, casual for playful pets, etc. The character should feel like a natural human embodiment of the specific pet's essence and personality, not a generic animal-human hybrid. Position in a setting or with props that connect to the pet's lifestyle or preferences. The final image should create an immediate sense of recognition while being fully humanized.";
        
        case 'self-cat':
          return "Transform the person in this image into a realistic cat while carefully preserving their unique individual characteristics. Match the cat's fur color and pattern to the person's hair color and style - if they have blonde hair, make it a golden/cream colored cat; if brown hair, make it a brown tabby; if black hair, make it a black cat; if they have highlights or unique hair colors, reflect this in the cat's fur pattern. Preserve the person's eye color exactly in the cat's eyes. If the person is wearing distinctive clothing colors, incorporate those colors into a collar, bow tie, or small accessory on the cat. Capture the person's facial expression and personality - if they're smiling, show a content cat expression; if serious, show a more dignified cat pose. The cat should have realistic cat proportions and anatomy, but the coloring, expression, and small details should make it clearly recognizable as a feline version of this specific person. Pay special attention to unique features like freckles (show as subtle fur markings), hair texture (reflected in fur texture), and overall demeanor.";
        
        case 'caricature':
          return "Transform into a skillful caricature with exaggerated yet recognizable features. Strategically enlarge the most distinctive facial elements by 20-30% while keeping overall facial arrangement intact. Simplify less important features for contrast with the exaggerated ones. Apply bold, confident pen or marker-style linework with vibrant watercolor or marker-style coloring. Enhance expressiveness with slightly enlarged eyes and exaggerated facial expression. Keep the body proportions smaller relative to the head (about 1:4 ratio). Add subtle details that emphasize personal characteristics, hobbies, or occupation. The final image should be immediately recognizable as the subject while being playful and humorous without crossing into mockery.";

        // Kids Drawing
        case 'kids-drawing':
          return "Transform the kids drawing into a photorealistic version while maintaining the original character and style.";

        default:
          return "Transform the image in an artistic style";
      }
    };

    const detailedPrompt = getDetailedPrompt(selectedSubcategory);
    const finalPrompt = prompt.trim() ? `${detailedPrompt}. Additional details: ${prompt}` : detailedPrompt;

    // Convert selectedImageSize to API format
    const imageSizeMap: Record<string, string> = {
      'square': '1024x1024',
      'portrait': '1024x1536',
      'landscape': '1536x1024'
    };

    const apiImageSize = imageSizeMap[selectedImageSize] || '1024x1024';

    await handlePromptSubmit(finalPrompt, apiImageSize);
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

          // Handle multiple variations if available
          if (data.transformedImageUrls && data.transformedImageUrls.length > 0) {
            setTransformedImages(data.transformedImageUrls);
            // Set second image if we have multiple variations
            if (data.transformedImageUrls.length > 1) {
              setSecondTransformedImage(data.transformedImageUrls[1]);
            }
          } else {
            setTransformedImages([data.transformedImageUrl]);
          }
          
          // Also handle direct secondTransformedImageUrl from response
          if (data.secondTransformedImageUrl) {
            setSecondTransformedImage(data.secondTransformedImageUrl);
          }

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

                    {/* Category Selection Section - Show after upload */}
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

                        {/* Kids/Cartoons Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'animation' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('animation')}
                    >
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="text-sm font-semibold text-gray-900">Kids/Cartoons</div>
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

                    {/* Subcategory Options - Show when category is selected */}
                    {selectedTransformation && selectedTransformation !== 'custom' && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-900">
                          {selectedTransformation === 'other' ? 'Fun/Viral' : 
                           selectedTransformation === 'historical' ? 'Pop Culture Through The Years' :
                           selectedTransformation === 'animation' ? 'Animation' :
                           selectedTransformation === 'artistic' ? 'Artistic Styles' :
                           selectedTransformation === 'kids-real' ? 'Kids Drawing' : 'Selected'} Styles
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
                          {selectedTransformation === 'animation' && [
                            { name: 'Super Mario Bros', emoji: '🍄', id: 'mario' },
                            { name: 'Minecraft', emoji: '🟫', id: 'minecraft' },
                            { name: 'Pixar Style', emoji: '🎬', id: 'pixar' },
                            { name: 'Trolls', emoji: '💖', id: 'trolls' },
                            { name: 'Princess/Prince', emoji: '👸', id: 'princess' },
                            { name: 'Superhero', emoji: '🦸', id: 'superhero' },
                            { name: 'Lego Character', emoji: '🧱', id: 'lego' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'historical' && [
                            { name: 'Old Western', emoji: '🤠', id: 'western' },
                            { name: '90s Hip-Hop', emoji: '🎤', id: 'hiphop' },
                            { name: '1980s Style', emoji: '🌈', id: '80s' },
                            { name: 'Disco Era', emoji: '🕺', id: 'disco' },
                            { name: 'Renaissance', emoji: '🎨', id: 'renaissance' },
                            { name: 'Victorian Era', emoji: '🎩', id: 'victorian' },
                            { name: 'Medieval', emoji: '⚔️', id: 'medieval' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'artistic' && [
                            { name: 'Oil Painting', emoji: '🖼️', id: 'oil' },
                            { name: 'Watercolor', emoji: '🎨', id: 'watercolor' },
                            { name: 'Impressionist', emoji: '🌅', id: 'impressionist' },
                            { name: 'Abstract Art', emoji: '🔮', id: 'abstract' },
                            { name: 'Pop Surrealism', emoji: '👁️', id: 'surrealism' },
                            { name: 'Art Deco', emoji: '✨', id: 'artdeco' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'other' && [
                            { name: 'Mullets', emoji: '💇', id: 'mullets' },
                            { name: 'Hulkamania', emoji: '💪', id: 'hulkamania' },
                            { name: 'Baby Prediction', emoji: '👶', id: 'baby' },
                            { name: 'Future Self', emoji: '👵', id: 'future' },
                            { name: 'Ghibli Style', emoji: '🌸', id: 'ghibli' },
                            { name: 'AI Action Figure', emoji: '🎮', id: 'action-figure' },
                            { name: 'Pet as Human', emoji: '🐕', id: 'pet-human' },
                            { name: 'Self as Cat', emoji: '🐱', id: 'self-cat' },
                            { name: 'Caricature', emoji: '😄', id: 'caricature' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'kids-real' && [
                            { name: 'Kids Drawing to Reality', emoji: '🖍️', id: 'kids-drawing' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prompt Input Section - Show when subcategory is selected */}
                    {selectedSubcategory && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-900">
                          Describe Your Transformation (Optional)
                        </h4>
                        <div className="max-w-2xl mx-auto">
                          <textarea
                            className="w-full h-24 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#06B6D4] focus:border-transparent"
                            placeholder="Add any specific details or modifications you'd like..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Leave blank to use the default style transformation
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Size Selection - Show when subcategory is selected */}
                    {selectedSubcategory && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-900">
                          Choose Image Size
                        </h4>
                        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
                          <button
                            className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                              selectedImageSize === 'square' 
                                ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedImageSize('square')}
                          >
                            <div className="text-sm font-medium text-gray-700">Square</div>
                            <div className="text-xs text-gray-500">1024×1024</div>
                          </button>
                          <button
                            className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                              selectedImageSize === 'portrait' 
                                ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedImageSize('portrait')}
                          >
                            <div className="text-sm font-medium text-gray-700">Portrait</div>
                            <div className="text-xs text-gray-500">1024×1536</div>
                          </button>
                          <button
                            className={`px-6 py-3 rounded-lg border-2 transition-all duration-200 ${
                              selectedImageSize === 'landscape' 
                                ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedImageSize('landscape')}
                          >
                            <div className="text-sm font-medium text-gray-700">Landscape</div>
                            <div className="text-xs text-gray-500">1536×1024</div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Let's Make Magic Button - Show when subcategory and size are selected */}
                    {selectedSubcategory && selectedImageSize && (
                      <div className="text-center">
                        <RainbowButton
                          onClick={handleMakeMagic}
                          className="px-12 py-4 text-lg font-semibold"
                          disabled={!originalImagePath}
                        >
                          ✨ Let's Make Magic ✨
                        </RainbowButton>
                      </div>
                    )}
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

                    {/* Kids/Cartoons Category */}
                    <button
                      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
                        selectedTransformation === 'animation' 
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                          : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTransformation('animation')}
                    >
                      <div className="text-3xl mb-2">🎬</div>
                      <div className="text-sm font-semibold text-gray-900">Kids/Cartoons</div>
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

                {selectedTransformation && selectedTransformation !== 'custom' && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-900">
                          {selectedTransformation === 'other' ? 'Fun/Viral' : 
                           selectedTransformation === 'historical' ? 'Pop Culture Through The Years' :
                           selectedTransformation === 'animation' ? 'Animation' :
                           selectedTransformation === 'artistic' ? 'Artistic Styles' :
                           selectedTransformation === 'kids-real' ? 'Kids Drawing' : 'Selected'} Styles
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
                          {selectedTransformation === 'animation' && [
                            { name: 'Super Mario Bros', emoji: '🍄', id: 'mario' },
                            { name: 'Minecraft', emoji: '🟫', id: 'minecraft' },
                            { name: 'Pixar Style', emoji: '🎬', id: 'pixar' },
                            { name: 'Trolls', emoji: '💖', id: 'trolls' },
                            { name: 'Princess/Prince', emoji: '👸', id: 'princess' },
                            { name: 'Superhero', emoji: '🦸', id: 'superhero' },
                            { name: 'Lego Character', emoji: '🧱', id: 'lego' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'historical' && [
                            { name: 'Old Western', emoji: '🤠', id: 'western' },
                            { name: '90s Hip-Hop', emoji: '🎤', id: 'hiphop' },
                            { name: '1980s Style', emoji: '🌈', id: '80s' },
                            { name: 'Disco Era', emoji: '🕺', id: 'disco' },
                            { name: 'Renaissance', emoji: '🎨', id: 'renaissance' },
                            { name: 'Victorian Era', emoji: '🎩', id: 'victorian' },
                            { name: 'Medieval', emoji: '⚔️', id: 'medieval' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'artistic' && [
                            { name: 'Oil Painting', emoji: '🖼️', id: 'oil' },
                            { name: 'Watercolor', emoji: '🎨', id: 'watercolor' },
                            { name: 'Impressionist', emoji: '🌅', id: 'impressionist' },
                            { name: 'Abstract Art', emoji: '🔮', id: 'abstract' },
                            { name: 'Pop Surrealism', emoji: '👁️', id: 'surrealism' },
                            { name: 'Art Deco', emoji: '✨', id: 'artdeco' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'other' && [
                            { name: 'Mullets', emoji: '💇', id: 'mullets' },
                            { name: 'Hulkamania', emoji: '💪', id: 'hulkamania' },
                            { name: 'Baby Prediction', emoji: '👶', id: 'baby' },
                            { name: 'Future Self', emoji: '👵', id: 'future' },
                            { name: 'Ghibli Style', emoji: '🌸', id: 'ghibli' },
                            { name: 'AI Action Figure', emoji: '🎮', id: 'action-figure' },
                            { name: 'Pet as Human', emoji: '🐕', id: 'pet-human' },
                            { name: 'Self as Cat', emoji: '🐱', id: 'self-cat' },
                            { name: 'Caricature', emoji: '😄', id: 'caricature' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}

                          {selectedTransformation === 'kids-real' && [
                            { name: 'Kids Drawing to Reality', emoji: '🖍️', id: 'kids-drawing' },
                          ].map((style, index) => (
                            <button
                              key={index}
                              className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedSubcategory === style.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => {
                                setSelectedSubcategory(style.id);
                                console.log('Selected style:', style.name);
                              }}
                            >
                              <span className="text-lg">{style.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">{style.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Size Selection - Show when subcategory is selected */}
                    {selectedSubcategory && (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold text-center mb-4 text-gray-900">
                          Choose Output Size
                        </h4>
                        <div className="flex justify-center gap-3 max-w-md mx-auto">
                          {[
                            { id: 'square', label: 'Square', ratio: '1:1' },
                            { id: 'portrait', label: 'Portrait', ratio: '2:3' },
                            { id: 'landscape', label: 'Landscape', ratio: '3:2' }
                          ].map((size) => (
                            <button
                              key={size.id}
                              className={`flex-1 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                                selectedImageSize === size.id 
                                  ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg' 
                                  : 'bg-white border-gray-200 hover:border-[#06B6D4] hover:bg-[#06B6D4]/5'
                              }`}
                              onClick={() => setSelectedImageSize(size.id)}
                            >
                              <div className="text-sm font-medium text-gray-700">{size.label}</div>
                              <div className="text-xs text-gray-500">{size.ratio}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Let's Make Magic Button - Show when subcategory and size are selected */}
                    {selectedSubcategory && selectedImageSize && (
                      <div className="text-center">
                        <RainbowButton
                          onClick={handleMakeMagic}
                          className="px-12 py-4 text-lg font-semibold"
                          disabled={!originalImagePath}
                        >
                          ✨ Let's Make Magic ✨
                        </RainbowButton>
                      </div>
                    )}
              </div>
            )}

            {currentStep === Step.Processing && (
              <ProcessingState originalImage={originalImage} prompt={prompt} />
            )}

            {currentStep === Step.Result && (
              <ResultView
                originalImage={originalImage}
                transformedImage={transformedImage}
                transformedImages={transformedImages}
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