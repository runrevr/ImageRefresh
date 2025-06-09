import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
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
  PaintBucket,
  Paintbrush,
  Sparkles,
  Clock, // For era category
  Baby, // For kids to real
  Plus,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SavedStyle } from "./StyleIntegration";
import { apiRequest } from "@/lib/queryClient";

interface PromptInputProps {
  originalImage: string;
  onSubmit: (
    prompt: string,
    imageSize: string,
    isColoringBook?: boolean,
  ) => void;
  onBack: () => void;
  selectedTransformation?: TransformationType | null;
  defaultPrompt?: string; // Default prompt text (can come from saved style)
  savedStyle?: SavedStyle | null; // Style information from Ideas page
}

// Main transformation categories
export type TransformationType =
  | "cartoon"
  | "painting"
  | "era"
  | "historical"
  | "other"
  | "kids"
  | "kids-real"
  | "taylor-swift"
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
  | "coloringBook"
  | "custom-cartoon";

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
  | "babyMode"
  | "baby-prediction"
  | "future-self"
  | "ghibli-style"
  | "ai-action-figure"
  | "pet-as-human"
  | "self-as-cat"
  | "caricature"
  | "vampire"
  | "custom-other";

export type TaylorSwiftSubcategory =
  | "debut"
  | "fearless"
  | "speak-now"
  | "red"
  | "nineteen-eighty-nine"
  | "reputation"
  | "lover"
  | "folklore"
  | "evermore"
  | "midnights"
  | "ttpd"
  | "eras-tour-concert";
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
export const CARTOON_STYLES: Record<CartoonSubcategory, StyleOption> = {
  "super-mario": {
    title: "Super Mario Bros",
    description:
      "Transform into the modern 3D-animated style of contemporary Mario films and games.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: `Take the person shown in the uploaded image and transform them into an animated Super Mario Bros cartoon character. CRITICAL: You MUST preserve their exact eye color from the original image - do not change brown eyes to blue, green eyes to brown, etc. Keep their original eye color exactly as it appears in the uploaded photo.
Also preserve their exact hair color, facial structure, expression, skin tone, and any distinctive characteristics. Use their actual appearance as the foundation:
For males: Randomly choose between two character transformations:
- Main plumber hero: Red cap with circular emblem, red shirt, blue overalls with yellow buttons, white gloves, brown boots, and cartoon mustache. KEEP THEIR ORIGINAL EYE COLOR from the uploaded image.
- Secondary plumber hero: Green cap with circular emblem, green shirt, blue overalls with yellow buttons, white gloves, brown boots, and cartoon mustache. KEEP THEIR ORIGINAL EYE COLOR from the uploaded image.
For females: Transform into the animated royal princess character - style their hair in an elegant long updo using their NATURAL hair color from the image, add a golden crown with jewels, pink ball gown with puffy sleeves, white gloves, pink heels. KEEP THEIR ORIGINAL EYE COLOR from the uploaded image.
DO NOT CHANGE THE EYE COLOR - use the exact same eye color as shown in the original uploaded image.
Randomly select from diverse Super Mario Bros movie-inspired backgrounds and environments - such as the colorful Rainbow Road/Rainbow Bridge with sparkling effects, the Mushroom Kingdom with rolling green hills, Bowser's dark volcanic castle with lava, the underwater kingdom with coral reefs, cloud worlds with floating platforms, the jungle kingdom with lush vegetation, ice kingdoms with crystal formations, desert worlds with sand dunes, Princess Peach's elegant castle with marble architecture, underground caverns with glowing crystals, or the Brooklyn city scenes. Include appropriate Mario elements like floating platforms, question mark blocks, warp pipes, power-ups, and creatures that match the chosen environment.
Style: High-quality 3D cartoon animation with vibrant colors like the Mario movie, maintaining the person's true-to-life eye color and facial characteristics.`,
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
    suggestedPrompt:
      "Transform the person in the uploaded AI-generated reference image into a cartoon superhero using the image as the direct basis for the character's pose proportions and general appearance while preserving their exact facial features hair color and style eye color skin tone facial structure and any distinctive features like freckles dimples or tooth gap. The person wears a vibrant superhero costume with cape and emblem standing in a heroic pose with dynamic lighting rendered in one of these randomly selected styles classic American comic book style with dramatic shadows muscular heroic proportions and cinematic lighting or modern 3D animation style with expressive features warm lighting and family-friendly appeal or Japanese manga superhero style with dynamic action lines and large expressive eyes scaled to match original or animated TV series style with bold geometric shapes and strong jaw lines or multiverse comic style with halftone effects and multiple art styles blended or traditional comic illustration style with dot patterns and bold ink outlines or action cartoon style with angular designs and vibrant colors. Place the superhero in one of these randomly selected backgrounds city skyline at sunset or action scene mid-flight or hero landing pose with impact effects or standing atop building with cape flowing or power effects surrounding them or cosmic space background or training facility. The superhero version must be immediately recognizable as the same person from the reference image just illustrated and empowered with superhero elements maintaining authentic appearance while adding heroic costume and setting.",
  },
  lego: {
    title: "Lego",
    description: "Reconstruct in the distinctive blocky Lego brick style.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt:
      "The scene should be set in a vibrant, playful Lego world with colorful, modular Lego environments such as brick-built trees, buildings, and vehicles. Transform into a custom Lego minifigure that accurately matches real-life features. Carefully replicate the hair style (using the closest matching Lego hairpiece), skin tone (adapted to Lego colors but faithful to real tone), eye color, and visible dental traits. The Lego minifigure should reflect the clothing style and selected theme in a fun, blocky Lego way while maintaining unmistakable likeness. Ensure the Lego character is smiling joyfully. The tone must remain colorful, whimsical, imaginative, and true to a Lego world, with full visual likeness preserved.",
  },
  coloringBook: {
    title: "Coloring Book",
    description:
      "Transform any image into a clean, black and white coloring book page with clear outlines perfect for coloring - works with people, objects, landscapes, or any scene.",
    placeholder: "E.g., Turn this into a coloring book page",
    suggestedPrompt:
      "Transform this image into a professional coloring book style illustration with these specific requirements:\n\n1. Line art conversion:\n   - Convert to pure black outlines on white background\n   - Create clean, smooth, continuous lines\n   - Line thickness should be consistent and bold enough for coloring\n   - Remove all colors, shading, and fills - outlines only\n   - Ensure all shapes are fully enclosed for easy coloring\n\n2. Detail level:\n   - Simplify complex textures into drawable patterns\n   - Convert gradients and shadows into distinct outlined areas\n   - Break down complicated elements into clear, colorable sections\n   - Add decorative patterns where appropriate (hair, clothing, backgrounds)\n   - Include enough detail to be interesting but not overwhelming\n\n3. Composition:\n   - Maintain the original composition and all subjects\n   - Ensure all elements are clearly defined and separated\n   - Add simple background elements if original background is plain\n   - Create distinct boundaries between different areas\n   - Keep proportions accurate to original image\n\n**CRITICAL REQUIREMENTS:**\n- Output must be pure black lines on white background\n- NO grayscale, NO shading, NO filled areas\n- All lines must connect properly to create enclosed spaces\n- Line weight should be uniform and suitable for coloring\n- Maintain recognizable features of all subjects\n- Suitable for both children and adults to color\n- Clear, crisp lines without sketchy or rough edges\n\n**ABSOLUTELY DO NOT:**\n- Include any colors or gray tones\n- Leave any areas filled in or shaded\n- Create lines too thin or too thick for coloring\n- Make it too complex or too simple\n- Lose important details from the original\n- Add realistic shading or gradients\n- Leave open gaps in outline shapes",
  },
  "custom-cartoon": {
    title: "Create Your Own Cartoon",
    description: "Describe your own custom cartoon transformation.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: "",
  },
};
// Painting subcategories
export const PAINTING_STYLES: Record<PaintingSubcategory, StyleOption> = {
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
export const ERA_STYLES: Record<EraSubcategory, StyleOption> = {
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
      "Using the uploaded photo as your sole reference, generate an authentic 1990s hip-hop–style portrait that maintains the subject's exact skin tone, facial features, and expression. Do not alter any aspect of their natural complexion. Apply the following:• Fashion & Accessories: Convert clothing into iconic '90s hip-hop fashion—baggy jeans, oversized sports jerseys, branded tracksuits, Timberland boots, or streetwear with bold logos and bright colors. Add chunky gold chains, door-knocker earrings, snapback caps at angles, bandanas, or sports team apparel.• Hairstyles: Style hair in era-specific trends (high-top fades, box braids, flat tops, etc.), adapted to the subject's original hair texture and color.• Setting: Place against a graffiti-tagged wall,Enhance My Prompt with AI basketball court, city street, or similar urban backdrop.• Color & Lighting: Emulate slightly overexposed flash photography and '90s film/video color effects—saturated hues, light film grain, and high-contrast look—while keeping all skin tones exactly as in the source.The result should capture the bold, expressive aesthetic of '90s hip-hop culture without changing the subject's natural skin color or identity.",
  },
  "1980s": {
    title: "1980s",
    description:
      "Vibrant neon aesthetics, distinctive fashion, and visual style of the 1980s era.",
    placeholder: "E.g., Add 80s fashion, hairstyle, and background",
    suggestedPrompt:
      "Transform this image into an authentic 1980s version while keeping the exact same environment and setting from the original photo. Preserve all facial features hair texture eye color skin tone and facial structure completely unchanged ensuring the people remain instantly recognizable as themselves. Apply 80s photography characteristics including high saturation film grain slight soft focus and that distinctive 80s flash photography look with warm tones. Update only the clothing to period appropriate 80s fashion like Members Only jackets shoulder pads acid wash denim neon windbreakers leg warmers or power suits while maintaining the original pose and body position. Add subtle 80s styling elements like feathered hair edges teased volume scrunchies headbands or styling gel effects without changing the actual hair color or length. Include period accessories naturally integrated into the scene such as Walkman headphones chunky watches plastic jewelry or wayfarers. Apply an 80s photo filter that mimics the color processing and slight overexposure common in 80s photography. The original background and environment must remain exactly the same just with the vintage photo quality applied. The final result should look like an authentic photo taken in the 1980s in the same location with the same people just dressed and styled for that era.",
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
      "Transform the uploaded photo of a person or couple into a 1970s disco scene, altering only their hair, clothing, and background—do not change any facial features or body proportions.  \n1. **Isolate regions**  \n   - Use the image's hair mask to replace hairstyles.  \n   - Use the clothing mask to swap in disco outfits.  \n   - Use a background mask to recreate a dance‐floor setting.  \n2. **Preserve identity**  \n   - Keep all facial attributes (skin tone, bone structure, eye color & shape, lip shape, expression) exactly as in the original—no age shifts, no new wrinkles or blemishes.  \n   - Maintain original body posture and proportions.  \n3. **Randomize key disco elements** (choose one per run):  \n   - **Hair style:** classic rounded afro | feathered shag with curtain bangs | voluminous blowout waves  \n   - **Outfit:** sequin jumpsuit with flared legs | polyester wrap dress with geometric prints | satin shirt with wide collar + bell-bottom trousers  \n   - **Accessory:** mirrored aviator sunglasses | wide paisley headband | metallic platform shoes  \n4. **Background & lighting**  \n   - Place the subjects on a reflective dance floor with a spinning disco ball overhead.  \n   - Add colored spotlights (amber, magenta, teal) and subtle lens flares.  \n5. **Seamless integration**  \n   - Blend shadows, highlights, and color cast so the new hair, clothes, and background look like one cohesive photograph.  \n6. **Negative constraints** (do **not**):  \n   - Alter any facial detail, skin texture, or age cues.  \n   - Change body poses, hand positions, or cropping.  \n   - Introduce modern elements (smartphones, modern jewelry, contemporary hairstyles).",
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

export const OTHER_STYLES: Record<OtherSubcategory, StyleOption> = {
  mullets: {
    title: "Mullets",
    description:
      "It's well known that everyone secretly wants to look like Joe Dirt.",
    placeholder: "E.g., Make my mullet more dramatic with volume",
    suggestedPrompt:
      "Transform the uploaded photo by replacing only the hair region with an iconic mullet hairstyle.\n1. Use the image's hair mask to isolate the hair—do not touch the face, body, clothing, or background.\n2. Match the original hair color, texture, and density exactly.\n3. Randomly choose one of these top-hair styles for each run:\n   - curly, teased volume\n   - short, textured spikes\n   - feathered, classic '80s layers\n   - sleek, modern taper\n4. In every variation, the back must be noticeably longer than the front (\"business in front, party in back\").\n5. Preserve **all** facial attributes exactly as in the original, including:\n   - Skin tone and smoothness (no new wrinkles, age spots, or blemishes)\n   - Facial proportions and bone structure\n   - Eye color, eye shape, lips, and expression\n   - Age appearance (do **not** make the subject look older or younger)\n6. Seamlessly blend shadows, highlights, and lighting so the new hair looks like part of the original photograph.\n\n**Negative constraints** (do **not**):\n- Alter any aspect of the face, skin texture, or age cues.\n- Introduce wrinkles, sagging, or any aging artifacts.\n- Change posture, clothing, background, or cropping.",
  },
  hulkamania: {
    title: "Hulkamania",
    description:
      "Transform into the iconic Hulk Hogan look with blonde mustache, red bandana, and wrestling attitude.",
    placeholder: "E.g., Add more wrestling accessories or background elements",
    suggestedPrompt:
      "Apply ONLY these specific costume overlays to the uploaded photo. Do NOT alter the person's features:\n\n1. Hair color change:\n   - Change visible hair color to platinum blonde\n   - Apply to all hair showing beneath the bandana\n   - Keep the person's natural hair length and style\n   - If hair is short, keep it short but blonde\n   - If hair is long, keep it long and blonde\n\n2. Red bandana do-rag style:\n   - Place red bandana as a full do-rag covering the top of head\n   - Should cover from forehead to crown like a skull cap\n   - Include 'HULKAMANIA' in bold yellow text across the front\n   - Bandana should have realistic fabric folds and texture\n\n3. Mustache overlay:\n   - ADD a blonde horseshoe mustache as an overlay\n   - Size it proportionally to the person's face\n   - Blend naturally but keep as an addition, not a transformation\n\n4. Clothing replacement:\n   - Replace ONLY the clothing with a yellow tank top\n   - Add 'HULK RULES' in red block letters on the chest\n   - Fit the tank to the person's exact body shape\n\n**CRITICAL PRESERVATION RULES:**\n- Do NOT alter facial features, bone structure, or expressions\n- Keep the person's exact face, just add the mustache\n- Preserve their natural body shape and size completely\n- Maintain their original skin tone and texture\n- The person should still look like themselves in costume\n- NEVER change eyes, eye color, eye shape, or eyelids\n- NEVER alter the nose shape, size, or nostrils\n- NEVER modify teeth, smile, or mouth shape\n\n**ABSOLUTELY DO NOT:**\n- Change face shape or features\n- Alter body proportions or chest size\n- Make the person look more masculine/feminine\n- Age or de-age the person\n- Change their natural build or physique\n- Modify eyes, eye color, nose, or teeth in any way",
  },
  babyMode: {
    title: "Baby Mode",
    description:
      "Transform into an adorable baby version of yourself - same clothes, same style, just tiny and cute with all your distinctive features preserved in miniature form.",
    placeholder: "E.g., Turn me into a baby wearing my exact outfit",
    suggestedPrompt:
      "Transform the person in this image into a realistic baby (approximately 6-12 months old) while preserving ALL distinctive features and clothing:\n\n1. Clothing preservation:\n   - Keep EXACT same outfit in miniature baby sizes\n   - Preserve all visible clothing items perfectly\n   - Maintain identical colors, patterns, logos, and details\n   - Include ALL accessories: jewelry, glasses, hats, etc.\n   - Clothes should fit naturally on baby body\n\n2. Physical features to maintain:\n   - Keep exact same eye color and eye shape characteristics\n   - Preserve skin tone precisely\n   - Adapt hair to baby-appropriate length but keep same color/texture\n   - Maintain recognizable facial structure in baby proportions\n   - If wearing glasses, include baby-sized glasses\n\n3. Expression and pose:\n   - Capture the person's expression in baby form\n   - Adapt pose to be baby-appropriate while maintaining essence\n   - If standing, show baby standing/supported\n   - If sitting, show baby in similar position\n\n**CRITICAL PRESERVATION RULES:**\n- The baby must wear the COMPLETE original outfit\n- Maintain all unique identifying features\n- Keep exact same clothing details, just sized for baby\n- Preserve distinctive characteristics (freckles as subtle markings, etc.)\n- Result should be immediately recognizable as baby version of this person\n- NEVER change eye color or distinctive features\n- NEVER omit any clothing items or accessories\n- NEVER alter the outfit design or colors\n\n**ABSOLUTELY DO NOT:**\n- Remove or change any clothing items\n- Alter eye color or skin tone\n- Add baby clothes that weren't in original\n- Change hair color (only adjust length/volume for baby realism)\n- Lose any distinctive features or characteristics\n- Make generic baby - must be THIS specific person as a baby",
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
    placeholder: "E.g., I want to be the most magnificent cat alive!!",
    suggestedPrompt:
      "Transform the person in this image into a realistic anthropomorphic cat that stands upright and wears the EXACT same outfit as shown in the original image. The cat must be wearing every piece of clothing visible on the person - preserve all clothing items precisely including shirts, jackets, pants, dresses, accessories, jewelry, hats, or any other garments. The clothes should fit the cat's body naturally as if tailored for a cat-human hybrid. For the cat's appearance: Match the fur color to the person's hair (blonde hair = golden/cream fur, brown hair = brown tabby, black hair = black fur, etc.). Preserve the person's exact eye color in the cat's eyes. If the person has unique features like freckles, glasses, or facial hair, adapt these appropriately (freckles as fur markings, glasses on the cat, whisker styling for facial hair).Maintain the person's pose and expression - if they're standing with hands in pockets, show the cat in the same pose with paws in pockets. If sitting cross-legged, show the cat sitting the same way. The final image should clearly be recognizable as a cat version of this specific person, wearing their complete outfit, in their exact pose.",
  },
  caricature: {
    title: "Caricature",
    description:
      "Exaggerated features with humorous intent while maintaining recognition",
    placeholder: "E.g., Exaggerate eyes and mouth for humorous effect",
    suggestedPrompt:
      "Transform into a skillful caricature with exaggerated yet recognizable features. Strategically enlarge the most distinctive facial elements by 20-30% while keeping overall facial arrangement intact. Simplify less important features for contrast with the exaggerated ones. Apply bold, confident pen or marker-style linework with vibrant watercolor or marker-style coloring. Enhance expressiveness with slightly enlarged eyes and exaggerated facial expression. Keep the body proportions smaller relative to the head (about 1:4 ratio). Add subtle details that emphasize personal characteristics, hobbies, or occupation. The final image should be immediately recognizable as the subject while being playful and humorous without crossing into mockery.",
  },
  vampire: {
    title: "Vampire Transformation",
    description:
      "Transform into a classic gothic vampire with pale skin and fangs.",
    placeholder: "E.g., Add dramatic cape and gothic mansion background",
    suggestedPrompt:
      "Transform the person into a classic vampire with pale, porcelain skin, subtle fangs, and piercing eyes with a slight red glow. Add a dramatic black cape with red interior lining. Style the hair in an elegant, timeless fashion. Set against a gothic mansion or castle backdrop with moonlight and fog. Include subtle supernatural elements like bats in the background. Maintain the person's core facial features while adding the vampire aesthetic.",
  },
  "custom-other": {
    title: "Create Your Own",
    description: "Describe your own custom transformation.",
    placeholder:
      "E.g., Make it look like it's underwater with fish swimming around",
    suggestedPrompt: "",
  },
};

// Taylor Swift Era subcategories - Animated Versions
export const TAYLOR_SWIFT_STYLES: Record<TaylorSwiftSubcategory, StyleOption> =
  {
    debut: {
      title: "Country Debut Era (2006)",
      description:
        "Animated country girl aesthetic with curly hair and warm lighting",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a warm, animated illustration in the style of modern digital art. Create a 2006 country music debut aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use warm, golden hour lighting typical of animated films

ANIMATED COUNTRY STYLING:
- Style hair into long, flowing animated curls with movement
- Add subtle side-swept bangs in illustration style
- Create voluminous, bouncy waves using cartoon art techniques
- Apply warm honey-colored highlights in animation style

COUNTRY AESTHETIC:
- Transform clothing into animated sundress or country-style outfit
- Add delicate animated jewelry like small hoops or simple necklaces
- Create modest, wholesome country girl styling in cartoon form
- Use soft fabric textures typical of animation

ANIMATED ATMOSPHERE:
- Apply warm, golden sunset lighting in illustration style
- Create dreamy, slightly oversaturated country filter
- Add soft bokeh background with animated green fields or blue sky
- Include gentle lens flare effects in artistic style
- Apply nostalgic 2006 feel through color grading

COLOR PALETTE:
- Warm yellows and oranges in highlights
- Soft, creamy skin tones in animation style
- Slightly faded, vintage quality
- Emphasize turquoise blues and earthy browns in environment

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create wholesome, country charm like an animated movie
- Use artistic interpretation to capture personality`,
    },
    fearless: {
      title: "Golden Fairytale Era (2008)",
      description:
        "Animated sparkly golden hour with flowing curls and glitter",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a magical animated illustration in the style of modern digital art. Create a golden, fairytale-inspired aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use magical, ethereal lighting typical of fairy tale animations

ANIMATED GOLDEN TRANSFORMATION:
- Style hair into bouncy animated curls with magical movement
- Create windswept effect as if caught mid-twirl in cartoon style
- Add sparkly hair accessories and animated glitter effects
- Use flowing, dynamic hair animation techniques

FAIRYTALE WARDROBE:
- Transform clothing into flowing, golden animated fabric
- Add sparkles, sequins, and glittery elements in illustration style
- Create movement in fabric as if dancing in animated form
- Use rich, magical textures typical of fantasy animation

GOLDEN ANIMATED ATMOSPHERE:
- Bathe entire image in warm, golden sunset lighting
- Create dreamy, ethereal glow around the subject
- Add animated light leaks and golden lens flares
- Apply soft, romantic focus with gentle motion blur effects

MAGICAL ELEMENTS:
- Create abstract golden bokeh background in animation style
- Add floating sparkles and light particles
- Include animated sunset colors bleeding into frame
- Use rich golds and champagnes throughout

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create magical, fairytale quality like a Disney princess movie
- Use artistic interpretation to capture joyful personality`,
    },
    "speak-now": {
      title: "Purple Fantasy Era (2010)",
      description:
        "Animated purple fantasy with flowing hair and enchanted atmosphere",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into an enchanted animated illustration in the style of modern digital art. Create a purple-themed fantasy aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use mystical, theatrical lighting typical of fantasy animations

ANIMATED FANTASY STYLING:
- Transform hairstyle into long, flowing animated waves
- Add volume and dramatic movement in illustration style
- Create fairy-tale princess styling using cartoon techniques
- Include purple accessories or animated flowers in hair

PURPLE WONDERLAND:
- Drape subject in flowing purple animated fabric or gown
- Add layers of tulle or chiffon in illustration style
- Include sparkles and shimmer throughout clothing
- Create dramatic fabric movement using animation techniques

ENCHANTED ATMOSPHERE:
- Apply theatrical, stage-like lighting in cartoon style
- Create purple and lavender color wash throughout environment
- Add mystical, enchanted forest feel in animation style
- Include soft spotlighting effects

MAGICAL BACKGROUND:
- Transform background into animated purple gradient
- Add swirling mists and smoke effects in cartoon style
- Include subtle sparkles floating in air
- Create dreamy, fantastical atmosphere

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create whimsical, storybook quality like an animated fantasy film
- Use artistic interpretation to capture graceful personality`,
    },
    red: {
      title: "Autumn Romance Era (2012)",
      description: "Animated autumn vibes with vintage waves and red lips",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a romantic animated illustration in the style of modern digital art. Create an autumn-themed aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use warm, nostalgic lighting typical of romantic animations

ANIMATED SIGNATURE ELEMENTS:
- Apply bold red lipstick in illustration style
- Style hair into vintage-inspired animated waves
- Create sophisticated 1940s-style hair waves using cartoon techniques
- Add classic, timeless beauty in animation form

AUTUMN ANIMATED ATMOSPHERE:
- Create warm, fall-themed color grading in illustration style
- Add vintage film grain texture effect
- Apply slightly desaturated, nostalgic filter
- Include warm orange and red color cast

ROMANTIC WARDROBE:
- Transform clothing to include red elements in animation style
- Create vintage-inspired styling (scarves, coats) in cartoon form
- Add cozy autumn textures using illustration techniques

AUTUMN BACKGROUND:
- Transform background to animated autumn leaves or soft bokeh
- Add falling leaves effect in cartoon style
- Create melancholic, wistful atmosphere
- Include warm, diffused lighting

COLOR PALETTE:
- Deep burgundy reds in clothing/accessories
- Burnt oranges in environment
- Golden yellows in lighting
- Rich browns in background

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create romantic, vintage quality like a classic animated film
- Use artistic interpretation to capture sophisticated personality`,
    },
    "nineteen-eighty-nine": {
      title: "Polaroid Pop Era (2014)",
      description:
        "Animated Polaroid aesthetic with sleek hair and urban vibes",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a stylish animated illustration in the style of modern digital art. Create a Polaroid-inspired pop aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use cool, urban lighting typical of contemporary animations

ANIMATED POLAROID STYLING:
- Frame image with animated white Polaroid-style border
- Apply instant camera color grading in illustration style
- Create slightly washed-out, dreamy quality
- Add subtle light leaks on edges in cartoon style

SIGNATURE ANIMATED LOOK:
- Apply bold red or pink lipstick in illustration style
- Style hair in sleek animated bob or pulled back style
- Create clean, minimalist aesthetic using cartoon techniques
- Apply soft, diffused lighting

URBAN ATMOSPHERE:
- Suggest city backdrop in animation style without overwhelming
- Add cool blue undertones to environment
- Create sophisticated, urban feel
- Include subtle lens flare effects

POLAROID COLOR TREATMENT:
- Slightly overexposed highlights in illustration style
- Faded, vintage color palette in background
- Cool blues and soft pinks throughout environment
- Create instant camera aesthetic

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create intimate, candid feeling like an animated music video
- Use artistic interpretation to capture cool, confident personality`,
    },
    reputation: {
      title: "Dark Snake Era (2017)",
      description:
        "Animated dark, edgy aesthetic with slicked hair and snake motifs",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a dramatic animated illustration in the style of modern digital art. Create a dark, edgy aesthetic with snake motifs:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with dramatic shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use intense, moody lighting typical of thriller animations

ANIMATED MONOCHROME TREATMENT:
- Convert to high-contrast black and white illustration
- Create dramatic shadows and highlights in cartoon style
- Apply gritty, editorial texture effect
- Add film noir quality using animation techniques

EDGY ANIMATED STYLING:
- Slick hair back or create wet-look styling in illustration form
- Add dark, dramatic makeup effects in cartoon style
- Create sharp, defined edges using animation techniques
- Apply intense, moody lighting

NEWSPAPER AESTHETIC:
- Overlay subtle newsprint texture in animation style
- Add typography elements around edges
- Create collage-like effect with text
- Include halftone dot pattern subtly

SNAKE MOTIFS:
- Add subtle snake-scale textures in background in cartoon style
- Include serpentine shapes in shadows
- Create mysterious, dangerous atmosphere
- Add metallic, reptilian highlights to environment

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create dark, edgy quality like a noir animated film
- Use artistic interpretation to capture fierce, confident personality`,
    },
    lover: {
      title: "Pastel Dream Era (2019)",
      description:
        "Animated pastel paradise with romantic waves and heart makeup",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a dreamy animated illustration in the style of modern digital art. Create a pastel paradise aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use warm, soft lighting typical of animated films

SIGNATURE ANIMATED HEART:
- Paint a sparkly heart shape around one eye in artistic illustration style
- Use stylized glitter effect with animated sparkles
- Apply pink and iridescent colors in cartoon art style
- Make it look like magical face paint in an animated world
- Add twinkling star effects around the heart
- Create dimensional shading using illustration techniques

PASTEL ANIMATED PARADISE:
- Transform background into dreamy animated clouds
- Use soft cartoon sky with cotton candy textures
- Apply gentle pastel gradient (pinks, blues, purples, yellows)
- Add floating animated elements like hearts and butterflies
- Include magical sparkles drifting through the air
- Create storybook illustration atmosphere

ANIMATED HAIR STYLING:
- Style hair with gentle animated waves and movement
- Add pastel highlights in illustration style
- Include magical sparkles throughout the hair
- Use smooth, flowing lines typical of animation
- Apply soft cartoon shading and highlights

ILLUSTRATION COLOR PALETTE:
- Use vibrant but soft pastel colors
- Apply cartoon-style lighting and shading
- Create glowing, luminous skin in illustration style
- Add magical aura effects around the subject
- Use artistic color blending techniques

WHIMSICAL ANIMATED ELEMENTS:
- Add floating hearts with gentle animation-style glow
- Include cartoon butterflies with soft wing details
- Create lens flare effects in artistic illustration style
- Apply magical fairy-tale atmosphere
- Use soft focus effects typical of animated films
- Add prismatic light beams in cartoon style

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create magical, dreamy quality like a Disney movie still
- Use artistic interpretation to capture personality rather than exact realism`,
    },
    folklore: {
      title: "Indie Forest Era (2020)",
      description: "Animated cottagecore forest aesthetic with natural braids",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a serene animated illustration in the style of modern digital art. Create an indie folk forest aesthetic:

    ANIMATION STYLE:
    - Convert to smooth, stylized digital illustration style
    - Use clean vector-like artwork with soft shading
    - Apply cartoon/animated character proportions while maintaining ALL recognizable features
    - Create painterly, artistic interpretation rather than photorealistic rendering
    - Use natural, muted lighting typical of indie animations
    - PRESERVE EXACT facial features, bone structure, eye color, and natural hair color

    DISTANT FOREST COMPOSITION:
    - Position subject further back in the forest scene, creating depth and atmosphere
    - Show them as a figure walking through or sitting in the woodland setting
    - Create a wider shot that includes more of the forest environment
    - Use cinematic framing like a Studio Ghibli establishing shot
    - Make the person a focal point but integrated into the larger forest scene

    ANIMATED COTTAGECORE STYLING:
    - Transform hair into loose, natural animated braids using EXACT original hair color
    - Add messy, effortless texture in illustration style while maintaining natural color
    - Create woodland fairy aesthetic using cartoon techniques
    - Include small braids or twisted sections in original hair color
    - NEVER change the natural hair color - preserve it exactly in animated form

    FOREST ATMOSPHERE:
    - Desaturate environment to muted, earthy tones in animation style
    - Create moody, overcast lighting filtering through trees
    - Add misty, ethereal quality using illustration techniques
    - Include soft, natural shadows and dappled light
    - Show tall trees, fallen logs, moss, and forest floor details
    - Create sense of being deep in the woods

    COZY WARDROBE:
    - Transform clothing to chunky knit cardigan in animation style
    - Add cream or gray tones using cartoon techniques
    - Create cozy, rustic textures in illustration form
    - Include vintage, handmade quality
    - Add boots suitable for forest walking

    ENHANCED WOODLAND BACKGROUND:
    - Transform setting to expansive animated deep forest with layers of depth
    - Add fog and mist effects weaving between trees in cartoon style
    - Include detailed forest elements: tree trunks, branches, leaves, ferns
    - Create mysterious, isolated feeling with atmospheric perspective
    - Show forest path or clearing where subject is positioned
    - Add subtle wildlife elements like birds or butterflies

    COLOR PALETTE:
    - Muted grays and creams in clothing
    - Soft forest greens in environment with multiple tonal variations
    - Earthy browns in tree trunks and forest floor
    - Natural, organic color scheme with depth
    - Preserve subject's exact natural coloring

    FINAL ARTISTIC TOUCHES:
    - Maintain the essence and EXACT recognizability of the original person
    - Apply consistent animated art style throughout while preserving identity
    - Create peaceful, introspective quality like a Studio Ghibli establishing shot
    - Use artistic interpretation to capture contemplative personality
    - Ensure the subject remains clearly visible and recognizable despite being further in the scene`,
    },
    evermore: {
      title: "Rustic Woods Era (2020)",
      description: "Animated autumn woods with flowing waves and golden light",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a warm animated illustration in the style of modern digital art. Create a rustic woodland aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use golden, nostalgic lighting typical of autumn animations

RUSTIC STYLING:
- Transform hair into loose, flowing animated waves
- Add plaid or flannel clothing elements in cartoon style
- Create rustic, outdoorsy look using illustration techniques
- Apply natural, minimal makeup effect

AUTUMN WOODS ATMOSPHERE:
- Create golden hour forest lighting in animation style
- Add warm, amber tones to environment
- Include falling leaves effect in cartoon form
- Create cozy cabin atmosphere

TEXTURAL ELEMENTS:
- Add film grain for vintage feel in illustration style
- Create soft, nostalgic focus
- Include warm light leaks using animation techniques
- Apply subtle sepia toning to environment

WOODLAND BACKGROUND:
- Transform to animated autumn forest setting
- Add golden sunlight filtering through trees
- Create intimate, storytelling mood
- Include rustic, natural elements

COLOR STORY:
- Rich oranges and reds in environment
- Deep forest greens in background
- Warm browns and golds in lighting
- Cozy, autumnal color palette

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create intimate, storytelling quality like an animated indie film
- Use artistic interpretation to capture warm, nostalgic personality`,
    },
    midnights: {
      title: "Lavender Haze Era (2022)",
      description: "Animated 70s glamour with sleek hair and jewel tones",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a glamorous animated illustration in the style of modern digital art. Create a midnight-themed aesthetic:

    ANIMATION STYLE:
    - Convert to smooth, stylized digital illustration style
    - Use clean vector-like artwork with soft shading
    - Apply cartoon/animated character proportions while maintaining recognizable features
    - Create painterly, artistic interpretation rather than photorealistic rendering
    - Use moody, late-night lighting typical of retro animations

    ICONIC MIDNIGHTS LIGHTER:
    - Include a vintage-style lighter as a key prop in the scene
    - Show subject holding or positioned near the lighter
    - Create warm, flickering flame effect in animation style
    - Use the lighter flame as a key light source illuminating the face
    - Add mystical, midnight atmosphere around the lighter
    - Make the lighter prominent but artistic, fitting the aesthetic

    ANIMATED RETRO GLAMOUR:
    - Apply sparkly, jewel-toned eyeshadow in illustration style
    - Add subtle glitter effects in cartoon form
    - Create 70s-inspired makeup look using animation techniques
    - Include dramatic eye makeup with animated sparkles
    - Use warm lighter flame to create golden highlights on face

    MIDNIGHT ATMOSPHERE:
    - Apply deep blue and purple color grading in animation style
    - Create moody, late-night lighting
    - Add subtle blur for dreamy quality
    - Include vintage 70s film texture effect

    ANIMATED 70S STYLING:
    - Style hair in sleek animated 70s waves
    - Transform clothing to include sparkles/sequins in cartoon style
    - Add jewel-toned fabric effects
    - Create disco-era inspired elements

    CELESTIAL EFFECTS:
    - Add clock or time-related motifs subtly in animation style
    - Create starry night elements in background
    - Include moon and celestial touches
    - Apply retro color correction

    FINAL ARTISTIC TOUCHES:
    - Maintain the essence and recognizability of the original person
    - Apply consistent animated art style throughout
    - Create mysterious, glamorous quality like a retro animated music video
    - Use artistic interpretation to capture confident, dreamy personality`,
    },
    ttpd: {
      title: "Poet's Department Era (2024)",
      description: "Animated minimalist black & white with understated styling",
      placeholder: "E.g., Add specific details about the transformation",
      suggestedPrompt: `Transform the uploaded image into a contemplative animated illustration in the style of modern digital art. Create a minimalist poetic aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with soft shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use soft, contemplative lighting typical of artistic animations

ANIMATED MONOCHROME ARTISTRY:
- Convert to sophisticated black and white illustration
- Create soft, artistic shadows in cartoon style
- Apply fine art photography style using animation techniques
- Add subtle grain texture effect

MINIMALIST STYLING:
- Style hair in simple, understated way in animation form
- Transform clothing to basic black/white using cartoon techniques
- Add vulnerable, raw quality
- Include intimate, personal feeling

POETIC ATMOSPHERE:
- Create moody, contemplative lighting in illustration style
- Add typewriter or manuscript elements
- Include subtle ink stain effects
- Apply literary, artistic quality

ARTISTIC COMPOSITION:
- Use dramatic negative space in animation style
- Create introspective mood
- Add slight motion blur for emotion
- Include artistic, editorial framing

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create emotional, raw quality like an artistic animated short film
- Use artistic interpretation to capture vulnerable, introspective personality`,
    },
    "eras-tour-concert": {
      title: "Stadium Tour Era",
      description: "Animated pop star performing at a massive stadium tour",
      placeholder: "E.g., Add specific concert details or era elements",
      suggestedPrompt: `Transform the uploaded image into an epic animated illustration in the style of modern digital art. Create a stadium tour performance aesthetic:

ANIMATION STYLE:
- Convert to smooth, stylized digital illustration style
- Use clean vector-like artwork with dramatic shading
- Apply cartoon/animated character proportions while maintaining recognizable features
- Create painterly, artistic interpretation rather than photorealistic rendering
- Use spectacular concert lighting typical of animated performances

ANIMATED CONCERT OUTFIT:
- Transform clothing into sparkly animated performance attire
- Add rhinestones and sequins in illustration style
- Use vibrant colors: pink, blue, gold, and silver
- Create flowing, dynamic costume using cartoon techniques

SIMPLIFIED STADIUM ATMOSPHERE:
- Position subject as a distant animated figure on a large stage
- Create dramatic stage lighting with animated spotlights
- Show dark silhouetted crowd with scattered twinkling phone lights
- Add large LED screens in background in cartoon style
- Include atmospheric fog/haze effects
- Use pink, purple, and blue stage lighting beams

ANIMATED CROWD ELEMENTS:
- Show crowd as dark silhouettes with glimmering phone lights
- Create a sea of tiny light points in animation style
- Keep crowd simple and atmospheric rather than detailed
- Add soft glow from LED screens
- Focus on magical lighting atmosphere

PERFORMANCE ENERGY:
- Capture confident performance pose in animation style
- Show dynamic movement using cartoon techniques
- Add motion blur effects while maintaining clarity
- Include animated confetti or sparkles falling

FINAL ARTISTIC TOUCHES:
- Maintain the essence and recognizability of the original person
- Apply consistent animated art style throughout
- Create spectacular, larger-than-life quality like an animated concert film
- Use artistic interpretation to capture performance energy and charisma`,
    },
  };

// Popular subcategories that should have rainbow borders
const POPULAR_SUBCATEGORIES = {
  other: ["mullets", "babyMode", "self-as-cat"] as OtherSubcategory[],
  // Can add more categories later if needed
  // cartoon: ["super-mario", "pixar"] as CartoonSubcategory[],
  // era: ["90s-hip-hop", "1980s"] as EraSubcategory[],
};

// Function to check if a subcategory is popular
const isPopularSubcategory = (
  category: string,
  subcategory: string,
): boolean => {
  switch (category) {
    case "other":
      return POPULAR_SUBCATEGORIES.other.includes(
        subcategory as OtherSubcategory,
      );
    // Add more cases as needed
    default:
      return false;
  }
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
  const [imageSize, setImageSize] = useState<"default" | "mobile" | "square">(
    "square",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [randomTip, setRandomTip] = useState("");
  const [uploadedReferenceImage, setUploadedReferenceImage] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transformation selection state
  const [primaryCategory, setPrimaryCategory] =
    useState<TransformationType | null>(
      selectedTransformation ||
        (savedStyle?.category as TransformationType) ||
        null,
    );

  // Subcategory selections
  const [cartoonSubcategory, setCartoonSubcategory] =
    useState<CartoonSubcategory | null>(null);
  const [paintingSubcategory, setPaintingSubcategory] =
    useState<PaintingSubcategory | null>(null);
  const [eraSubcategory, setEraSubcategory] = useState<EraSubcategory | null>(
    null,
  );
  const [otherSubcategory, setOtherSubcategory] =
    useState<OtherSubcategory | null>(null);
  const [taylorSwiftSubcategory, setTaylorSwiftSubcategory] =
    useState<TaylorSwiftSubcategory | null>(null);
  // No pop culture subcategory needed

  // Determine subcategory options based on primary category
  const getSubcategoryOptions = () => {
    switch (primaryCategory) {
      case "cartoon":
        return Object.keys(CARTOON_STYLES) as CartoonSubcategory[];
      case "painting":
        return Object.keys(PAINTING_STYLES) as PaintingSubcategory[];
      case "era":
        return Object.keys(ERA_STYLES) as EraSubcategory[];
      case "other":
        return Object.keys(OTHER_STYLES) as OtherSubcategory[];
      case "taylor-swift":
        return Object.keys(TAYLOR_SWIFT_STYLES) as TaylorSwiftSubcategory[];
      case "kids-real":
        // No subcategories for kids-real
        return [];
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
      // Make sure we're using the EXACT prompt from the saved style
      // without any modifications or truncation
      setPromptText(savedStyle.prompt);

      // Handle style category
      if (savedStyle.category) {
        console.log(
          "Setting primary category to",
          savedStyle.category,
          "from saved style",
        );
        setPrimaryCategory(savedStyle.category as TransformationType);
      }

      // Special handling for mullets saved style
      if (savedStyle.title === "Mullets") {
        console.log(
          "Setting primary category to other and subcategory to mullets from saved style",
        );
        setPrimaryCategory("other");
        setOtherSubcategory("mullets");

        // Ensure we're using the full mullet prompt
        const mulletPrompt = OTHER_STYLES.mullets.suggestedPrompt;
        console.log("Setting full mullet prompt:", mulletPrompt);
        setPromptText(mulletPrompt);
      }

      // Special handling for hulkamania saved style
      if (savedStyle.title === "Hulkamania") {
        console.log(
          "Setting primary category to other and subcategory to hulkamania from saved style",
        );
        setPrimaryCategory("other");
        setOtherSubcategory("hulkamania");

        // Ensure we're using the full hulkamania prompt
        const hulkamaniaPrompt = OTHER_STYLES.hulkamania.suggestedPrompt;
        console.log("Setting full hulkamania prompt:", hulkamaniaPrompt);
        setPromptText(hulkamaniaPrompt);
      }
    }
  }, [savedStyle]);

  // Handle form submission
  const handleSubmit = () => {
    if (!promptText.trim()) {
      toast({
        title: "Prompt required",
        description:
          "Please enter a description of how to transform the image.",
        variant: "destructive",
      });
      return;
    }

    // Log the exact prompt being submitted for debugging
    console.log("Submitting prompt from PromptInput:", promptText);
    console.log("Prompt length:", promptText.length);

    // Special handling for category-specific prompts
    let finalPrompt = promptText;

    // Check if this is a coloring book transformation - treat it like any other style
    if (
      primaryCategory === "cartoon" &&
      cartoonSubcategory === "coloringBook"
    ) {
      finalPrompt = CARTOON_STYLES.coloringBook.suggestedPrompt;
      console.log("Using full coloring book prompt:", finalPrompt);
    }

    // If we're using a mullet transformation, make sure we're sending the full prompt
    if (primaryCategory === "other" && otherSubcategory === "mullets") {
      finalPrompt = OTHER_STYLES.mullets.suggestedPrompt;
      console.log("Using full mullet prompt:", finalPrompt);
    }

    // If we're using a hulkamania transformation, make sure we're sending the full prompt
    if (primaryCategory === "other" && otherSubcategory === "hulkamania") {
      finalPrompt = OTHER_STYLES.hulkamania.suggestedPrompt;
      console.log("Using full hulkamania prompt:", finalPrompt);
    }

    // If we're using a self-as-cat transformation, make sure we're sending the full prompt
    if (primaryCategory === "other" && otherSubcategory === "self-as-cat") {
      finalPrompt = OTHER_STYLES["self-as-cat"].suggestedPrompt;
      console.log("Using full self-as-cat prompt:", finalPrompt);
    }

    // If we're using a babyMode transformation, make sure we're sending the full prompt
    if (primaryCategory === "other" && otherSubcategory === "babyMode") {
      finalPrompt = OTHER_STYLES.babyMode.suggestedPrompt;
      console.log("Using full babyMode prompt:", finalPrompt);
    }

    setIsLoading(true);
    onSubmit(finalPrompt, imageSize);
  };

  // Handle primary category selection
  const handleCategorySelect = (category: TransformationType) => {
    setPrimaryCategory(category);
    // Reset all subcategories when changing the main category
    setCartoonSubcategory(null);
    setPaintingSubcategory(null);
    setEraSubcategory(null);
    setOtherSubcategory(null);
    setTaylorSwiftSubcategory(null);
    // Pop culture reference removed

    // Set default prompt for Kids to Real
    if (category === "kids-real") {
      setPromptText(
        "Transform this children's drawing into a realistic photographic image. Maintain the composition, characters, and key elements from the drawing, but render them in a photorealistic style with natural lighting, proper proportions, and detailed textures. Keep the original colors as a guide but enhance them to look realistic. Add appropriate environmental details and background elements that complement the drawing's theme. The final image should look like a professional photograph that brings the child's drawing to life while preserving its creative essence and charm.",
      );
    }
  };

  // Handle subcategory selections
  const handleCartoonSelect = (subcategory: CartoonSubcategory) => {
    setCartoonSubcategory(subcategory);
    if (subcategory !== "custom-cartoon") {
      setPromptText(CARTOON_STYLES[subcategory].suggestedPrompt);
    }

    // Track subcategory selection with Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "style_applied", {
        event_category: "user_selections",
        category: "cartoon",
        subcategory: subcategory,
        combination: `cartoon_${subcategory}`,
        full_path: `cartoon > ${subcategory}`,
      });
    }
  };

  const handlePaintingSelect = (subcategory: PaintingSubcategory) => {
    setPaintingSubcategory(subcategory);
    if (subcategory !== "custom-painting") {
      setPromptText(PAINTING_STYLES[subcategory].suggestedPrompt);
    }

    // Track subcategory selection with Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "style_applied", {
        event_category: "user_selections",
        category: "painting",
        subcategory: subcategory,
        combination: `painting_${subcategory}`,
        full_path: `painting > ${subcategory}`,
      });
    }
  };

  const handleEraSelect = (subcategory: EraSubcategory) => {
    setEraSubcategory(subcategory);
    if (subcategory !== "custom-era") {
      setPromptText(ERA_STYLES[subcategory].suggestedPrompt);
    }

    // Track subcategory selection with Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "style_applied", {
        event_category: "user_selections",
        category: "era",
        subcategory: subcategory,
        combination: `era_${subcategory}`,
        full_path: `era > ${subcategory}`,
      });
    }
  };

  const handleOtherSelect = (subcategory: OtherSubcategory) => {
    setOtherSubcategory(subcategory);
    if (subcategory !== "custom-other") {
      setPromptText(OTHER_STYLES[subcategory].suggestedPrompt);
    }

    // Track subcategory selection with Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "style_applied", {
        event_category: "user_selections",
        category: "other",
        subcategory: subcategory,
        combination: `other_${subcategory}`,
        full_path: `other > ${subcategory}`,
      });
    }
  };

  const handleTaylorSwiftSelect = (subcategory: TaylorSwiftSubcategory) => {
    setTaylorSwiftSubcategory(subcategory);
    if (subcategory !== "custom-taylor-swift") {
      setPromptText(TAYLOR_SWIFT_STYLES[subcategory].suggestedPrompt);
    }

    // Track subcategory selection with Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "style_applied", {
        event_category: "user_selections",
        category: "taylor-swift",
        subcategory: subcategory,
        combination: `taylor-swift_${subcategory}`,
        full_path: `taylor-swift > ${subcategory}`,
      });
    }
  };

  // Pop culture handler removed

  // Get the current subcategory title and description
  const getCurrentSubcategoryInfo = () => {
    if (primaryCategory === "cartoon" && cartoonSubcategory) {
      return CARTOON_STYLES[cartoonSubcategory];
    } else if (primaryCategory === "painting" && paintingSubcategory) {
      return PAINTING_STYLES[paintingSubcategory];
    } else if (primaryCategory === "era" && eraSubcategory) {
      return ERA_STYLES[eraSubcategory];
    } else if (primaryCategory === "other" && otherSubcategory) {
      return OTHER_STYLES[otherSubcategory];
    } else if (primaryCategory === "taylor-swift" && taylorSwiftSubcategory) {
      return TAYLOR_SWIFT_STYLES[taylorSwiftSubcategory];
      // Pop culture reference removed
    } else if (primaryCategory === "kids-real") {
      // Custom info for kids-real category
      return {
        title: "Sketch to Reality",
        description:
          "Transform children's drawings, simple sketches, or doodles into realistic photographic images while preserving the original composition and creative elements.",
        placeholder:
          "Tip: Upload a simple drawing or sketch and see it transformed into a realistic photograph.",
        suggestedPrompt:
          "Transform this children's drawing into a realistic photographic image. Maintain the composition, characters, and key elements from the drawing, but render them in a photorealistic style with natural lighting, proper proportions, and detailed textures. Keep the original colors as a guide but enhance them to look realistic. Add appropriate environmental details and background elements that complement the drawing's theme. The final image should look like a professional photograph that brings the child's drawing to life while preserving its creative essence and charm.",
      };
    }
    return null;
  };

  // Get the appropriate icon based on the transformation type
  const getCategoryIcon = (category: TransformationType) => {
    switch (category) {
      case "cartoon":
        return <ImageIcon className="h-5 w-5 mr-2" />;
      case "painting":
        return <Paintbrush className="h-5 w-5 mr-2" />;
      case "era":
        return <Clock className="h-5 w-5 mr-2" />;
      case "other":
        return <Sparkles className="h-5 w-5 mr-2" />;
      case "taylor-swift":
        return <Sparkles className="h-5 w-5 mr-2" />;
      case "kids-real":
        return <Baby className="h-5 w-5 mr-2" />;
      // Pop culture case removed
      default:
        return <Wand2 className="h-5 w-5 mr-2" />;
    }
  };

  // Function to check for active subcategory
  const isSubcategoryActive = (category: string, subcategory: string) => {
    switch (category) {
      case "cartoon":
        return cartoonSubcategory === subcategory;
      case "painting":
        return paintingSubcategory === subcategory;
      case "era":
        return eraSubcategory === subcategory;
      case "other":
        return otherSubcategory === subcategory;
      case "taylor-swift":
        return taylorSwiftSubcategory === subcategory;
      // Pop culture case removed
      default:
        return false;
    }
  };

  // Function to get custom prompt placeholder
  const getCustomPlaceholder = () => {
    if (
      primaryCategory === "cartoon" &&
      cartoonSubcategory === "custom-cartoon"
    ) {
      return "Describe your custom cartoon transformation...";
    } else if (
      primaryCategory === "painting" &&
      paintingSubcategory === "custom-painting"
    ) {
      return "Describe your custom painting transformation...";
    } else if (primaryCategory === "era" && eraSubcategory === "custom-era") {
      return "Describe your custom historical era transformation...";
    } else if (
      primaryCategory === "other" &&
      otherSubcategory === "custom-other"
    ) {
      return "Describe your custom transformation...";
      // Pop culture case removed
    } else {
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
      console.log("Requesting prompt suggestion for image:", originalImage);
      const response = await apiRequest("POST", "/api/suggest-prompt", {
        image: originalImage,
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("Received prompt suggestion data:", data);

      if (data && data.prompt) {
        setPromptText(data.prompt);
        toast({
          title: "Prompt suggested",
          description: "AI has analyzed your image and suggested a prompt.",
        });
      } else {
        throw new Error("No prompt returned from the API");
      }
    } catch (error) {
      console.error("Error suggesting prompt:", error);
      toast({
        title: "Error",
        description:
          "Could not generate a prompt suggestion. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setUploadedReferenceImage(result);
          toast({
            title: "Reference image uploaded",
            description: "Your reference image has been added to the prompt.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const currentSubcategoryInfo = getCurrentSubcategoryInfo();
  const subcategoryOptions = getSubcategoryOptions();

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <RainbowButton variant="outline" className="pl-2" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Image Upload
        </RainbowButton>
      </div>

      {/* Show the uploaded image */}
      {originalImage ? (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-md rounded-lg overflow-hidden shadow-md bg-white">
            {/* Debug log for image URL */}
            <img
              src={originalImage}
              alt="Uploaded image"
              className="w-full h-auto object-contain max-h-[400px]"
              onError={(e) => {
                console.error("Image failed to load:", originalImage);
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                e.currentTarget.alt = "Image failed to load";
              }}
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center text-gray-400 my-4">
          No image available
        </div>
      )}

      {/* Step 1: Transformation Category Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">
          Step 1: Select a Transformation Type
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          <Button
            variant={primaryCategory === "other" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "other"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("other")}
          >
            <Sparkles className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Fun/Viral</span>
          </Button>
          <Button
            variant={primaryCategory === "era" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "era"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("era")}
          >
            <Clock className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Pop Culture</span>
          </Button>
          <Button
            variant={primaryCategory === "cartoon" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "cartoon"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("cartoon")}
          >
            <ImageIcon className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Cartoon</span>
          </Button>
          <Button
            variant={primaryCategory === "kids-real" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "kids-real"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("kids-real")}
          >
            <Baby className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Sketch to Reality</span>
          </Button>
          <Button
            variant={primaryCategory === "painting" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "painting"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("painting")}
          >
            <Paintbrush className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Painting</span>
          </Button>
          <Button
            variant={primaryCategory === "taylor-swift" ? "default" : "outline"}
            className={`flex flex-col items-center justify-center h-16 ${
              primaryCategory === "taylor-swift"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => handleCategorySelect("taylor-swift")}
          >
            <Sparkles className="h-5 w-5 mb-1" />
            <span className="text-xs text-center">Taylor Swift Eras</span>
          </Button>
        </div>
      </div>

      {/* Step 2: Subcategory Selection (if applicable) */}
      {primaryCategory && subcategoryOptions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">
            Step 2: Select a{" "}
            {primaryCategory === "era"
              ? "Pop Culture"
              : primaryCategory.charAt(0).toUpperCase() +
                primaryCategory.slice(1)}{" "}
            Style
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {subcategoryOptions.map((key) => {
              let title = "";
              switch (primaryCategory) {
                case "cartoon":
                  title = CARTOON_STYLES[key as CartoonSubcategory].title;
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
                case "taylor-swift":
                  title =
                    TAYLOR_SWIFT_STYLES[key as TaylorSwiftSubcategory].title;
                  break;
                // Pop culture case removed
              }

              let description = "";
              switch (primaryCategory) {
                case "cartoon":
                  description =
                    CARTOON_STYLES[key as CartoonSubcategory].description;
                  break;
                case "painting":
                  description =
                    PAINTING_STYLES[key as PaintingSubcategory].description;
                  break;
                case "era":
                  description = ERA_STYLES[key as EraSubcategory].description;
                  break;
                case "other":
                  description =
                    OTHER_STYLES[key as OtherSubcategory].description;
                  break;
                case "taylor-swift":
                  description =
                    TAYLOR_SWIFT_STYLES[key as TaylorSwiftSubcategory]
                      .description;
                  break;
                // Pop culture case removed
              }

              const isPopular = isPopularSubcategory(primaryCategory, key);

              return (
                <Button
                  key={key}
                  variant={
                    isSubcategoryActive(primaryCategory, key)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => {
                    switch (primaryCategory) {
                      case "cartoon":
                        handleCartoonSelect(key as CartoonSubcategory);
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
                      case "taylor-swift":
                        handleTaylorSwiftSelect(key as TaylorSwiftSubcategory);
                        break;
                      // Pop culture case removed
                    }
                  }}
                  className={`justify-center text-center h-auto py-3 px-3 text-xs font-medium rounded-lg whitespace-normal break-words min-h-[60px] flex items-center ${
                    isSubcategoryActive(primaryCategory, key)
                      ? "bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600"
                      : "text-white bg-gray-800 border-gray-700 hover:bg-gray-700"
                  } ${isPopular ? "rainbow-border" : ""}`}
                  title={description}
                >
                  <span className="text-white relative z-10">{title}</span>
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
          <p className="text-muted-foreground mt-1">
            {currentSubcategoryInfo.description}
          </p>
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
            {currentSubcategoryInfo
              ? "Step 3: Customize Your Prompt"
              : "Step 3: Enter Any Other Details Here"}
          </h2>

          <div className="flex space-x-2">
            <Popover open={showTips} onOpenChange={setShowTips}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center text-xs text-white bg-black"
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
              className="flex items-center text-xs text-white bg-black"
              onClick={handleSuggestPrompt}
              disabled={isLoading || !originalImage}
            >
              <Wand2 className="h-3.5 w-3.5 mr-1" />
              {isLoading ? "Thinking..." : "Enhance My Prompt with AI"}
            </Button>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-50 bg-blue-600 hover:bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold shadow-xl border-2 border-white transition-all duration-200 cursor-pointer hover:scale-105"
            title="Upload reference image"
            type="button"
          >
            <span className="text-white">+</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Textarea
            placeholder={
              currentSubcategoryInfo?.placeholder || getCustomPlaceholder()
            }
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="h-[38px] min-h-[38px] text-base resize-y overflow-hidden focus:min-h-[150px] transition-all leading-[38px] py-0 pl-12 pr-3 border border-gray-300"
            rows={1}
          />
        </div>

        {/* Show uploaded reference image if exists */}
        {uploadedReferenceImage && (
          <div className="mt-2 p-3 bg-muted/50 rounded-lg flex items-start gap-3">
            <img
              src={uploadedReferenceImage}
              alt="Reference"
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Reference image uploaded</p>
              <p className="text-xs text-muted-foreground">
                This image will be used as additional context for your
                transformation.
              </p>
              <button
                onClick={() => setUploadedReferenceImage(null)}
                className="text-xs text-destructive hover:underline mt-1"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {randomTip && (
          <p className="text-sm text-muted-foreground flex items-start">
            <Lightbulb className="h-4 w-4 mr-1 mt-0.5 text-amber-500" />
            <span>
              <span className="font-medium">Tip:</span> {randomTip}
            </span>
          </p>
        )}
      </div>

      {/* Image Size Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium">
          Step {currentSubcategoryInfo ? "4" : "4"}: Choose Image Size
        </h2>
        <div className="flex space-x-2">
          <Button
            variant={imageSize === "mobile" ? "default" : "outline"}
            className={`flex flex-col items-center py-2 px-4 h-auto ${
              imageSize === "mobile"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => setImageSize("mobile")}
          >
            <div className="h-8 w-4 border-2 border-current rounded-sm mb-1 flex items-center justify-center">
              <div className="h-6 w-2 bg-current rounded-sm"></div>
            </div>
            <span className="text-xs">Mobile</span>
            <span className="text-xs opacity-80 mt-1">2:3</span>
          </Button>

          <Button
            variant={imageSize === "square" ? "default" : "outline"}
            className={`flex flex-col items-center py-2 px-4 h-auto ${
              imageSize === "square"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => setImageSize("square")}
          >
            <div className="h-6 w-6 border-2 border-current rounded-sm mb-1 flex items-center justify-center">
              <div className="h-4 w-4 bg-current rounded-sm"></div>
            </div>
            <span className="text-xs">Square</span>
            <span className="text-xs opacity-80 mt-1">1:1</span>
          </Button>

          <Button
            variant={imageSize === "default" ? "default" : "outline"}
            className={`flex flex-col items-center py-2 px-4 h-auto ${
              imageSize === "default"
                ? "bg-secondary text-white"
                : "text-white bg-black"
            }`}
            onClick={() => setImageSize("default")}
          >
            <div className="h-4 w-8 border-2 border-current rounded-sm mb-1 flex items-center justify-center">
              <div className="h-2 w-6 bg-current rounded-sm"></div>
            </div>
            <span className="text-xs">Landscape</span>
            <span className="text-xs opacity-80 mt-1">16:9</span>
          </Button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <RainbowButton
          onClick={handleSubmit}
          disabled={isLoading || !promptText.trim()}
          size="lg"
        >
          {isLoading ? "Processing..." : "Transform Image"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </RainbowButton>
      </div>
    </div>
  );
}
