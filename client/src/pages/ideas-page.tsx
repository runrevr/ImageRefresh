import { useState } from "react";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Import Mascots
import logoImage from "@assets/Imagerefresh Logo.png";

// Define a type for the idea card
interface IdeaCard {
  id: string;
  title: string;
  category: string;
  prompt: string;
  description: string;
  originalImage: string;
  transformedImage: string;
}

export default function IdeasPage() {
  const { toast } = useToast();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const ideas: IdeaCard[] = [
    {
      id: "pixel-art",
      title: "8-Bit Pixel Art",
      category: "Retro Gaming",
      prompt: "Create a colorful 8-bit pixel art scene inspired by retro video games. The scene features a small pixel-style character sitting on a brown brick platform, holding a glowing orb. The character wears a green shirt and blue pants. The background includes a bright blue sky with pixelated white clouds outlined in black, rolling green hills, rounded trees, and colorful pixel flowers growing from floating bricks. Add a large green warp pipe with a red-and-green plant coming out of it, small turtle-like pixel creatures walking nearby, and floating question mark blocks above the character. The overall style should feel bright, playful, and nostalgic, like a side-scrolling adventure world.",
      description: "Transform any photo into a nostalgic 8-bit pixel art style reminiscent of classic Nintendo games.",
      originalImage: "/examples/example-boy.png",
      transformedImage: "/examples/transformed-pixel-art.png"
    },
    {
      id: "superhero",
      title: "Superhero Comic",
      category: "Fantasy",
      prompt: "Use the uploaded image as inspiration for the pose and action of a new, non-photorealistic cartoon superhero character. Create a bold animated style with exaggerated features, colorful heroic costumes, dynamic flowing capes, and glowing energy effects around the hands or eyes. Make the character have a serious and determined expression. Set the scene in a whimsical urban cartoon cityscape with a skyline backdrop, and use bright, joyful colors. Everything must feel original and playful, inspired by animated superhero adventures.",
      description: "Turn yourself or friends into vibrant comic book superheroes with dynamic poses and energy effects.",
      originalImage: "/examples/example-person.png",
      transformedImage: "/examples/transformed-superhero.png"
    },
    {
      id: "trolls",
      title: "Fantasy Troll World",
      category: "Animation",
      prompt: "Use the uploaded image as inspiration for the mood and attitude of a whimsical troll folk-hero character. Create a playful fantasy scene filled with oversized flowers, sparkling waterfalls, and colorful candy-like forests arranged in musical, rhythmic patterns. Design the character in a bright, cartoon style with wild, gravity-defying neon hair shaped like a crown, textured clothes inspired by forest leaves and vines, and a joyful, lively expression. Set everything in a vivid, high-contrast animated world, like a cheerful fairy-tale concert.",
      description: "Create a magical, musical world with vibrant colors and whimsical characters inspired by the Trolls movie style.",
      originalImage: "/examples/example-child.png",
      transformedImage: "/examples/transformed-trolls.png"
    },
    {
      id: "van-gogh",
      title: "Van Gogh Style",
      category: "Fine Art",
      prompt: "Transform this image into Vincent van Gogh's distinctive Post-Impressionist style. Use bold, visible brushstrokes with thick impasto texture. Apply vibrant, swirling patterns in the background reminiscent of 'Starry Night'. Create emotional color contrasts with deep blues, bright yellows, and rich greens. Maintain the basic composition and subjects from the original image, but interpret them with van Gogh's characteristic distorted perspective and emotional intensity. Add slight elongation of features and objects, with outlines emphasized by darker colors.",
      description: "Turn your photos into stunning Post-Impressionist masterpieces with Van Gogh's distinctive swirling brushstrokes and vibrant colors.",
      originalImage: "/examples/example-landscape.png",
      transformedImage: "/examples/transformed-van-gogh.png"
    },
    {
      id: "watercolor",
      title: "Soft Watercolor",
      category: "Fine Art",
      prompt: "Transform this image into a delicate watercolor painting with soft, translucent washes of color. Create gentle color bleeds and subtle gradients with visible paper texture showing through. Use a light touch with minimal detail, focusing on capturing the essence and mood rather than precise details. Apply transparent layering techniques with colors slightly bleeding into one another at the edges. Include some areas where colors blend naturally and others with small deliberate brushstrokes. Add slight bleeding effects at color boundaries typical of wet-on-wet watercolor techniques.",
      description: "Transform photos into elegant watercolor paintings with soft color washes and gentle transitions.",
      originalImage: "/examples/example-portrait.png",
      transformedImage: "/examples/transformed-watercolor.png"
    },
    {
      id: "cyberpunk",
      title: "Cyberpunk Future",
      category: "Sci-Fi",
      prompt: "Transform this image into a cyberpunk-style scene with neon-lit urban dystopia aesthetics. Add abundant holographic displays, vibrant neon signs in pink, blue, and purple casting colorful glows. Create a rainy night atmosphere with reflective wet streets and steam rising from vents. Include technological enhancements like cybernetic implants, AR displays, or digital interfaces. The lighting should feature stark contrasts between dark shadows and bright artificial lights, with lens flares and light pollution. Maintain the core elements of the original image but reimagined in this high-tech, gritty futuristic setting.",
      description: "Enter a futuristic world of neon lights, holographic displays, and technological enhancements in a cyberpunk-inspired transformation.",
      originalImage: "/examples/example-city.png",
      transformedImage: "/examples/transformed-cyberpunk.png"
    },
  ];

  const copyPromptToClipboard = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Prompt copied!",
      description: "The prompt has been copied to your clipboard.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#2A7B9B] to-[#A3E4D7] inline-block text-transparent bg-clip-text">
            Transformation Ideas
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Explore different styles and prompts to inspire your next image transformation. 
            Click on any card to see before and after examples and copy prompts directly to use in your own transformations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <Card 
              key={idea.id} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-[#2A7B9B] max-w-sm mx-auto"
              onMouseEnter={() => setHoveredCard(idea.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src={hoveredCard === idea.id ? idea.transformedImage : idea.originalImage} 
                  alt={hoveredCard === idea.id ? "Transformed image" : "Original image"}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-medium bg-black bg-opacity-60 px-3 py-1 rounded">
                    {hoveredCard === idea.id ? "After" : "Before"}
                  </p>
                </div>
                <div className="absolute top-2 right-2 bg-[#FF7B54] text-white px-2 py-1 rounded text-xs">
                  {idea.category}
                </div>
              </div>

              <CardHeader className="p-4">
                <CardTitle className="text-lg font-bold text-[#333333]">{idea.title}</CardTitle>
                <CardDescription className="text-sm">{idea.description}</CardDescription>
              </CardHeader>

              <CardFooter className="flex justify-between gap-2 p-4">
                <Button 
                  variant="outline" 
                  className="border-[#2A7B9B] text-[#2A7B9B] hover:bg-[#2A7B9B] hover:text-white text-xs px-2"
                  onClick={() => copyPromptToClipboard(idea.prompt)}
                >
                  Copy Prompt
                </Button>
                <Link href="/">
                  <Button className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white text-xs px-2">
                    Try It Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}