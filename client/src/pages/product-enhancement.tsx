import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import SEO from "@/components/SEO";

// Import product images for the masonry grid
import shampoo1 from "../assets/shampoo-1.jpg";
import shampoo2 from "../assets/shampoo-2.png";
import shampoo3 from "../assets/shampoo-3.png";
import shampoo4 from "../assets/shampoo-4.png";
import mexicanFoodOriginal from "../assets/mexican-food-original.png";
import mexicanFoodEnhanced from "../assets/mexican-food-enhanced.png";
import sweatshirtBasic from "../assets/sweatshirt-basic.png";
import sweatshirtLifestyle from "../assets/sweatshirt-lifestyle.png";
import sweatshirtDynamic from "../assets/sweatshirt-dynamic.png";

// Define UserCredits type
type UserCredits = {
  totalCredits: number;
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
    <>
      <SEO 
        title="AI Product Photography Enhancement | Professional E-commerce Images"
        description="Transform ordinary product photos into professional e-commerce images with AI. Enhance lighting, backgrounds, and presentation for better sales conversions."
        keywords="product photography enhancement, e-commerce images, AI product photos, professional product images, online store photography, product image editing"
        canonical="https://imagerefresh.com/product-enhancement"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Refresh",
          "description": "AI-powered image transformation platform for personal and commercial use",
          "url": "https://imagerefresh.com",
          "applicationCategory": "PhotographyApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "10.00",
            "priceCurrency": "USD",
            "priceValidUntil": "2025-12-31"
          },
          "provider": {
            "@type": "Organization",
            "name": "Image Refresh",
            "url": "https://imagerefresh.com"
          }
        })}
      </script>
      <div className="flex flex-col min-h-screen">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />

        <main className="flex-grow">
          {/* Hero section */}
          <div className="bg-[#2A7B9B] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                TURN YOUR PRODUCT PHOTOS INTO
                <br />
                SCROLL-STOPPING SENSATIONS
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
                AI-powered image transformations that make your products pop—across social feeds, ads & your website.
              </p>
              <Link href="/upload">
                <Button size="lg" className="bg-[#FF7B54] text-white hover:bg-[#e56c49] px-8 py-6 text-lg">
                  Let's Enhance My Product Photos
                </Button>
              </Link>
            </div>
          </div>

          {/* Masonry grid with product images */}
          <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
                {/* Mexican Food Pair */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={mexicanFoodOriginal} alt="Basic food photography" className="w-full h-auto" />
                </div>

                {/* Sweatshirt Dynamic Version */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={sweatshirtDynamic} alt="Sweatshirt with dynamic background" className="w-full h-auto" />
                </div>

                {/* Enhanced Mexican Food */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={mexicanFoodEnhanced} alt="Enhanced food photography" className="w-full h-auto" />
                </div>

                {/* Sweatshirt Lifestyle */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={sweatshirtLifestyle} alt="Sweatshirt lifestyle photography" className="w-full h-auto" />
                </div>

                {/* Shampoo Gold Glamour */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={shampoo4} alt="Shampoo with gold luxury styling" className="w-full h-auto" />
                </div>

                {/* Original Sweatshirt */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={sweatshirtBasic} alt="Basic sweatshirt product photo" className="w-full h-auto" />
                </div>

                {/* Shampoo Bathroom Setting */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={shampoo3} alt="Shampoo in luxury bathroom setting" className="w-full h-auto" />
                </div>

                {/* Shampoo with Towels */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={shampoo2} alt="Shampoo with spa towels and greenery" className="w-full h-auto" />
                </div>

                {/* Shampoo Original Product Shot */}
                <div className="mb-5 transform transition-all duration-300 hover:scale-[1.02] shadow-lg rounded-lg overflow-hidden break-inside-avoid">
                  <img src={shampoo1} alt="Original product photography" className="w-full h-auto" />
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
              <Link href="/upload">
                <Button size="lg" className="bg-[#FF7B54] text-white hover:bg-[#e56c49]">
                  Let's Enhance My Product Photos
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}