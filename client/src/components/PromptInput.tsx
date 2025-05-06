import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";

// Icons
import { Paintbrush, Sparkles, Clock, Wand2, Image, Info, Box } from "lucide-react";

// Define categories and styles
export type AnimationSubcategory =
  | "lego-character"
  | "minecraft"
  | "pixar"
  | "mario"
  | "disney-princess"
  | "chibi-anime"
  | "kids-drawing";

export type ArtisticSubcategory =
  | "oil-painting"
  | "watercolor"
  | "comic-book"
  | "pixel-art"
  | "neon-glow"
  | "impressionist"
  | "van-gogh"
  | "cyberpunk"
  | "custom-art";

export type HistoricalSubcategory =
  | "1980s"
  | "90s-hip-hop"
  | "disco"
  | "1950s"
  | "renaissance"
  | "victorian-era"
  | "medieval"
  | "old-western"
  | "ancient-greece"
  | "custom-era";

export type OtherSubcategory =
  | "mullets"
  | "baby-prediction"
  | "future-self"
  | "ghibli-style"
  | "ai-action-figure"
  | "pet-as-human"
  | "self-as-cat"
  | "caricature"
  | "custom-other";

export type ProductSubcategory =
  | "product-advertisement"
  | "perfume-ad"
  | "lifestyle-brand"
  | "book-cover"
  | "album-cover"
  | "shampoo-commercial"
  | "luxury-watch"
  | "car-advertisement"
  | "custom-product";

export type Category =
  | "animation"
  | "historical"
  | "artistic"
  | "product"
  | "other";

export type Subcategory =
  | AnimationSubcategory
  | HistoricalSubcategory
  | ArtisticSubcategory
  | ProductSubcategory
  | OtherSubcategory;

export type StyleOption = {
  title: string;
  description: string;
  placeholder: string;
  suggestedPrompt: string;
};

// Animation styles
const ANIMATION_STYLES: Record<AnimationSubcategory, StyleOption> = {
  "lego-character": {
    title: "LEGO Character",
    description: "Transform into a charming LEGO minifigure",
    placeholder: "E.g., Add a police officer hat",
    suggestedPrompt:
      "Transform into an authentic-looking LEGO minifigure with the characteristic plastic yellow skin, simplified body proportions, and C-shaped hands. Add the distinctive LEGO facial features with simple black eyes and a minimal smile. Include classic LEGO hair or hat piece appropriate to the character. Set against a playful LEGO brick background. The final image should look exactly like an official LEGO minifigure that could exist in a LEGO set while maintaining a clear connection to the original subject.",
  },
  minecraft: {
    title: "Minecraft",
    description:
      "Convert into the iconic blocky, pixelated style of Minecraft",
    placeholder: "E.g., Place me in a Minecraft forest biome",
    suggestedPrompt:
      "Transform into the distinct blocky, pixelated style of Minecraft. Convert all elements into perfectly square cubes with the characteristic 16x16 pixel textures. Adapt clothing and features to match Minecraft's limited palette and simplified designs. Place in a recognizable Minecraft environment such as a forest, desert, or cave setting with appropriate block types. Include subtle Minecraft elements like tools, blocks, or mobs in the background. The final image should look exactly like an authentic Minecraft character or scene while maintaining a clear connection to the original subject.",
  },
  pixar: {
    title: "Pixar Animation",
    description: "Transform into the heart-warming Pixar 3D animation style",
    placeholder: "E.g., Make me look like a Pixar dad character",
    suggestedPrompt:
      "Transform into the distinctive 3D animated style of Pixar. Apply the characteristic exaggerated facial features with expressive, slightly oversized eyes and smooth, simplified skin textures. Convert body proportions to Pixar's stylized but believable form with subtle exaggeration of distinctive features. Add the signature soft lighting with gentle shadows and ambient occlusion typical in Pixar films. Include subtle environmental details that suggest a Pixar movie setting. The final image should look exactly like a character that could appear in a Pixar film while maintaining a clear connection to the original subject.",
  },
  mario: {
    title: "Super Mario World",
    description:
      "Transform into the colorful, blocky style of the Super Mario universe.",
    placeholder: "E.g., Place the name Jack somewhere in the image",
    suggestedPrompt: `Create a colorful 8-bit pixel art scene inspired by classic retro video games. Design a small pixel-style adventurer character (boy or girl) with a playful, confident, or determined expression, sitting or standing on a brown brick platform, holding a glowing orb.

Create a vibrant video game landscape with these specific elements:
- A Super Mario-inspired setting with blue sky, fluffy pixel clouds, green pipes, and iconic block formations
- The background should include 2-3 small mountains, occasional bushes, and one or two small castle structures
- Include 1-2 small enemy characters like Goombas or Koopas in the scene
- Add floating power-up blocks with question marks
- Include classic coins scattered throughout

Please maintain a pure 8-bit/16-bit pixel art aesthetic with square pixels, limited color palette, and no anti-aliasing. The overall composition should be cheerful, adventurous, and immediately recognizable as inspired by classic Nintendo games, particularly Super Mario World.`,
  },
  "disney-princess": {
    title: "Disney Princess",
    description:
      "Transform into a classic Disney princess with magical elements",
    placeholder: "E.g., Add a forest background with animal friends",
    suggestedPrompt:
      "Transform into an authentic Disney princess in the classic 2D animation style from films like Snow White or Sleeping Beauty. Apply the characteristic large, expressive eyes with defined lashes and graceful facial features with a small nose and pronounced lips. Convert clothing to elaborate, flowing princess attire with rich colors and delicate details like ribbons, brocade, and subtle sparkles. Include Disney princess elements like a tiara, magical objects, animal companions, or enchanted background elements. Set against a fairytale background such as a castle, forest, or royal garden. The final image should look exactly like an official Disney princess that could appear in a classic animated Disney film while maintaining a clear connection to the original subject.",
  },
  "chibi-anime": {
    title: "Chibi Anime",
    description: "Transform into an adorable, super-deformed anime character",
    placeholder: "E.g., Add some kawaii accessories",
    suggestedPrompt:
      "Transform into an authentic chibi anime character with the characteristic super-deformed style. Apply the exaggerated proportions with an oversized head (approximately 1/3 of the total height), tiny body, and simplified limbs. Convert facial features to the classic chibi style with large, expressive eyes taking up much of the face, a tiny nose, and a small mouth capable of showing exaggerated emotions. Add chibi-style hair with simplified but recognizable styling that maintains the original hair color. Include anime elements like simple blush marks, sweat drops, or emotion symbols. Set against a simple, colorful background with minimal details. The final image should look exactly like an authentic chibi anime character while maintaining a clear connection to the original subject.",
  },
  "kids-drawing": {
    title: "Child's Drawing",
    description:
      "Transform your photo into a charming, simple drawing as created by a child",
    placeholder: "E.g., Add a rainbow and sun in the corner",
    suggestedPrompt: `Transform this image into a charming, authentic child's drawing that looks like it was created by a 5-7 year old. 

Apply these specific characteristics:
- Simple, uneven line work with visible pencil or crayon-like texture
- Disproportionate features with larger heads and simplified body parts
- Basic shapes for facial features without sophisticated details
- Limited understanding of anatomy and perspective
- Simplified clothing and accessories with basic shapes and bold colors
- Slightly wobbly, imprecise coloring that occasionally goes outside the lines
- Vibrant, unrealistic color choices with minimal shading or blending
- Simplified background with basic elements like a sun, clouds, or grass
- Charming mistakes and quirky additions that reflect a child's imagination

For the background/environment: Keep it simple and complementary. If the drawing appears to be a creature, place it in a fitting natural habitat. If it's an object, place it in a contextually appropriate setting with soft focus.

Feel free to interpret what this might be, but do not add any elements not present in the original drawing. Maintain the exact personality and character of the original creation.`,
  },
};

// Historical era styles
const HISTORICAL_STYLES: Record<HistoricalSubcategory, StyleOption> = {
  "1980s": {
    title: "1980s",
    description:
      "Vibrant neon colors, big hair, shoulder pads, and maximalist style",
    placeholder: "E.g., Add neon background and retro sunglasses",
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
      "Formal, ornate portrait style with sepia tones (1837-1901)",
    placeholder: "E.g., Add Victorian formal wear and props",
    suggestedPrompt:
      "Transform into an authentic Victorian Era (1837-1901) portrait photograph or painting. Apply sepia-toned or muted color palette with formal, composed aesthetic. Convert clothing to period Victorian attire including high collars, corsets, bustles, waistcoats, cravats, petticoats, and formal suits with precisely tailored details. Position the subject in a formal, dignified pose with serious expression against ornate Victorian backdrop featuring heavy drapery, ornate furniture, architectural elements, or formal gardens. Add Victorian accessories like cameo brooches, pocket watches, gloves, top hats, parasols, or walking canes. Include period-appropriate Victorian objects like books, tea sets, family photos, or decorative items that convey status. The final portrait should capture the formal, restrained dignity of Victorian portraiture while maintaining clear likeness to the original subject.",
  },
  medieval: {
    title: "Medieval",
    description:
      "Illuminated manuscript or tapestry style with flat perspective (500-1400)",
    placeholder: "E.g., Add medieval knight armor and a castle",
    suggestedPrompt:
      "Transform into an authentic Medieval Era (500-1400 CE) artwork, resembling illuminated manuscripts or tapestries. Apply flat perspective with limited depth and rich, symbolic color palette dominated by reds, blues, and gold highlights. Convert clothing to period Medieval attire including tunics, cottes, surcoats, chainmail, cloaks, or simple homespun garments depending on depicted social class. Add Medieval accessories like belts with pouches, simple jewelry, head coverings, religious symbols, or period-appropriate weapons. Position the subject in formal, stylized poses with religious or courtly themes against backgrounds featuring castles, walled gardens, forests, or simple decorative patterns. Include Medieval motifs like heraldic symbols, decorative borders, Gothic arches, or religious imagery. The final artwork should capture the symbolic, spiritual quality of Medieval art while maintaining some recognizable likeness to the original subject.",
  },
  "90s-hip-hop": {
    title: "90s Hip-Hop",
    description:
      "Bold style with oversized clothing, gold chains, and urban settings",
    placeholder: "E.g., Add a boombox and graffiti wall",
    suggestedPrompt:
      "Transform into an authentic 90's hip-hop music video style portrait. Apply high-contrast photography with slight film grain and bold colors. Convert clothing to iconic 90's hip-hop fashion including oversized jerseys, baggy jeans, Timberland boots, bright tracksuits, backward caps, or bandanas. Add statement gold chains, large medallions, chunky watches, and rectangular sunglasses. Set against urban backdrops like graffiti walls, basketball courts, city streets, or luxury cars. Include 90's props like boomboxes, pagers, early cell phones, or basketball sneakers. The final image should capture the confident, bold aesthetic of 90's hip-hop culture while maintaining clear likeness to the original subject.",
  },
  disco: {
    title: "Disco Era",
    description:
      "Glamorous 70s style with sequins, platform shoes, and nightclub vibes",
    placeholder: "E.g., Add a disco ball and colorful lighting",
    suggestedPrompt:
      "Transform into a quintessential Disco Era (1975-1980) portrait. Apply vivid, slightly oversaturated colors with glamorous lighting and lens flare effects. Convert hairstyles to characteristic disco looks including feathered cuts, afros, or Farrah Fawcett waves. Update clothing to iconic disco fashion with sequins, metallic fabrics, satin shirts with wide collars, bell bottoms, platform shoes, or wrap dresses. Add disco accessories like oversized sunglasses, chunky gold jewelry, or medallions. Set against disco nightclub backdrops featuring mirror balls, colored lights, illuminated dance floors, or sparkly decorations. The final image should capture the energetic, liberated spirit of the disco era while maintaining clear likeness to the original subject.",
  },
  "1950s": {
    title: "1950s America",
    description:
      "Classic Americana with polished, idealized family-friendly aesthetic",
    placeholder: "E.g., Add a vintage car and milkshake",
    suggestedPrompt:
      "Transform into an authentic 1950s American portrait with classic Americana aesthetic. Apply slightly oversaturated colors with polished, commercial photography style and perfect lighting. Convert hairstyles to iconic 50's looks including pompadours, victory rolls, crew cuts, or bouffants with precise styling. Update clothing to quintessential 50's fashion with full skirts, pencil dresses, high-waisted pants, bowling shirts, varsity jackets, or tailored suits with thin ties. Add 50's accessories like cat-eye glasses, pearl necklaces, pocket squares, silk scarves, or sturdy leather belts. Set against 1950s backdrops like diners, drive-in theaters, suburban homes, classic cars, or soda fountains. Include 50's cultural elements like vinyl records, jukeboxes, transistor radios, or classic Coca-Cola bottles. The final image should capture the optimistic, polished spirit of 1950s commercial photography while maintaining clear likeness to the original subject.",
  },
  "old-western": {
    title: "Old Western",
    description:
      "Rugged frontier style with sepia tones and authentic period details",
    placeholder: "E.g., Add cowboy hat and saloon background",
    suggestedPrompt:
      "Transform into an authentic Old Western (1865-1895) portrait photograph. Apply sepia-toned or black and white photography with slight aging effects, dust specks, and mild vignetting. Convert clothing to period Western attire including cowboy hats, bandanas, leather vests, dusters, wide-brimmed hats, cotton dresses, or chambray work shirts with authentic worn textures. Add Western accessories like leather gun belts, pocket watches with chains, cowboy boots with spurs, or simple frontier jewelry. Position the subject with a stoic, unsmiling expression against rustic Western backdrops like wooden buildings, saloons, general stores, rural landscapes, or wooden fences. Include Western elements like horseshoes, whiskey bottles, wanted posters, or simple farming/ranching tools. The final portrait should capture the rugged, frontier spirit of Old Western photography while maintaining clear likeness to the original subject.",
  },
  "ancient-greece": {
    title: "Ancient Greece",
    description:
      "Classical sculpture or fresco style with idealized forms (800-31 BCE)",
    placeholder: "E.g., Add Greek columns and ancient symbols",
    suggestedPrompt:
      "Transform into an authentic Ancient Greek (800-31 BCE) artwork resembling marble sculpture, pottery painting, or fresco. Apply the characteristic monochromatic white marble texture with subtle aging or classical red-figure pottery style with black and terracotta coloration. Convert attire to period Ancient Greek clothing including draped chitons, himations, or simple tunics with classical folds and movement. Position the subject in formal, idealized poses with contrapposto stance against backgrounds featuring Greek columns, temples, Mediterranean landscapes, or simple decorative Greek key patterns. Add Ancient Greek elements like olive wreaths, laurel crowns, lyres, scrolls, amphorae, or classical weapons. Include Greek motifs like meanders, acanthus leaves, olive branches, or mythological references. The final artwork should capture the idealized, harmonious aesthetic of Ancient Greek art while maintaining some recognizable likeness to the original subject.",
  },
  "custom-era": {
    title: "Custom Historical Era",
    description:
      "Specify any historical time period and location for customization",
    placeholder:
      "E.g., 1920s Gatsby era with flapper dress and Art Deco background",
    suggestedPrompt:
      "Transform into a historically accurate portrait from your specified time period and location. Apply appropriate photographic or artistic techniques authentic to the era. Convert clothing, hairstyles, and accessories to period-appropriate styles with accurate details, fabrics, and construction. Position the subject in poses typical of the specified era's portraiture against historically accurate backgrounds, architecture, or landscapes. Include objects, symbols, and cultural elements specific to the time period and region that provide historical context. The final image should capture the distinctive aesthetic of the specified historical era while maintaining clear likeness to the original subject.",
  },
};

// Artistic styles
const ARTISTIC_STYLES: Record<ArtisticSubcategory, StyleOption> = {
  "oil-painting": {
    title: "Classic Oil Painting",
    description:
      "Rich texture and depth like traditional museum masterpieces",
    placeholder: "E.g., Use an autumn color palette",
    suggestedPrompt:
      "Transform into a masterful oil painting with rich texture and depth. Apply visible brushwork with thick impasto technique in areas of highlight and smoother blending in middle tones and shadows. Use a sophisticated color palette with warm and cool tones balanced for visual harmony. Structure the composition with classical techniques including rule of thirds, leading lines, or atmospheric perspective. Incorporate traditional oil painting elements like glazing effects, subtle chiaroscuro lighting, and painterly rendering of textures. The final image should resemble a museum-quality oil painting with technical excellence while maintaining clear likeness to the original subject.",
  },
  watercolor: {
    title: "Watercolor Painting",
    description:
      "Dreamy, translucent effects with visible paper texture and soft edges",
    placeholder: "E.g., Use bright spring colors and loose brushwork",
    suggestedPrompt:
      "Transform into a beautiful watercolor painting with characteristic translucent quality. Apply visible watercolor techniques including wet-on-wet gradients, granulation effects, bleeding edges, and controlled transparency showing paper texture in lighter areas. Use a harmonious color palette with subtle color mixing and natural pigment variations. Incorporate watercolor-specific elements like soft edges, pooled pigment in details, delicate layering of transparent washes, and spontaneous blooms or backruns. Leave strategic white spaces for highlights and breathing room. The final image should capture the delicate, luminous quality of watercolor painting while maintaining clear likeness to the original subject.",
  },
  "comic-book": {
    title: "Comic Book Style",
    description:
      "Bold outlines, flat colors, and dynamic superhero-inspired composition",
    placeholder: "E.g., Add speech bubbles and action lines",
    suggestedPrompt:
      "Transform into an authentic comic book illustration with bold linework and dynamic styling. Apply strong black outlines with varying line weights and flat, vibrant coloring with simple shading through color blocking or halftones. Convert expressions to heightened, dramatic comic book emotions with exaggerated features for impact. Structure the composition with dynamic angles, foreshortening, or heroic poses inspired by superhero comics. Add comic book elements like action lines, speed streaks, impact stars, or simple background patterns to enhance movement and emotion. Include comic-specific details like expressive typography, speech/thought bubbles, panel borders, or caption boxes. The final image should look like it came straight from a professionally illustrated comic book while maintaining recognizable likeness to the original subject.",
  },
  "pixel-art": {
    title: "Pixel Art",
    description:
      "Retro gaming aesthetic with limited colors and visible square pixels",
    placeholder: "E.g., Make it look like a retro RPG character",
    suggestedPrompt:
      "Transform into authentic pixel art resembling classic video games. Apply a clearly visible pixel grid structure with perfectly square pixels and no anti-aliasing or blurring between color areas. Use a severely limited color palette with 8-32 distinct colors maximum including carefully selected shades for highlights and shadows. Create pixelated outlines and details at a consistent resolution throughout the image. Incorporate pixel art techniques including dithering for gradients, careful single-pixel highlighting, and simplified forms that work within pixel constraints. The final image should look like it belongs in a retro video game from the 8-bit or 16-bit era while maintaining recognizable likeness to the original subject within the pixel limitations.",
  },
  "neon-glow": {
    title: "Neon Glow",
    description:
      "Vibrant colors with dramatic light effects on dark backgrounds",
    placeholder: "E.g., Add cyberpunk city elements in the background",
    suggestedPrompt:
      "Transform into a striking neon-influenced artwork with vibrant, glowing elements. Apply dramatic neon lighting effects with bright, saturated colors that appear to emit light against a predominantly dark background. Create strong color contrast with complementary or split-complementary color schemes featuring electric blues, hot pinks, acid greens, or vibrant purples. Incorporate neon-specific elements like luminous outlines, light bloom effects, subtle lens flares, and realistic light reflection on surfaces. Add atmospheric effects such as mist, smoke, or rain to enhance the neon glow. The final image should capture the energetic, nocturnal quality of neon-lit scenes while maintaining clear likeness to the original subject.",
  },
  impressionist: {
    title: "Impressionist Painting",
    description:
      "Soft, light-filled scenes with visible brushstrokes capturing atmosphere",
    placeholder: "E.g., Set in a garden with dappled sunlight",
    suggestedPrompt:
      "Transform into an authentic Impressionist painting in the style of Monet, Renoir, or Degas. Apply visible, broken brushwork with distinct strokes of color placed side by side rather than blended. Use a light-filled color palette focusing on the effects of natural light with complementary color shadows and atmospheric color shifts. Soften details in favor of capturing the overall impression and mood of the scene. Incorporate typical Impressionist subject elements like outdoor settings, natural landscapes, everyday scenes, or leisure activities depicted in changing light conditions. The final image should capture the spontaneous, atmospheric quality of Impressionist art while maintaining somewhat recognizable likeness to the original subject.",
  },
  "van-gogh": {
    title: "Van Gogh Style",
    description:
      "Expressive, swirling brushstrokes with vibrant colors and emotional intensity",
    placeholder: "E.g., Add a starry night sky in the background",
    suggestedPrompt:
      "Transform into a painting in the distinctive style of Vincent van Gogh. Apply characteristic swirling, dynamic brushstrokes with thick impasto texture showing directionality and movement. Use Van Gogh's vibrant, emotionally expressive color palette with bold complementary color contrasts and distinctive yellows, blues, and greens. Incorporate Van Gogh's unique perspective with slightly tilted horizon lines, flattened depth, and animated backgrounds. Add typical Van Gogh elements like cypress trees, wheat fields, dramatic night skies, sunflowers, or humble interior scenes with exaggerated features. The final image should capture the passionate, dream-like quality of Van Gogh's work while maintaining somewhat recognizable likeness to the original subject within the stylistic interpretation.",
  },
  cyberpunk: {
    title: "Cyberpunk",
    description:
      "Futuristic urban dystopia with high-tech elements and neon lighting",
    placeholder:
      "E.g., Add cybernetic implants and a rainy cityscape background",
    suggestedPrompt:
      "Transform into a striking cyberpunk-themed portrait set in a high-tech dystopian future. Apply dramatic lighting with neon colors, volumetric light beams, and strong contrast between shadows and illuminated areas. Convert clothing and accessories to cyberpunk aesthetics with futuristic materials, tactical urban wear, technological enhancements, or revealing club attire with a high-tech edge. Add cyberpunk elements like holographic displays, cybernetic implants, AR interfaces, neural connections, or technological modifications. Set against dystopian urban backgrounds featuring megastructures, neon signage, industrial zones, or densely packed urban sprawl. Include cyberpunk details like digital glitches, rain-slicked streets, steam vents, flying vehicles, or corporate logos. The final image should capture the gritty, high-tech, noir quality of cyberpunk while maintaining clear likeness to the original subject.",
  },
  "custom-art": {
    title: "Custom Art Style",
    description:
      "Specify any artistic style for a completely customized transformation",
    placeholder:
      "E.g., Art Nouveau style with flowing organic lines and decorative elements",
    suggestedPrompt:
      "Transform into artwork in your specified artistic style with authentic techniques and visual elements. Apply appropriate color palette, brushwork, or rendering methods authentic to the requested style. Incorporate characteristic compositional approaches, perspective handling, and subject treatment typical of the specified artistic movement or artist. Add style-specific decorative elements, motifs, or symbolic components that define the requested aesthetic. Adjust the level of abstraction, realism, or stylization to accurately reflect the specified art style. The final image should authentically capture the distinctive quality of the requested artistic style while maintaining appropriate likeness to the original subject according to the style's typical approach to representation.",
  },
};

// Product styles
const PRODUCT_STYLES: Record<ProductSubcategory, StyleOption> = {
  "product-advertisement": {
    title: "Product Advertisement",
    description:
      "Professional, polished commercial photography for product marketing",
    placeholder: "E.g., Add a clean white background and product logo",
    suggestedPrompt:
      "Transform into a professional product advertisement photo with commercial-grade polish. Apply perfect studio lighting with appropriate highlights, fill lights, and subtle gradient backgrounds that emphasize the product's best features. Create a pristine, controlled environment with immaculate surfaces, perfect reflections, and precise shadows that enhance dimensional perception. Position the product using professional commercial photography techniques with optimal angles that showcase key design elements and features. Incorporate marketing-focused composition with balanced negative space for text placement, careful arrangement of supplementary elements, and strategic color psychology. The final image should have the flawless, persuasive quality of high-end commercial photography while maintaining complete accuracy to the original product.",
  },
  "perfume-ad": {
    title: "Luxury Perfume Ad",
    description:
      "Elegant, sensual imagery with luxurious textures and mood lighting",
    placeholder: "E.g., Add gold accents and misty background effects",
    suggestedPrompt:
      "Transform into an elegant luxury perfume advertisement with sensual, evocative imagery. Apply sophisticated studio lighting with carefully controlled highlights on glass or metal surfaces, subtle gradients, and atmospheric elements like mist, soft focus, or light rays. Create a luxurious mood through rich, premium color palettes featuring deep blacks, metallics, or signature brand colors with perfect exposure and contrast. Position the perfume bottle as the central focus with artistic angles that capture reflections, transparency effects, and the distinctive silhouette against complementary background elements. Incorporate luxury perfume ad techniques like water droplets, floating floral elements, fabric swirls, or abstract color forms that suggest scent through visual metaphor. The final image should embody the aspirational, sensory quality of high-end fragrance advertising while maintaining perfect representation of the perfume bottle design.",
  },
  "lifestyle-brand": {
    title: "Lifestyle Brand",
    description:
      "Authentic, aspirational scenes showing products in attractive real-life use",
    placeholder:
      "E.g., Show the product being used in a beautiful beach setting",
    suggestedPrompt:
      "Transform into an authentic lifestyle brand photograph showing products in aspirational everyday use. Apply warm, inviting lighting with a slightly enhanced natural look that feels genuine while being more perfect than reality. Create a curated environment with thoughtfully selected, complementary elements that establish a cohesive aesthetic while keeping the product naturally integrated and visible. Position people and products in relaxed, candid-appearing (though carefully composed) arrangements that suggest enjoyable, effortless use without appearing staged. Incorporate lifestyle branding elements like contextually appropriate activities, beautiful locations, and a consistent color story that reinforces brand identity. The final image should capture the authentic yet idealized quality of premium lifestyle photography while maintaining clear visibility and appeal of the featured product.",
  },
  "book-cover": {
    title: "Book Cover Design",
    description:
      "Eye-catching graphic design with integrated imagery and typography",
    placeholder: "E.g., Create a thriller novel cover with dark mood",
    suggestedPrompt:
      "Transform into a professional book cover design with compelling visual appeal and commercial polish. Apply appropriate genre-specific visual styling with color palettes, imagery treatment, and compositional approach that clearly communicates the book's category (thriller, romance, literary fiction, etc.). Create a focal point with a striking central image, symbol, or typographic element that captures attention while leaving appropriate space for title and author name. Position visual elements using professional book design principles with balanced weight distribution, strategic use of negative space, and careful attention to the spine edge. Incorporate professional typography with appropriate hierarchy, genre-suitable fonts, and readable contrast even at thumbnail size. The final image should have the commercial quality of a professionally designed book cover with compelling visual storytelling that entices potential readers.",
  },
  "album-cover": {
    title: "Album Cover Art",
    description:
      "Expressive, iconic imagery capturing musical style and artist identity",
    placeholder: "E.g., Create an indie rock album cover with vintage feel",
    suggestedPrompt:
      "Transform into striking album cover art with visual impact and musical identity. Apply genre-appropriate visual styling with color treatment, texture, and compositional techniques that align with the implied musical style (rock, electronic, hip-hop, etc.). Create a memorable, iconic central concept with symbolic imagery, artist representation, or abstract elements that capture attention while allowing space for artist name and album title. Position visual elements using album art design principles with consideration for square format, potential vinyl record application, and both physical and digital display contexts. Incorporate music-related visual cues like instruments, sound visualization, subcultural symbolism, or emotional tone indicators that connect to musical content. The final image should have the distinctive, expressive quality of professional album artwork with a strong visual concept that represents the implied musical identity.",
  },
  "shampoo-commercial": {
    title: "Shampoo Commercial",
    description:
      "Glossy, perfect hair imagery with dramatic movement and shine",
    placeholder: "E.g., Add water droplets and flowing hair movement",
    suggestedPrompt:
      "Transform into a professional shampoo advertisement with perfect, glossy hair imagery. Apply specialized hair photography lighting with multiple light sources that create maximum shine, dimensional highlights, and silky reflections throughout the hair. Create flawless hair styling with voluminous body, zero frizz, and idealized texture appropriate to the hair type with perfect strand definition and movement. Position the model with dynamic hair motion frozen in time, showing dramatic flow, bounce, or elegant fall that emphasizes healthy movement. Incorporate shampoo commercial elements like water droplets, splashes, floating botanical ingredients, or abstract color forms suggesting freshness and vitality. The final image should have the ultra-polished, aspirational quality of high-end hair product advertising with impossibly perfect hair that appears touchably soft and supremely healthy.",
  },
  "luxury-watch": {
    title: "Luxury Watch Ad",
    description:
      "Precise, high-end product photography highlighting craftsmanship and status",
    placeholder: "E.g., Show the watch with dramatic shadows on marble",
    suggestedPrompt:
      "Transform into a premium luxury watch advertisement with meticulous attention to detail. Apply specialized watch photography lighting techniques with precisely controlled reflections on crystal, case, and bracelet that highlight the watch's materials and finish without distracting glare. Create a sophisticated environment using premium materials like marble, leather, brushed metal, or dark wood that complement the watch's design aesthetic and price positioning. Position the watch using professional horology photography techniques with the hands set to 10:10 (or similar) for balanced dial presentation, optimal angle to showcase case profile, and perfect focus on key design elements. Incorporate luxury watch advertising approaches like extreme macro details of movements or dials, elegant shadows emphasizing dimension, and careful arrangement of any supporting elements. The final image should have the exceptional, prestigious quality of high-end watch marketing with perfect representation of materials, proportions, and craftsmanship.",
  },
  "car-advertisement": {
    title: "Car Advertisement",
    description:
      "Dynamic automotive photography with dramatic lighting and environment",
    placeholder: "E.g., Place the car on a scenic mountain road at sunset",
    suggestedPrompt:
      "Transform into a professional automotive advertisement with dramatic vehicle presentation. Apply specialized car photography lighting that emphasizes the vehicle's body lines, creates perfect reflections on paint and glass, and highlights key design elements with precision. Create an impactful environment that complements the vehicle's character using appropriate locations like urban architecture, scenic natural landscapes, or abstract studio settings with professional ground reflections. Position the vehicle using automotive photography techniques with dynamic angles that emphasize performance, luxury, or utility based on the car type, perfect compositional balance, and strategic placement within the environment. Incorporate car advertising elements like motion effects for dynamic shots, atmospheric conditions that add mood, and careful color grading that enhances the vehicle's paint and features. The final image should have the high-impact, aspirational quality of premium automotive advertising with flawless representation of the vehicle's design and character.",
  },
  "custom-product": {
    title: "Custom Product",
    description:
      "Specify any product type for a customized commercial transformation",
    placeholder:
      "E.g., Create a luxury chocolate packaging with gold foil details",
    suggestedPrompt:
      "Transform into professional product advertising for your specified product type with commercial-grade presentation. Apply appropriate professional photography techniques with lighting, composition, and styling specific to the product category and market positioning. Create an optimal product environment using setting, props, and contextual elements that enhance the product's appeal and communicate its purpose or benefits. Position the product using category-specific best practices that showcase its most important features, functional elements, or design details from the most flattering angle. Incorporate relevant advertising approaches for the specific product category including appropriate mood, supporting elements, and visual storytelling that builds desire and communicates value. The final image should have the polished, persuasive quality of category-specific commercial photography with perfect representation of the product and its appealing characteristics.",
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
  "baby-prediction": {
    title: "What Will Our Baby Look Like",
    description:
      "Envision how a future baby might look based on people in an image",
    placeholder: "E.g., Create a baby girl with my eyes and his smile",
    suggestedPrompt:
      "Create a realistic image of a baby that would result from the genetics of the two people in this photo. Analyze the facial features, skin tone, hair color/texture, and eye characteristics of both people. Generate a baby approximately 1 year old with a natural blend of genetic features from both potential parents, maintaining appropriate ethnic characteristics. Create a realistic facial structure with baby proportions including larger forehead, chubby cheeks, and smaller chin. Include specific inherited elements like eye shape/color, nose shape, lip fullness, hair color/texture, skin tone, and face shape that are visibly derived from the parent photos. The final image should look like a completely realistic, heartwarming baby photo with natural lighting and an appropriate simple background, not like an obvious composite or artificial creation.",
  },
  "future-self": {
    title: "What Will I Look Like in 20 Years",
    description:
      "Age the subject in the image to show how they might look in the future",
    placeholder: "E.g., Show me with gray hair and reading glasses",
    suggestedPrompt:
      "Create a realistic future version of this person aged approximately 20 years older. Add natural age-progression features including: appropriate gray/white hair based on current color and realistic pattern (temples, overall salt-and-pepper, etc.), deeper nasolabial folds and faint crow's feet around eyes, slightly thinner skin with minor age spots on exposed areas, slight decrease in skin elasticity around jawline, and subtle changes to facial fat distribution. Maintain the person's core identity, bone structure, and racial characteristics while aging them realistically. Update styling elements like hair (modern style for an older person), clothing (contemporary but age-appropriate), and any accessories to suit an older version. The final image should look like a completely natural future photograph of the same person, not a caricature of aging.",
  },
  "ghibli-style": {
    title: "Ghibli Style",
    description:
      "Transform into the beautiful, painterly anime style of Studio Ghibli films",
    placeholder: "E.g., Add Totoro-inspired forest spirits nearby",
    suggestedPrompt:
      "Transform into the distinctive Studio Ghibli animation style reminiscent of films like 'Spirited Away' or 'Howl's Moving Castle.' Apply the characteristic Ghibli watercolor-inspired backgrounds with soft, painterly textures and natural landscapes featuring lush greenery, detailed clouds, or charming architectural elements. Convert character design to Ghibli aesthetic with simplified but expressive facial features, natural body proportions (not exaggerated anime style), and slightly rounded, soft forms. Add Ghibli-specific elements like magical natural phenomena, whimsical spirits, detailed environmental textures, or intricate mechanical designs with fantasy elements. Include signature Ghibli atmospheric qualities like gentle wind effects, dappled light through trees, or peaceful environmental moments. The final image should capture the heartfelt, thoughtful quality of Studio Ghibli animation while maintaining recognizable likeness to the original subject within the style conventions.",
  },
  "ai-action-figure": {
    title: "Action Figure",
    description:
      "Transform into a realistic toy action figure with packaging",
    placeholder: "E.g., Make the figure hold a tiny laser sword",
    suggestedPrompt:
      "Transform into a realistic, commercially-produced action figure toy in professional packaging. Apply authentic toy material textures with slight plastic sheen, simplified but recognizable facial features, and visible articulation points at shoulders, elbows, hips, and knees. Create realistic toy proportions with slightly enlarged head, simplified hands, and stable feet designed to stand independently. Position the figure in a dynamic but achievable pose inside a retail-ready blister package with clear plastic front and branded cardboard backing. Include action figure packaging elements like character name, toy line branding, included accessories, appropriate age warnings, and manufacturer logos. The final image should look exactly like a commercially available action figure toy that could be found in stores, with professional product photography quality.",
  },
  "pet-as-human": {
    title: "What Would My Pet Look Like as a Human",
    description:
      "Reimagine a pet as a human while keeping recognizable traits and personality",
    placeholder: "E.g., Keep my cat's distinctive markings as clothing patterns",
    suggestedPrompt:
      "Transform a pet into a human character while preserving the animal's distinctive traits, personality, and essence. Translate the pet's fur color, patterns, and markings into human hair color, clothing designs, or distinctive features. Convert the pet's most expressive physical features (eyes, ears, distinctive nose/muzzle) into human facial characteristics that subtly reference the animal features without looking bizarre. Capture the pet's personality and typical expressions (playful, serious, mischievous, aloof) in the human's pose, expression, and styling. Incorporate subtle references to the pet's species through appropriate styling choices like clothing colors, accessories, environment, or activities that reference typical animal behaviors. The final image should be a completely natural-looking human that creatively and subtly embodies the pet's most recognizable physical and personality traits.",
  },
  "self-as-cat": {
    title: "What Would I Look Like as a Cat",
    description:
      "Transform the subject into a photorealistic cat with personality traits preserved",
    placeholder: "E.g., Make me a Maine Coon cat with my eye color",
    suggestedPrompt:
      "Transform the person into a photorealistic cat with personality traits and distinctive features preserved. Translate the human's hair color, style, and texture into corresponding cat fur. Convert the person's most distinctive facial features (eye color, expression, unique characteristics) into feline equivalents that capture their essence. Choose a cat breed whose typical personality aligns with the human's apparent personality traits (serious, playful, elegant, etc.). Maintain any distinctive accessories or clothing elements as appropriate cat-sized versions (collar with pendant instead of necklace, etc.). Position the cat in a pose and environment that reflects the human's posture and background while being natural for a cat. The final image should be a completely photorealistic cat that subtly reminds viewers of the human subject through clever translation of their most distinctive traits.",
  },
  "caricature": {
    title: "Caricature",
    description:
      "Exaggerated features with humorous artistic style while keeping likeness",
    placeholder: "E.g., Exaggerate my smile and make the background colorful",
    suggestedPrompt:
      "Transform into an artistic caricature with exaggerated features while maintaining recognizable likeness. Identify and amplify the subject's most distinctive facial characteristics (large nose, prominent chin, distinctive smile, unique hairstyle) with playful exaggeration that's humorous without being mean-spirited. Apply a lively artistic style with bold linework, slightly cartoonish proportions, and expressive color choices that enhance the caricature effect. Create an appropriate caricature composition with enlarged head and smaller body, dynamic pose that suggests personality, and simplified background elements that provide context without distraction. Include subtle personality elements through exaggerated expressions, appropriate props that suggest hobbies/interests, or clothing details that reveal character. The final image should have the playful, instantly-recognizable quality of professional caricature art with skillful exaggeration that captures essence while clearly connecting to the original subject.",
  },
  "custom-other": {
    title: "Custom Transformation",
    description:
      "Specify any creative transformation for a completely custom result",
    placeholder:
      "E.g., Transform me into a mythological creature with forest elements",
    suggestedPrompt:
      "Transform according to your custom creative direction with imaginative yet cohesive execution. Apply visual style, medium, and artistic approach as specified in your custom request with professional-quality rendering and attention to detail. Create an imaginative transformation that balances creativity with appropriate maintenance of recognizable elements from the original subject as needed for your concept. Position compositional elements in a visually engaging arrangement that best showcases the custom transformation concept while maintaining visual hierarchy and focus. Incorporate specified thematic elements, environments, accessories, or contextual details that enhance and complete your creative vision. The final image should be a polished, impressive realization of your custom transformation concept with skillful execution and attention to both technical quality and creative expression.",
  },
};

export type PromptCategory = {
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultPlaceholder: string;
  styles: Record<string, StyleOption>;
};

const CATEGORIES: Record<Category, PromptCategory> = {
  animation: {
    title: "Kids & Animation",
    description: "Transform into popular animation and kids' entertainment styles",
    icon: <Box className="w-4 h-4" />,
    defaultPlaceholder: "E.g., Add specific character details or background elements",
    styles: ANIMATION_STYLES,
  },
  historical: {
    title: "Historical Eras",
    description: "Travel through time with authentic period transformations",
    icon: <Clock className="w-4 h-4" />,
    defaultPlaceholder: "E.g., Add era-specific clothing or background details",
    styles: HISTORICAL_STYLES,
  },
  artistic: {
    title: "Artistic Styles",
    description: "Reimagine images in the style of famous art movements and techniques",
    icon: <Paintbrush className="w-4 h-4" />,
    defaultPlaceholder: "E.g., Adapt the style with specific artistic elements",
    styles: ARTISTIC_STYLES,
  },
  product: {
    title: "Product & Commercial",
    description: "Create professional product imagery and commercial photography",
    icon: <Image className="w-4 h-4" />,
    defaultPlaceholder: "E.g., Add specific product details or marketing elements",
    styles: PRODUCT_STYLES,
  },
  other: {
    title: "Fun & Viral Styles",
    description: "Enjoy popular and viral transformation styles",
    icon: <Sparkles className="w-4 h-4" />,
    defaultPlaceholder: "E.g., Add specific creative elements to enhance the style",
    styles: OTHER_STYLES,
  },
};

type PromptInputProps = {
  initialCategory?: Category;
  initialSubcategory?: Subcategory;
  initialPrompt?: string;
  onPromptChange: (prompt: string) => void;
  onTitleChange?: (title: string) => void;
  onCategoryChange?: (category: string) => void;
  onStyleChange?: (style: StyleOption) => void;
};

export default function PromptInput({
  initialCategory,
  initialSubcategory,
  initialPrompt = "",
  onPromptChange,
  onTitleChange,
  onCategoryChange,
  onStyleChange,
}: PromptInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    initialCategory || "animation"
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(
    initialSubcategory || null
  );
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Get the styles for the selected category
  const categoryData = CATEGORIES[selectedCategory];
  const styles = categoryData.styles;

  // Handle category change
  const handleCategoryChange = (category: string) => {
    const validCategory = category as Category;
    setSelectedCategory(validCategory);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    if (onCategoryChange) {
      onCategoryChange(validCategory);
    }
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategory: string) => {
    const validSubcategory = subcategory as Subcategory;
    setSelectedSubcategory(validSubcategory);
    
    // Get the style for the selected subcategory
    const style = styles[validSubcategory];
    
    if (style) {
      setPrompt(style.suggestedPrompt);
      onPromptChange(style.suggestedPrompt);
      
      if (onTitleChange) {
        onTitleChange(style.title);
      }
      
      if (onStyleChange) {
        onStyleChange(style);
      }
    }
  };

  // Handle prompt change
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    onPromptChange(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    onPromptChange(suggestion);
    setIsPopoverOpen(false); // Close popover after selection
  };

  // Set initial values if provided
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
    
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    
    if (initialSubcategory) {
      setSelectedSubcategory(initialSubcategory);
    }
  }, [initialPrompt, initialCategory, initialSubcategory]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Category selection */}
          <div>
            <Label htmlFor="category" className="block text-sm font-medium mb-1">
              Style Category
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory selection */}
          <div>
            <Label htmlFor="style" className="block text-sm font-medium mb-1">
              Specific Style
            </Label>
            <Select
              value={selectedSubcategory || ""}
              onValueChange={handleSubcategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specific style" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(styles).map(([key, style]) => (
                  <SelectItem key={key} value={key}>
                    {style.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Style description if subcategory is selected */}
        {selectedSubcategory && styles[selectedSubcategory] && (
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="font-medium mb-1">
              {styles[selectedSubcategory].title}
            </div>
            <div className="text-muted-foreground">
              {styles[selectedSubcategory].description}
            </div>
          </div>
        )}

        {/* Prompt input with help popover */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <Label
              htmlFor="prompt"
              className="block text-sm font-medium"
            >
              Transformation Prompt
            </Label>
            
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Prompt help</span>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Prompt Tips</h4>
                  <p className="text-sm text-muted-foreground">
                    Be specific about the transformation you want. Include details about style, mood, colors, and elements to include or avoid.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can modify the suggested prompt or write your own completely custom instructions.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <Textarea
            id="prompt"
            value={prompt}
            onChange={handlePromptChange}
            placeholder={
              selectedSubcategory && styles[selectedSubcategory]
                ? styles[selectedSubcategory].placeholder
                : categoryData.defaultPlaceholder
            }
            className="min-h-32 font-mono text-sm"
          />
        </div>
      </div>

      {/* Magic wand button for suggestions */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Get Prompt Suggestions
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="center">
          <Tabs defaultValue="quick">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick">Quick Suggestions</TabsTrigger>
              <TabsTrigger value="tips">Writing Tips</TabsTrigger>
            </TabsList>
            <TabsContent value="quick" className="p-4 space-y-2">
              <h3 className="font-medium mb-2">Quick Suggestions</h3>
              {/* Dynamically show suggestions based on selected category/style */}
              {selectedSubcategory && styles[selectedSubcategory] ? (
                <div className="space-y-2">
                  <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleSuggestionClick(styles[selectedSubcategory].suggestedPrompt)}>
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm">Use Suggested Prompt</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <CardDescription className="text-xs line-clamp-2">
                        {styles[selectedSubcategory].suggestedPrompt.substring(0, 100)}...
                      </CardDescription>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleSuggestionClick(`${styles[selectedSubcategory].suggestedPrompt}\n\nAdditional details: Make the background more dramatic with deeper colors and atmospheric lighting.`)}>
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm">Dramatic Background</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <CardDescription className="text-xs">
                        Add a more dramatic background with deeper colors and atmosphere.
                      </CardDescription>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleSuggestionClick(`${styles[selectedSubcategory].suggestedPrompt}\n\nAdditional details: Enhance the emotional impact with more expressive facial features while maintaining likeness.`)}>
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm">More Expressive</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <CardDescription className="text-xs">
                        Enhance emotional impact with more expressive features.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please select a specific style to see suggestions.
                </p>
              )}
            </TabsContent>
            <TabsContent value="tips" className="p-4 space-y-3">
              <h3 className="font-medium">Prompt Writing Tips</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Be specific:</span> Include clear details about the style, elements, and mood you want.
                </p>
                <p>
                  <span className="font-medium">Mention what to keep:</span> Specify which aspects of the original should be preserved.
                </p>
                <p>
                  <span className="font-medium">Describe the atmosphere:</span> Mention lighting, color palette, and emotional tone.
                </p>
                <p>
                  <span className="font-medium">Reference examples:</span> Mention specific artists, eras, or visual styles.
                </p>
                <p>
                  <span className="font-medium">Add constraints:</span> Explicitly state what you don't want to see in the result.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          <CardFooter className="p-2 border-t">
            <p className="text-xs text-muted-foreground">
              Click on any suggestion to use it as your prompt
            </p>
          </CardFooter>
        </PopoverContent>
      </Popover>
    </div>
  );
}