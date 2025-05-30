import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import EditConfirmDialog from './EditConfirmDialog';

interface EditPromptProps {
  originalImage: string;
  transformedImage: string;
  initialPrompt: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onSkip: () => void;
  transformationId?: string; // ID of the transformation being edited
  editsUsed?: number; // Count of edits already used
  freeCreditsUsed?: boolean; // Whether user has used free credits
  paidCredits?: number; // User's remaining paid credits
}

export default function EditPrompt({ 
  originalImage, 
  transformedImage, 
  initialPrompt,
  onSubmit, 
  onSkip,
  transformationId = '',
  editsUsed = 0,
  freeCreditsUsed = false,
  paidCredits = 0
}: EditPromptProps) {
  // Start with an empty prompt box for edits, regardless of the initialPrompt
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  
  // Debug the image paths
  console.log("EditPrompt received originalImage:", originalImage);
  console.log("EditPrompt received transformedImage:", transformedImage);
  
  // Ensure we have absolute URLs for the images
  const originalImageUrl = originalImage.startsWith('http') ? originalImage : originalImage.startsWith('/') ? originalImage : `/${originalImage}`;
  const transformedImageUrl = transformedImage.startsWith('http') ? transformedImage : transformedImage.startsWith('/') ? transformedImage : `/${transformedImage}`;
  
  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };
  
  const enhancePrompt = async () => {
    if (prompt.trim().length === 0) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsEnhancing(true);
      
      const response = await apiRequest('POST', '/api/enhance-prompt', {
        prompt: prompt.trim()
      });
      
      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }
      
      const data = await response.json();
      
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Prompt Enhanced",
          description: "Your prompt has been enhanced with AI assistance.",
        });
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  // Handle updating description for page - update based on if this will be a free edit or not
  useEffect(() => {
    // We'll update any relevant UI based on edits used
    console.log(`Edits used for transformation #${transformationId}: ${editsUsed}`);
  }, [editsUsed, transformationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to describe your edit.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if this is an additional edit (beyond the first free one)
    if (editsUsed > 0) {
      // Show confirmation dialog if user has credits
      if (paidCredits > 0) {
        setShowConfirmDialog(true);
      } else {
        // No credits available
        toast({
          title: "Additional Credit Required",
          description: "You've used your free edit for this transformation. Please purchase credits to make additional edits.",
          variant: "destructive"
        });
      }
    } else {
      // First edit is free, proceed
      onSubmit(prompt, selectedSize);
    }
  };
  
  const handleConfirmEdit = () => {
    // User confirmed using a credit for this edit
    setShowConfirmDialog(false);
    onSubmit(prompt, selectedSize);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {editsUsed > 0 ? "Additional Edit" : "Make Your Free Edit"}
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        {editsUsed > 0 
          ? "You've already used the included edit for this image. Additional edits will require a new credit." 
          : "Each credit includes 1 image transformation + 1 edit. For best results, focus on simple color changes and be very specific with your instructions."}
      </p>
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-6">
        <p className="text-blue-800 text-sm">
          <strong>Tips for successful edits:</strong> Keep edits simple and focused on color changes (e.g., "Change the background from blue to green"). The more specific you are, the better the results. Avoid requests that could alter character appearance beyond simple color adjustments.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 flex flex-col items-center">
          <h3 className="font-semibold mb-2">Current Image</h3>
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={transformedImageUrl} 
              alt="Current transformed version" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <h3 className="font-semibold mb-2">Original Image</h3>
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={originalImageUrl} 
              alt="Original uploaded image" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="prompt" className="block mb-2 font-medium">Describe Your Edit</Label>
          <div className="relative">
            <Textarea
              id="prompt"
              placeholder="For best results: Focus on simple color changes like 'Change the hat from blue to red' or 'Make the background purple instead of green'. Be very specific and avoid content that could be rejected by safety systems."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 rounded-lg p-4 resize-none text-white bg-black shadow-inner"
            />
            <RainbowButton
              variant="outline"
              size="sm"
              className="absolute right-2 top-2 rounded-full p-1.5"
              onClick={enhancePrompt}
              disabled={isEnhancing || prompt.trim().length === 0}
              title="Enhance prompt with AI"
            >
              {isEnhancing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </RainbowButton>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
            <RainbowButton
              variant="outline"
              size="sm"
              className="text-xs p-1 h-auto"
              onClick={enhancePrompt}
              disabled={isEnhancing || prompt.trim().length === 0}
            >
              <Wand2 className="h-3 w-3 mr-1" /> 
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </RainbowButton>
          </div>
        </div>
        
        <div className="mb-5">
          <h4 className="text-sm font-medium mb-2">Image Size</h4>
          <div className="flex flex-wrap gap-2">
            <RainbowButton 
              type="button"
              variant="outline" 
              className={`${selectedSize === "1024x1024" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1024x1024")}
            >
              Square (1024×1024)
            </RainbowButton>
            <RainbowButton 
              type="button"
              variant="outline" 
              className={`${selectedSize === "1024x1536" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1024x1536")}
            >
              Portrait (1024×1536)
            </RainbowButton>
            <RainbowButton 
              type="button"
              variant="outline" 
              className={`${selectedSize === "1536x1024" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1536x1024")}
            >
              Landscape (1536×1024)
            </RainbowButton>
          </div>
        </div>
        
        {editsUsed > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> You've already used the included edit for this image. 
              Each credit includes 1 image creation + 1 edit.
              This additional edit will use 1 new credit from your account.
              You currently have {paidCredits} credits remaining.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <RainbowButton 
            type="button" 
            variant="outline" 
            onClick={onSkip}
          >
            Skip Edit
          </RainbowButton>
          <RainbowButton 
            type="submit"
          >
            {editsUsed > 0 ? "Apply Edit (Use 1 Credit)" : "Apply Edit"}
          </RainbowButton>
        </div>
      </form>
      
      {/* Confirmation Dialog for additional edits */}
      <EditConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmEdit}
        paidCredits={paidCredits}
      />
    </div>
  );
}