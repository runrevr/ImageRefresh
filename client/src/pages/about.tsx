import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

// Define UserCredits type similar to home.tsx
type UserCredits = {
  freeCreditsUsed: boolean;
  paidCredits: number;
  id: number;
};

export default function AboutPage() {
  const authContext = useAuth();
  const authUser = authContext?.user || null;
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
        <div className="bg-gradient-to-b from-blue-100 to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About ImageRefresh
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              We're revolutionizing how people transform and enhance their images using cutting-edge AI technology.
            </p>
          </div>
        </div>
        
        {/* Our Story section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            
            <div className="prose prose-lg max-w-4xl mx-auto text-gray-700">
              <p>
                ImageRefresh was born from a simple observation: while AI image generation technology was becoming increasingly powerful, 
                it remained inaccessible to everyday users who just wanted to transform their personal photos in fun and creative ways.
              </p>
              
              <p>
                Founded in 2025, our mission is to democratize access to advanced AI image transformation technology, 
                making it easy, affordable, and fun for everyone to use. Whether you're a parent wanting to transform your child's 
                drawing into a masterpiece, a product photographer in need of professional-quality images, or simply someone looking 
                to have fun with your photos, ImageRefresh is designed for you.
              </p>
              
              <p>
                Our team combines expertise in artificial intelligence, user experience design, and visual arts to create a platform 
                that's both powerful and intuitive. We believe that technology should enhance human creativity, not replace it.
              </p>
            </div>
          </div>
        </div>
        
        {/* Our Values section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mt-4">Creativity First</h3>
                  </div>
                  <p className="text-gray-700 text-center">
                    We believe in enhancing human creativity, not replacing it. Our tools are designed to inspire and amplify your creative vision.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mt-4">Safety & Privacy</h3>
                  </div>
                  <p className="text-gray-700 text-center">
                    We prioritize your privacy and the ethical use of AI. Your images are processed securely and aren't used to train our models.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mt-4">Simplicity</h3>
                  </div>
                  <p className="text-gray-700 text-center">
                    Advanced technology should be accessible to everyone. We've designed our platform to be intuitive and easy to use, regardless of technical skill.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Team section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team member card */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Alex Chen</h3>
                  <p className="text-blue-600 mb-4">Founder & CEO</p>
                  <p className="text-gray-700">
                    With a background in AI and computer vision, Alex founded ImageRefresh to make advanced image transformation technology accessible to everyone.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Sophia Rodriguez</h3>
                  <p className="text-blue-600 mb-4">CTO</p>
                  <p className="text-gray-700">
                    Sophia leads our technical team, bringing expertise in machine learning and AI model development to create our powerful transformation engine.
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Marcus Johnson</h3>
                  <p className="text-blue-600 mb-4">Design Director</p>
                  <p className="text-gray-700">
                    Marcus oversees the user experience and design of our platform, ensuring that powerful technology is wrapped in an intuitive, beautiful interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to transform your images?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of users who are already creating stunning transformations with ImageRefresh.
            </p>
            <Link href="/">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
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