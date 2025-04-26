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
    <div className="relative overflow-hidden text-white h-[90vh] min-h-[700px] mt-[-2rem]">
      {/* Background carousel */}
      <Carousel className="absolute inset-0 h-full w-full">
        <CarouselContent className="h-full">
          {examples.map((example) => (
            <CarouselItem key={example.id} className="h-full">
              <div className="relative h-full w-full">
                {/* Before/After Slider as Background */}
                <div className="absolute inset-0 z-0">
                  <ComparisonSlider 
                    className="h-full w-full"
                    before={
                      <div className="h-full w-full">
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
                      <div className="h-full w-full">
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
                </div>
                
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-white/60 z-10" />
                
                {/* Transformation type */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full z-20 backdrop-blur-sm">
                  {example.title}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 z-20 bg-black/60 hover:bg-black/80 text-white" />
        <CarouselNext className="absolute right-4 top-1/2 z-20 bg-black/60 hover:bg-black/80 text-white" />
      </Carousel>
      
      {/* Content overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-2 text-black leading-tight">
              Create Viral-Worthy Images In Just 3 Clicks
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-6 text-black/80">
              One Click. Incredible Results.
            </h2>
            <p className="text-xl lg:text-2xl mb-8 text-gray-700 mx-auto">
              Imagine your kid as a cartoon hero. Your product as the next viral obsession. Your content is creating trends. If Nothing Else You Can Make Your Friends Look Like a Simpson Charcter...
            </p>
            
            <div className="flex flex-col items-center justify-center">
              <Button 
                className="bg-white text-black hover:bg-white/90 text-lg font-medium px-8 py-6 rounded-lg mb-6 border-4 border-blue-500 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]" 
                onClick={onCreateClick}
              >
                🎉 Make My Photos Pop
              </Button>
              
              <div className="text-md text-gray-700 p-2">
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