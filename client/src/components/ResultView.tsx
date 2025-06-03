import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeftRight, Upload, ImageIcon, Edit, Check, BookOpen, Loader2, RefreshCw, Share2, ZoomIn, ArrowLeft, RotateCcw } from 'lucide-react';
import { downloadImage, getFilenameFromPath } from '@/lib/utils';
import { Link } from 'wouter';
import EmailCollectionDialog from './EmailCollectionDialog';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ResultViewProps {
  originalImage: string;
  transformedImage: string;
  transformedImages?: string[];
  secondTransformedImage?: string | null;
  onTryAgain: () => void;
  onNewImage: () => void;
  onEditImage?: (imageToEdit?: string, editPrompt?: string) => void;
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
  transformedImages = [],
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

  // State for regeneration
  const [isRegenerating, setIsRegenerating] = useState(false);

  // State for edit prompt
  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [editPromptText, setEditPromptText] = useState('');
  const [editImageUrl, setEditImageUrl] = useState<string>('');

  // State for full view
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

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
      onEditImage(editImageUrl, editPromptText);
    } else if (actionRequiringEmail === 'coloring') {
      handleColoringBookTransform();
    }
  };

  const handleSkipEmail = () => {
    setShowEmailDialog(false);
  };

  // Function to handle downloading the selected image
  const handleDownload = (imageUrl?: string) => {
    const imageToDownload = imageUrl || selectedImage;

    // If user is not logged in and email hasn't been collected, show email dialog
    if (isGuest && !emailAlreadyCollected) {
      setActionRequiringEmail('download');
      setShowEmailDialog(true);
      return;
    }

    // Otherwise proceed with download of the selected image
    downloadImage(imageToDownload, getFilenameFromPath(imageToDownload));
  };

  // Function to handle regeneration (same prompt, no credit)
  const handleRegenerate = async (imageUrl: string) => {
    setIsRegenerating(true);
    try {
      // Call the transform API with the same prompt
      const response = await apiRequest("POST", "/api/transform", {
        originalImagePath: originalImage,
        prompt: prompt,
        userId: effectiveUserId,
        isRegeneration: true // Flag to indicate this is a regeneration
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate image");
      }

      const data = await response.json();
      // Update the transformed image with the new result
      setSelectedImage(data.transformedImageUrl);

      toast({
        title: "Image Regenerated!",
        description: "Your image has been regenerated with the same prompt.",
      });
    } catch (error: any) {
      console.error("Error regenerating image:", error);
      toast({
        title: "Regeneration Failed",
        description: error.message || "Failed to regenerate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Function to handle sharing
  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my transformed image!',
          url: imageUrl
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Link Copied!",
          description: "Image link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share image. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to handle edit prompt submission
  const handleEditPromptSubmit = async () => {
    if (!editPromptText.trim()) {
      toast({
        title: "Edit Prompt Required",
        description: "Please enter a description of the changes you want to make.",
        variant: "destructive"
      });
      return;
    }

    // If user is not logged in and email hasn't been collected, show email dialog
    if (isGuest && !emailAlreadyCollected) {
      setActionRequiringEmail('edit');
      setShowEmailDialog(true);
      return;
    }

    if (onEditImage) {
      // Pass the selected image URL and edit prompt to the parent component
      onEditImage(editImageUrl, editPromptText);
    }

    setShowEditPrompt(false);
    setEditPromptText('');
    setEditImageUrl('');
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

  // Icon button component
  const IconButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    disabled = false,
    loading = false 
  }: { 
    icon: any, 
    label: string, 
    onClick: () => void, 
    disabled?: boolean,
    loading?: boolean 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="group flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={label}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
      ) : (
        <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
      )}
      <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors mt-1">
        {label}
      </span>
    </button>
  );

  return (
    <div className="p-8">
      {/* Email collection dialog */}
      <EmailCollectionDialog 
        open={showEmailDialog}
        onClose={handleSkipEmail}
        onEmailSubmitted={handleEmailSubmitted}
        userId={effectiveUserId}
      />

      {/* Full view modal */}
      {fullViewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setFullViewImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullViewImage(null)}
            className="absolute top-4 right-4 z-60 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 transition-all"
            aria-label="Close full view"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="max-w-full max-h-full p-4">
            <img 
              src={fullViewImage} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto">
        {/* Transformation Complete Message */}
        <div className="text-center mb-6">
          <p className="text-xl font-medium mb-2">Transformation Complete!</p>
          <p className="text-gray-600">
            Click on an image to select it, then use the action buttons below.
          </p>
          {editsUsed > 0 && (
            <div className="mt-1 text-sm">
              <span className="text-gray-500">
                {editsUsed} edit{editsUsed !== 1 ? 's' : ''} used
              </span>
            </div>
          )}
        </div>

        {/* Image Grid - Above the Fold */}
        <div className="mb-8">
          <div className={`grid gap-6 ${secondTransformedImage || coloringBookImage ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {/* First transformed image */}
            <div className="space-y-4">
              <div 
                className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === transformedImage ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
                onClick={() => {
                  setSelectedImage(transformedImage);
                  saveImageSelection(transformedImage);
                }}
              >
                <div className="aspect-square relative">
                  {transformedImage && typeof transformedImage === 'string' ? (
                    <img 
                      src={transformedImage} 
                      alt="Transformed image option 1" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        console.error('Error loading transformed image:', transformedImage);
                        e.currentTarget.src = originalImage; // Fallback to original image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <p className="text-gray-500">Loading transformed image...</p>
                    </div>
                  )}
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

              {/* Icon buttons for first image */}
              <div className="flex justify-center space-x-1">
                <IconButton 
                  icon={RefreshCw} 
                  label="Regenerate" 
                  onClick={() => handleRegenerate(transformedImage)}
                  loading={isRegenerating}
                />
                <IconButton 
                  icon={Download} 
                  label="Download" 
                  onClick={() => handleDownload(transformedImage)} 
                />
                <IconButton 
                  icon={Share2} 
                  label="Share" 
                  onClick={() => handleShare(transformedImage)} 
                />
                <IconButton 
                  icon={Edit} 
                  label="Edit Prompt" 
                  onClick={() => {
                    setEditImageUrl(transformedImage);
                    setShowEditPrompt(true);
                  }} 
                />
                <IconButton 
                  icon={ZoomIn} 
                  label="View Full" 
                  onClick={() => setFullViewImage(transformedImage)} 
                />
              </div>
            </div>

            {/* Second transformed image (if available) */}
            {(secondTransformedImage || coloringBookImage) && (
              <div className="space-y-4">
                <div 
                  className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === (secondTransformedImage || coloringBookImage) ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
                  onClick={() => {
                    const imageToSelect = secondTransformedImage || coloringBookImage;
                    if (imageToSelect) {
                      setSelectedImage(imageToSelect);
                      saveImageSelection(imageToSelect);
                    }
                  }}
                >
                  <div className="aspect-square relative">
                    {(secondTransformedImage || coloringBookImage) && (
                      <img 
                        src={secondTransformedImage || coloringBookImage || ''} 
                        alt="Transformed image option 2" 
                        className="object-cover w-full h-full" 
                      />
                    )}
                    {selectedImage === (secondTransformedImage || coloringBookImage) && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
                    <p className="text-sm font-medium">
                      {coloringBookImage && !secondTransformedImage ? 'Coloring Book' : 'Option 2'}
                    </p>
                  </div>
                </div>

                {/* Icon buttons for second image */}
                <div className="flex justify-center space-x-1">
                  <IconButton 
                    icon={RefreshCw} 
                    label="Regenerate" 
                    onClick={() => handleRegenerate(secondTransformedImage || coloringBookImage || '')}
                    loading={isRegenerating}
                  />
                  <IconButton 
                    icon={Download} 
                    label="Download" 
                    onClick={() => handleDownload(secondTransformedImage || coloringBookImage || '')} 
                  />
                  <IconButton 
                    icon={Share2} 
                    label="Share" 
                    onClick={() => handleShare(secondTransformedImage || coloringBookImage || '')} 
                  />
                  <IconButton 
                    icon={Edit} 
                    label="Edit Prompt" 
                    onClick={() => {
                      setEditImageUrl(secondTransformedImage || coloringBookImage || '');
                      setShowEditPrompt(true);
                    }} 
                  />
                  <IconButton 
                    icon={ZoomIn} 
                    label="View Full" 
                    onClick={() => setFullViewImage(secondTransformedImage || coloringBookImage || '')} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Prompt Dialog */}
        {showEditPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Image Prompt</h3>
              <textarea
                value={editPromptText}
                onChange={(e) => setEditPromptText(e.target.value)}
                placeholder="Describe the changes you want to make..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditPrompt(false);
                    setEditPromptText('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditPromptSubmit}>
                  Apply Changes {editsUsed > 0 && <span className="ml-1 text-xs bg-yellow-400 text-black px-1 py-0.5 rounded">1 Credit</span>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-4 mb-8">
          {/* Coloring Book Option */}
          {!coloringBookImage && (
            <RainbowButton
              className="w-full"
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
                  Convert to Coloring Book Style
                  <span className="ml-1 text-xs bg-yellow-400 text-black px-1 py-0.5 rounded">
                    1 Credit
                  </span>
                </>
              )}
            </RainbowButton>
          )}

          {/* Back to Ideas and Start Fresh buttons */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <RainbowButton 
              variant="outline" 
              onClick={onTryAgain}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ideas
            </RainbowButton>
            <RainbowButton 
              variant="outline"
              className="flex-1"
              onClick={onNewImage}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Fresh
            </RainbowButton>
          </div>
        </div>

        {/* Credits Display */}
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