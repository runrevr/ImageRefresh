import { Button } from "@/components/ui/button";
import catsImage from "../assets/couple of cats.png";

interface HeroCarouselProps {
  onCreateClick: () => void;
}

export default function HeroCarousel({ onCreateClick }: HeroCarouselProps) {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)] md:h-screen bg-white relative overflow-hidden mt-0 pt-0">
      <div 
        className="absolute inset-0 bg-center bg-cover z-0"
        style={{
          backgroundImage: `url(${catsImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-white/60 z-1"></div>
      
      {/* Content overlay */}
      <div className="relative z-10 h-full w-full flex items-center justify-center pt-16 sm:pt-20">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-4 text-black leading-[1.1] tracking-normal px-2 sm:px-4 md:px-8">
              Create Viral-Worthy Images In Just 3 Clicks
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-4 sm:mb-6 text-black/80 px-2">
              Upload Your Image, Unload Your Imagination
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-700 mx-auto px-4">
              Imagine your kid as a cartoon hero. Your product as the next viral obsession. Your content creating tons of likes and comments. If nothing else you can make your friends look like a cat...
            </p>
            
            <div className="flex flex-col items-center justify-center px-2 sm:px-0">
              <Button 
                className="w-full sm:w-auto bg-white text-black hover:bg-white/90 text-base sm:text-lg font-medium px-4 sm:px-8 py-5 sm:py-6 rounded-lg mb-4 sm:mb-6 border-4 border-[#FF7B54] shadow-[0_5px_15px_-5px_rgba(255,123,84,0.5)]" 
                onClick={onCreateClick}
              >
                ⚡ Let's Make Some Magic
              </Button>
              
              <div className="text-sm sm:text-md text-gray-700 p-2 text-center">
                <i className="fas fa-info-circle mr-1 sm:mr-2"></i>
                Your first transformation is free! No credit card required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}