
import React, { useState, useRef, useCallback } from 'react'
import { useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ImageUploader from '@/components/ImageUploader'
import PromptInput from '@/components/PromptInput'
import ProcessingState from '@/components/ProcessingState'
import ResultView from '@/components/ResultView'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/hooks/useCredits'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { getSavedStyle, clearSavedStyle, hasSavedStyle } from '@/components/StyleIntegration'

// Enum for the different steps in the process
enum Step {
  Upload,
  Prompt,
  Processing,
  Result,
}

export default function UploadPage() {
  const { user } = useAuth()
  const { data: userCredits } = useCredits()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null)
  const [transformedImage, setTransformedImage] = useState<string | null>(null)
  const [secondTransformedImage, setSecondTransformedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<string>('')
  const [currentTransformation, setCurrentTransformation] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Check for saved style from Ideas page
  const [savedStyle, setSavedStyle] = useState<{
    prompt: string;
    title: string;
    category: string;
  } | null>(null)

  const handleImageUpload = useCallback(async (imagePath: string, imageUrl: string) => {
    console.log("Image uploaded, path:", imagePath)
    console.log("Image URL:", imageUrl)

    // Validate inputs
    if (!imagePath || !imageUrl) {
      console.error("Invalid image path or URL received in handleUpload")
      toast({
        title: "Upload Error",
        description: "Could not process the uploaded image. Please try again.",
        variant: "destructive",
      })
      return
    }

    setOriginalImage(imageUrl)
    setOriginalImagePath(imagePath)

    // Check if there's a saved style from the Ideas page
    if (hasSavedStyle()) {
      const style = getSavedStyle()
      console.log("Found saved style:", style)
      if (style) {
        // Set the prompt from the saved style
        console.log("Setting prompt from saved style:", style.prompt)
        setPrompt(style.prompt)
        setSavedStyle(style)

        // Notify the user that a style is being applied
        toast({
          title: `"${style.title}" style selected`,
          description: `Your image has been uploaded. Click "Transform Image" to apply the transformation.`,
        })

        // Clear the saved style to avoid reapplying it
        clearSavedStyle()
      }
    }

    // Move to prompt step
    setCurrentStep(Step.Prompt)
  }, [toast])

  const handlePromptSubmit = async (promptText: string, imageSize: string = "square") => {
    console.log("Submitting prompt:", promptText)
    console.log("Image size:", imageSize)
    console.log("Original image path:", originalImagePath)

    // Validate image path exists before proceeding
    if (!originalImagePath) {
      toast({
        title: "Image Upload Error",
        description: "No image path found. Please try uploading your image again.",
        variant: "destructive",
      })
      setCurrentStep(Step.Upload)
      return
    }

    setPrompt(promptText)
    setCurrentStep(Step.Processing)
    setIsProcessing(true)

    try {
      console.log("Sending transformation request with data:", {
        originalImagePath,
        prompt: promptText,
        userId: user?.id,
        imageSize: imageSize,
      })

      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath,
        prompt: promptText,
        userId: user?.id,
        imageSize: imageSize,
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Image transformation completed successfully")

        setTransformedImage(data.transformedImageUrl)
        if (data.secondTransformedImageUrl) {
          setSecondTransformedImage(data.secondTransformedImageUrl)
        }

        // Store transformation data
        setCurrentTransformation(data)
        setCurrentStep(Step.Result)
      } else {
        const data = await response.json()
        console.error("Server returned error response:", data)
        
        if (data.error === "content_safety") {
          toast({
            title: "Content Safety Alert",
            description: "Your request was rejected by our safety system. Please try a different prompt or style that is more appropriate for all audiences.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Transformation failed",
            description: data.message || "An unknown error occurred during transformation",
            variant: "destructive",
          })
        }
        setCurrentStep(Step.Prompt)
      }
    } catch (error: any) {
      console.error("Error transforming image:", error)
      toast({
        title: "Transformation Failed",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      })
      setCurrentStep(Step.Prompt)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    if (currentStep === Step.Prompt) {
      setCurrentStep(Step.Upload)
      setOriginalImage(null)
      setOriginalImagePath(null)
    } else if (currentStep === Step.Result) {
      setCurrentStep(Step.Prompt)
    }
  }

  const handleNewImage = () => {
    setOriginalImage(null)
    setOriginalImagePath(null)
    setTransformedImage(null)
    setSecondTransformedImage(null)
    setPrompt("")
    setCurrentTransformation(null)
    setCurrentStep(Step.Upload)
    setSavedStyle(null)
  }

  const handleCancel = () => {
    setCurrentStep(Step.Prompt)
    setIsProcessing(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar 
        freeCredits={userCredits?.freeCreditsUsed ? 0 : 1} 
        paidCredits={userCredits?.paidCredits || 0} 
      />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Images
            </h1>
            <p className="text-xl text-gray-600">
              Upload an image and choose how you want to transform it
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
            {currentStep === Step.Upload && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-3 text-center">
                  Upload Your Photo
                </h2>
                <p className="text-red-500 font-medium mb-4 text-center">
                  Not all images with children in them will work with all prompts. AI is very strict about editing kids images (for good reason).
                </p>
                <ImageUploader onImageUploaded={handleImageUpload} />
              </div>
            )}

            {currentStep === Step.Prompt && originalImage && (
              <PromptInput
                originalImage={originalImage}
                onSubmit={handlePromptSubmit}
                onBack={handleBack}
                defaultPrompt={prompt}
                savedStyle={savedStyle}
              />
            )}

            {currentStep === Step.Processing && originalImage && (
              <ProcessingState
                originalImage={originalImage}
                onCancel={handleCancel}
                transformationId={currentTransformation?.id}
              />
            )}

            {currentStep === Step.Result && originalImage && transformedImage && (
              <ResultView
                originalImage={originalImage}
                transformedImage={transformedImage}
                secondTransformedImage={secondTransformedImage}
                onTryAgain={() => setCurrentStep(Step.Prompt)}
                onNewImage={handleNewImage}
                onEditImage={() => {/* Edit functionality can be added later */}}
                prompt={prompt}
                freeCredits={userCredits?.freeCreditsUsed ? 0 : 1}
                paidCredits={userCredits?.paidCredits || 0}
                canEdit={false}
                transformationId={currentTransformation?.id?.toString()}
                editsUsed={0}
                userId={user?.id}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
