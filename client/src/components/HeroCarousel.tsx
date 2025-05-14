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
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-white/60 z-1"></div>

      {/* Content overlay */}
      <div className="relative z-10 h-full w-full flex items-center justify-center pt-24 sm:pt-12">
        <div className="container mx-auto px-6 md:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 text-black leading-[1.15] tracking-normal px-4 sm:px-6 md:px-10 max-w-screen-lg mx-auto">
              Transform Any Photo in Seconds—No Design Skills Needed!            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-6 sm:mb-8 text-black/80 px-4 sm:px-6 md:px-10 max-w-screen-lg mx-auto">
              Upload any image. Choose a vibe—anything from playful to polished. Get a custom-enhanced version that’s perfect for social media or your online store.
            </h2>

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
