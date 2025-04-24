import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Lightbulb, CircleHelp } from 'lucide-react';

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string) => void;
  onBack: () => void;
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

export default function PromptInput({ originalImage, onSubmit, onBack }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const handleSubmit = () => {
    if (prompt.trim().length === 0) return;
    onSubmit(prompt.trim());
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
            <h3 className="text-xl font-medium mb-4">Describe your transformation</h3>
            <p className="text-gray-600 mb-4">
              Be specific about what changes you want. For best results, include details about style, mood, and elements.
            </p>
            
            <div className="mb-4">
              <Textarea
                value={prompt}
                onChange={handlePromptChange}
                className="w-full border border-gray-300 rounded-lg p-4 h-40 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-white bg-black"
                placeholder="E.g., 'Turn this portrait into an oil painting with vibrant colors in the style of Van Gogh'"
                maxLength={maxChars}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Be descriptive for better results</span>
                <span id="char-count">{charCount}/{maxChars}</span>
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
