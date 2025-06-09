import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

// Define UserCredits type similar to home.tsx
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function AboutPage() {
  const { user } = useAuth();
  const { data: userCredits } = useCredits();

  // Default to 0 if userCredits is not available
  const freeCredits = userCredits && !userCredits.freeCreditsUsed ? 1 : 0;
  const paidCredits = userCredits?.paidCredits || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="About ImageRefresh | AI-Powered Image Transformation Platform"
        description="Learn about ImageRefresh, the leading AI image transformation platform. Discover our mission to make professional photo editing accessible to everyone."
        keywords="about imagerefresh, AI image company, photo transformation team, image editing platform, AI photography tools"
        canonical="https://imagerefresh.com/about"
      />
      <Navbar 
        freeCredits={userCredits && !userCredits.freeCreditsUsed ? 1 : 0} 
        paidCredits={userCredits?.paidCredits || 0} 
      />

      <main className="flex-grow">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-[#A3E4D7] to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-6">
              About ImageRefresh
            </h1>
            <p className="text-lg md:text-xl text-[#333333] max-w-3xl mx-auto">
              Hi! I'm Cory, and I've created ImageRefresh to share the magic of AI image transformation with families everywhere.
            </p>
          </div>
        </div>

        {/* My Story section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#333333] mb-8 text-center">My Story</h2>

            <div className="prose prose-lg max-w-4xl mx-auto text-[#333333]">
              <p>
                ImageRefresh began as a family project. I started using AI image transformations with my daughter, turning her drawings 
                into incredible artwork that amazed her and sparked her imagination. What began as a fun family activity quickly grew 
                into something more meaningful.
              </p>

              <p>
                After sharing these transformations with friends and family, I noticed how much joy and wonder they brought to everyone. 
                The ability to see a child's drawing turn into a vibrant, realistic image or transform an ordinary photo into something extraordinary 
                created magical moments that strengthened connections and inspired creativity.
              </p>

              <p>
                Founded in 2025, ImageRefresh aims to bring this magic to everyone. Whether you're a parent wanting to transform your child's 
                drawing into a masterpiece, a product photographer in need of professional-quality images, or simply someone looking 
                to have fun with your photos, ImageRefresh is designed to make AI image transformation accessible, affordable, and fun for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* My Values section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f2f2f2]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#333333] mb-12 text-center">My Values</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg bg-[#2A7B9B]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-[#A3E4D7] rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4">Creativity First</h3>
                  </div>
                  <p className="text-white text-center">
                    I believe in enhancing human creativity, not replacing it. ImageRefresh is designed to inspire and amplify your creative vision.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-[#2A7B9B]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-[#A3E4D7] rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4">Safety & Privacy</h3>
                  </div>
                  <p className="text-white text-center">
                    I prioritize your privacy and the ethical use of AI. Your images are processed securely and aren't used to train our models.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-[#2A7B9B]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-[#A3E4D7] rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4">Simplicity</h3>
                  </div>
                  <p className="text-white text-center">
                    Advanced technology should be accessible to everyone. I've designed ImageRefresh to be intuitive and easy to use, regardless of technical skill.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Founder section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#333333] mb-12 text-center">Meet The Founder</h2>

            <div className="max-w-2xl mx-auto">
              {/* Founder card */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
                <div className="bg-[#A3E4D7] h-64 md:w-1/3 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="p-6 md:w-2/3">
                  <h3 className="text-2xl font-semibold text-[#333333] mb-1">Cory T.</h3>
                  <p className="text-[#2A7B9B] mb-4">Founder & AI Specialist</p>
                  <p className="text-[#333333]">
                    As an AI specialist and coach, I decided to create ImageRefresh after using similar AI transformations with my friends, family, and especially my daughter. We had so much fun as a family transforming otherwise boring images that we decided we needed to share this experience with the world.
                  </p>
                  <p className="text-[#333333] mt-4">
                    My passion lies in making advanced AI technology accessible to everyone, creating magical moments that bring joy and spark creativity. I hope you enjoy using ImageRefresh as much as we enjoy building it!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-[#2A7B9B] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your images?</h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90">
              Join thousands of users who are already creating stunning transformations with ImageRefresh.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-[#FF7B54] text-white hover:bg-[#e56c49]">
                Try It Now
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}