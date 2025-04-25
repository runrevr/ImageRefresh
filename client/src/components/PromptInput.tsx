import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Lightbulb, CircleHelp, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onBack: () => void;
  selectedTransformation?: TransformationType | null;
}

// Example prompts that users can select
const EXAMPLE_PROMPTS = [
  "Turn this portrait into a vibrant oil painting in the style of Van Gogh",
  "Transform this daytime beach scene into a magical night beach with stars and moonlight",
  "Convert this modern building into an ancient medieval stone castle",
  "Enhance this food photo with professional lighting and commercial food styling",
  "Transform this person into a cyberpunk character with neon accents",
  "Turn this room into a luxury modern interior with upscale furnishings"
];

// Writing tips for better prompts
const PROMPT_TIPS = [
  "Be specific about style (e.g., 'watercolor', 'photorealistic', 'cartoon')",
  "Mention colors and lighting (e.g., 'vibrant colors', 'dramatic lighting')",
  "Reference artists or styles (e.g., 'like Van Gogh', 'cyberpunk aesthetic')",
  "Include mood or atmosphere (e.g., 'mysterious', 'cheerful', 'serene')",
  "Specify what elements to modify (e.g., 'replace the background with mountains')"
];

// Preset transformation descriptions and suggestions
type TransformationType = 'cartoon' | 'product' | 'custom';

type PresetTransformation = {
  title: string;
  description: string;
  placeholder: string;
  suggestedPrompt: string;
};

const PRESET_TRANSFORMATIONS: Record<TransformationType, PresetTransformation> = {
  cartoon: {
    title: "Cartoon Style",
    description: "Transform your image into a vibrant cartoon with bold outlines and simplified shapes.",
    placeholder: "E.g., 'Add bright colors and exaggerated features while keeping the original subject as the main focus'",
    suggestedPrompt: "Transform this image into a vibrant cartoon style with bold outlines, simplified shapes, and exaggerated features. Use bright, saturated colors and create a playful, animated appearance while maintaining the original composition and subject as the main focus. Add a slight cel-shaded effect for depth."
  },
  product: {
    title: "Product Photography",
    description: "Create a professional product shot with the uploaded product as the center focus.",
    placeholder: "E.g., 'Place the product on a minimal white surface with soft shadows and dramatic lighting'",
    suggestedPrompt: "Transform this into a professional product photo with the product as the central focus. Use clean, commercial-grade lighting with soft shadows, a simple background that complements the product, and enhance the colors and details to make the product look premium and appealing."
  },
  custom: {
    title: "Custom Transformation",
    description: "Describe exactly how you'd like to transform your image.",
    placeholder: "E.g., 'Turn this portrait into an oil painting with vibrant colors in the style of Van Gogh'",
    suggestedPrompt: ""
  }
};

export default function PromptInput({ originalImage, onSubmit, onBack, selectedTransformation }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();
  const maxChars = 500;

  // We no longer auto-fill the prompt based on transformation type
  // The presets will now only affect the placeholder text and description

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const handleSubmit = () => {
    if (prompt.trim().length === 0) return;
    onSubmit(prompt.trim(), selectedSize);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setPrompt(value);
    }
  };

  const selectExamplePrompt = (example: string) => {
    setPrompt(example);
  };
  
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

  return (
    <div className="p-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80 md:h-96">
            <img 
              src={originalImage} 
              className="max-w-full max-h-full object-contain" 
              alt="Your uploaded image" 
            />
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-medium">Describe your transformation</h3>
              {selectedTransformation && selectedTransformation in PRESET_TRANSFORMATIONS && (
                <div className="bg-black text-white text-xs px-3 py-1 rounded-full">
                  {PRESET_TRANSFORMATIONS[selectedTransformation as TransformationType].title}
                </div>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              {selectedTransformation && selectedTransformation in PRESET_TRANSFORMATIONS
                ? PRESET_TRANSFORMATIONS[selectedTransformation as TransformationType].description
                : "Be specific about what changes you want. For best results, include details about style, mood, and elements."}
            </p>
            
            <div className="mb-4">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  className="w-full border border-gray-300 rounded-lg p-4 h-40 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-white bg-black"
                  placeholder={selectedTransformation && selectedTransformation in PRESET_TRANSFORMATIONS
                    ? PRESET_TRANSFORMATIONS[selectedTransformation as TransformationType].placeholder 
                    : "E.g., 'Turn this portrait into an oil painting with vibrant colors in the style of Van Gogh'"
                  }
                  maxLength={maxChars}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-1.5"
                  onClick={enhancePrompt}
                  disabled={isEnhancing || prompt.trim().length === 0}
                  title="Enhance prompt with AI"
                >
                  {isEnhancing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                <div className="flex items-center">
                  <span>Be descriptive for better results</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-primary-500 p-1 h-auto"
                    onClick={enhancePrompt}
                    disabled={isEnhancing || prompt.trim().length === 0}
                  >
                    <Wand2 className="h-3 w-3 mr-1" /> 
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </Button>
                </div>
                <span id="char-count">{charCount}/{maxChars}</span>
              </div>
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
            
            <div className="flex items-center space-x-3 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="link" className="text-sm text-primary-500 p-0 h-auto">
                    <Lightbulb className="h-4 w-4 mr-1" /> Example prompts
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Example Prompts</h4>
                    <div className="space-y-2">
                      {EXAMPLE_PROMPTS.map((example, index) => (
                        <div 
                          key={index}
                          className="p-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectExamplePrompt(example)}
                        >
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="link" className="text-sm text-primary-500 p-0 h-auto">
                    <CircleHelp className="h-4 w-4 mr-1" /> Writing tips
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">Tips for Better Results</h4>
                    <ul className="space-y-2 text-sm">
                      {PROMPT_TIPS.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-500 mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onBack} className="text-white bg-black">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button 
                className="flex-1 text-white bg-primary hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={prompt.trim().length === 0}
              >
                Generate Transformation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
