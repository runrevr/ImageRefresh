import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { PromptExample } from '@shared/schema';

interface TransformationExamplesProps {
  onExampleClick: () => void;
}

// Example data
const examples: PromptExample[] = [
  {
    category: "Artistic Style",
    title: "Tiger in Van Gogh Style",
    prompt: "Transform this tiger photo into a Van Gogh-style oil painting with swirling brushstrokes and vibrant colors",
    originalImageUrl: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    transformedImageUrl: "/images/van-gogh-tiger.png"
  },
  {
    category: "Artistic Style",
    title: "Portrait to Oil Painting",
    prompt: "Transform this portrait into a vibrant oil painting in the style of Van Gogh",
    originalImageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  },
  {
    category: "Time Change",
    title: "Day to Night Transformation",
    prompt: "Turn this daytime beach scene into a magical night beach with stars and moonlight",
    originalImageUrl: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  },
  {
    category: "Architectural",
    title: "Modern to Medieval",
    prompt: "Transform this modern building into an ancient medieval stone castle",
    originalImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  },
  {
    category: "Commercial",
    title: "Restaurant-Quality Food Photos",
    prompt: "Enhance this food photo with professional lighting and commercial food styling",
    originalImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  },
  {
    category: "Sci-Fi",
    title: "Cyberpunk Character",
    prompt: "Transform this person into a cyberpunk character with neon accents and futuristic elements",
    originalImageUrl: "https://images.unsplash.com/photo-1581084324492-c8076f130f86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1581084324492-c8076f130f86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  },
  {
    category: "Interior Design",
    title: "Room Makeover",
    prompt: "Transform this room into a luxury modern interior with upscale furnishings",
    originalImageUrl: "https://images.unsplash.com/photo-1610146090564-35921429d339?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "https://images.unsplash.com/photo-1610146090564-35921429d339?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
  }
];

export default function TransformationExamples({ onExampleClick }: TransformationExamplesProps) {
  const [hoveredExample, setHoveredExample] = useState<number | null>(null);
  
  const handleExampleClick = () => {
    onExampleClick();
  };

  return (
    <section id="examples" className="mb-16 mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Stunning Transformations</h2>
        <p className="text-xl text-gray-600">See what our AI can do with your photos</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden group transition transform hover:-translate-y-1 hover:shadow-lg"
            onMouseEnter={() => setHoveredExample(index)}
            onMouseLeave={() => setHoveredExample(null)}
          >
            <div className="h-64 bg-gray-100 relative">
              <img 
                src={example.originalImageUrl} 
                alt={example.title} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hoveredExample === index ? 'opacity-0' : 'opacity-100'}`}
              />
              <img 
                src={example.transformedImageUrl} 
                alt={`Transformed ${example.title}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${hoveredExample === index ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
            <div className="p-4">
              <Badge variant="secondary" className="bg-primary-50 text-primary-600 hover:bg-primary-100 mb-1">
                {example.category}
              </Badge>
              <h3 className="font-medium text-lg mb-2">{example.title}</h3>
              <p className="text-gray-600 text-sm mb-3">"{example.prompt}"</p>
              <Button 
                variant="link" 
                className="text-primary-500 p-0 h-auto"
                onClick={handleExampleClick}
              >
                Try this transformation
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 text-center">
        <Button 
          onClick={handleExampleClick}
          size="lg"
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Create Your Own Transformation
        </Button>
      </div>
    </section>
  );
}
