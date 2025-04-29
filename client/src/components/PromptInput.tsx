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
  Paintbrush,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SavedStyle } from "./StyleIntegration";
import { apiRequest } from "@/lib/queryClient";

interface PromptInputProps {
  originalImage: string;
  onSubmit: (prompt: string, imageSize: string) => void;
  onBack: () => void;
  selectedTransformation?: TransformationType | null;
  defaultPrompt?: string; // Default prompt text (can come from saved style)
  savedStyle?: { 
    prompt: string; 
    title: string; 
    category: string; 
  } | null; // Style information from Ideas page
}

// Main transformation categories
export type TransformationType = "cartoon" | "product" | "painting" | "era" | "custom";

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
  | "social-media-ready"
  | "custom-product";
export type PaintingSubcategory =
  | "oil-painting"
  | "watercolor"
  | "impressionist"
  | "abstract"
  | "pop-surrealism"
  | "art-deco"
  | "pixel-art"
  | "anime-manga"
  | "cartoon-style"
  | "gothic-noir"
  | "custom-painting";
  
export type EraSubcategory =
  | "old-western"
  | "90s-hip-hop"
  | "1980s"
  | "renaissance"
  | "caricature"
  | "victorian-era"
  | "disco-era"
  | "cyberpunk"
  | "medieval"
  | "custom-era";
  
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
    title: "Lifestyle Integration",
    description:
      "Place the product in a realistic outdoor or natural environment.",
    placeholder: "E.g., Indoor or outdoor, which environment [modern/rustic/minimalist]",
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
  "social-media-ready": {
    title: "Social Media Ready",
    description: "Optimize product presentation for social media platforms.",
    placeholder: "Color Style: vibrant, pastel or contrasting",
    suggestedPrompt:
      "Transform this product into a highly shareable, scroll-stopping image optimized for social media. Create a visually striking composition with [vibrant/pastel/contrasting] colors, perfect for Instagram or Pinterest. Add stylish negative space for text overlay, incorporate trending visual elements, and ensure the product pops against a carefully designed background that suggests lifestyle without overwhelming.",
  },
  "custom-product": {
    title: "Create Your Own Product Image",
    description: "Describe your own custom product transformation.",
    placeholder:
      "E.g., Place product on a marble countertop with morning light",
    suggestedPrompt: "",
  },
};

// Painting subcategories
const PAINTING_STYLES: Record<PaintingSubcategory, StyleOption> = {
  "oil-painting": {
    title: "Oil Painting",
    description: "Emulates traditional oil paintings with rich colors, textures, and visible brushstrokes.",
    placeholder: "E.g., In the style of Van Gogh or Rembrandt",
    suggestedPrompt: "Transform this image into a traditional oil painting with rich, deep colors and visible textured brushstrokes. Create a masterful composition with careful attention to light and shadow, capturing the dimensional quality and depth that oil paint provides. Apply thick impasto technique for highlights and finer brush detail for shadows. Use a warm, slightly muted color palette reminiscent of classical oil paintings, with subtle glazing effects and the characteristic luminosity that comes from layered oil paint. The final result should have the timeless, elegant aesthetic of museum-quality oil paintings while maintaining the essence and emotional quality of the original image."
  },
  "watercolor": {
    title: "Watercolor",
    description: "Creates a soft, fluid look with translucent colors, similar to watercolor paintings.",
    placeholder: "E.g., Add delicate color washes and soft edges",
    suggestedPrompt: "Transform this image into a delicate watercolor painting with soft, flowing colors and gentle transparency. Create subtle color washes that blend seamlessly at the edges, allowing the white of the paper to show through in lighter areas. Apply the characteristic diffused edges and gentle color bleeding that defines watercolor technique. Include small areas of increased detail with fine brushwork contrasted with broader, more impressionistic areas. The colors should appear light, luminous and slightly diluted with a fresh, airy quality. Add subtle paper texture to enhance the authentic watercolor feel. The final image should convey a dreamy, ethereal atmosphere with the gentle, translucent quality that makes watercolor paintings so distinctive."
  },
  "impressionist": {
    title: "Impressionist",
    description: "Focuses on capturing light and movement with loose brushstrokes, like the works of Monet and Renoir.",
    placeholder: "E.g., Use short, visible brushstrokes to capture light",
    suggestedPrompt: "Transform this image into an Impressionist painting in the style of Monet, Renoir, or Degas. Use small, thin brush strokes that are visible to the naked eye, creating a sense of spontaneity and movement. Focus on accurately depicting the changing qualities of light with vivid colors applied side-by-side for a vibrant, shimmering effect. Capture the fleeting moment and overall visual impression rather than exact details. Apply an open composition with unusual visual angles and emphasis on light in its changing qualities. Include elements of ordinary subject matter transformed by the play of natural light. The color palette should be bright yet natural, with particular attention to the reflection of colors from objects to one another. The final image should convey the sense of atmosphere and the shifting effect of light and color that characterizes Impressionist works."
  },
  "abstract": {
    title: "Abstract",
    description: "Uses non-representational forms and colors to create a visually striking image, focusing on shape, color and form.",
    placeholder: "E.g., Create a bold, geometric abstract interpretation",
    suggestedPrompt: "Transform this image into an abstract composition that uses color, form, line, and texture to create a non-representational interpretation of the subject. Break down the original image into its essential elements, emphasizing shapes, patterns, and color relationships rather than realistic depiction. Create a bold visual rhythm with geometric or organic forms, dynamic lines, and contrasting colors. The composition should balance tension and harmony, with focal points created through color intensity, size, or position. The palette can be vibrant and expressive or subtle and monochromatic, depending on the emotional quality you wish to convey. The final result should evoke emotional or intellectual responses through its compositional elements alone, without relying on recognizable imagery, capturing the essence rather than the appearance of the original subject."
  },
  "pop-surrealism": {
    title: "Pop Surrealism",
    description: "Blends surreal and dreamlike elements with bright, exaggerated colors, creating eye-catching results.",
    placeholder: "E.g., Add whimsical, dreamlike elements",
    suggestedPrompt: "Transform this image into a pop surrealist artwork that combines dreamlike, fantastical elements with bright, cartoon-influenced aesthetics. Create a whimsical, slightly unsettling scene that juxtaposes the familiar with the bizarre. Use a vibrant, high-saturation color palette with bold outlines and smooth gradients reminiscent of lowbrow art and comic book styles. Incorporate unexpected elements, altered scale relationships, and imaginative details that challenge reality while maintaining a polished, illustrative quality. Add symbolic objects, anthropomorphic creatures, or nostalgic pop culture references that create narrative tension and intrigue. The final image should balance technical precision with imaginative fantasy, creating a visually striking composition that feels both accessible and otherworldly, inviting viewers into an alternate reality that's both familiar and strange."
  },
  "art-deco": {
    title: "Art Deco",
    description: "Features bold geometric shapes, rich colors, and a luxurious, elegant aesthetic.",
    placeholder: "E.g., Add geometric patterns and metallic accents",
    suggestedPrompt: "Transform this image into an Art Deco style artwork featuring the bold geometric forms, symmetry, and lavish ornamentation characteristic of 1920s and 1930s design. Apply a color palette of rich, deep colors accented with gold, silver, or black, creating a sense of luxury and sophistication. Incorporate strong vertical lines, stepped forms, sweeping curves, and sunburst patterns typical of Art Deco architecture and design. Add elegant, stylized representations of natural or mechanical elements with the clean lines and geometric precision that defines the style. The composition should feel balanced yet dynamic, with a sense of sleek modernity and celebration of urban life and technological progress. The final image should capture the glamour, elegance, and bold confidence of the Art Deco period, combining ornamental richness with geometric simplicity."
  },
  "pixel-art": {
    title: "Pixel Art",
    description: "Transforms images into blocky, low-resolution visuals reminiscent of 8-bit and 16-bit games for a retro feel.",
    placeholder: "E.g., Convert to 16-bit pixel style with limited color palette",
    suggestedPrompt: "Transform this image into pixelated digital art reminiscent of classic 8-bit or 16-bit video games. Convert all elements into a grid-based format with distinct, visible square pixels as the building blocks of the image. Apply a limited color palette with few shades per color channel, creating the characteristic constrained spectrum of retro games. Simplify complex forms and details into blocky representations using careful pixel placement to suggest shape and dimension. Use techniques like dithering (alternating patterns of pixels) to create the illusion of additional colors or shading. Implement clean edges and distinct color boundaries with minimal anti-aliasing. The final image should have a charming, nostalgic quality that celebrates the aesthetic constraints of early digital art while still being recognizable as the original subject."
  },
  "anime-manga": {
    title: "Anime/Manga",
    description: "Captures the dynamic energy of Japanese comics and animation with detailed shading and vibrant colors.",
    placeholder: "E.g., Create a detailed anime character style",
    suggestedPrompt: "Transform this image into a high-quality anime/manga art style that captures the distinctive aesthetic of Japanese animation and comics. Apply bold, clean outlines with variable line weight to define forms. Create large, expressive eyes with detailed highlights and reflections, simplified facial features, and stylized hair with exaggerated volume and distinctive color. Use cell-shaded coloring with flat color areas separated by hard edges for shadows rather than gradual blending. Include characteristic anime visual elements like speed lines for movement, expressive symbols to show emotion, and dramatic lighting effects. The background should be detailed but somewhat simplified compared to the foreground elements. The overall composition should have a dynamic quality with dramatic angles or perspectives and a vibrant color palette that emphasizes character expression and mood. The final image should feel like a frame from a high-quality anime production or a page from a professionally illustrated manga."
  },
  "cartoon-style": {
    title: "Cartoon Style",
    description: "Brings a playful energy to an image with exaggerated features.",
    placeholder: "E.g., Create a fun, stylized cartoon version",
    suggestedPrompt: "Transform this image into a vibrant, playful cartoon style with bold outlines, simplified forms, and exaggerated features. Create a clean, graphic look with smooth, flat colors and simplified shadows that give dimension without complex shading. Apply slightly exaggerated proportions to emphasize distinctive character features while maintaining recognizability. Use thick, consistent outlines around the main elements to give that classic cartoon definition. The color palette should be bright and saturated with good contrast between elements. Add a sense of energy and expressiveness to poses and facial expressions, capturing personality with simple but effective details. The background should be slightly simplified compared to the foreground elements, with a focus on supporting the main subject. The final result should have that instantly recognizable cartoon aesthetic that feels lighthearted, accessible, and full of personality."
  },
  "gothic-noir": {
    title: "Gothic Noir",
    description: "Combines high contrast and eerie shadows to create an atmosphere of suspense.",
    placeholder: "E.g., Add dramatic shadows and mysterious atmosphere",
    suggestedPrompt: "Transform this image into a gothic noir style artwork featuring dramatic shadows, high contrast, and an atmosphere of mystery and suspense. Create a moody, atmospheric scene with deep, inky blacks and stark highlights that sculpt the subject with dramatic lighting. Apply a limited, desaturated color palette dominated by dark tones with occasional accents of deep red, midnight blue, or purple. Incorporate gothic elements like ornate architecture, wrought iron details, or victorian-inspired styling that suggests a sense of decaying grandeur. The lighting should create long, dramatic shadows and slivers of illumination that partially reveal the subject, leaving much to the imagination. Add subtle details like mist, smoke, or environmental elements that enhance the sense of foreboding. The final image should evoke the feeling of classic film noir combined with gothic sensibilities, creating a haunting, cinematic quality that suggests hidden stories and unseen dangers lurking just beyond the frame."
  },
  "custom-painting": {
    title: "Create Your Own Painting Style",
    description: "Describe your own custom painting transformation.",
    placeholder: "E.g., Create a mixed-media collage with watercolor and sketch elements",
    suggestedPrompt: ""
  }
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
      "E.g., Put the name on the packaging with accessories",
    suggestedPrompt:
      "Use this uploaded image to create a picture of an action figure toy in a blister package, displayed from head to toe. The action figure should accurately represent the character/person from the uploaded image while giving it a mass-produced toy aesthetic with visible joints and plastic texture. Include relevant accessories that match the character's theme, abilities, or items visible in the original image. The package should have clear plastic with cardboard backing featuring bright colors and marketing text. The packaging should prominently display an appropriate name/title at the top that fits the character/person shown in the image.",
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
      "Transform into a cat/cats while preserving distinctive human features, coloration, and personality. Create a feline that has subtle similarities to the original hair color, eye color, and facial expressions. The cat should feel like a natural feline version of the person, with recognizable traits that connect it to its human counterpart.",
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
  defaultPrompt = "", // Default to empty string if not provided
  savedStyle = null, // Default to null if not provided
}: PromptInputProps) {
  // State variables
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [charCount, setCharCount] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("1024x1024"); // Default to square
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [primaryCategory, setPrimaryCategory] = useState<
    "cartoon" | "product" | "painting" | "other" | null
  >(null);
  const [cartoonSubcategory, setCartoonSubcategory] =
    useState<CartoonSubcategory | null>(null);
  const [productSubcategory, setProductSubcategory] =
    useState<ProductSubcategory | null>(null);
  const [paintingSubcategory, setPaintingSubcategory] =
    useState<PaintingSubcategory | null>(null);
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
    } else if (selectedTransformation === "painting") {
      setPrimaryCategory("painting");
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
      // If no subcategory is selected but primary is painting, use a generic prompt
      else if (primaryCategory === "painting" && !paintingSubcategory) {
        finalPrompt =
          "Transform into a beautiful artistic painting with rich textures and expressive brushwork. " +
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
          primaryCategory === "painting" &&
          paintingSubcategory &&
          paintingSubcategory in PAINTING_STYLES
        ) {
          const suggestion = PAINTING_STYLES[paintingSubcategory].suggestedPrompt;
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
    category: "cartoon" | "product" | "painting" | "other",
  ) => {
    setPrimaryCategory(category);
    setCartoonSubcategory(null);
    setProductSubcategory(null);
    setPaintingSubcategory(null);
    setOtherSubcategory(null);
  };

  // Set subcategory selection
  const handleCartoonSelect = (subcategory: CartoonSubcategory) => {
    setCartoonSubcategory(subcategory);
  };

  const handleProductSelect = (subcategory: ProductSubcategory) => {
    setProductSubcategory(subcategory);
  };

  const handlePaintingSelect = (subcategory: PaintingSubcategory) => {
    setPaintingSubcategory(subcategory);
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
      primaryCategory === "painting" &&
      paintingSubcategory &&
      paintingSubcategory in PAINTING_STYLES
    ) {
      return PAINTING_STYLES[paintingSubcategory].description;
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
      primaryCategory === "painting" &&
      paintingSubcategory &&
      paintingSubcategory in PAINTING_STYLES
    ) {
      return PAINTING_STYLES[paintingSubcategory].placeholder;
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
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center h-80 md:h-96">
              <img
                src={originalImage}
                className="max-w-full max-h-full object-contain"
                alt="Your uploaded image"
              />
              
              {/* Saved Style Notification Banner */}
              {savedStyle && (
                <div className="mt-3 w-full bg-secondary text-white p-3 rounded-md text-sm">
                  <div className="font-medium">Applied Style: {savedStyle.title}</div>
                  <div className="text-xs opacity-90">Category: {savedStyle.category}</div>
                </div>
              )}
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
                  primaryCategory === "painting"
                    ? "border-black bg-black text-white"
                    : "border-black bg-white text-black hover:bg-gray-50"
                }`}
                onClick={() => handlePrimaryCategorySelect("painting")}
              >
                <div className="flex items-center">
                  <Paintbrush className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="font-medium whitespace-normal break-words">
                    Painting Styles
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
            
            {/* Secondary Category Selection (Step 2) - Painting Subcategories */}
            {primaryCategory === "painting" && (
              <div className="mb-6 grid grid-cols-2 gap-2 overflow-y-auto max-h-52">
                {Object.entries(PAINTING_STYLES).map(([key, style]) => (
                  <Button
                    key={key}
                    className={`justify-start text-left h-auto py-2 px-3 whitespace-normal break-words ${
                      paintingSubcategory === key
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() =>
                      handlePaintingSelect(key as PaintingSubcategory)
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
            {(cartoonSubcategory || productSubcategory || paintingSubcategory || otherSubcategory) && (
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
