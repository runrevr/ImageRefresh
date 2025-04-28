import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronLeft,
  Lightbulb,
  CircleHelp,
  Wand2,
  ChevronRight,
  ImageIcon,
  BoxIcon,
  PaintBucket,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onBack: () => void;
  selectedTransformation?: TransformationType | null;
}

// Main transformation categories
export type TransformationType = "cartoon" | "product" | "custom";

// Subcategory types
export type CartoonSubcategory =
  | "super-mario"
  | "minecraft"
  | "pixar"
  | "dreamworks"
  | "princess"
  | "superhero"
  | "lego"
  | "custom-cartoon";
export type ProductSubcategory =
  | "remove-background"
  | "enhanced-lighting"
  | "natural-scene"
  | "product-mockup"
  | "custom-product";
export type OtherSubcategory =
  | "baby-prediction"
  | "future-self"
  | "ghibli-style"
  | "ai-action-figure"
  | "pet-as-human"
  | "self-as-cat"
  | "custom-other";

// Writing tips for better prompts
const PROMPT_TIPS = [
  "Be specific about style (e.g., 'watercolor', 'photorealistic', 'cartoon')",
  "Mention colors and lighting (e.g., 'vibrant colors', 'dramatic lighting')",
  "Reference artists or styles (e.g., 'like Van Gogh', 'cyberpunk aesthetic')",
  "Include mood or atmosphere (e.g., 'mysterious', 'cheerful', 'serene')",
  "Specify what elements to modify (e.g., 'replace the background with mountains')",
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
  "super-mario": {
    title: "Super Mario Bros",
    description:
      "Transform into the colorful, blocky style of the Super Mario universe.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: `Create a colorful 8-bit pixel art scene inspired by classic retro video games. Design a small pixel-style adventurer character (boy or girl) with a playful, confident, or determined expression, sitting or standing on a brown brick platform, holding a glowing orb.

For a boy, the character should have a more rugged and adventurous look, with a bold, structured design — like a simple but strong chest emblem and energetic pose.
For a girl, the character should have a playful, whimsical design — a floral-inspired chest emblem or softer, rounded features with a joyful expression and fluid motion in the pose.

The character should wear a bright green shirt and blue pants. The scene features a bright solid blue sky, pixelated white clouds outlined in black, rolling green hills, rounded pixelated trees, and colorful pixel flowers growing from floating brick blocks. Add a large green warp pipe with a red-and-green plant emerging from it, small turtle-like pixel creatures walking nearby, and floating question mark blocks above.

The overall style should feel cheerful, energetic, bright, and nostalgic, capturing the playful, lively atmosphere of classic side-scrolling adventure games. The character should have a playful attitude, but do not copy real-world facial features or likenesses.

  `,
  },
  minecraft: {
    title: "Minecraft",
    description: "Convert to the iconic blocky, pixel style of Minecraft.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "Transform into the iconic Minecraft blocky pixel art style. Convert all elements into perfect cubes with 16x16 pixel textures and limited color palette. Characters should have the distinctive squared-off head and body proportions with simple facial features and blocky limbs. The environment should be rendered with recognizable Minecraft block types - dirt blocks with grass tops, stone textures, wooden planks, etc. Include characteristic Minecraft elements like floating blocks, right-angled water/lava, and simple shadow effects. Apply the game's distinctive flat lighting with minimal gradients. The overall scene should capture the charm of Minecraft's procedurally generated worlds with their charming simplicity, block-based construction, and instantly recognizable aesthetic where everything is made of textured cubes.",
  },
  pixar: {
    title: "Pixar",
    description:
      "Stylize in the smooth, expressive 3D animation style of Pixar films.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "Transform into the distinctive Pixar animation style, featuring slightly exaggerated proportions with larger eyes and expressive faces. Apply the characteristic smooth, polished 3D rendering with soft lighting and subtle texturing. Maintain vibrant but realistic color palette with careful attention to light reflection and shadow detail. Add the signature Pixar depth of field with slightly blurred backgrounds and sharp foreground elements. Enhance facial expressions to convey emotion while keeping the overall look friendly and appealing with a touch of whimsy. The final result should capture that magical balance between cartoonish charm and believable realism that defines the Pixar aesthetic.",
  },
  dreamworks: {
    title: "Trolls",
    description:
      "Transform into a vibrant, whimsical world with exaggerated expressions and detailed environments.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "Use the uploaded image only as inspiration for the mood and attitude of a whimsical fantasy hero character. Create a colorful cartoon-style character with a playful, lively, and adventurous spirit. Design the character with wild, gravity-defying neon or pastel-colored hair shaped like a crown, and textured clothing inspired by forest leaves, vines, and magical plants. Set the scene in a vivid, high-contrast fantasy world filled with oversized flowers, sparkling waterfalls, candy-colored forests, and rhythmic, musical patterns. The character can have a joyful smile or a determined expression, depending on the mood. Add glowing, magical accents around the character to enhance the fantasy feel. All elements should be original, imaginative, and inspired by classic musical fairy-tale traditions. Do not copy real-world facial features or likeness from the uploaded image.",
  },
  princess: {
    title: "Princess",
    description: "Create a fairytale princess style with magical elements.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "Transform into a fairytale princess illustration with an enchanted atmosphere. Use soft, dreamy colors and magical light effects with sparkles and glowing accents. Apply an artistic style reminiscent of Disney princess films with fantasy elements like castle backgrounds, royal attire, and elegant accessories. For female subjects, add a beautiful flowing gown in pastel colors with intricate decorative elements, a delicate tiara or crown, and enhanced feminine features. For male subjects, transform into a charming prince with royal attire including formal jacket with gold accents, decorated shoulders, and a small crown or royal insignia. The overall scene should have a romantic, magical quality with elegant details and fantastical lighting that captures the essence of classic princess fairytales.",
  },
  superhero: {
    title: "Superhero",
    description: "Convert to a dynamic comic book superhero style.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: `Create a colorful 2D cartoon-style illustration of a cheerful young superhero [boy or girl] standing proudly with hands on hips or seated confidently on a platform holding a glowing energy orb. The character should have playful, stylized hair, bright expressive eyes, and either a big happy smile or a serious, determined expression. Dress the superhero in a vibrant costume with a bold chest emblem, colorful gloves, boots, and a flowing cape. Set the background as either a bright, whimsical outdoor scene with green bushes, trees, and a winding path under a clear blue sky, or a lively urban cartoon cityscape with tall colorful buildings and fluffy clouds. Add soft glowing effects around the hands, orb, or emblem to suggest magical powers. The overall style should be animated, playful, bold, and perfect for a children's cartoon series. Use any uploaded images only for inspiration for pose and action, without copying real facial features or likeness.

`,
  },
  lego: {
    title: "Lego",
    description: "Reconstruct in the distinctive blocky Lego brick style.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "The scene should be set in a vibrant, playful Lego world with colorful, modular Lego environments such as brick-built trees, buildings, and vehicles. Transform into a custom Lego minifigure that accurately matches real-life features. Carefully replicate the hair style (using the closest matching Lego hairpiece), skin tone (adapted to Lego colors but faithful to real tone), eye color, and visible dental traits. The Lego minifigure should reflect the clothing style and selected theme in a fun, blocky Lego way while maintaining unmistakable likeness. Ensure the Lego character is smiling joyfully. The tone must remain colorful, whimsical, imaginative, and true to a Lego world, with full visual likeness preserved.",
  },
  "custom-cartoon": {
    title: "Create Your Own Cartoon",
    description: "Describe your own custom cartoon transformation.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: "",
  },
};

// Product subcategories
const PRODUCT_STYLES: Record<ProductSubcategory, StyleOption> = {
  "remove-background": {
    title: "Remove Background",
    description:
      "Isolate the product with a clean, solid or transparent background.",
    placeholder: "E.g., Place on a pure white background with subtle shadow",
    suggestedPrompt:
      "Remove the current background and replace it with a clean, pure white background. Add a subtle shadow beneath the product for depth. Ensure the product edges are crisp and well-defined with no background artifacts.",
  },
  "enhanced-lighting": {
    title: "Enhanced Lighting & Colors",
    description:
      "Improve product appearance with professional studio lighting and color enhancement.",
    placeholder: "E.g., Add dramatic side lighting to highlight texture",
    suggestedPrompt:
      "Apply enhanced professional studio lighting. Add soft key lights to highlight the product's best features, rim lighting to define edges, and fill lights to soften shadows. Enhance colors for better vibrancy and contrast while maintaining natural appearance.",
  },
  "natural-scene": {
    title: "Natural Scene Placement",
    description:
      "Place the product in a realistic outdoor or natural environment.",
    placeholder: "E.g., Show the product on a beach at sunset",
    suggestedPrompt:
      "Place in a natural scene environment. Integrate seamlessly with realistic shadows and reflections that match the environment's lighting. Ensure the product remains the focal point while the natural setting provides context and atmosphere.",
  },
  "product-mockup": {
    title: "Product Mockup",
    description: "Show the product in context of use in realistic scenarios.",
    placeholder: "E.g., Show being used by a model in a living room",
    suggestedPrompt:
      "Create a realistic mockup showing the product in context of use. Add human interaction if appropriate, and place in a realistic setting where the product would normally be used. Ensure proper scale, realistic shadows, and environmental reflections.",
  },
  "custom-product": {
    title: "Create Your Own Product Image",
    description: "Describe your own custom product transformation.",
    placeholder:
      "E.g., Place product on a marble countertop with morning light",
    suggestedPrompt: "",
  },
};

// Other subcategories
const OTHER_STYLES: Record<OtherSubcategory, StyleOption> = {
  "baby-prediction": {
    title: "What Will Our Baby Look Like",
    description:
      "Envision how a future baby might look based on the people in the image.",
    placeholder: "E.g., Show what our future baby might look like",
    suggestedPrompt:
      "Create a realistic image of a baby that would result from the genetics of the two people in the uploaded photos. The baby should have a balanced blend of facial features from both parents, including eye shape/color, nose, mouth, face shape, and skin tone. Show only the baby in the final image, centered in frame with good lighting against a neutral background. The baby should appear healthy, happy, and around 6-12 months old with a natural expression. Dress the baby in appropriate baby clothing - such as a simple onesie, cute baby outfit, or comfortable infant attire - not attempting to match or replicate the clothing style of the parents. Add subtle details that clearly connect to features from both parent photos without directly copying them.",
  },
  "future-self": {
    title: "What Will I Look Like in 20 Years",
    description:
      "Age the subject in the image to show how they might look 20 years in the future.",
    placeholder: "E.g., Show me as a distinguished older person",
    suggestedPrompt:
      "Show how the person might look 20 years in the future. Age the face naturally with appropriate wrinkles, hair changes, and subtle physical aging. Maintain their core facial structure and identity while showing realistic aging effects. Keep the same general style and pose.",
  },
  "ghibli-style": {
    title: "Ghibli Style",
    description:
      "Transform into the beautiful, painterly anime style of Studio Ghibli films.",
    placeholder: "E.g., Make it look like a scene from a Miyazaki film",
    suggestedPrompt:
      "Transform into the distinctive Studio Ghibli animation style while preserving the subject's essential features and likeness. Apply the characteristic hand-painted watercolor aesthetic with soft, diffused lighting and a gentle color palette of muted pastels and natural tones. Add delicate line work and careful attention to small details that give depth to the scene. Recreate backgrounds with the studio's signature nature elements - billowing clouds, wind-swept grasses, detailed foliage, or charming rural/traditional architecture. Maintain the subject's core identity but render them with slightly simplified features, larger expressive eyes, and natural-looking hair with visible strands that might flow in a gentle breeze. The overall atmosphere should capture that dreamlike quality between fantasy and reality that defines the Ghibli look - where everyday moments feel magical and environments breathe with life. Include subtle environmental touches like floating dust particles, dappled sunlight, or small background movements that suggest a living world.",
  },
  "ai-action-figure": {
    title: "AI Action Figure",
    description:
      "Turn the subject into a realistic, detailed action figure or toy.",
    placeholder:
      "E.g., Make me into a collectible action figure with accessories",
    suggestedPrompt:
      "Transform into a realistic, high-quality action figure or toy. Add visible joints, plastic texture, and a display stand. Include appropriate accessories and packaging design elements. Maintain the subject's likeness and key features while giving it the distinctive plastic sheen and manufacturing details of a premium collectible figure.",
  },
  "pet-as-human": {
    title: "What Would My Pet Look Like as a Human",
    description:
      "Reimagine a pet as a human while keeping recognizable traits and personality.",
    placeholder: "E.g., Transform my dog into a human with similar features",
    suggestedPrompt:
      "Transform the pet into a human character while preserving distinctive features, coloration, and personality. Maintain the essence and character in human form, with subtle references to fur color, eye shape, and distinctive markings. Create a humanoid that feels connected to the original pet's identity and spirit.",
  },
  "self-as-cat": {
    title: "What Would I Look Like as a Cat",
    description:
      "Transform a human into a cat with recognizable traits from the original subject.",
    placeholder: "E.g., Turn me into a cat that resembles my features",
    suggestedPrompt:
      "Transform into a cat while preserving distinctive human features, coloration, and personality. Create a feline that has subtle similarities to the original hair color, eye color, and facial expressions. The cat should feel like a natural feline version of the person, with recognizable traits that connect it to its human counterpart.",
  },
  "custom-other": {
    title: "Create Your Own Image",
    description: "Describe your own custom transformation.",
    placeholder:
      "E.g., Make it look like it's underwater with fish swimming around",
    suggestedPrompt: "",
  },
};

export default function PromptInput({
  originalImage,
  onSubmit,
  onBack,
  selectedTransformation,
}: PromptInputProps) {
  // State variables
  const [prompt, setPrompt] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState<
    "cartoon" | "product" | "other" | null
  >(null);
  const [cartoonSubcategory, setCartoonSubcategory] =
    useState<CartoonSubcategory | null>(null);
  const [productSubcategory, setProductSubcategory] =
    useState<ProductSubcategory | null>(null);
  const [otherSubcategory, setOtherSubcategory] =
    useState<OtherSubcategory | null>(null);

  const { toast } = useToast();
  const maxChars = 500;

  // Update character count when prompt changes
  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  // Set initial selection from parent component if provided
  useEffect(() => {
    if (selectedTransformation === "cartoon") {
      setPrimaryCategory("cartoon");
    } else if (selectedTransformation === "product") {
      setPrimaryCategory("product");
    } else if (selectedTransformation === "custom") {
      setPrimaryCategory("other");
    }
  }, [selectedTransformation]);

  // Handle form submission
  const handleSubmit = () => {
    // Remove validation to allow empty prompts - the suggestedPrompt will be used
    // if (prompt.trim().length === 0) return;

    // Build the complete prompt based on selections
    let finalPrompt = prompt.trim();

    // Always include the full Super Mario prompt, regardless of user input
    if (primaryCategory === "cartoon" && cartoonSubcategory === "super-mario") {
      const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
      if (suggestion) {
        finalPrompt = suggestion + " " + finalPrompt;
      }
    }
    // Always include the full Lego prompt, regardless of user input
    else if (primaryCategory === "cartoon" && cartoonSubcategory === "lego") {
      const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
      if (suggestion) {
        finalPrompt = suggestion + " " + finalPrompt;
      }
    }
    // Always include the full Princess prompt, regardless of user input
    else if (
      primaryCategory === "cartoon" &&
      cartoonSubcategory === "princess"
    ) {
      const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
      if (suggestion) {
        finalPrompt = suggestion + " " + finalPrompt;
      }
    }
    // Add suggested prompts from chosen categories
    else {
      // If no subcategory is selected but primary is cartoon, use a generic prompt
      if (primaryCategory === "cartoon" && !cartoonSubcategory) {
        finalPrompt =
          "Transform into a cartoon style with vibrant colors and exaggerated features. " +
          finalPrompt;
      }
      // If no subcategory is selected but primary is product, use a generic prompt
      else if (primaryCategory === "product" && !productSubcategory) {
        finalPrompt =
          "Enhance with professional lighting and a clean background. " +
          finalPrompt;
      }
      // If no subcategory is selected but primary is other, use a generic prompt
      else if (primaryCategory === "other" && !otherSubcategory) {
        finalPrompt =
          "Transform with creative artistic effects. " + finalPrompt;
      }
      // If subcategory is selected, use its suggested prompt for minimal user input
      else if (prompt.length < 20) {
        if (
          primaryCategory === "cartoon" &&
          cartoonSubcategory &&
          cartoonSubcategory in CARTOON_STYLES
        ) {
          const suggestion = CARTOON_STYLES[cartoonSubcategory].suggestedPrompt;
          if (suggestion) {
            finalPrompt = suggestion + " " + finalPrompt;
          }
        } else if (
          primaryCategory === "product" &&
          productSubcategory &&
          productSubcategory in PRODUCT_STYLES
        ) {
          const suggestion = PRODUCT_STYLES[productSubcategory].suggestedPrompt;
          if (suggestion) {
            finalPrompt = suggestion + " " + finalPrompt;
          }
        } else if (
          primaryCategory === "other" &&
          otherSubcategory &&
          otherSubcategory in OTHER_STYLES
        ) {
          const suggestion = OTHER_STYLES[otherSubcategory].suggestedPrompt;
          if (suggestion) {
            finalPrompt = suggestion + " " + finalPrompt;
          }
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
  const handlePrimaryCategorySelect = (
    category: "cartoon" | "product" | "other",
  ) => {
    setPrimaryCategory(category);
    setCartoonSubcategory(null);
    setProductSubcategory(null);
    setOtherSubcategory(null);
  };

  // Set subcategory selection
  const handleCartoonSelect = (subcategory: CartoonSubcategory) => {
    setCartoonSubcategory(subcategory);
  };

  const handleProductSelect = (subcategory: ProductSubcategory) => {
    setProductSubcategory(subcategory);
  };

  const handleOtherSelect = (subcategory: OtherSubcategory) => {
    setOtherSubcategory(subcategory);
  };

  // AI prompt enhancement
  const enhancePrompt = async () => {
    if (prompt.trim().length === 0) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEnhancing(true);

      const response = await apiRequest("POST", "/api/enhance-prompt", {
        prompt: prompt.trim(),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
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
      console.error("Error enhancing prompt:", error);
      toast({
        title: "Enhancement Failed",
        description:
          "There was an error enhancing your prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Get current description based on selections
  const getCurrentDescription = () => {
    if (
      primaryCategory === "cartoon" &&
      cartoonSubcategory &&
      cartoonSubcategory in CARTOON_STYLES
    ) {
      return CARTOON_STYLES[cartoonSubcategory].description;
    } else if (
      primaryCategory === "product" &&
      productSubcategory &&
      productSubcategory in PRODUCT_STYLES
    ) {
      return PRODUCT_STYLES[productSubcategory].description;
    } else if (
      primaryCategory === "other" &&
      otherSubcategory &&
      otherSubcategory in OTHER_STYLES
    ) {
      return OTHER_STYLES[otherSubcategory].description;
    }

    return "Be specific about what changes you want. For best results, include details about style, mood, and elements.";
  };

  // Get current placeholder based on selections
  const getCurrentPlaceholder = () => {
    // For cartoon styles, always use the same placeholder regardless of subcategory
    if (primaryCategory === "cartoon") {
      return "E.g., Place the name Jack somewhere in the image";
    } else if (
      primaryCategory === "product" &&
      productSubcategory &&
      productSubcategory in PRODUCT_STYLES
    ) {
      return PRODUCT_STYLES[productSubcategory].placeholder;
    } else if (
      primaryCategory === "other" &&
      otherSubcategory &&
      otherSubcategory in OTHER_STYLES
    ) {
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
                className={`w-full justify-between text-left border-2 h-auto py-3 ${
                  primaryCategory === "cartoon"
                    ? "border-black bg-black text-white"
                    : "border-black bg-white text-black hover:bg-gray-50"
                }`}
                onClick={() => handlePrimaryCategorySelect("cartoon")}
              >
                <div className="flex items-center">
                  <PaintBucket className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="font-medium whitespace-normal break-words">
                    Cartoon Style
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0" />
              </Button>

              <Button
                className={`w-full justify-between text-left border-2 h-auto py-3 ${
                  primaryCategory === "product"
                    ? "border-black bg-black text-white"
                    : "border-black bg-white text-black hover:bg-gray-50"
                }`}
                onClick={() => handlePrimaryCategorySelect("product")}
              >
                <div className="flex items-center">
                  <BoxIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="font-medium whitespace-normal break-words">
                    Product Enhancement
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0" />
              </Button>

              <Button
                className={`w-full justify-between text-left border-2 h-auto py-3 ${
                  primaryCategory === "other"
                    ? "border-black bg-black text-white"
                    : "border-black bg-white text-black hover:bg-gray-50"
                }`}
                onClick={() => handlePrimaryCategorySelect("other")}
              >
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="font-medium whitespace-normal break-words">
                    Other Styles
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0" />
              </Button>
            </div>

            {/* Secondary Category Selection (Step 2) - Cartoon Subcategories */}
            {primaryCategory === "cartoon" && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(CARTOON_STYLES).map(([key, style]) => (
                  <Button
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 whitespace-normal break-words ${
                      cartoonSubcategory === key
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handleCartoonSelect(key as CartoonSubcategory)
                    }
                  >
                    <span className="line-clamp-2">{style.title}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Secondary Category Selection (Step 2) - Product Subcategories */}
            {primaryCategory === "product" && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(PRODUCT_STYLES).map(([key, style]) => (
                  <Button
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 whitespace-normal break-words ${
                      productSubcategory === key
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handleProductSelect(key as ProductSubcategory)
                    }
                  >
                    <span className="line-clamp-2">{style.title}</span>
                  </Button>
                ))}
              </div>
            )}

            {/* Secondary Category Selection (Step 2) - Other Subcategories */}
            {primaryCategory === "other" && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(OTHER_STYLES).map(([key, style]) => (
                  <Button
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 whitespace-normal break-words ${
                      otherSubcategory === key
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleOtherSelect(key as OtherSubcategory)}
                    title={
                      key === "baby-prediction"
                        ? "Must have an image with two people in it to work correctly"
                        : key === "pet-as-human"
                          ? "Must have image of your pet with a visible face to work correctly"
                          : key === "self-as-cat"
                            ? "Must have image of a person with a visible face to work correctly"
                            : key === "future-self"
                              ? "Must have a clear image of a person's face to work correctly"
                              : key === "ai-action-figure"
                                ? "Works best with a clear image of a person or object"
                                : ""
                    }
                  >
                    <span className="line-clamp-2">{style.title}</span>
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
                {primaryCategory
                  ? "Optional: Tell us more!"
                  : "Describe your transformation"}
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
                    {isEnhancing ? "Enhancing..." : "Enhance with AI"}
                  </Button>
                </div>
                <span id="char-count">
                  {charCount}/{maxChars}
                </span>
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
                  <Button
                    variant="link"
                    className="text-sm text-primary-500 p-0 h-auto"
                  >
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
              <Button
                variant="outline"
                onClick={onBack}
                className="text-white bg-black"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-1 text-white bg-black hover:bg-black/80"
                onClick={handleSubmit}
                disabled={!primaryCategory}
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
