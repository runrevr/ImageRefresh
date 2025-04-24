import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditPromptProps {
  originalImage: string;
  transformedImage: string;
  initialPrompt: string;
  onSubmit: (prompt: string) => void;
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
  const { toast } = useToast();
  
  // Debug the image paths
  console.log("EditPrompt received originalImage:", originalImage);
  console.log("EditPrompt received transformedImage:", transformedImage);
  
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
    
    onSubmit(prompt);
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
              src={transformedImage} 
              alt="Current transformed version" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center">
          <h3 className="font-semibold mb-2">Original Image</h3>
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={originalImage} 
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