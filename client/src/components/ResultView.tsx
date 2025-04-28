import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ArrowLeftRight, Upload, ImageIcon, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';
import { downloadImage, getFilenameFromPath } from '@/lib/utils';
import { Link } from 'wouter';
import EmailCollectionDialog from './EmailCollectionDialog';

interface ResultViewProps {
  originalImage: string;
  transformedImage: string;
  onTryAgain: () => void;
  onNewImage: () => void;
  onEditImage?: () => void;
  freeCredits: number;
  paidCredits: number;
  prompt?: string;
  canEdit?: boolean;
  transformationId?: string;
  editsUsed?: number;
}

export default function ResultView({ 
  originalImage, 
  transformedImage, 
  onTryAgain, 
  onNewImage,
  onEditImage,
  freeCredits,
  paidCredits,
  prompt = "Transformation of the original image",
  canEdit = true,
  transformationId = '',
  editsUsed = 0
}: ResultViewProps) {
  // Check if this is an edit (editsUsed > 0) or if email has already been collected
  const isEdit = editsUsed > 0;
  const emailAlreadyCollected = localStorage.getItem('emailCollected') === 'true';
  
  // Only show email dialog if it's not an edit and email hasn't been collected yet
  const [showEmailDialog, setShowEmailDialog] = useState(!isEdit && !emailAlreadyCollected);
  const [emailSubmitted, setEmailSubmitted] = useState(emailAlreadyCollected);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const userId = 1; // Default to user ID 1 for demo
  
  const handleEmailSubmitted = () => {
    localStorage.setItem('emailCollected', 'true');
    setEmailSubmitted(true);
    setShowEmailDialog(false);
  };
  
  const handleSkipEmail = () => {
    setShowEmailDialog(false);
  };
  
  const handleDownload = () => {
    downloadImage(transformedImage, getFilenameFromPath(transformedImage));
  };
  
  // Helper function to truncate long prompt text
  const getTruncatedPrompt = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-8">
      {/* Email collection dialog */}
      <EmailCollectionDialog 
        open={showEmailDialog}
        onClose={handleSkipEmail}
        onEmailSubmitted={handleEmailSubmitted}
        userId={userId}
      />
      
      <div className="w-full max-w-3xl mx-auto">
        {/* Transformation Complete Message */}
        <div className="text-center mb-6">
          <p className="text-xl font-medium mb-2">Transformation Complete!</p>
          <p className="text-gray-600">
            Drag the slider to compare before and after images.
          </p>
          {editsUsed > 0 && (
            <div className="mt-1 text-sm">
              <span className="text-gray-500">
                {editsUsed} edit{editsUsed !== 1 ? 's' : ''} used
              </span>
            </div>
          )}
        </div>
        
        {/* Comparison slider */}
        <div className="w-full h-96 rounded-lg overflow-hidden mb-8">
          <ComparisonSlider 
            beforeImage={originalImage} 
            afterImage={transformedImage} 
          />
        </div>
        
        {/* Transformation Description - Gray text with collapsible content */}
        <div className="p-4 rounded-lg mb-8 border border-gray-200">
          <div className="flex items-start">
            <ImageIcon className="text-gray-700 h-5 w-5 mt-1 mr-3 flex-shrink-0" />
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-gray-700 font-medium">Description:</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0" 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  title={showFullDescription ? "Hide full description" : "Show full description"}
                >
                  {showFullDescription ? 
                    <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  }
                </Button>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-screen' : 'max-h-16'}`}>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {showFullDescription ? prompt : getTruncatedPrompt(prompt)}
                </p>
              </div>
              {!showFullDescription && prompt.length > 150 && (
                <div className="text-right mt-1">
                  <button 
                    className="text-xs text-primary-500 hover:underline"
                    onClick={() => setShowFullDescription(true)}
                  >
                    Show more
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* First row: Edit and Download */}
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {canEdit && onEditImage && (
              <Button
                className="text-[#FF7B54] bg-[#333333] hover:bg-[#333333]/90 flex-1"
                onClick={onEditImage}
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
          
          {/* Second row: Try Another Prompt and Upload New Image */}
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
              className="border-primary-500 text-black hover:bg-primary-50 hover:text-primary-500 bg-primary-500 flex-1"
              onClick={onNewImage}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload New Image
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
