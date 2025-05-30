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
  Clock, // For era category
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
  savedStyle?: SavedStyle | null; // Style information from Ideas page
}

// Main transformation categories
export type TransformationType =
  | "cartoon"
  | "product"
  | "painting"
  | "era"
  | "historical"
  | "other"
  | "kids"
  | "custom";

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
  | "charcoal-pencil"
  | "custom-painting";

export type EraSubcategory =
  | "old-western"
  | "90s-hip-hop"
  | "1980s"
  | "renaissance"
  | "victorian-era"
  | "disco-era"
  | "cyberpunk"
  | "medieval"
  | "custom-era";

export type OtherSubcategory =
  | "mullets"
  | "hulkamania"
  | "baby-prediction"
  | "future-self"
  | "ghibli-style"
  | "ai-action-figure"
  | "pet-as-human"
  | "self-as-cat"
  | "caricature"
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
    suggestedPrompt: "Create a dynamic comic book-style superhero character inspired by classic superhero adventures. Design an original hero with a confident, determined expression wearing a vibrant costume with bold primary colors and a distinctive emblem centered on the chest. For the costume, include a well-fitted superhero suit with textured panels, decorative seams, and complementary color blocking. Add distinctive identity-concealing elements like a sleek mask, advanced visor system, or specialized glasses that enhance the heroic appearance while maintaining the character's expressive eyes.The character should have a powerful stance with shoulders back and chin up, suggesting readiness for action. Include superhero accessories like a flowing cape with dramatic movement, specialized gauntlets, or a utility belt with gadgets. Surround the hero with dynamic energy effects, motion lines, or power signatures that match their color scheme.     Set the scene in a stylized city environment with dramatic perspective, featuring tall buildings, a setting sun creating dramatic lighting, and subtle hints of action or danger in the background. The overall style should feel empowering, bold, and reminiscent of beloved comic book art.Use the uploaded AI-generated reference image as the direct basis for the character's pose, proportions, and general appearance, transforming it into this superhero version while preserving its essential character.",
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

// Painting subcategories
const PAINTING_STYLES: Record<PaintingSubcategory, StyleOption> = {
  "oil-painting": {
    title: "Oil Painting",
    description:
      "Emulates traditional oil paintings with rich colors, textures, and visible brushstrokes.",
    placeholder: "E.g., In the style of Van Gogh or Rembrandt",
    suggestedPrompt:
      "Transform this image into a traditional oil painting with rich, deep colors and visible textured brushstrokes. Create a masterful composition with careful attention to light and shadow, capturing the dimensional quality and depth that oil paint provides. Apply thick impasto technique for highlights and finer brush detail for shadows. Use a warm, slightly muted color palette reminiscent of classical oil paintings, with subtle glazing effects and the characteristic luminosity that comes from layered oil paint. The final result should have the timeless, elegant aesthetic of museum-quality oil paintings while maintaining the essence and emotional quality of the original image.",
  },
  watercolor: {
    title: "Watercolor",
    description:
      "Creates a soft, fluid look with translucent colors, similar to watercolor paintings.",
    placeholder: "E.g., Add delicate color washes and soft edges",
    suggestedPrompt:
      "Transform this image into a delicate watercolor painting with soft, flowing colors and gentle transparency. Create subtle color washes that blend seamlessly at the edges, allowing the white of the paper to show through in lighter areas. Apply the characteristic diffused edges and gentle color bleeding that defines watercolor technique. Include small areas of increased detail with fine brushwork contrasted against looser, more impressionistic areas to create visual interest. Use a light, airy color palette with luminous quality and the slightly granular texture typical of watercolor pigments on paper. The final painting should maintain the essence and mood of the original image while having the delicate, ethereal quality of a skillfully executed watercolor.",
  },
  impressionist: {
    title: "Impressionist",
    description:
      "Captures light and atmosphere with visible brushstrokes like Monet or Renoir.",
    placeholder: "E.g., Focus on light and atmosphere",
    suggestedPrompt:
      "Transform this image into an impressionist painting in the style of artists like Monet or Renoir. Use visible, sketch-like brushstrokes and dabs of unmixed colors placed side-by-side to create a vibrant, shimmering effect when viewed from a distance. Focus on capturing the fleeting quality of light, atmosphere, and movement rather than sharp details. Apply a bright, vibrant color palette that emphasizes blues, greens, and complementary colors typical of impressionist works. Use broken color technique where multiple colors are layered to create optical blending. Add soft edges between elements and give particular attention to how light plays across the scene, with areas of brightness and color reflections. The final result should feel alive with energy and movement, evoking the sensory impression of the moment rather than a strictly realistic representation.",
  },
  abstract: {
    title: "Abstract",
    description:
      "Non-representational art focusing on shapes, colors, and textures.",
    placeholder: "E.g., Bold geometric forms in primary colors",
    suggestedPrompt:
      "Transform this image into an abstract painting that focuses on shapes, colors, forms, and textures rather than realistic representation. Deconstruct the original image into fundamental geometric or organic shapes, emphasizing bold lines, dynamic composition, and strong color relationships. Use a distinctive color palette with vibrant contrasting colors or harmonious color schemes depending on the mood. Add layers of visual interest through varied textures, drips, splatters, or scraped areas typical of abstract expressionism. Create focal points using variations in color intensity, scale, or textural contrast. Express emotions and concepts through the relationship between shapes and colors rather than literal depictions. While the final image should be completely abstract, it should still maintain some essence or emotional quality of the original image, translated into a non-representational visual language.",
  },
  "pop-surrealism": {
    title: "Pop Surrealism",
    description:
      "Playful, dreamlike imagery with vibrant colors and pop culture references.",
    placeholder: "E.g., Add dreamlike elements and cultural references",
    suggestedPrompt:
      "Transform this image into a pop surrealist artwork that blends dreamlike imagery with pop culture elements in a technically refined painting style. Create a playful, whimsical scene with unexpected juxtapositions and imaginative elements that challenge reality. Maintain high-quality, detailed rendering with crisp edges and smooth gradients reminiscent of lowbrow art and comic illustration. Use a vibrant, saturated color palette with bold contrasts and carefully crafted lighting effects. Add subtle references to mainstream culture, vintage advertisements, cartoons, or toys that create narrative depth and cultural connection. Include at least one surreal element like impossible scale relationships, objects floating or melting, or unexpected combinations of unrelated items. Apply a glossy, polished finish to the entire piece that enhances its contemporary yet nostalgic appeal. The final result should be visually striking, immediately engaging, and contain layers of meaning and discovery while maintaining technical excellence in execution.",
  },
  "art-deco": {
    title: "Art Deco",
    description:
      "Elegant, stylized designs with bold geometric patterns from the 1920s-30s.",
    placeholder: "E.g., Add geometric patterns and metallic accents",
    suggestedPrompt:
      "Transform this image into an Art Deco style artwork reminiscent of the elegant, glamorous aesthetic of the 1920s and 1930s. Convert elements into streamlined, geometric forms with symmetrical compositions and clean lines. Apply a sophisticated color palette using bold, contrasting colors alongside metallic gold, silver, or bronze accents. Include characteristic Art Deco patterns like sunbursts, chevrons, zigzags, and stylized floral motifs. Simplify and stylize any figurative elements with elongated proportions and elegant poses. Add architectural details inspired by skyscrapers, machinery, or ancient cultures (Egyptian, Aztec) that influenced the Art Deco movement. Incorporate luxury materials or their appearance such as polished wood, lacquer, marble, or exotic materials. The overall composition should feel balanced, ornate yet restrained, with an emphasis on luxury, modernity, and graphic boldness that characterized the Art Deco period.",
  },
  "pixel-art": {
    title: "Pixel Art",
    description:
      "Retro digital aesthetic with visible pixels and limited color palette.",
    placeholder: "E.g., 16-bit style with limited color palette",
    suggestedPrompt:
      "Transform this image into classic pixel art reminiscent of vintage video games and early computer graphics. Reduce the image to a limited color palette of 16-32 colors maximum with deliberate color choices that create cohesive areas and clear distinctions. Convert all elements to a grid-based structure where individual pixels are clearly visible and aligned to a consistent grid. Apply careful pixel-by-pixel placement with clean edges and no anti-aliasing to maintain the authentic pixelated aesthetic. Use dithering techniques (checkerboard or other patterns) to create the illusion of additional colors or gradients where needed. Include characteristic pixel art techniques like outlined forms, limited detail that emphasizes recognizable silhouettes, and deliberate use of negative space. The final result should evoke the nostalgic charm of 8-bit or 16-bit era games while clearly representing the subject from the original image in an instantly recognizable way despite the technical limitations of the pixel art format.",
  },
  "anime-manga": {
    title: "Anime/Manga",
    description:
      "Japanese animation and comic book style with distinctive eyes and expressions.",
    placeholder: "E.g., Specific anime like Studio Ghibli or Shonen style",
    suggestedPrompt:
      "Transform into a high-quality anime/manga illustration with clean lines and distinctive Japanese animation styling. Apply the characteristic anime facial features including larger, expressive eyes with light reflections, simplified nose and mouth, and distinctive hair styling with sleek, gravity-defying locks in vibrant colors. For clothing, create flowing fabrics with dynamic movement and clean fold lines. Use a cell-shaded coloring style with flat color areas separated by clean lines, minimal gradients, and strategic shadows. Add anime-specific emotion indicators like blush marks, sweat drops, or expression lines when appropriate. Set against a background with simplified details and depth-of-field effects typical of anime scenes. The final image should maintain the distinctive anime aesthetic that balances stylization with emotion, using simplified yet expressive features to convey character and mood.",
  },
  "cartoon-style": {
    title: "Cartoon Style",
    description:
      "Simplified, exaggerated features with bold outlines in various cartoon styles.",
    placeholder: "E.g., Modern cartoon with bold lines",
    suggestedPrompt:
      "Transform this image into a modern cartoon style with clean, bold outlines and simplified forms. Apply exaggerated proportions and features that enhance expression and character while maintaining recognizability. Use a bright, vibrant color palette with flat color areas and minimal shading for a contemporary cartoon look. Add characteristic cartoon elements like simplified backgrounds, expression lines, or minor motion effects that enhance the playful, animated feel. The styling should feel contemporary and polished, similar to modern animated shows, with attention to line weight variation and appealing character design. The final image should capture the fun, engaging quality of contemporary cartoons while clearly representing the subject from the original image.",
  },
  "gothic-noir": {
    title: "Gothic Noir",
    description:
      "Dark, atmospheric style with high contrast and dramatic shadows.",
    placeholder: "E.g., Add dramatic shadows and gothic elements",
    suggestedPrompt:
      "Transform this image into a gothic noir style with dark, moody atmosphere and dramatic high-contrast lighting. Apply a predominantly dark color palette with deep blacks, rich shadows, and selective highlights that create a stark, dramatic effect. Include gothic architectural elements or decorative motifs like ornate frames, arched windows, or decorative ironwork when appropriate to the composition. Add atmospheric effects such as fog, mist, or smoke that enhance the mysterious quality. Style any figures with elegant, dramatic poses and period-appropriate gothic fashion elements or noir styling. Incorporate symbolism typical of gothic imagery such as ravens, roses, or other elements that suggest mystery and foreboding. The final image should evoke a sense of atmospheric tension, elegant darkness, and dramatic emotional weight, blending elements of classic film noir with gothic romanticism.",
  },
  "charcoal-pencil": {
    title: "Charcoal & Pencil",
    description:
      "Black and white sketchy style mimicking traditional drawing media.",
    placeholder: "E.g., Emphasis on texture and contrast",
    suggestedPrompt:
      "Transform this image into a realistic charcoal and pencil drawing that captures the texture and depth of traditional hand-drawn techniques. Apply a monochromatic palette ranging from rich blacks to bright whites with a full range of grays, mimicking the look of charcoal, graphite pencil, and white chalk on textured paper. Create varied mark-making including bold, expressive charcoal strokes for darker areas, fine pencil lines for details, and subtle smudging for smooth transitions. Show the texture of the drawing medium with visible strokes, hatching, cross-hatching, and the characteristic granular quality of charcoal. Include strategic areas where the paper texture shows through, and use deliberate eraser marks or highlights to add dimension. Focus on creating strong contrasts between light and shadow while maintaining rich detail in mid-tones. The final drawing should appear convincingly hand-crafted with the spontaneous, expressive quality of traditional drawing media while clearly representing the subject from the original image.",
  },
  "custom-painting": {
    title: "Create Your Own Painting Style",
    description: "Describe your own custom painting transformation.",
    placeholder: "E.g., Combine impressionist style with modern elements",
    suggestedPrompt: "",
  },
};

// Era subcategories
const ERA_STYLES: Record<EraSubcategory, StyleOption> = {
  "old-western": {
    title: "Old Western",
    description:
      "Capture the rustic, sepia-toned aesthetic of the American Wild West.",
    placeholder: "E.g., Add cowboy/cowgirl attire and western setting",
    suggestedPrompt:
      "Transform into an authentic American Old West (1850s-1890s) portrait. Apply a vintage color treatment with warm sepia tones, subtle vignetting, and slight photo degradation with dust/scratch effects. Convert clothing to period-accurate western wear including options like cowboy hats, leather vests, bandanas, prairie dresses, or period-appropriate formal attire. Add characteristic Western elements such as leather gun belts, pocket watches, lace details, or brooches as appropriate. Include Old West environmental context with wooden buildings, saloons, rural landscapes, or painted studio backdrops typical of period photography. Position subjects with the formal, slightly stiff poses characteristic of long-exposure photography from the era. The final image should authentically capture the rugged frontier aesthetic of Old West photography while maintaining clear likeness to the original subject.",
  },
  "90s-hip-hop": {
    title: "90s Hip-Hop",
    description:
      "Vibrant urban style with iconic fashion and visual elements from 90s hip-hop culture.",
    placeholder: "E.g., Add 90s hip-hop fashion and urban setting",
    suggestedPrompt:
      "Transform into an authentic 1990s hip-hop style portrait with bold, vibrant colors and slightly overexposed flash photography aesthetic. Convert clothing to iconic 90s hip-hop fashion including baggy jeans, oversized sports jerseys, branded tracksuits, Timberland boots, or streetwear with bold logos and bright colors. Add characteristic 90s hip-hop accessories like chunky gold chains, door-knocker earrings, snapback caps worn at angles, bandanas, or sports team apparel. Style hair in 90s trends like high-top fades, box braids, flat tops, or other era-specific styles. Set against urban backdrops featuring graffiti art, basketball courts, city streets, or other iconic 90s hip-hop environments. Apply color effects reminiscent of 90s film photography with saturated colors, slight film grain, and the characteristic look of 90s music videos and album covers. The final image should authentically capture the bold, expressive aesthetic of 90s hip-hop culture while maintaining clear likeness to the original subject.",
  },
  "1980s": {
    title: "1980s",
    description:
      "Vibrant neon aesthetics, distinctive fashion, and visual style of the 1980s era.",
    placeholder: "E.g., Add 80s fashion, hairstyle, and background",
    suggestedPrompt:
      "Transform into an authentic 1980's portrait with vibrant neon aesthetics. Apply high-saturation, high-contrast photography with slight airbrushing effect. Convert hairstyles to characteristic 80's looks including big permed hair, mullets, side ponytails, or feathered styles. Update clothing to iconic 80's fashion with shoulder pads, Members Only jackets, leg warmers, acid-wash jeans, neon colors, or power suits. Add period accessories like large plastic earrings, Ray-Ban Wayfarers, scrunchies, sweatbands, or chunky digital watches. Set against 80's backdrops featuring laser grids, chrome effects, geometric patterns, or airbrushed gradients. Include 80's technology like boomboxes, Walkmans, early video game systems, or brick phones. The final image should capture the maximalist, energetic spirit of the 1980's while maintaining clear likeness to the original subject.",
  },
  renaissance: {
    title: "Renaissance",
    description:
      "Classical painting style with formal poses and rich, muted colors (1400-1600)",
    placeholder: "E.g., Add period-appropriate formal attire",
    suggestedPrompt:
      "Transform into a Renaissance portrait painting in the style of masters like Leonardo da Vinci or Raphael (1400-1600). Apply oil painting technique with rich, muted color palette and subtle glazing effects. Convert clothing to period Renaissance attire including high collars, elaborate embroidery, velvet, brocade fabrics, ornate jewelry, and formal headwear. Position the subject in a three-quarter view with dignified posture against a dark backdrop or classical architectural elements. Add symbolic Renaissance objects that reflect status or character like books, scientific instruments, religious items, or flora. Apply characteristic Renaissance lighting with soft modeling and sfumato technique creating subtle transitions between light and shadow. The final portrait should convey the solemnity, dignity and intellectual character of Renaissance portraiture while maintaining clear likeness to the original subject.",
  },
  "victorian-era": {
    title: "Victorian Era",
    description:
      "Formal, ornate style reflecting the fashions and photographs of the late 1800s.",
    placeholder: "E.g., Add Victorian clothing and formal pose",
    suggestedPrompt:
      "Transform into an authentic Victorian era (1837-1901) portrait. Apply a vintage photographic style with sepia toning, formal composition, and the slight blur characteristic of early photography's long exposure times. Convert clothing to period-accurate Victorian fashion including high-necked dresses with bustles, corsets, and lace details for women, or formal frock coats, waistcoats, and high collars for men. Add Victorian accessories such as cameo brooches, pocket watches with chains, lace gloves, or walking sticks. Style hair in Victorian fashions including updos with center parts for women or neat side parts with facial hair for men. Set against Victorian backdrops such as formal parlors with heavy drapery, ornate furniture, painted scenic backgrounds, or formal gardens. Position the subject with the stiff, formal poses typical of Victorian photography where subjects had to remain still for long exposures. The final portrait should authentically capture the formal, restrained aesthetic of Victorian photography while maintaining clear likeness to the original subject.",
  },
  "disco-era": {
    title: "Disco Era",
    description:
      "Glittering, colorful 1970s disco style with characteristic fashion and lighting.",
    placeholder: "E.g., Add disco fashion and dance floor setting",
    suggestedPrompt:
      "Transform into an authentic 1970s disco era portrait with vibrant colors and glamorous disco lighting effects. Apply the characteristic photo style of the late 70s with slightly faded colors, film grain, and dramatic lighting. Convert clothing to iconic disco fashion including sequined/metallic fabrics, wide-collar shirts open at the chest, flared pants, platform shoes, wrap dresses, or jumpsuits in bold patterns. Style hair in classic 70s disco looks including feathered styles, afros, long sideburns, or other era-defining haircuts. Add disco-appropriate accessories such as oversized sunglasses, chunky jewelry, headbands, or medallion necklaces. Set against disco environments featuring illuminated dance floors, mirror balls, colorful lighting effects, or wood-paneled lounges with retro furniture. The final image should authentically capture the glamorous, energetic spirit of the disco era (1975-1980) while maintaining clear likeness to the original subject.",
  },
  cyberpunk: {
    title: "Cyberpunk",
    description:
      "Futuristic dystopian aesthetic with neon lights, urban decay, and high-tech elements.",
    placeholder: "E.g., Add neon lights and cybernetic elements",
    suggestedPrompt:
      "Transform into a cyberpunk scene set in a high-tech dystopian future. Apply a cinematic color grade with dominant blue and magenta neon tones contrasting with dark shadows and urban decay. Add technological modifications like subtle cybernetic implants, neural interface ports, augmented reality displays, or holographic elements integrated with the subject. Update clothing to cyberpunk fashion featuring a mix of high-tech elements with street-level grit - technical fabrics, asymmetric designs, utility garments with functional pockets/straps, and practical urban wear with futuristic details. Set against a dystopian cityscape background with dense urban architecture, neon signs in multiple languages, holographic advertisements, industrial elements, and signs of both technological advancement and social decay. Add atmospheric elements like rain, fog, or steam illuminated by colored lights to enhance the mood. The final image should capture the gritty, high-tech/low-life aesthetic that defines cyberpunk while maintaining clear likeness to the original subject.",
  },
  medieval: {
    title: "Medieval",
    description:
      "Historical style depicting the Middle Ages with period costumes and settings.",
    placeholder: "E.g., Add medieval attire and castle background",
    suggestedPrompt:
      "Transform into an authentic medieval portrait set between 1100-1400 CE. Convert into the style of medieval illuminated manuscripts or early Renaissance painting with rich colors, flat perspective, and decorative elements. Update clothing to historically accurate medieval attire including period-appropriate tunics, surcoats, cloaks, or gowns with appropriate layering and construction for the subject's apparent social status. Add medieval accessories such as belts with pouches, simple jewelry, head coverings like coifs or veils, and status-appropriate items. Set against medieval environments featuring castle interiors, countryside with period architecture, or simple colored backgrounds with decorative borders as seen in manuscript illustrations. Include medieval symbolic elements or activities appropriate to the setting such as religious symbols, heraldry, or period-accurate tools/weapons. The final portrait should authentically capture the aesthetic of medieval European art while maintaining recognizable likeness to the original subject.",
  },
  "custom-era": {
    title: "Create Your Own Era",
    description: "Describe your own custom historical era transformation.",
    placeholder: "E.g., Transform into 1920s Gatsby-era style",
    suggestedPrompt: "",
  },
};

// Other subcategories
const OTHER_STYLES: Record<OtherSubcategory, StyleOption> = {
  "mullets": {
    title: "Mullets",
    description: "It's well known that everyone secretly wants to look like Joe Dirt.",
    placeholder: "E.g., Make my mullet more dramatic with volume",
    suggestedPrompt: "Transform the uploaded photo by replacing only the hair region with an iconic mullet hairstyle.\n1. Use the image's hair mask to isolate the hair—do not touch the face, body, clothing, or background.\n2. Match the original hair color, texture, and density exactly.\n3. Randomly choose one of these top-hair styles for each run:\n   - curly, teased volume\n   - short, textured spikes\n   - feathered, classic '80s layers\n   - sleek, modern taper\n4. In every variation, the back must be noticeably longer than the front (\"business in front, party in back\").\n5. Preserve **all** facial attributes exactly as in the original, including:\n   - Skin tone and smoothness (no new wrinkles, age spots, or blemishes)\n   - Facial proportions and bone structure\n   - Eye color, eye shape, lips, and expression\n   - Age appearance (do **not** make the subject look older or younger)\n6. Seamlessly blend shadows, highlights, and lighting so the new hair looks like part of the original photograph.\n\n**Negative constraints** (do **not**):\n- Alter any aspect of the face, skin texture, or age cues.\n- Introduce wrinkles, sagging, or any aging artifacts.\n- Change posture, clothing, background, or cropping.",
  },
  "hulkamania": {
    title: "Hulkamania",
    description: "Channel your inner wrestling legend with the ultimate showman transformation - complete with the iconic red bandana and yellow tank top from the golden era.",
    placeholder: "E.g., Give me that classic Hulkamania look",
    suggestedPrompt: "Apply ONLY these specific costume overlays to the uploaded photo. Do NOT alter the person's features:\n\n1. Hair color change:\n   - Change visible hair color to platinum blonde\n   - Apply to all hair showing beneath the bandana\n   - Keep the person's natural hair length and style\n   - If hair is short, keep it short but blonde\n   - If hair is long, keep it long and blonde\n\n2. Red bandana do-rag style:\n   - Place red bandana as a full do-rag covering the top of head\n   - Should cover from forehead to crown like a skull cap\n   - Include 'HULKAMANIA' in bold yellow text across the front\n   - Bandana should have realistic fabric folds and texture\n\n3. Mustache overlay:\n   - ADD a blonde horseshoe mustache as an overlay\n   - Size it proportionally to the person's face\n   - Blend naturally but keep as an addition, not a transformation\n\n4. Clothing replacement:\n   - Replace ONLY the clothing with a yellow tank top\n   - Add 'HULK RULES' in red block letters on the chest\n   - Fit the tank to the person's exact body shape\n\n**CRITICAL PRESERVATION RULES:**\n- Do NOT alter facial features, bone structure, or expressions\n- Keep the person's exact face, just add the mustache\n- Preserve their natural body shape and size completely\n- Maintain their original skin tone and texture\n- The person should still look like themselves in costume\n- NEVER change eyes, eye color, eye shape, or eyelids\n- NEVER alter the nose shape, size, or nostrils\n- NEVER modify teeth, smile, or mouth shape\n\n**ABSOLUTELY DO NOT:**\n- Change face shape or features\n- Alter body proportions or chest size\n- Make the person look more masculine/feminine\n- Age or de-age the person\n- Change their natural build or physique\n- Modify eyes, eye color, nose, or teeth in any way",
  },
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
    placeholder: "E.g., Create a whimsical Miyazaki-inspired scene",
    suggestedPrompt:
      "Transform into the distinctive Studio Ghibli animation style reminiscent of films by Hayao Miyazaki. Use the characteristic soft, painterly animation style with watercolor-inspired backgrounds and attention to natural elements. Apply the signature Ghibli character design including simplified but expressive faces with large, detailed eyes and minimal facial lines. Update the scene with warm, natural lighting and atmospheric effects like gentle wind or soft shadows. Add Ghibli-inspired environmental details such as lush vegetation, detailed clouds, charming architecture, or magical subtle elements that suggest wonder. Include the sense of movement and liveliness typical of Ghibli films with hair or clothing that appears to flow naturally. The final image should capture the heartfelt, nostalgic quality and connection to nature that characterizes Studio Ghibli's unique aesthetic while maintaining recognizable likeness to the original subject.",
  },
  "ai-action-figure": {
    title: "AI Action Figure",
    description:
      "Turn the subject into a realistic, detailed action figure or toy.",
    placeholder: "E.g., Put the name on the packaging with accessories",
    suggestedPrompt:
      "Transform into a highly detailed, collectible action figure presented in professional packaging. Create a realistic toy version with visible plastic texture, molded details, articulation points at major joints, and slight manufacturing imperfections. Design custom blister packaging featuring character artwork, logos, and product details including a character name and special features listed on the card. Add accessory items relevant to the character's identity displayed alongside the figure. Position the packaged figure against a clean background with professional product photography lighting that shows reflections on the plastic packaging. The final image should realistically depict how the subject would appear if manufactured as a premium collectible action figure in unopened retail packaging, presented as a professional product photograph.",
  },
  "pet-as-human": {
    title: "What Would My Pet Look Like as a Human",
    description:
      "Reimagine a pet as a human while keeping recognizable traits and personality.",
    placeholder: "E.g., Turn my cat into a human with feline features",
    suggestedPrompt:
      "Transform a pet into a human character while preserving the pet's distinctive traits, coloration, and personality. Create a human face and body that incorporates subtle animal features reminiscent of the original pet - such as similar eye color, hair color/pattern matching fur color/pattern, and facial expressions that capture the pet's typical demeanor. Dress the human character in clothing that reflects the pet's personality and status - elegant for dignified pets, casual for playful pets, etc. The character should feel like a natural human embodiment of the specific pet's essence and personality, not a generic animal-human hybrid. Position in a setting or with props that connect to the pet's lifestyle or preferences. The final image should create an immediate sense of recognition while being fully humanized.",
  },
  "self-as-cat": {
    title: "What Would I Look Like as a Cat",
    description:
      "Transform a human into a cat with recognizable traits from the original subject.",
    placeholder: "E.g., Turn me into a cat that resembles my features",
    suggestedPrompt:
      "Transform into a cat/cats while preserving distinctive human features, coloration, and personality. Create a feline that has subtle similarities to the original hair color, eye color, and facial expressions. The cat should feel like a natural feline version of the person, with recognizable traits that connect it to its human counterpart.",
  },
  caricature: {
    title: "Caricature",
    description:
      "Exaggerated features with humorous intent while maintaining recognition",
    placeholder: "E.g., Exaggerate eyes and mouth for humorous effect",
    suggestedPrompt:
      "Transform into a skillful caricature with exaggerated yet recognizable features. Strategically enlarge the most distinctive facial elements by 20-30% while keeping overall facial arrangement intact. Simplify less important features for contrast with the exaggerated ones. Apply bold, confident pen or marker-style linework with vibrant watercolor or marker-style coloring. Enhance expressiveness with slightly enlarged eyes and exaggerated facial expression. Keep the body proportions smaller relative to the head (about 1:4 ratio). Add subtle details that emphasize personal characteristics, hobbies, or occupation. The final image should be immediately recognizable as the subject while being playful and humorous without crossing into mockery.",
  },
  "custom-other": {
    title: "Create Your Own",
    description: "Describe your own custom transformation.",
    placeholder:
      "E.g., Make it look like it's underwater with fish swimming around",
    suggestedPrompt: "",
  },
};

// This is the main component
export default function PromptInput({
  originalImage,
  onSubmit,
  onBack,
  selectedTransformation,
  defaultPrompt,
  savedStyle,
}: PromptInputProps) {
  const { toast } = useToast();
  const [promptText, setPromptText] = useState(defaultPrompt || "");
  const [imageSize, setImageSize] = useState("default"); // default, hd
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [randomTip, setRandomTip] = useState("");

  // Transformation selection state
  const [primaryCategory, setPrimaryCategory] =
    useState<TransformationType | null>(
      selectedTransformation || savedStyle?.category || null
    );

  // Subcategory selections
  const [cartoonSubcategory, setCartoonSubcategory] =
    useState<CartoonSubcategory | null>(null);
  const [productSubcategory, setProductSubcategory] =
    useState<ProductSubcategory | null>(null);
  const [paintingSubcategory, setPaintingSubcategory] =
    useState<PaintingSubcategory | null>(null);
  const [eraSubcategory, setEraSubcategory] =
    useState<EraSubcategory | null>(null);
  const [otherSubcategory, setOtherSubcategory] =
    useState<OtherSubcategory | null>(null);

  // Determine subcategory options based on primary category
  const getSubcategoryOptions = () => {
    switch (primaryCategory) {
      case "cartoon":
        return Object.keys(CARTOON_STYLES) as CartoonSubcategory[];
      case "product":
        return Object.keys(PRODUCT_STYLES) as ProductSubcategory[];
      case "painting":
        return Object.keys(PAINTING_STYLES) as PaintingSubcategory[];
      case "era":
        return Object.keys(ERA_STYLES) as EraSubcategory[];
      case "other":
        return Object.keys(OTHER_STYLES) as OtherSubcategory[];
      default:
        return [];
    }
  };

  // Get random writing tip
  useEffect(() => {
    if (PROMPT_TIPS.length > 0) {
      const tipIndex = Math.floor(Math.random() * PROMPT_TIPS.length);
      setRandomTip(PROMPT_TIPS[tipIndex]);
    }
  }, []);

  // Initialize from saved style if available
  useEffect(() => {
    if (savedStyle && savedStyle.prompt) {
      console.log("Setting prompt from saved style:", savedStyle.prompt);
      setPromptText(savedStyle.prompt);

      // Handle style category
      if (savedStyle.category) {
        console.log("Setting primary category to", savedStyle.category, "from saved style");
        setPrimaryCategory(savedStyle.category as TransformationType);
      }

      // Special handling for mullets saved style
      if (savedStyle.title === "Mullets") {
        console.log("Setting primary category to other and subcategory to mullets from saved style");
        setPrimaryCategory("other");
        setOtherSubcategory("mullets");
      }
    }
  }, [savedStyle]);

  // Handle form submission
  const handleSubmit = () => {
    if (!promptText.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a description of how to transform the image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    onSubmit(promptText, imageSize);
  };

  // Handle primary category selection
  const handleCategorySelect = (category: TransformationType) => {
    setPrimaryCategory(category);
    // Reset all subcategories when changing the main category
    setCartoonSubcategory(null);
    setProductSubcategory(null);
    setPaintingSubcategory(null);
    setEraSubcategory(null);
    setOtherSubcategory(null);
  };

  // Handle subcategory selections
  const handleCartoonSelect = (subcategory: CartoonSubcategory) => {
    setCartoonSubcategory(subcategory);
    if (subcategory !== "custom-cartoon") {
      setPromptText(CARTOON_STYLES[subcategory].suggestedPrompt);
    }
  };

  const handleProductSelect = (subcategory: ProductSubcategory) => {
    setProductSubcategory(subcategory);
    if (subcategory !== "custom-product") {
      setPromptText(PRODUCT_STYLES[subcategory].suggestedPrompt);
    }
  };

  const handlePaintingSelect = (subcategory: PaintingSubcategory) => {
    setPaintingSubcategory(subcategory);
    if (subcategory !== "custom-painting") {
      setPromptText(PAINTING_STYLES[subcategory].suggestedPrompt);
    }
  };

  const handleEraSelect = (subcategory: EraSubcategory) => {
    setEraSubcategory(subcategory);
    if (subcategory !== "custom-era") {
      setPromptText(ERA_STYLES[subcategory].suggestedPrompt);
    }
  };

  const handleOtherSelect = (subcategory: OtherSubcategory) => {
    setOtherSubcategory(subcategory);
    if (subcategory !== "custom-other") {
      setPromptText(OTHER_STYLES[subcategory].suggestedPrompt);
    }
  };

  // Get the current subcategory title and description
  const getCurrentSubcategoryInfo = () => {
    if (primaryCategory === "cartoon" && cartoonSubcategory) {
      return CARTOON_STYLES[cartoonSubcategory];
    } else if (primaryCategory === "product" && productSubcategory) {
      return PRODUCT_STYLES[productSubcategory];
    } else if (primaryCategory === "painting" && paintingSubcategory) {
      return PAINTING_STYLES[paintingSubcategory];
    } else if (primaryCategory === "era" && eraSubcategory) {
      return ERA_STYLES[eraSubcategory];
    } else if (primaryCategory === "other" && otherSubcategory) {
      return OTHER_STYLES[otherSubcategory];
    }
    return null;
  };

  // Get the appropriate icon based on the transformation type
  const getCategoryIcon = (category: TransformationType) => {
    switch (category) {
      case "cartoon":
        return <ImageIcon className="h-5 w-5 mr-2" />;
      case "product":
        return <BoxIcon className="h-5 w-5 mr-2" />;
      case "painting":
        return <Paintbrush className="h-5 w-5 mr-2" />;
      case "era":
        return <Clock className="h-5 w-5 mr-2" />;
      case "other":
        return <Sparkles className="h-5 w-5 mr-2" />;
      default:
        return <Wand2 className="h-5 w-5 mr-2" />;
    }
  };

  // Function to check for active subcategory
  const isSubcategoryActive = (category: string, subcategory: string) => {
    switch (category) {
      case "cartoon":
        return cartoonSubcategory === subcategory;
      case "product":
        return productSubcategory === subcategory;
      case "painting":
        return paintingSubcategory === subcategory;
      case "era":
        return eraSubcategory === subcategory;
      case "other":
        return otherSubcategory === subcategory;
      default:
        return false;
    }
  };

  // Function to get custom prompt placeholder
  const getCustomPlaceholder = () => {
    switch (primaryCategory) {
      case "cartoon" && cartoonSubcategory === "custom-cartoon":
        return "Describe your custom cartoon transformation...";
      case "product" && productSubcategory === "custom-product":
        return "Describe your custom product transformation...";
      case "painting" && paintingSubcategory === "custom-painting":
        return "Describe your custom painting transformation...";
      case "era" && eraSubcategory === "custom-era":
        return "Describe your custom historical era transformation...";
      case "other" && otherSubcategory === "custom-other":
        return "Describe your custom transformation...";
      default:
        return "Describe how to transform your image...";
    }
  };

  // Function to handle suggest prompt button
  const handleSuggestPrompt = async () => {
    if (!originalImage) {
      toast({
        title: "Image required",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/api/suggest-prompt", {
        method: "POST",
        body: JSON.stringify({ image: originalImage }),
      });

      if (response.prompt) {
        setPromptText(response.prompt);
        toast({
          title: "Prompt suggested",
          description: "AI has analyzed your image and suggested a prompt.",
        });
      }
    } catch (error) {
      console.error("Error suggesting prompt:", error);
      toast({
        title: "Error",
        description: "Could not generate a prompt suggestion.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const currentSubcategoryInfo = getCurrentSubcategoryInfo();
  const subcategoryOptions = getSubcategoryOptions();

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          className="pl-0 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Image Upload
        </Button>
      </div>

      {/* Step 1: Transformation Category Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Step 1: Select a Transformation Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <Button
            variant={primaryCategory === "cartoon" ? "default" : "outline"}
            className={`flex items-center justify-center h-12 ${
              primaryCategory === "cartoon" ? "bg-brand text-white" : ""
            }`}
            onClick={() => handleCategorySelect("cartoon")}
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Cartoon
          </Button>
          <Button
            variant={primaryCategory === "product" ? "default" : "outline"}
            className={`flex items-center justify-center h-12 ${
              primaryCategory === "product" ? "bg-brand text-white" : ""
            }`}
            onClick={() => handleCategorySelect("product")}
          >
            <BoxIcon className="h-5 w-5 mr-2" />
            Product
          </Button>
          <Button
            variant={primaryCategory === "painting" ? "default" : "outline"}
            className={`flex items-center justify-center h-12 ${
              primaryCategory === "painting" ? "bg-brand text-white" : ""
            }`}
            onClick={() => handleCategorySelect("painting")}
          >
            <Paintbrush className="h-5 w-5 mr-2" />
            Painting
          </Button>
          <Button
            variant={primaryCategory === "era" ? "default" : "outline"}
            className={`flex items-center justify-center h-12 ${
              primaryCategory === "era" ? "bg-brand text-white" : ""
            }`}
            onClick={() => handleCategorySelect("era")}
          >
            <Clock className="h-5 w-5 mr-2" />
            Historical Era
          </Button>
          <Button
            variant={primaryCategory === "other" ? "default" : "outline"}
            className={`flex items-center justify-center h-12 ${
              primaryCategory === "other" ? "bg-brand text-white" : ""
            }`}
            onClick={() => handleCategorySelect("other")}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Fun/Viral
          </Button>
        </div>
      </div>

      {/* Step 2: Subcategory Selection (if applicable) */}
      {primaryCategory && subcategoryOptions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">
            Step 2: Select a {primaryCategory.charAt(0).toUpperCase() + primaryCategory.slice(1)}{" "}
            Style
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {subcategoryOptions.map((key) => {
              let title = "";
              switch (primaryCategory) {
                case "cartoon":
                  title = CARTOON_STYLES[key as CartoonSubcategory].title;
                  break;
                case "product":
                  title = PRODUCT_STYLES[key as ProductSubcategory].title;
                  break;
                case "painting":
                  title = PAINTING_STYLES[key as PaintingSubcategory].title;
                  break;
                case "era":
                  title = ERA_STYLES[key as EraSubcategory].title;
                  break;
                case "other":
                  title = OTHER_STYLES[key as OtherSubcategory].title;
                  break;
              }

              return (
                <Button
                  key={key}
                  variant={isSubcategoryActive(primaryCategory, key) ? "default" : "outline"}
                  className={`flex items-center justify-start h-auto py-2 px-3 text-sm ${
                    isSubcategoryActive(primaryCategory, key) ? "bg-brand text-white" : ""
                  }`}
                  onClick={() => {
                    switch (primaryCategory) {
                      case "cartoon":
                        handleCartoonSelect(key as CartoonSubcategory);
                        break;
                      case "product":
                        handleProductSelect(key as ProductSubcategory);
                        break;
                      case "painting":
                        handlePaintingSelect(key as PaintingSubcategory);
                        break;
                      case "era":
                        handleEraSelect(key as EraSubcategory);
                        break;
                      case "other":
                        handleOtherSelect(key as OtherSubcategory);
                        break;
                    }
                  }}
                >
                  <span className="truncate">{title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Display current subcategory info if available */}
      {currentSubcategoryInfo && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-lg flex items-center">
            {getCategoryIcon(primaryCategory as TransformationType)}
            {currentSubcategoryInfo.title}
          </h3>
          <p className="text-muted-foreground mt-1">{currentSubcategoryInfo.description}</p>
          {currentSubcategoryInfo.placeholder && (
            <p className="text-sm text-muted-foreground italic mt-2">
              Tip: {currentSubcategoryInfo.placeholder}
            </p>
          )}
        </div>
      )}

      {/* Step 3: Prompt Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {currentSubcategoryInfo ? "Step 3: Customize Your Prompt" : "Step 2: Enter Your Prompt"}
          </h2>
          
          <div className="flex space-x-2">
            <Popover open={showTips} onOpenChange={setShowTips}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs"
                >
                  <Lightbulb className="h-3.5 w-3.5 mr-1" />
                  Writing Tips
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Prompt Writing Tips</h3>
                  <ul className="text-xs space-y-1">
                    {PROMPT_TIPS.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-1.5 text-brand">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-xs"
              onClick={handleSuggestPrompt}
              disabled={isLoading || !originalImage}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              {isLoading ? "Thinking..." : "Suggest Prompt"}
            </Button>
          </div>
        </div>

        <Textarea
          placeholder={
            currentSubcategoryInfo?.placeholder ||
            getCustomPlaceholder()
          }
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="min-h-[150px] text-base"
        />

        {randomTip && (
          <p className="text-sm text-muted-foreground flex items-start">
            <Lightbulb className="h-4 w-4 mr-1 mt-0.5 text-amber-500" />
            <span>
              <span className="font-medium">Tip:</span> {randomTip}
            </span>
          </p>
        )}
      </div>

      {/* Quality Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">Step {currentSubcategoryInfo ? "4" : "3"}: Select Image Quality</h2>
        <div className="flex space-x-2">
          <Button
            variant={imageSize === "default" ? "default" : "outline"}
            className={imageSize === "default" ? "bg-brand text-white" : ""}
            onClick={() => setImageSize("default")}
          >
            Standard Quality
          </Button>
          <Button
            variant={imageSize === "hd" ? "default" : "outline"}
            className={imageSize === "hd" ? "bg-brand text-white" : ""}
            onClick={() => setImageSize("hd")}
          >
            HD Quality
            <span className="ml-1 text-xs px-1.5 py-0.5 bg-yellow-500 text-black rounded-full font-medium">
              2 Credits
            </span>
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !promptText.trim()} 
          className="bg-brand hover:bg-brand-dark"
          size="lg"
        >
          {isLoading ? "Processing..." : "Transform Image"} 
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}