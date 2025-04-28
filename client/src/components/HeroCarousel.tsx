import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ComparisonSlider } from "@/components/ui/comparison-slider";

// Define the type for our carousel items
interface CarouselExample {
  id: number;
  beforeImage: string;
  afterImage: string;
  title: string;
  description: string;
}

// Example data for our carousel
const examples: CarouselExample[] = [
  {
    id: 1,
    beforeImage: "/uploads/image-1745589592601-385889560.jpg",
    afterImage: "/uploads/transformed-1745589830896-image-1745589592601-385889560.jpg",
    title: "Product Photography",
    description: "Transform everyday products into professional studio quality photos"
  },
  {
    id: 2,
    beforeImage: "/uploads/image-1745519719394-392561701.jpg",
    afterImage: "/uploads/transformed-1745519755708-image-1745519719394-392561701.jpg",
    title: "Cartoon Style",
    description: "Convert your images into vibrant cartoon illustrations"
  },
  {
    id: 3,
    beforeImage: "/uploads/image-1745518488094-199361840.jpg",
    afterImage: "/uploads/transformed-1745518728162-image-1745518488094-199361840.jpg",
    title: "Custom Transformations",
    description: "Create any artistic style you can imagine"
  }
];

interface HeroCarouselProps {
  onCreateClick: () => void;
}

export default function HeroCarousel({ onCreateClick }: HeroCarouselProps) {
  return (
    <div className="relative overflow-hidden text-white h-screen w-full min-h-screen m-0 p-0 flex flex-col flex-grow" style={{ minHeight: '100vh', height: '100%' }}>
      {/* Background image with the cats */}
      <img 
        src="/images/couple_of_cats.png" 
        alt="Four cats dressed as humans"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-white/60 z-10" />
      
      {/* Content overlay */}
      <div className="relative z-20 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-6 md:px-8 py-10 pb-16">
          <div className="max-w-2xl mx-auto text-center md:pt-0">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-2 text-black leading-tight">
              Create Viral-Worthy Images In Just 3 Clicks
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-6 text-black/80">
              Upload Your Image, Unload Your Imagination
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-gray-700 mx-auto">
              Imagine your kid as a cartoon hero. Your product as the next viral obsession. Your content is creating tons of likes and comments. If nothing else you can make your friends look like a cat...
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <Button 
                className="bg-white text-black hover:bg-white/90 text-lg font-medium px-8 py-6 rounded-lg mb-10 border-4 border-[#FF7B54] shadow-[0_10px_25px_-5px_rgba(255,123,84,0.5)]" 
                onClick={onCreateClick}
              >
                ⚡ Let's Make Some Magic
              </Button>
              
              <div className="text-md text-gray-700 p-2 mb-4">
                <i className="fas fa-info-circle mr-2"></i>
                Your first transformation is free! No credit card required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}