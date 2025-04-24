import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EditPromptProps {
  originalImage: string;
  transformedImage: string;
  initialPrompt: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onSkip: () => void;
}

export default function EditPrompt({ 
  originalImage, 
  transformedImage, 
  initialPrompt,
  onSubmit, 
  onSkip 
}: EditPromptProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
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
    
    onSubmit(prompt, selectedSize);
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Make One Edit</h2>
      <p className="text-gray-600 mb-6 text-center">
        You can make one free edit to your transformation. Describe what you'd like to change.
      </p>
      
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
          <Textarea
            id="prompt"
            placeholder="Example: Make the background blue instead of red, add more clouds to the sky, etc."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 rounded-lg p-4 resize-none text-white bg-black shadow-inner"
          />
        </div>
        
        <div className="mb-5">
          <h4 className="text-sm font-medium mb-2">Image Size</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              type="button"
              variant="outline" 
              className={`border-dashed border-black text-black bg-white hover:bg-gray-100 ${selectedSize === "1024x1024" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1024x1024")}
            >
              Square (1024×1024)
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className={`border-dashed border-black text-black bg-white hover:bg-gray-100 ${selectedSize === "1024x1536" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1024x1536")}
            >
              Portrait (1024×1536)
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className={`border-dashed border-black text-black bg-white hover:bg-gray-100 ${selectedSize === "1536x1024" ? "border-2 bg-gray-100" : "border"}`}
              onClick={() => handleSizeSelection("1536x1024")}
            >
              Landscape (1536×1024)
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSkip}
            className="text-white bg-black"
          >
            Skip Edit
          </Button>
          <Button 
            type="submit" 
            className="text-white bg-black"
          >
            Apply Edit
          </Button>
        </div>
      </form>
    </div>
  );
}