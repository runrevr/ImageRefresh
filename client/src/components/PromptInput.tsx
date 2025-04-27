import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, Lightbulb, CircleHelp, Wand2, ChevronRight, ImageIcon, BoxIcon, PaintBucket, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onBack: () => void;
  selectedTransformation?: TransformationType | null;
}

// Main transformation categories
export type TransformationType = 'cartoon' | 'product' | 'custom';

// Subcategory types
export type CartoonSubcategory = 'super-mario' | 'minecraft' | 'pixar' | 'dreamworks' | 'princess' | 'superhero' | 'lego' | 'custom-cartoon';
export type ProductSubcategory = 'remove-background' | 'enhanced-lighting' | 'natural-scene' | 'product-mockup' | 'custom-product';
export type OtherSubcategory = 'baby-prediction' | 'future-self' | 'ghibli-style' | 'ai-action-figure' | 'pet-as-human' | 'self-as-cat' | 'custom-other';

// Writing tips for better prompts
const PROMPT_TIPS = [
  "Be specific about style (e.g., 'watercolor', 'photorealistic', 'cartoon')",
  "Mention colors and lighting (e.g., 'vibrant colors', 'dramatic lighting')",
  "Reference artists or styles (e.g., 'like Van Gogh', 'cyberpunk aesthetic')",
  "Include mood or atmosphere (e.g., 'mysterious', 'cheerful', 'serene')",
  "Specify what elements to modify (e.g., 'replace the background with mountains')"
];

// Descriptions and example prompts for subcategories
type StyleOption = {
  title: string;
  description: string;
  placeholder: string;
  suggestedPrompt: string;
};

// Cartoon subcategories
const CARTOON_STYLES: Record<CartoonSubcategory, StyleOption> = {
  'super-mario': {
    title: 'Super Mario Bros',
    description: 'Transform into the colorful, blocky style of the Super Mario universe.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'The scene should be inspired by a cinematic, colorful tech-fantasy universe with glowing pipes, floating platforms, oversized mushrooms, and blocky architecture. Use bright, saturated colors with joyful lighting and dynamic energy. Transform the child into a royal or heroic character based on classic adventure archetypes: If the child is a girl, style her as a whimsical princess in a pink dress with white gloves, a gold crown, and elegant details. If the child is a boy, style him as an energetic adventurer in colorful overalls with a red or green cap and oversized gloves. Always match outfit details, proportions, and styling to the child\'s age and physical description while maintaining full likeness.'
  },
  'minecraft': {
    title: 'Minecraft',
    description: 'Convert to the iconic blocky, pixel style of Minecraft.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'Transform this image into Minecraft pixelated cube style. Use the distinctive blocky aesthetic with clear pixel edges and square proportions. Maintain the color scheme but simplify it to match Minecraft\'s limited palette.'
  },
  'pixar': {
    title: 'Pixar',
    description: 'Stylize in the smooth, expressive 3D animation style of Pixar films.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'Transform this image into the Pixar animation style with smooth 3D rendering, slightly exaggerated proportions, and expressive features. Use the characteristic high-quality texture, warm lighting, and subtle details that define Pixar\'s animation style.'
  },
  'dreamworks': {
    title: 'DreamWorks',
    description: 'Render in the dynamic, expressive style of DreamWorks animations.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'Transform this image into the DreamWorks animation style with expressive features, dynamic poses, and slightly exaggerated characteristics. Use the distinctive lighting and texture style seen in films like Shrek or How to Train Your Dragon.'
  },
  'princess': {
    title: 'Princess',
    description: 'Create a fairytale princess style with magical elements.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'Transform this image into a fairytale princess style with elegant royal attire, soft glowing effects, sparkles, and magical elements. Use pastel colors, ornate details, and a dreamy atmosphere reminiscent of classic fairy tales.'
  },
  'superhero': {
    title: 'Superhero',
    description: 'Convert to a dynamic comic book superhero style.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'Transform this image into a comic book superhero style with bold outlines, dynamic poses, and action elements like motion lines or impact effects. Use vibrant, contrasting colors and dramatic lighting typical of superhero comics.'
  },
  'lego': {
    title: 'Lego',
    description: 'Reconstruct in the distinctive blocky Lego brick style.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: 'The scene should be set in a vibrant, playful Lego world with colorful, modular Lego environments such as brick-built trees, buildings, and vehicles. Transform the child into a custom Lego minifigure that accurately matches their real-life features from uploaded image. Carefully replicate the child\'s hair style (using the closest matching Lego hairpiece), skin tone (adapted to Lego colors but faithful to real tone), eye color, and visible dental traits. The Lego minifigure should reflect the child\'s clothing style and selected theme in a fun, blocky Lego way while maintaining unmistakable likeness. Ensure the child\'s Lego character is smiling joyfully. The tone must remain colorful, whimsical, imaginative, and true to a Lego world, with full visual likeness preserved.'
  },
  'custom-cartoon': {
    title: 'Custom Cartoon Style',
    description: 'Describe your own custom cartoon transformation.',
    placeholder: 'E.g., Enter name "Jack" into the image',
    suggestedPrompt: ''
  }
};

// Product subcategories
const PRODUCT_STYLES: Record<ProductSubcategory, StyleOption> = {
  'remove-background': {
    title: 'Remove Background',
    description: 'Isolate the product with a clean, solid or transparent background.',
    placeholder: 'E.g., Place on a pure white background with subtle shadow',
    suggestedPrompt: 'Transform this product image by removing the current background and replacing it with a clean, pure white background. Add a subtle shadow beneath the product for depth. Ensure the product edges are crisp and well-defined with no background artifacts.'
  },
  'enhanced-lighting': {
    title: 'Enhanced Lighting & Colors',
    description: 'Improve product appearance with professional studio lighting and color enhancement.',
    placeholder: 'E.g., Add dramatic side lighting to highlight texture',
    suggestedPrompt: 'Transform this product image with enhanced professional studio lighting. Add soft key lights to highlight the product\'s best features, rim lighting to define edges, and fill lights to soften shadows. Enhance colors for better vibrancy and contrast while maintaining natural appearance.'
  },
  'natural-scene': {
    title: 'Natural Scene Placement',
    description: 'Place the product in a realistic outdoor or natural environment.',
    placeholder: 'E.g., Show the product on a beach at sunset',
    suggestedPrompt: 'Transform this product image by placing it in a natural scene environment. Integrate it seamlessly with realistic shadows and reflections that match the environment\'s lighting. Ensure the product remains the focal point while the natural setting provides context and atmosphere.'
  },
  'product-mockup': {
    title: 'Product Mockup',
    description: 'Show the product in context of use in realistic scenarios.',
    placeholder: 'E.g., Show being used by a model in a living room',
    suggestedPrompt: 'Transform this product image into a realistic mockup showing it in context of use. Add human interaction if appropriate, and place in a realistic setting where the product would normally be used. Ensure proper scale, realistic shadows, and environmental reflections.'
  },
  'custom-product': {
    title: 'Custom Product Enhancement',
    description: 'Describe your own custom product transformation.',
    placeholder: 'E.g., Place product on a marble countertop with morning light',
    suggestedPrompt: ''
  }
};

// Other subcategories
const OTHER_STYLES: Record<OtherSubcategory, StyleOption> = {
  'baby-prediction': {
    title: 'What Will Our Baby Look Like',
    description: 'Envision how a future baby might look based on the people in the image.',
    placeholder: 'E.g., Show what our future baby might look like',
    suggestedPrompt: 'Using the people in this image as parents, create a realistic and heartwarming prediction of what their baby might look like. Blend facial features, skin tone, hair color, and eye color in a natural way. Make the baby appear around 1 year old with a joyful expression.'
  },
  'future-self': {
    title: 'What Will I Look Like in 20 Years',
    description: 'Age the subject in the image to show how they might look 20 years in the future.',
    placeholder: 'E.g., Show me as a distinguished older person',
    suggestedPrompt: 'Transform this image to show how this person might look 20 years in the future. Age the face naturally with appropriate wrinkles, hair changes, and subtle physical aging. Maintain their core facial structure and identity while showing realistic aging effects. Keep the same general style and pose.'
  },
  'ghibli-style': {
    title: 'Ghibli Style',
    description: 'Transform into the beautiful, painterly anime style of Studio Ghibli films.',
    placeholder: 'E.g., Make it look like a scene from a Miyazaki film',
    suggestedPrompt: 'Transform this image into the distinctive Studio Ghibli animation style with soft, painterly backgrounds, whimsical elements, and the characteristic Miyazaki aesthetic. Use the warm color palette, gentle lighting, and simplified but expressive facial features typical of films like Spirited Away or My Neighbor Totoro.'
  },
  'ai-action-figure': {
    title: 'AI Action Figure',
    description: 'Turn the subject into a realistic, detailed action figure or toy.',
    placeholder: 'E.g., Make me into a collectible action figure with accessories',
    suggestedPrompt: 'Transform this image into a realistic, high-quality action figure or toy. Add visible joints, plastic texture, and a display stand. Include appropriate accessories and packaging design elements. Maintain the subject\'s likeness and key features while giving it the distinctive plastic sheen and manufacturing details of a premium collectible figure.'
  },
  'pet-as-human': {
    title: 'What Would My Pet Look Like as a Human',
    description: 'Reimagine a pet as a human while keeping recognizable traits and personality.',
    placeholder: 'E.g., Transform my dog into a human with similar features',
    suggestedPrompt: 'Transform this pet into a human character while preserving its distinctive features, coloration, and personality. Maintain the essence and character of the pet in human form, with subtle references to fur color, eye shape, and distinctive markings. Create a humanoid that feels connected to the original pet\'s identity and spirit.'
  },
  'self-as-cat': {
    title: 'What Would I Look Like as a Cat',
    description: 'Transform a human into a cat with recognizable traits from the original subject.',
    placeholder: 'E.g., Turn me into a cat that resembles my features',
    suggestedPrompt: 'Transform this person into a cat while preserving their distinctive features, coloration, and personality. Create a feline that has subtle similarities to the human\'s hair color, eye color, and facial expressions. The cat should feel like a natural feline version of the person, with recognizable traits that connect it to its human counterpart.'
  },
  'custom-other': {
    title: 'Custom Request',
    description: 'Describe your own custom transformation.',
    placeholder: 'E.g., Make it look like it\'s underwater with fish swimming around',
    suggestedPrompt: ''
  }
};

export default function PromptInput({ originalImage, onSubmit, onBack, selectedTransformation }: PromptInputProps) {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState<'cartoon' | 'product' | 'other' | null>(null);
  const [cartoonSubcategory, setCartoonSubcategory] = useState<CartoonSubcategory | null>(null);
  const [productSubcategory, setProductSubcategory] = useState<ProductSubcategory | null>(null);
  const [otherSubcategory, setOtherSubcategory] = useState<OtherSubcategory | null>(null);
  
  const { toast } = useToast();
  const maxChars = 500;

  // Update character count when prompt changes
  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  // Set initial selection from parent component if provided
  useEffect(() => {
    if (selectedTransformation === 'cartoon') {
      setPrimaryCategory('cartoon');
    } else if (selectedTransformation === 'product') {
      setPrimaryCategory('product');
    } else if (selectedTransformation === 'custom') {
      setPrimaryCategory('other');
    }
  }, [selectedTransformation]);

  // Handle form submission
  const handleSubmit = () => {
    if (prompt.trim().length === 0) return;
    
    // Build the complete prompt based on selections
    let finalPrompt = prompt.trim();
    
    // Always include the full Super Mario prompt, regardless of user input
    if (primaryCategory === 'cartoon' && cartoonSubcategory === 'super-mario') {
      const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
      if (suggestion) {
        finalPrompt = suggestion + " " + finalPrompt;
      }
    }
    // Always include the full Lego prompt, regardless of user input
    else if (primaryCategory === 'cartoon' && cartoonSubcategory === 'lego') {
      const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
      if (suggestion) {
        finalPrompt = suggestion + " " + finalPrompt;
      }
    }
    // Add suggested prompts from chosen categories if there's minimal user input
    else if (prompt.length < 20) {
      if (primaryCategory === 'cartoon' && cartoonSubcategory && cartoonSubcategory in CARTOON_STYLES) {
        const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
        if (suggestion) {
          finalPrompt = suggestion + " " + finalPrompt;
        }
      } else if (primaryCategory === 'product' && productSubcategory && productSubcategory in PRODUCT_STYLES) {
        const suggestion = PRODUCT_STYLES[productSubcategory].suggestedPrompt;
        if (suggestion) {
          finalPrompt = suggestion + " " + finalPrompt;
        }
      } else if (primaryCategory === 'other' && otherSubcategory && otherSubcategory in OTHER_STYLES) {
        const suggestion = OTHER_STYLES[otherSubcategory].suggestedPrompt;
        if (suggestion) {
          finalPrompt = suggestion + " " + finalPrompt;
        }
      }
    }
    
    onSubmit(finalPrompt, selectedSize);
  };

  // Handle prompt input changes
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setPrompt(value);
    }
  };

  // Handle size selection
  const handleSizeSelection = (size: string) => {
    setSelectedSize(size);
  };
  
  // Reset subcategory selections when primary category changes
  const handlePrimaryCategorySelect = (category: 'cartoon' | 'product' | 'other') => {
    setPrimaryCategory(category);
    setCartoonSubcategory(null);
    setProductSubcategory(null);
    setOtherSubcategory(null);
    
    // If selecting cartoon category, pre-fill the default placeholder text
    if (category === 'cartoon' && !prompt) {
      setPrompt("Place the name Jack somewhere in the image");
    }
  };
  
  // Set subcategory selection
  const handleCartoonSelect = (subcategory: CartoonSubcategory) => {
    setCartoonSubcategory(subcategory);
    
    // Pre-fill prompt with placeholder if it's empty
    if (!prompt) {
      setPrompt("Place the name Jack somewhere in the image");
    }
  };
  
  const handleProductSelect = (subcategory: ProductSubcategory) => {
    setProductSubcategory(subcategory);
    
    // Pre-fill prompt with placeholder if it's empty
    if (!prompt && subcategory in PRODUCT_STYLES) {
      setPrompt(PRODUCT_STYLES[subcategory].placeholder.replace('E.g., ', ''));
    }
  };
  
  const handleOtherSelect = (subcategory: OtherSubcategory) => {
    setOtherSubcategory(subcategory);
    
    // Pre-fill prompt with placeholder if it's empty
    if (!prompt && subcategory in OTHER_STYLES) {
      setPrompt(OTHER_STYLES[subcategory].placeholder.replace('E.g., ', ''));
    }
  };
  
  // AI prompt enhancement
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
  
  // Get current description based on selections
  const getCurrentDescription = () => {
    if (primaryCategory === 'cartoon' && cartoonSubcategory && cartoonSubcategory in CARTOON_STYLES) {
      return CARTOON_STYLES[cartoonSubcategory].description;
    } else if (primaryCategory === 'product' && productSubcategory && productSubcategory in PRODUCT_STYLES) {
      return PRODUCT_STYLES[productSubcategory].description;
    } else if (primaryCategory === 'other' && otherSubcategory && otherSubcategory in OTHER_STYLES) {
      return OTHER_STYLES[otherSubcategory].description;
    }
    
    return "Be specific about what changes you want. For best results, include details about style, mood, and elements.";
  };
  
  // Get current placeholder based on selections
  const getCurrentPlaceholder = () => {
    // For cartoon styles, always use the same placeholder regardless of subcategory
    if (primaryCategory === 'cartoon') {
      return "E.g., Place the name Jack somewhere in the image";
    } else if (primaryCategory === 'product' && productSubcategory && productSubcategory in PRODUCT_STYLES) {
      return PRODUCT_STYLES[productSubcategory].placeholder;
    } else if (primaryCategory === 'other' && otherSubcategory && otherSubcategory in OTHER_STYLES) {
      return OTHER_STYLES[otherSubcategory].placeholder;
    }
    
    return "E.g., 'Turn this portrait into an oil painting with vibrant colors in the style of Van Gogh'";
  };

  return (
    <div className="p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid md:grid-cols-7 gap-6">
          {/* Left column - Image preview */}
          <div className="md:col-span-3">
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-80 md:h-96">
              <img 
                src={originalImage} 
                className="max-w-full max-h-full object-contain" 
                alt="Your uploaded image" 
              />
            </div>
          </div>
          
          {/* Right column - Style selection and prompt input */}
          <div className="md:col-span-4">
            <h3 className="text-xl font-medium mb-4">Choose Your Style</h3>
            
            {/* Primary Category Selection (Step 1) */}
            <div className="mb-6 space-y-3">
              <Button 
                className={`w-full justify-between text-left border-2 h-auto py-3 ${primaryCategory === 'cartoon' 
                  ? 'border-black bg-black text-white' 
                  : 'border-black bg-white text-black hover:bg-gray-50'}`}
                onClick={() => handlePrimaryCategorySelect('cartoon')}
              >
                <div className="flex items-center">
                  <PaintBucket className="h-5 w-5 mr-2" />
                  <span className="font-medium">Cartoon Style</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <Button 
                className={`w-full justify-between text-left border-2 h-auto py-3 ${primaryCategory === 'product' 
                  ? 'border-black bg-black text-white' 
                  : 'border-black bg-white text-black hover:bg-gray-50'}`}
                onClick={() => handlePrimaryCategorySelect('product')}
              >
                <div className="flex items-center">
                  <BoxIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">Product Enhancement</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <Button 
                className={`w-full justify-between text-left border-2 h-auto py-3 ${primaryCategory === 'other' 
                  ? 'border-black bg-black text-white' 
                  : 'border-black bg-white text-black hover:bg-gray-50'}`}
                onClick={() => handlePrimaryCategorySelect('other')}
              >
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  <span className="font-medium">Other Styles</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Secondary Category Selection (Step 2) - Cartoon Subcategories */}
            {primaryCategory === 'cartoon' && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(CARTOON_STYLES).map(([key, style]) => (
                  <Button 
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 ${cartoonSubcategory === key 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleCartoonSelect(key as CartoonSubcategory)}
                  >
                    <span>{style.title}</span>
                  </Button>
                ))}
              </div>
            )}
            
            {/* Secondary Category Selection (Step 2) - Product Subcategories */}
            {primaryCategory === 'product' && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(PRODUCT_STYLES).map(([key, style]) => (
                  <Button 
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 ${productSubcategory === key 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleProductSelect(key as ProductSubcategory)}
                  >
                    <span>{style.title}</span>
                  </Button>
                ))}
              </div>
            )}
            
            {/* Secondary Category Selection (Step 2) - Other Subcategories */}
            {primaryCategory === 'other' && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(OTHER_STYLES).map(([key, style]) => (
                  <Button 
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 ${otherSubcategory === key 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black border border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => handleOtherSelect(key as OtherSubcategory)}
                  >
                    <span>{style.title}</span>
                  </Button>
                ))}
              </div>
            )}
            
            {/* Description of selected style */}
            {(cartoonSubcategory || productSubcategory || otherSubcategory) && (
              <div className="mb-4">
                <p className="text-gray-700">{getCurrentDescription()}</p>
              </div>
            )}
            
            {/* Optional Detailed Prompt Input (Step 3) */}
            <div className="mb-4">
              <h4 className="text-lg font-medium mb-2">
                {primaryCategory ? "Optional: Tell us more!" : "Describe your transformation"}
              </h4>
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={handlePromptChange}
                  className="w-full border border-gray-300 rounded-lg p-4 h-32 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-white bg-black"
                  placeholder={getCurrentPlaceholder()}
                  maxLength={maxChars}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 bg-white/10 backdrop-blur-sm hover:bg-gray-100 rounded-full p-1.5"
                  onClick={enhancePrompt}
                  disabled={isEnhancing || prompt.trim().length === 0}
                  title="Enhance prompt with AI"
                >
                  {isEnhancing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                <div className="flex items-center">
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
            
            {/* Size Selection */}
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
            
            {/* Writing Tips */}
            <div className="flex items-center space-x-3 mb-6">
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
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onBack} className="text-white bg-black">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button 
                className="flex-1 text-white bg-black hover:bg-black/80"
                onClick={handleSubmit}
                disabled={!primaryCategory || !(cartoonSubcategory || productSubcategory || otherSubcategory)}
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