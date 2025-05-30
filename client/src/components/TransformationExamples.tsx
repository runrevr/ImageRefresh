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
    category: "Character Design",
    title: "Kid to Cartoon Character",
    prompt: "Transform this child's portrait into a playful, animated cartoon character in a Minecraft-inspired style",
    originalImageUrl: "/images/kid.png",
    transformedImageUrl: "/images/kid-cartoon.png"
  },
  {
    category: "Product Enhancement",
    title: "Professional Product Photography",
    prompt: "Transform this basic product shot into a professional commercial product photograph with ideal lighting, composition, and visual appeal",
    originalImageUrl: "/images/camo.jpg",
    transformedImageUrl: "/images/camo-product.png"
  },
  {
    category: "Artistic Style",
    title: "Portrait to Oil Painting",
    prompt: "Transform this portrait into a vibrant oil painting in the style of Van Gogh with swirling brushstrokes and intense colors",
    originalImageUrl: "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80",
    transformedImageUrl: "/images/van-gogh-tiger.png"
  },
  {
    category: "Commercial",
    title: "Restaurant-Quality Food Photos",
    prompt: "Enhance this burger photo with professional lighting and commercial food styling for an appetizing presentation",
    originalImageUrl: "/images/burger.png",
    transformedImageUrl: "/images/burger-transformed.png"
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
          className="bg-[#FF7B54] hover:bg-[#ff6a3c] text-white"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Create Your Own Transformation
        </Button>
      </div>
    </section>
  );
}
