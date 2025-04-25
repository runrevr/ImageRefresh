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
    <div className="relative overflow-hidden bg-black text-white py-16 mt-[-2rem]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Text content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text leading-tight">
              Transform Your Photos with AI
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-300 max-w-2xl lg:mx-0 mx-auto">
              Upload any photo and watch our AI transform it into something extraordinary. No design skills needed.
            </p>
            <div className="text-md bg-white/10 text-white p-4 rounded-md inline-flex items-center backdrop-blur-sm mb-8 max-w-md">
              <i className="fas fa-info-circle mr-2"></i>
              Your first transformation is free! No credit card required.
            </div>
            
            <Button 
              className="bg-white text-black hover:bg-white/90 text-lg font-medium px-8 py-6 rounded-lg shadow-lg" 
              onClick={onCreateClick}
            >
              Create Now
            </Button>
          </div>
          
          {/* Carousel */}
          <div className="w-full lg:w-1/2">
            <Carousel className="w-full max-w-xl mx-auto">
              <CarouselContent>
                {examples.map((example) => (
                  <CarouselItem key={example.id} className="pl-0">
                    <div className="rounded-xl overflow-hidden">
                      <ComparisonSlider 
                        className="h-[400px] w-full"
                        before={
                          <div className="h-full w-full flex items-center justify-center">
                            <img 
                              src={example.beforeImage} 
                              alt="Before" 
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute left-4 bottom-4 text-white px-2 py-1 bg-black/50 rounded-md text-sm">
                              Before
                            </div>
                          </div>
                        }
                        after={
                          <div className="h-full w-full flex items-center justify-center">
                            <img 
                              src={example.afterImage} 
                              alt="After" 
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute right-4 bottom-4 text-white px-2 py-1 bg-black/50 rounded-md text-sm">
                              After
                            </div>
                          </div>
                        }
                      />
                      <div className="mt-4 text-center">
                        <h3 className="text-lg font-semibold">{example.title}</h3>
                        <p className="text-gray-300">{example.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 bg-white/20 hover:bg-white/30 text-white" />
              <CarouselNext className="absolute right-2 bg-white/20 hover:bg-white/30 text-white" />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
}