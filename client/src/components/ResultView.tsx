import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeftRight, Upload, ImageIcon, Edit, Check, BookOpen, Loader2 } from 'lucide-react';
import { downloadImage, getFilenameFromPath } from '@/lib/utils';
import { Link } from 'wouter';
import EmailCollectionDialog from './EmailCollectionDialog';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResultViewProps {
  originalImage: string;
  transformedImage: string;
  secondTransformedImage?: string | null;
  onTryAgain: () => void;
  onNewImage: () => void;
  onEditImage?: (imageToEdit?: string) => void;
  freeCredits: number;
  paidCredits: number;
  prompt?: string;
  canEdit?: boolean;
  transformationId?: string;
  editsUsed?: number;
  userId?: number;
}

export default function ResultView({ 
  originalImage, 
  transformedImage, 
  secondTransformedImage = null,
  onTryAgain, 
  onNewImage,
  onEditImage,
  freeCredits,
  paidCredits,
  prompt = "Transformation of the original image",
  canEdit = true,
  transformationId = '',
  editsUsed = 0,
  userId
}: ResultViewProps) {
  // Get authentication state
  const { user } = useAuth();
  
  // Track which image is selected for download/edit
  const [selectedImage, setSelectedImage] = useState<string>(transformedImage);
  
  // State for coloring book transformation
  const [isColoringBookLoading, setIsColoringBookLoading] = useState(false);
  const [coloringBookImage, setColoringBookImage] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Set initial selected image when component loads or when images change
  useEffect(() => {
    setSelectedImage(transformedImage);
  }, [transformedImage]);
  
  // Check if this is an edit (editsUsed > 0) or if email has already been collected
  const isEdit = editsUsed > 0;
  const emailAlreadyCollected = localStorage.getItem('emailCollected') === 'true';
  
  // Show email dialog for guests who try to download or edit images
  const isGuest = !user; // If there's no user, we're in guest mode
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [actionRequiringEmail, setActionRequiringEmail] = useState<'download' | 'edit' | 'coloring' | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(emailAlreadyCollected || !!user);
  const effectiveUserId = user?.id || userId || 1; // Use provided userId or logged in user ID or fallback to 1
  
  const handleEmailSubmitted = () => {
    localStorage.setItem('emailCollected', 'true');
    setEmailSubmitted(true);
    setShowEmailDialog(false);
    
    // Execute the action that was pending email collection
    if (actionRequiringEmail === 'download') {
      handleDownload();
    } else if (actionRequiringEmail === 'edit' && onEditImage) {
      onEditImage(selectedImage);
    } else if (actionRequiringEmail === 'coloring') {
      handleColoringBookTransform();
    }
  };
  
  const handleSkipEmail = () => {
    setShowEmailDialog(false);
  };
  
  // Function to handle downloading the selected image
  const handleDownload = () => {
    // If user is not logged in and email hasn't been collected, show email dialog
    if (isGuest && !emailAlreadyCollected) {
      setActionRequiringEmail('download');
      setShowEmailDialog(true);
      return;
    }
    
    // Otherwise proceed with download of the selected image
    downloadImage(selectedImage, getFilenameFromPath(selectedImage));
  };
  
  // Function to handle coloring book transformation
  const handleColoringBookTransform = async () => {
    // If user is not logged in and email hasn't been collected, show email dialog
    if (isGuest && !emailAlreadyCollected) {
      setActionRequiringEmail('coloring');
      setShowEmailDialog(true);
      return;
    }
    
    // Check if we already have a coloring book image
    if (coloringBookImage) {
      setSelectedImage(coloringBookImage);
      return;
    }
    
    try {
      setIsColoringBookLoading(true);
      
      // Make API request to transform the image
      const response = await apiRequest("POST", "/api/product-enhancement/coloring-book", {
        imagePath: selectedImage,
        userId: effectiveUserId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle credit errors specifically
        if (errorData.error === "credit_required") {
          toast({
            title: "Credits Required",
            description: "You need 1 credit to transform this image into coloring book style.",
            variant: "destructive"
          });
          return;
        }
        
        // Handle other errors
        throw new Error(errorData.message || "Failed to create coloring book style");
      }
      
      const data = await response.json();
      setColoringBookImage(data.transformedImageUrl);
      setSelectedImage(data.transformedImageUrl);
      
      toast({
        title: "Coloring Book Style Created!",
        description: "Your image has been transformed into coloring book style.",
      });
    } catch (error: any) {
      console.error("Error creating coloring book style:", error);
      toast({
        title: "Transformation Failed",
        description: error.message || "Failed to create coloring book style. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsColoringBookLoading(false);
    }
  };
  
  // Function to save the user's image selection to the database
  const saveImageSelection = async (imagePath: string) => {
    if (transformationId) {
      try {
        const response = await fetch(`/api/transformation/${transformationId}/select-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ selectedImagePath: imagePath }),
        });
        
        if (response.ok) {
          console.log('Image selection saved successfully');
        } else {
          const errorData = await response.json();
          console.error('Failed to save image selection:', errorData.message || 'Unknown error');
        }
      } catch (error) {
        console.error('Failed to save image selection:', error);
      }
    }
  };

  return (
    <div className="p-8">
      {/* Email collection dialog */}
      <EmailCollectionDialog 
        open={showEmailDialog}
        onClose={handleSkipEmail}
        onEmailSubmitted={handleEmailSubmitted}
        userId={effectiveUserId}
      />
      
      <div className="w-full max-w-3xl mx-auto">
        {/* Transformation Complete Message */}
        <div className="text-center mb-6">
          <p className="text-xl font-medium mb-2">Transformation Complete!</p>
          <p className="text-gray-600">
            Select one of the images below for download or editing.
          </p>
          {editsUsed > 0 && (
            <div className="mt-1 text-sm">
              <span className="text-gray-500">
                {editsUsed} edit{editsUsed !== 1 ? 's' : ''} used
              </span>
            </div>
          )}
        </div>
        
        {/* Side-by-side image display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* First transformed image */}
          <div 
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === transformedImage ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
            onClick={() => {
              setSelectedImage(transformedImage);
              saveImageSelection(transformedImage);
            }}
          >
            <div className="aspect-w-1 aspect-h-1 relative">
              <img 
                src={transformedImage} 
                alt="Transformed image option 1" 
                className="object-cover w-full h-full" 
              />
              {selectedImage === transformedImage && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
              <p className="text-sm font-medium">Option 1</p>
            </div>
          </div>

          {/* Second transformed image (if available) */}
          {secondTransformedImage && (
            <div 
              className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === secondTransformedImage ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
              onClick={() => {
                setSelectedImage(secondTransformedImage);
                saveImageSelection(secondTransformedImage);
              }}
            >
              <div className="aspect-w-1 aspect-h-1 relative">
                <img 
                  src={secondTransformedImage} 
                  alt="Transformed image option 2" 
                  className="object-cover w-full h-full" 
                />
                {selectedImage === secondTransformedImage && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
                <p className="text-sm font-medium">Option 2</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mb-6">
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Click on an image to select it for download or editing
          </span>
        </p>
        
        {/* Transformation completed message - replaced the original prompt display */}
        <div className="p-4 rounded-lg mb-8 border border-gray-200">
          <div className="flex items-start">
            <ImageIcon className="text-gray-700 h-5 w-5 mt-1 mr-3 flex-shrink-0" />
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-gray-700 font-medium">Ready for edits:</h3>
              </div>
              <div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  Your image has been transformed successfully. Click the "Edit This Image" button below to make changes.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* First row: Edit and Download */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {canEdit && onEditImage && (
              <Button
                className="text-[#FF7B54] bg-[#333333] hover:bg-[#333333]/90 flex-1"
                onClick={() => {
                  // If user is not logged in and email hasn't been collected, show email dialog
                  if (isGuest && !emailAlreadyCollected) {
                    setActionRequiringEmail('edit');
                    setShowEmailDialog(true);
                    return;
                  }
                  
                  // Otherwise, proceed with edit passing the selected image
                  if (onEditImage) {
                    onEditImage(selectedImage);
                  }
                }}
                title={editsUsed > 0 ? "Additional edits will use credits" : "You have 1 free edit available"}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editsUsed > 0 ? "Edit Again (Uses Credit)" : "Edit This Image"}
                {editsUsed > 0 && (
                  <span className="ml-1 text-xs bg-yellow-400 text-black px-1 py-0.5 rounded">
                    1 Credit
                  </span>
                )}
              </Button>
            )}
            <Button 
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" /> Download Image
            </Button>
          </div>
          
          {/* Second row: Coloring Book Style, Try Another Prompt and Upload New Image */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="outline" 
              onClick={onTryAgain}
              className="text-[#A3E4D7] border-[#A3E4D7] hover:bg-[#A3E4D7]/10 flex-1"
            >
              <ArrowLeftRight className="h-4 w-4 mr-2" />
              Try Another Prompt
            </Button>
            <Button 
              variant="outline"
              className="border-[#333333] text-black hover:bg-gray-100 bg-[#f2f2f2] flex-1"
              onClick={onNewImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Image
            </Button>
          </div>
          
          {/* Third row: Coloring Book button */}
          <div className="mt-4">
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleColoringBookTransform}
              disabled={isColoringBookLoading}
            >
              {isColoringBookLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Coloring Book...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {coloringBookImage ? 'View Coloring Book Style' : 'Convert to Coloring Book Style'}
                  {!coloringBookImage && (
                    <span className="ml-1 text-xs bg-yellow-400 text-black px-1 py-0.5 rounded">
                      1 Credit
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-700">
            <span className="mr-1">⭐</span> 
            You have {freeCredits + paidCredits} credit{freeCredits + paidCredits !== 1 ? 's' : ''} remaining.
            <span className="block text-sm mt-1">Each credit includes 1 image creation + 1 edit.</span>
            {(freeCredits + paidCredits === 0) && (
              <Link href="/pricing">
                <span className="font-medium underline ml-1 cursor-pointer">
                  Get more credits
                </span>
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
