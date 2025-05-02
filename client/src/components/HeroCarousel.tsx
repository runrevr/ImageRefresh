import { Button } from "@/components/ui/button";
import catsImage from "../assets/couple of cats.png";

interface HeroCarouselProps {
  onCreateClick: () => void;
}

export default function HeroCarousel({ onCreateClick }: HeroCarouselProps) {
  return (
    <div className="w-full min-h-screen bg-white relative overflow-hidden mt-0 pt-0">
      <div
        className="absolute inset-0 bg-center bg-cover z-0"
        style={{
          backgroundImage: `url(${catsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-1"></div>

      {/* Content overlay */}
      <div className="relative z-10 h-full w-full flex items-center justify-center pt-0 mt-20 sm:mt-0">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center mt-4 sm:mt-0 pt-20">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 text-white leading-[1.1] tracking-normal px-2 sm:px-4 md:px-8 shadow-text">
              Create Viral-Worthy Images In Just 3 Clicks
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 sm:mb-8 text-white px-2 shadow-text">
              Upload Your Image, Unload Your Imagination
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-white mx-auto px-4 max-w-xl shadow-text bg-black/20 py-4 rounded-lg">
              Imagine your kid as a cartoon hero. Your product as the next viral
              obsession. Your content creating tons of likes and comments. If
              nothing else you can make your friends look like a cat...
            </p>

            <div className="flex flex-col items-center justify-center px-4 sm:px-0">
              <Button
                className="w-full sm:w-auto bg-[#FF7B54] text-white hover:bg-[#FF6B44] text-base sm:text-lg font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-lg mb-6 sm:mb-8 shadow-[0_5px_15px_-2px_rgba(0,0,0,0.5)] border-2 border-white"
                onClick={onCreateClick}
              >
                ⚡ Let's Make Some Magic
              </Button>

              <div className="text-sm sm:text-base text-white p-2 text-center mb-4 bg-black/30 rounded-full px-4 py-2 shadow-text">
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
