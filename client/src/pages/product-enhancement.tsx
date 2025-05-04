import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

// Import some product images for the masonry grid
import bearAfter from "../assets/bear-after.png";
import bear from "../assets/bear-drawing.png";
import deerDrinking from "../assets/beer-drinking-deer.png";
import giraffe from "../assets/giraffe-real.png"; 
import dogAndCat from "../assets/dog-and-cat-real.png";
import lego from "../assets/lego-character.png";

// Define UserCredits type
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function ProductEnhancementPage() {
  const { user: authUser } = useAuth();
  // Initialize local user state with data from auth
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  
  // Update local user state when auth user changes
  useEffect(() => {
    if (authUser) {
      setUserCredits({
        id: authUser.id,
        freeCreditsUsed: authUser.freeCreditsUsed,
        paidCredits: authUser.paidCredits
      });
    }
  }, [authUser]);
  
  // Default to 0 if userCredits is not available
  const freeCredits = userCredits && !userCredits.freeCreditsUsed ? 1 : 0;
  const paidCredits = userCredits?.paidCredits || 0;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-[#2A7B9B] text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Turn Your Product Photos into Scroll-Stopping Sensations
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              AI-powered image transformations that make your products pop—across social feeds, ads & your website.
            </p>
            <Button size="lg" className="bg-[#FF7B54] text-white hover:bg-[#e56c49]">
              Start Your Free Trial
            </Button>
          </div>
        </div>
        
        {/* Masonry grid with product images */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
              {/* Image 1 - Bear After - Larger Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={bearAfter} alt="Enhanced product" className="w-full h-auto" />
              </div>
              
              {/* Image 2 - Deer - Medium Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={deerDrinking} alt="Enhanced product" className="w-full h-auto" />
              </div>
              
              {/* Image 3 - Bear Drawing - Smaller Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={bear} alt="Product before enhancement" className="w-full h-auto" />
              </div>
              
              {/* Image 4 - Dog and Cat - Medium Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={dogAndCat} alt="Enhanced dog and cat" className="w-full h-auto" />
              </div>
              
              {/* Image 5 - Giraffe - Larger Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={giraffe} alt="Enhanced giraffe" className="w-full h-auto" />
              </div>
              
              {/* Image 6 - Lego - Medium Image */}
              <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                <img src={lego} alt="Enhanced lego character" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Features Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f2f2f2]">
          <div className="max-w-5xl mx-auto">
            <div className="prose prose-lg max-w-4xl mx-auto text-[#333333]">
              <p>
                Imagine your best-selling items not just displayed, but celebrated—vibrant, lifestyle-driven images that
                stop the scroll and drive clicks. Whether you're selling apparel, electronics, home goods or bespoke creations,
                our expert team uses cutting-edge AI and design flair to:
              </p>
              
              <ul className="space-y-6 mt-8">
                <li className="flex items-start">
                  <div className="bg-[#A3E4D7] rounded-full p-1 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#333333] mt-0">Elevate Visual Appeal</h3>
                    <p className="mt-1">From crisp shadows to dynamic backgrounds, we bring every detail to life.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-[#A3E4D7] rounded-full p-1 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#333333] mt-0">Boost Engagement</h3>
                    <p className="mt-1">Social-ready formats, perfect framing and on-trend styling ensure your posts go viral.</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-[#A3E4D7] rounded-full p-1 mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#333333] mt-0">Streamline Your Workflow</h3>
                    <p className="mt-1">Simply upload your originals—our end-to-end process delivers polished images back in 24–48 hours.</p>
                  </div>
                </li>
              </ul>
              
              <p className="mt-8 font-semibold text-lg">
                Don't settle for "good enough." Give your products the show-stopping imagery they deserve and watch your clicks, shares, and sales soar.
              </p>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-[#2A7B9B] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Get your first transformed image on us</h2>
            <Button size="lg" className="bg-[#FF7B54] text-white hover:bg-[#e56c49]">
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}