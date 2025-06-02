import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, Sparkles, Check, Loader2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";
import { useFreeCredits } from '@/hooks/useFreeCredits';
import { EmailCaptureModal } from '@/components/EmailCaptureModal';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { SignUpModal } from '@/components/SignUpModal';

export default function UploadEnhancePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showStepHighlight, setShowStepHighlight] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [industry, setIndustry] = useState("");
  const [productType, setProductType] = useState("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [processingError, setProcessingError] = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();
  const [location, setLocation] = useLocation();
    const [selectedImageSize, setSelectedImageSize] = useState<string | null>(null);


  const MAX_FILES = 1;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  const steps = [
    { id: 1, name: "Upload", description: "Select Images" },
    { id: 2, name: "Details", description: "Product Info" },
    { id: 3, name: "Enhance", description: "AI Processing" },
    { id: 4, name: "Download", description: "Get Results" }
  ];

  const industryPills = [
    "E-commerce",
    "Fashion & Apparel", 
    "Technology",
    "Food & Beverage",
    "Beauty & Cosmetics",
    "Home & Decor",
    "B2B Services",
    "Healthcare"
  ];

  const processingSteps = [
    { id: 1, name: "Uploading Images", description: "Securely uploading your product images" },
    { id: 2, name: "AI Analysis", description: "Analyzing products with computer vision" },
    { id: 3, name: "Generating Ideas", description: "Creating enhancement suggestions" },
    { id: 4, name: "Finalizing", description: "Preparing your results" }
  ];

  const { 
    creditStatus, 
    checkUserCredits, 
    useCredit, 
    markModalShown,
    isAuthenticated 
  } = useFreeCredits();

  // Toggle industry pill selection
  const toggleIndustryPill = (industryName: string) => {
    setSelectedIndustries(prev => {
      if (prev.includes(industryName)) {
        return prev.filter(item => item !== industryName);
      } else {
        return [...prev, industryName];
      }
    });
  };

  // Toggle purpose selection
  const togglePurpose = (purposeId: string) => {
    setSelectedPurposes(prev => {
      if (prev.includes(purposeId)) {
        return prev.filter(item => item !== purposeId);
      } else {
        return [...prev, purposeId];
      }
    });
  };

  const purposeOptions = [
    { id: "social", icon: "📱", label: "Social Media", subtitle: "Instagram, TikTok, Facebook" },
    { id: "website", icon: "💻", label: "Website", subtitle: "Hero images, Product pages" },
    { id: "ads", icon: "📢", label: "Digital Ads", subtitle: "Google, Facebook, Display" },
    { id: "ecommerce", icon: "🛍️", label: "E-commerce", subtitle: "Amazon, Shopify, eBay" },
    { id: "email", icon: "📧", label: "Email Marketing", subtitle: "Newsletters, Campaigns" },
    { id: "presentations", icon: "📊", label: "Presentations", subtitle: "Decks, Reports" },
    { id: "print", icon: "🎯", label: "Print Marketing", subtitle: "Brochures, Flyers" }
  ];

  // Validate file before adding to array
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and WebP images are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 10MB`;
    }
    return null;
  };

  // Add files to the array with validation
  const addFiles = (newFiles: FileList | File[]) => {
    const filesArray = Array.from(newFiles);
    const validFiles: File[] = [];
    let errors: string[] = [];

    // Check if adding these files would exceed the limit
    if (selectedFiles.length + filesArray.length > MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} images allowed. You can only add ${MAX_FILES - selectedFiles.length} more.`);
      return;
    }

    // Validate each file
    filesArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        // Check for duplicates
        const isDuplicate = selectedFiles.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('. '));
      return;
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...validFiles]);
      setUploadError("");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedFiles.length >= MAX_FILES) {
      return; // Don't allow drag if max files reached
    }

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (selectedFiles.length >= MAX_FILES) {
      setUploadError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
    setUploadError("");
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
    setUploadError("");
  };

  const openFileDialog = () => {
    if (selectedFiles.length < MAX_FILES) {
      fileInputRef.current?.click();
    }
  };

  // Validation helpers
  const hasImages = selectedFiles.length > 0;
  const hasIndustryInfo = selectedIndustries.length > 0;
  const hasPurposes = selectedPurposes.length > 0;
  const hasContent = hasImages || hasIndustryInfo || productType.trim() || hasPurposes;
    const hasImageSize = !!selectedImageSize;
  const canSubmit = hasImages && hasIndustryInfo && hasImageSize;

  // Multi-step loading indicator with comprehensive error handling
  const submitForProcessing = async () => {
    try {
      // Clear any previous errors
      setProcessingError("");
      setShowRetry(false);
      setUploadError("");

      setIsLoading(true);
      setProcessingStep(1);
      setProcessingStatus("Uploading image to server...");

      // Prepare FormData for upload
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append(`images`, file); // Changed to match backend expectation
      });

      // Add metadata
      formData.append('industries', JSON.stringify(selectedIndustries));
      formData.append('productType', productType);
      formData.append('purposes', JSON.stringify(selectedPurposes));
      formData.append('imageCount', selectedFiles.length.toString());

      // Step 1: Upload Images with real API call
      try {
        console.log('Step 1: Starting image upload...');

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          throw new Error(`Upload failed: ${errorData.message || uploadResponse.statusText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('Upload successful:', uploadResult);

        if (!uploadResult.success || !uploadResult.urls) {
          throw new Error('Invalid upload response format');
        }

        const imageUrls = uploadResult.urls;

        // Wait for step timing
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProcessingStep(2);
        setProcessingStatus("Analyzing with GPT Vision...");

        // Step 2: AI Product Analysis with real API call
        try {
          console.log('Step 2: Starting AI analysis...');

          const analysisResponse = await fetch('/api/analyze-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_urls: imageUrls,
              industry_context: selectedIndustries,
              image_purposes: selectedPurposes,
              product_type: productType
            })
          });

          if (!analysisResponse.ok) {
            const errorData = await analysisResponse.json().catch(() => ({}));
            throw new Error(`Analysis failed: ${errorData.message || analysisResponse.statusText}`);
          }

          const analysisResult = await analysisResponse.json();
          console.log('Analysis successful:', analysisResult);

          if (!analysisResult.success || !analysisResult.analysis) {
            throw new Error('Invalid analysis response format');
          }

          // Wait for step timing
          await new Promise(resolve => setTimeout(resolve, 3000));
          setProcessingStep(3);
          setProcessingStatus("Generating enhancement ideas...");

          // Step 3: Generate Enhancement Ideas with real API call
          try {
            console.log('Step 3: Starting idea generation...');

            const ideasResponse = await fetch('/api/generate-ideas', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                vision_analysis: analysisResult.analysis,
                industry_context: selectedIndustries,
                image_purposes: selectedPurposes,
                product_type: productType,
                brand_description: selectedIndustries.join(', ') + ' business focused on ' + selectedPurposes.join(', '),
                ideas_per_image: 5
              })
            });

            if (!ideasResponse.ok) {
              const errorData = await ideasResponse.json().catch(() => ({}));
              throw new Error(`Ideas generation failed: ${errorData.message || ideasResponse.statusText}`);
            }

            const ideasResult = await ideasResponse.json();
            console.log('Real ideas from Claude:', ideasResult);

            if (!ideasResult.success || !ideasResult.ideas) {
              throw new Error('Invalid ideas response format');
            }

            // Wait for step timing
            await new Promise(resolve => setTimeout(resolve, 2500));
            setProcessingStep(4);
            setProcessingStatus("Preparing your results...");

            // Step 4: Finalize and Store Results
            console.log('Step 4: Finalizing results...');

            // Store authentic Claude ideas and image data using consistent keys
            sessionStorage.setItem('enhancement_ideas', JSON.stringify(ideasResult));
            sessionStorage.setItem('original_images', JSON.stringify(imageUrls));

            // Also store complete session data for reference
            const sessionData = {
              timestamp: new Date().toISOString(),
              originalImages: {
                files: selectedFiles.map(file => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  url: URL.createObjectURL(file)
                })),
                urls: imageUrls
              },
              businessContext: {
                industries: selectedIndustries,
                productType: productType,
                purposes: selectedPurposes
              },
              aiAnalysis: analysisResult.analysis,
              enhancementIdeas: ideasResult.ideas,
              processingMetadata: {
                processingTime: Date.now(),
                imageCount: selectedFiles.length,
                ideasGenerated: ideasResult.ideas.length,
                processingDuration: 8000
              }
            };

            sessionStorage.setItem('uploadEnhanceResults', JSON.stringify(sessionData));
            sessionStorage.setItem('currentStep', 'select-ideas');

            await new Promise(resolve => setTimeout(resolve, 1000));
            setProcessingStatus("Complete! Redirecting to idea selection...");

            // Small delay to show completion
            setTimeout(() => {
              setIsLoading(false);
              navigate('/select-ideas');
            }, 500);

          } catch (ideasError) {
            console.error('Ideas generation error:', ideasError);
            throw new Error(`Failed to generate enhancement ideas: ${ideasError instanceof Error ? ideasError.message : 'Unknown error'}`);
          }

        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          throw new Error(`Failed to analyze products: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`);
        }

      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Processing error:', error);

      // Hide loading overlay
      setIsLoading(false);
      setProcessingStep(0);

      // Show user-friendly error message
      setProcessingError("An error occurred during processing. Please try again.");
      setShowRetry(true);

      // Log detailed error for debugging
      console.error('Detailed error information:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        processingStep: processingStep,
        selectedFiles: selectedFiles.length,
        selectedIndustries: selectedIndustries
      });
    }
  };

  // Retry function
  const retryProcessing = () => {
    setProcessingError("");
    setShowRetry(false);
    submitForProcessing();
  };

  // Start Over function - resets all form state
  const startOver = () => {
    // Clear all uploaded images
    setSelectedFiles([]);

    // Reset industry selections
    setSelectedIndustries([]);

    // Clear form fields
    setProductType("");
    setSelectedPurposes([]);

    // Clear any errors
    setUploadError("");
    setProcessingError("");
    setShowRetry(false);

    // Reset processing state
    setProcessingStep(0);
    setProcessingStatus("");
    setIsLoading(false);

    console.log('Form reset - all fields cleared');
  };

  const handleSubmit = async () => {
    // Check credits before proceeding
    if (creditStatus?.hasCredits || isAuthenticated) {
      await submitForProcessing();
    } else {
       if (!isAuthenticated && creditStatus?.usedFreeCredits && !creditStatus?.shouldShowSignUpModal) {
          setShowSignUpModal(true);
          markModalShown();
       } else if (!isAuthenticated && !creditStatus?.usedFreeCredits){
          setShowSignUpModal(true);
          markModalShown();
       } else{
        // Should not hit here
        setShowUpgradePrompt(true);
       }
    }
  };

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropNew = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect({ target: { files: e.dataTransfer.files } } as any);
    }
  };

  const handleSignUp = () => {
    setShowEmailModal(true);
  };

  const handleViewPricing = () => {
    window.open('https://www.sceneryai.com/pricing', '_blank');
  };

  const handleUpgradeClose = () => {
    setShowUpgradePrompt(false);
    setLocation('/upload-enhance');
  };

  const handleSignUpModalClose = () => {
    setShowSignUpModal(false);
    markModalShown();
    sessionStorage.setItem('signUpModalDismissed', 'true');
  };

  // Check credits on mount
  useEffect(() => {
    checkUserCredits();
  }, []);

  // Show signup modal when user has used their free credit
  useEffect(() => {
    if (creditStatus?.shouldShowSignUpModal && !showSignUpModal && !sessionStorage.getItem('signUpModalDismissed')) {
      setShowSignUpModal(true);
    }
  }, [creditStatus?.shouldShowSignUpModal]);

      const imageSizeOptions = [
        { 
          id: "square", 
          label: "Square (1024x1024)", 
          description: "Perfect for Instagram posts, profile pictures, and social media content",
          bestFor: "Instagram posts, Profile pics, Social media",
          icon: "⬜"
        },
        { 
          id: "landscape", 
          label: "Landscape (1536x1024)", 
          description: "Great for Facebook ads, Google ads, web banners, and presentations",
          bestFor: "Facebook ads, Google ads, Web banners",
          icon: "🖼️"
        },
        { 
          id: "portrait", 
          label: "Portrait (1024x1536)", 
          description: "Ideal for Instagram Stories, mobile content, and vertical displays",
          bestFor: "Instagram Stories, Mobile content, Vertical displays",
          icon: "📱"
        },
      ];


  return (
    <div>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;800&family=Montserrat:wght@400;500&display=swap" 
        rel="stylesheet" 
      />

      <style>{`
        :root {
          --primary: #0D7877;
          --secondary: #3DA5D9;
          --accent: #C1F50A;
          --neutral: #333333;
          --light: #F2F4F6;
        }

        .brand-font-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .brand-font-body {
          font-family: 'Montserrat', sans-serif;
        }

        .brand-bg-primary { background-color: var(--primary); }
        .brand-bg-secondary { background-color: var(--secondary); }
        .brand-bg-accent { background-color: var(--accent); }
        .brand-bg-light { background-color: var(--light); }

        .brand-text-primary { color: var(--primary); }
        .brand-text-secondary { color: var(--secondary); }
        .brand-text-accent { color: var(--accent); }
        .brand-text-neutral { color: var(--neutral); }

        .brand-border-primary { border-color: var(--primary); }
        .brand-border-secondary { border-color: var(--secondary); }
        .brand-border-accent { border-color: var(--accent); }

        .brand-gradient-primary {
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
        }

        .brand-gradient-accent {
          background: linear-gradient(135deg, var(--secondary) 0%, var(--accent) 100%);
        }

        .brand-button-primary {
          background: var(--primary);
          color: white;
          transition: all 0.3s ease;
        }

        .brand-button-primary:hover {
          background: var(--secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 120, 119, 0.3);
        }

        .brand-button-accent {
          background: var(--accent);
          color: var(--neutral);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .brand-button-accent:hover {
          background: #A8D209;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(193, 245, 10, 0.3);
        }

        .brand-card {
          background: white;
          border: 2px solid var(--light);
          transition: all 0.3s ease;
        }

        .brand-card:hover {
          border-color: var(--secondary);
          box-shadow: 0 8px 25px rgba(61, 165, 217, 0.15);
        }

        .progress-step-active {
          background: var(--primary);
          color: white;
        }

        .progress-step-completed {
          background: var(--accent);
          color: var(--neutral);
        }

        .progress-step-inactive {
          background: var(--light);
          color: var(--neutral);
        }

        .upload-zone {
          border: 2px dashed var(--light);
          transition: all 0.3s ease;
        }

        .upload-zone:hover {
          border-color: var(--secondary);
          background-color: rgba(61, 165, 217, 0.05);
        }

        .upload-zone.active {
          border-color: var(--primary);
          background-color: rgba(13, 120, 119, 0.05);
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .mobile-stack {
            grid-template-columns: 1fr !important;
          }

          .mobile-full-width {
            width: 100% !important;
          }

          .mobile-text-sm {
            font-size: 0.875rem !important;
          }

          .mobile-px-2 {
            padding-left: 0.5rem !important;
            padding-right: 0.5rem !important;
          }

          .mobile-py-3 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
        }

        .step-highlight {
          animation: pulse-highlight 2s ease-in-out 3;
          border: 3px solid var(--secondary) !important;
          box-shadow: 0 0 20px rgba(61, 165, 217, 0.3) !important;
        }

        @keyframes pulse-highlight {
          0%, 100% { 
            border-color: var(--secondary);
            box-shadow: 0 0 20px rgba(61, 165, 217, 0.3);
          }
          50% { 
            border-color: var(--primary);
            box-shadow: 0 0 30px rgba(13, 120, 119, 0.4);
          }
        }

        .scroll-arrow {
          animation: bounce-down 2s infinite;
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        @keyframes bounce-down {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(10px);
          }
          60% {
            transform: translateX(-50%) translateY(5px);
          }
        }
      `}</style>

      <div className="min-h-screen brand-bg-light">
        <Navbar freeCredits={0} paidCredits={0} />

      {/* Fixed Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-white shadow-sm border-b">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium brand-font-body ${
                    step.id < currentStep 
                      ? "progress-step-completed" 
                      : step.id === currentStep 
                        ? "progress-step-active" 
                        : "progress-step-inactive"
                  }`}>
                    {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <div className="ml-3 text-sm brand-font-body">
                    <p className={`font-medium ${step.id <= currentStep ? "brand-text-neutral" : "text-gray-500"}`}>
                      {step.name}
                    </p>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-0.5 mx-4 ${
                    step.id < currentStep ? "brand-bg-accent" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-screen-xl mx-auto px-4 py-8 mt-40">





        {/* Single Column Layout */}
        <div className="max-w-4xl mx-auto mb-8">
          {/* Main Upload Section - Always Visible */}
          <Card className="brand-card mb-8">

            <CardHeader className="text-center">
            <div className="text-center mb-8">
            <h1 className="text-4xl brand-font-heading font-extrabold brand-text-neutral mb-4">
            Upload Your Product Image
            </h1>
            <p className="text-xl brand-font-body brand-text-neutral max-w-2xl mx-auto">
            Select a high-quality image to get AI-powered enhancements
            </p>
            </div>
            </CardHeader>
            <CardContent>
              {/* Large Upload Zone - Full Width */}
              {selectedFiles.length < MAX_FILES ? (













                 <div
                  className={`upload-zone rounded-xl p-12 text-center cursor-pointer border-2 ${
                    dragActive ? "active border-[#0D7877] bg-[#0D7877]/5" : "border-dashed border-gray-300 hover:border-[#3DA5D9] hover:bg-[#3DA5D9]/5"
                  } transition-all duration-200`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                >
                  <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                  <h3 className="text-2xl brand-font-heading font-semibold brand-text-neutral mb-3">
                    Drop image here or click to browse
                  </h3>
                  <p className="text-gray-500 brand-font-body mb-6 text-lg">
                    {selectedFiles.length > 0 
                      ? `Replace image (JPEG, PNG, WebP - up to 10MB each)`
                      : `One image at a time, JPEG, PNG, WebP format, up to 10MB each`
                    }
                  </p>
                  <Button variant="outline" type="button" className="brand-button-primary border-none text-lg px-8 py-3">
                    Choose File
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Show when max files reached */
                <div className="upload-zone rounded-xl p-12 text-center bg-gray-50 border-2 border-dashed border-gray-300">
                  <Check className="mx-auto h-16 w-16 brand-text-accent mb-6" />
                  <h3 className="text-2xl brand-font-heading font-semibold brand-text-neutral mb-3">
                    Image selected
                  </h3>
                  <p className="text-gray-500 brand-font-body mb-6 text-lg">
                    You've selected an image. Remove it to add a different one.
                  </p>
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={clearAllFiles}
                    className="brand-button-primary border-none text-lg px-8 py-3"
                  >
                    Clear Image
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {uploadError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 brand-font-body text-sm">{uploadError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Information Section - Progressive Disclosure */}
          <div className={`transition-all duration-500 ease-in-out ${
            hasImages 
              ? 'opacity-100 transform translate-y-0' 
              : 'opacity-50 transform translate-y-4 pointer-events-none'
          }`}>
            <Card className={`brand-card ${hasImages ? '' : 'bg-gray-50'}`}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 brand-font-heading font-semibold brand-text-neutral text-xl">
                  <Sparkles className="h-5 w-5 brand-text-primary" />
                  Tell Us About Your Business
                </CardTitle>
                <CardDescription className="brand-font-body text-gray-600">
                  {hasImages 
                    ? "Help us understand your brand and products for better AI enhancement"
                    : "Upload image first to continue with business details"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Industry Pills Section */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="brand-font-heading font-medium brand-text-neutral text-lg">
                      Select Your Industries
                    </Label>
                    <p className="text-sm text-gray-600 brand-font-body mt-2">
                      Choose one or more industries that best describe your business
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
                    {industryPills.map((industryName) => (
                      <button
                        key={industryName}
                        type="button"
                        onClick={() => hasImages && toggleIndustryPill(industryName)}
                        disabled={!hasImages}
                        className={`p-3 rounded-lg border-2 text-center transition-all duration-200 min-h-[70px] flex flex-col items-center justify-center gap-1 ${
                          !hasImages
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : selectedIndustries.includes(industryName)
                              ? 'bg-[#0D7877] border-[#0D7877] text-white shadow-md transform -translate-y-1'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-[#0D7877] text-gray-700 hover:shadow-sm hover:-translate-y-1'
                        }`}
                      >
                        <span className="text-xs font-medium brand-font-body leading-tight">
                          {industryName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Type */}
                <div className="space-y-2 max-w-md mx-auto">
                  <Label htmlFor="productType" className="brand-font-heading font-medium brand-text-neutral text-center block">
                    Product Type (Optional)
                  </Label>
                  <Input
                    id="productType"
                    placeholder="e.g., Sneakers, Smartphone, Coffee Mug, Office Chair"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    disabled={!hasImages}
                    className={`brand-font-body text-center ${!hasImages ? 'bg-gray-100 text-gray-400' : ''}`}
                  />
                  <p className="text-xs text-gray-500 brand-font-body text-center">
                    Be specific about your main product category
                  </p>
                </div>

                {/* Image Size Selection */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Label className="brand-font-heading font-medium brand-text-neutral text-lg">
                      Choose Output Size
                    </Label>
                    <p className="text-sm text-gray-600 brand-font-body mt-2">
                      Select the desired size for your enhanced image
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {imageSizeOptions.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => hasImages && setSelectedImageSize(size.id)}
                        disabled={!hasImages}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          !hasImages
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : selectedImageSize === size.id
                              ? 'border-[#06B6D4] bg-[#06B6D4]/10 shadow-lg transform scale-105' 
                              : 'border-gray-200 hover:border-[#06B6D4] hover:bg-gray-50 hover:shadow-md'
                        }`}
                      >
                        {/* Visual Icon */}
                        <div className="flex items-center justify-center mb-3">
                          <div className={`relative ${
                            size.id === 'square' ? 'w-12 h-12' : 
                            size.id === 'landscape' ? 'w-16 h-10' : 'w-10 h-16'
                          } border-2 rounded-sm ${
                            selectedImageSize === size.id ? 'border-[#06B6D4]' : 'border-gray-400'
                          } flex items-center justify-center`}>
                            <div className={`${
                              size.id === 'square' ? 'w-8 h-8' : 
                              size.id === 'landscape' ? 'w-12 h-6' : 'w-6 h-12'
                            } ${
                              selectedImageSize === size.id ? 'bg-[#06B6D4]' : 'bg-gray-400'
                            } rounded-sm opacity-70`}></div>
                          </div>
                        </div>

                        {/* Size Label */}
                        <div className="text-lg font-semibold text-gray-800 mb-2">{size.label}</div>
                        
                        {/* Best For */}
                        <div className="text-sm font-medium text-[#06B6D4] mb-2">
                          Best for: {size.bestFor}
                        </div>
                        
                        {/* Description */}
                        <div className="text-xs text-gray-600 leading-relaxed">
                          {size.description}
                        </div>

                        {/* Selected Indicator */}
                        {selectedImageSize === size.id && (
                          <div className="mt-3 flex items-center text-[#06B6D4] text-sm font-medium">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Selected
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {selectedImageSize && hasImages && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 max-w-2xl mx-auto">
                      <div className="text-center">
                        <p className="text-sm brand-text-primary font-medium brand-font-body mb-1">
                          ✨ Perfect! Your image will be enhanced to {imageSizeOptions.find(size => size.id === selectedImageSize)?.label}
                        </p>
                        <p className="text-xs text-green-600 brand-font-body">
                          {imageSizeOptions.find(size => size.id === selectedImageSize)?.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Preview Grid */}
        {selectedFiles.length > 0 && (
          <Card className="mb-8 brand-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="brand-font-heading font-semibold brand-text-neutral">
                Selected Image (1/1)
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFiles}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Image
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-secondary transition-all duration-200">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))} // Clean up memory
                      />
                      {/* Remove button - always visible on mobile, hover on desktop */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      {/* File size indicator */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </div>
                    </div>

                    {/* File info */}
                    <div className="mt-2">
                      <p className="text-xs brand-font-body brand-text-neutral truncate font-medium">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 brand-font-body">
                        {file.type.split('/')[1].toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add more button if less than max */}
                {selectedFiles.length < MAX_FILES && (
                  <div 
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-gray-50 transition-all duration-200"
                    onClick={openFileDialog}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 brand-font-body text-center">
                      Replace Image
                    </p>
                  </div>
                )}
              </div>

              {/* Summary info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm brand-font-body">
                  <span className="brand-text-neutral">
                    Total: {selectedFiles.length} image
                  </span>
                  <span className="text-gray-500">
                    Total size: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(1)}MB
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons Section - Show only when user has added content */}
        {hasContent && (
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button 
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                className="brand-font-body border-2 brand-border-primary brand-text-primary hover:brand-bg-primary hover:text-white w-full sm:w-auto mobile-py-3"
              >
                Previous Step
              </Button>

              <Button 
                variant="outline"
                onClick={startOver}
                className="brand-font-body border-2 border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto mobile-py-3"
              >
                Start Over
              </Button>
            </div>

            <div className="text-sm text-gray-500 brand-font-body order-first md:order-none">
              Step {currentStep} of {steps.length}
            </div>

            <RainbowButton 
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`brand-font-body font-medium transition-all duration-200 w-full md:w-auto mobile-py-3 ${
                !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Enhancements
            </RainbowButton>
          </div>
        )}

        {/* Progress Indicator - Show when no content yet */}
        {!hasContent && (
          <div className="text-center mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <h3 className="text-lg brand-font-heading font-semibold brand-text-neutral mb-2">
              Get Started
            </h3>
            <p className="text-gray-600 brand-font-body">
              Upload your first image or select your industry to begin the enhancement process
            </p>
          </div>
        )}

        {/* Requirements Status Display */}
        {hasContent && !canSubmit && (
          <Card className="text-center brand-card border-2 border-gray-200" style={{ 
            background: 'linear-gradient(135deg, rgba(243, 244, 246, 0.8) 0%, rgba(249, 250, 251, 0.8) 100%)'
          }}>
            <CardContent className="pt-6 pb-6">
              <h3 className="text-xl brand-font-heading font-bold brand-text-neutral mb-4">
                Complete Requirements to Continue
              </h3>

              <div className="mb-4 max-w-2xl mx-auto">
                {/* Validation Checklist */}
                <div className="text-left space-y-2">
                  <div className={`flex items-center gap-3 p-2 rounded ${hasImages ? 'bg-green-50' : 'bg-red-50'}`}>
                    {hasImages ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`brand-font-body text-sm ${hasImages ? 'text-green-700' : 'text-red-600'}`}>
                      Upload an image (1/1 uploaded)
                    </span>
                  </div>

                  <div className={`flex items-center gap-3 p-2 rounded ${hasIndustryInfo ? 'bg-green-50' : 'bg-red-50'}`}>
                    {hasIndustryInfo ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`brand-font-body text-sm ${hasIndustryInfo ? 'text-green-700' : 'text-red-600'}`}>
                      Select your industry ({selectedIndustries.length} selected)
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 p-2 rounded ${hasImageSize ? 'bg-green-50' : 'bg-red-50'}`}>
                    {hasImageSize ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`brand-font-body text-sm ${hasImageSize ? 'text-green-700' : 'text-red-600'}`}>
                      Choose output size ({selectedImageSize || 'none selected'})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Enhanced Loading Overlay with Processing Steps */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg mx-4 text-center">
            <div className="mb-6">
              <Loader2 className="mx-auto h-16 w-16 brand-text-primary animate-spin mb-4" />
              <h3 className="text-2xl brand-font-heading font-bold brand-text-neutral mb-2">
                Processing Your Image
              </h3>
              <p className="brand-text-neutral brand-font-body mb-4">
                {processingStatus}
              </p>
            </div>

            {/* Processing Steps Progress */}
            <div className="space-y-3 mb-6">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center text-left">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    step.id < processingStep 
                      ? "brand-bg-accent brand-text-neutral" 
                      : step.id === processingStep 
                        ? "brand-bg-primary text-white" 
                        : "bg-gray-200 text-gray-500"
                  }`}>
                    {step.id < processingStep ? (
                      <Check className="h-4 w-4" />
                    ) : step.id === processingStep ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium brand-font-body text-sm ${
                      step.id <= processingStep ? "brand-text-neutral" : "text-gray-500"
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500 brand-font-body">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="brand-bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(processingStep / processingSteps.length) * 100}%` }}
              />
            </div>

            {/* Processing Stats */}

 <div className="text-xs text-gray-500 brand-font-body space-y-1">
                  <p>Processing your image</p>
                  <p>Industries: {selectedIndustries.join(', ')}</p>
                  <p className="brand-text-primary font-medium">
                    ✨ Generating 5 enhancement ideas
                  </p>
                </div>
          </div>
        </div>
      )}

      {/* Error Display Overlay */}
      {showRetry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <X className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-2xl brand-font-heading font-bold brand-text-neutral mb-2">
                Processing Failed
              </h3>
              <p className="brand-text-neutral brand-font-body mb-4">
                {processingError}
              </p>
            </div>

            {/* Error Actions */}
            <div className="space-y-3">
              <Button 
                onClick={retryProcessing}
                className="w-full brand-button-primary brand-font-body font-medium"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try Again
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  setShowRetry(false);
                  setProcessingError("");
                }}
                className="w-full brand-border-primary brand-text-primary hover:brand-bg-primary hover:text-white brand-font-body"
              >
                Cancel
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 brand-font-body mt-4">
              If the problem persists, try uploading different images or check your internet connection.
            </p>
          </div>
        </div>
      )}

{/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={handleUpgradeClose}
        onSignUp={handleSignUp}
        onViewPricing={handleViewPricing}
      />

      {/* Sign Up Modal for Second Image Attempt */}
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={handleSignUpModalClose}
        onSignUpWithGoogle={() => {
          setShowSignUpModal(false);
          setLocation('/auth?provider=google');
        }}
        onSignUpWithEmail={() => {
          setShowSignUpModal(false);
          setLocation('/auth?mode=signup');
        }}
        onLogin={() => {
          setShowSignUpModal(false);
          setLocation('/auth?mode=login');
        }}
      />

      <Footer />
      </div>
    </div>
  );
}