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
      title: "Video Game Characters",
      category: "Video Game Characters",
      prompt: "Create a colorful 8-bit pixel art scene inspired by retro video games. The scene features a small pixel-style character sitting on a brown brick platform, holding a glowing orb. The character wears a green shirt and blue pants. The background includes a bright blue sky with pixelated white clouds outlined in black, rolling green hills, rounded trees, and colorful pixel flowers growing from floating bricks. Add a large green warp pipe with a red-and-green plant coming out of it, small turtle-like pixel creatures walking nearby, and floating question mark blocks above the character. The overall style should feel bright, playful, and nostalgic, like a side-scrolling adventure world.",
      description: "Transform any photo into a nostalgic and newer video game characters. Want to be a GTA charcter? NBA 2K? Fortnite?",
      originalImage: "/examples/man-portrait.png",
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
      id: "painting",
      title: "Turn to Painting",
      category: "Paintings",
      prompt: "Transform this image into a beautiful artistic painting with rich textures and expressive brushwork. You can select from 10 painting styles including Oil Painting, Watercolor, Impressionist, Abstract, Pop Surrealism, Art Deco, Pixel Art, Anime/Manga, Cartoon Style, and Gothic Noir.",
      description: "Turn your photos into stunning painting styles stretching throughout history with 10 different artistic styles to choose from.",
      originalImage: "/assets/couple-field.png",
      transformedImage: "/assets/couple-field-painting.png"
    },
    {
      id: "pop-culture-eras",
      title: "Pop Culture Through the Eras",
      category: "Historical",
      prompt: "Transform into a historical or cultural era style with period-appropriate elements. Choose from styles including Old Western, 90s Hip-Hop, 1980s Retro, Renaissance, Caricature, Victorian Era, Disco Era, Cyberpunk, and Medieval.",
      description: "Transform photos into historical styles from Western frontiers to 80's to 90's hip-hop while preserving recognizable likenesses",
      originalImage: "/examples/example-portrait.png",
      transformedImage: "/examples/transformed-victorian.png"
    },
    {
      id: "cyberpunk",
      title: "Cyberpunk Future",
      category: "Sci-Fi",
      prompt: "Transform this image into a cyberpunk-style scene with neon-lit urban dystopia aesthetics. Add abundant holographic displays, vibrant neon signs in pink, blue, and purple casting colorful glows. Create a rainy night atmosphere with reflective wet streets and steam rising from vents. Include technological enhancements like cybernetic implants, AR displays, or digital interfaces. The lighting should feature stark contrasts between dark shadows and bright artificial lights, with lens flares and light pollution. Maintain the core elements of the original image but reimagined in this high-tech, gritty futuristic setting.",
      description: "Enter a futuristic world of neon lights, holographic displays, and technological enhancements in a cyberpunk-inspired transformation.",
      originalImage: "/examples/example-city.png",
      transformedImage: "/examples/transformed-cyberpunk.png"
    }
  ];

  const saveStylePrompt = (idea: IdeaCard) => {
    // Save the selected idea prompt in localStorage for use on the home page
    localStorage.setItem('selectedStyle', JSON.stringify({
      prompt: idea.prompt,
      title: idea.title,
      category: idea.category
    }));
    
    toast({
      title: "Style selected!",
      description: `The "${idea.title}" style will be applied to your next image.`,
    });
    
    // The Link component will handle navigation to the home page
    // No need for additional redirection code here
  };

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#2A7B9B] to-[#A3E4D7] inline-block text-transparent bg-clip-text">
            Transformation Ideas
          </h1>
          <p className="text-base text-gray-700 max-w-2xl mx-auto">
            Explore different styles and prompts to inspire your next image transformation. 
            Hover over cards to see before/after examples.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-12">
          {ideas.map((idea) => (
            <div key={idea.id} className="w-full sm:w-[45%] md:w-[30%]" style={{ minWidth: "250px", maxWidth: "400px" }}>
              <Card 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-[#2A7B9B] h-full"
                onMouseEnter={() => setHoveredCard(idea.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <img 
                    src={hoveredCard === idea.id ? idea.transformedImage : idea.originalImage} 
                    alt={hoveredCard === idea.id ? "Transformed image" : "Original image"}
                    className={`w-full h-full transition-all duration-500 ${idea.id === "painting" ? "object-cover object-[50%_35%]" : "object-cover"}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium bg-black bg-opacity-60 px-3 py-1 rounded">
                      {hoveredCard === idea.id ? "After" : "Before"}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 bg-[#2A7B9B] text-white px-2 py-1 rounded text-xs">
                    {idea.category}
                  </div>
                </div>

                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-base font-bold text-[#333333]">{idea.title}</CardTitle>
                  <CardDescription className="text-xs">{idea.description}</CardDescription>
                </CardHeader>

                <CardFooter className="flex justify-center p-3">
                  <Link href="/?showUpload=true">
                    <Button 
                      className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white w-full"
                      onClick={() => saveStylePrompt(idea)}
                    >
                      Use This Style
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}