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
        title="About Image Refresh - AI Photo Transformation Created by a Dad for Families"
        description="Meet Cory, the dad and AI specialist who created Image Refresh to transform kids into superheroes and enhance family photos. Learn our story and mission to make AI image transformation accessible to everyone."
        keywords="about image refresh, AI image transformation founder, superhero photo transformation, family photo editing, AI specialist, kids superhero transformation, professional product photography AI"
        canonical="https://imagerefresh.com/about"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["WebApplication", "Organization"],
          name: "Image Refresh",
          description:
            "AI-powered image transformation platform that transforms kids into superheroes and enhances product photography for families and businesses",
          url: "https://imagerefresh.com",
          applicationCategory: "PhotographyApplication",
          operatingSystem: "Web",
          founder: {
            "@type": "Person",
            name: "Cory T.",
            jobTitle: "Founder & AI Specialist"
          },
          foundingDate: "2025",
          offers: {
            "@type": "Offer",
            price: "10.00",
            priceCurrency: "USD",
            priceValidUntil: "2025-12-31",
            description: "AI image transformation services for superhero transformations and product photography"
          },
          provider: {
            "@type": "Organization",
            name: "Image Refresh",
            url: "https://imagerefresh.com",
          },
          serviceType: ["AI Image Transformation", "Superhero Photo Transformation", "Product Photography Enhancement"],
          audience: {
            "@type": "Audience",
            audienceType: ["Parents", "Small Business Owners", "Dental Offices", "Photographers"]
          }
        })}
      </script>
      <Navbar
        freeCredits={userCredits && !userCredits.freeCreditsUsed ? 1 : 0}
        paidCredits={userCredits?.paidCredits || 0}
      />

      <main className="flex-grow pt-20">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-[#06B6D4] to-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6" style={{ fontFamily: "'Audiowide', cursive" }}>
              About Image Refresh
            </h1>
            <p className="text-lg md:text-xl text-[#1F2937] max-w-3xl mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              The AI Image Transformation Platform Created by a Dad to Bring Magic to Every Family
            </p>
            <div className="mt-6 flex justify-center space-x-8 text-sm text-[#06B6D4]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <div className="text-center">
                <div className="text-2xl font-bold">10,000+</div>
                <div>Photos Transformed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2,500+</div>
                <div>Happy Families</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">30 sec</div>
                <div>Average Transform Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* My Story section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-8 text-center" style={{ fontFamily: "'Audiowide', cursive" }}>
              From Family Fun to Helping Thousands Transform Photos with AI
            </h2>

            <div className="prose prose-lg max-w-4xl mx-auto text-[#1F2937]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <div className="bg-[#FEF3C7] p-6 rounded-lg border-l-4 border-[#F97316] mb-8">
                <p className="text-lg font-semibold mb-2">
                  <strong>Hi! I'm Cory, and I created Image Refresh to share the magic of AI image transformation with families everywhere.</strong>
                </p>
                <p className="mb-0">
                  What started as a fun family activity has helped thousands of parents <strong>transform their kids into superheroes</strong> and small businesses create <strong>professional product photos</strong>.
                </p>
              </div>

              <h3 className="text-2xl font-bold text-[#06B6D4] mt-8 mb-4" style={{ fontFamily: "'Audiowide', cursive" }}>The Story Behind Image Refresh</h3>

              <p className="mb-6">
                Image Refresh began as a family project when I started using <strong>AI image transformation technology</strong> with my daughter. We'd take her simple drawings and transform them into incredible artwork that amazed her and sparked her imagination. Watching her eyes light up when she saw her creations come to life was pure magic.
              </p>

              <p className="mb-6">
                What began as turning <strong>kids' drawings into reality</strong> quickly evolved into something bigger. We started transforming family photos, turning my daughter into her favorite superheroes, and creating <strong>cartoon versions of our family pets</strong>. Each transformation brought more joy and wonder to our family time.
              </p>

              <p className="mb-6">
                After sharing these <strong>AI photo transformations</strong> with friends and family, I noticed the same magical reactions everywhere. Parents were amazed at seeing their children as superheroes. Small business owners discovered they could create <strong>professional product photography</strong> without expensive photoshoots. Even <strong>dental offices</strong> started using our transformations to help kids feel more comfortable during visits.
              </p>

              <h3 className="text-2xl font-bold text-[#06B6D4] mt-8 mb-4" style={{ fontFamily: "'Audiowide', cursive" }}>Our Mission: Making AI Transformation Accessible to Everyone</h3>

              <p className="mb-4">
                Founded in 2025, Image Refresh aims to bring this magic to everyone. Whether you're:
              </p>

              <ul className="list-disc ml-6 mb-6 space-y-2">
                <li><strong>A parent</strong> wanting to transform your child into their favorite superhero</li>
                <li><strong>A small business owner</strong> needing professional product photos for e-commerce</li>
                <li><strong>A dental office</strong> looking to make kids more comfortable during visits</li>
                <li><strong>A photographer</strong> wanting to offer unique AI transformation services</li>
                <li><strong>Anyone</strong> who wants to have fun with AI photo transformation</li>
              </ul>

              <p className="mb-6">
                Image Refresh is designed to make <strong>AI image transformation accessible, affordable, and fun</strong> for everyone - no technical skills required. Our platform serves both families looking for magical moments and businesses needing professional-quality results.
              </p>

              <div className="bg-[#FAFAFA] p-6 rounded-lg mt-8 border border-[#E5E7EB]">
                <h4 className="text-lg font-bold text-[#06B6D4] mb-3" style={{ fontFamily: "'Audiowide', cursive" }}>What Makes Us Different</h4>
                <ul className="list-none space-y-2 text-sm">
                  <li>🎯 <strong>Dual Focus:</strong> We serve both families (B2C) and businesses (B2B)</li>
                  <li>🏥 <strong>Unique Niche:</strong> Specialized solutions for dental offices and pediatric care</li>
                  <li>⚡ <strong>Speed:</strong> 30-second transformations vs. hours of manual editing</li>
                  <li>🔒 <strong>Privacy First:</strong> Your images aren't used to train our AI models</li>
                  <li>💰 <strong>Affordable:</strong> Professional results at a fraction of traditional costs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* My Values section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-12 text-center" style={{ fontFamily: "'Audiowide', cursive" }}>
              Our Core Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg bg-[#06B6D4]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#06B6D4]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4" style={{ fontFamily: "'Audiowide', cursive" }}>
                      🎨 Creativity First
                    </h3>
                  </div>
                  <p className="text-white text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    We believe in enhancing human creativity, not replacing it. Image Refresh amplifies your creative vision and helps bring imagination to life through <strong>AI transformation technology</strong>.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-[#84CC16]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#84CC16]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4" style={{ fontFamily: "'Audiowide', cursive" }}>
                      🔒 Safety & Privacy
                    </h3>
                  </div>
                  <p className="text-white text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    We prioritize your privacy and the ethical use of AI. Your images are processed securely and <strong>aren't used to train our models</strong>. What happens with your photos stays with your photos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-[#F97316]">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-[#F97316]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-4" style={{ fontFamily: "'Audiowide', cursive" }}>
                      ⚡ Simplicity
                    </h3>
                  </div>
                  <p className="text-white text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Advanced AI technology should be accessible to everyone. We've designed Image Refresh to be <strong>intuitive and easy to use</strong>, regardless of technical skill level.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Founder section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-[#1F2937] mb-12 text-center" style={{ fontFamily: "'Audiowide', cursive" }}>
              Meet The Founder
            </h2>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Founder card */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row border border-[#E5E7EB]">
                    <div className="bg-[#06B6D4] h-64 md:w-1/3 flex items-center justify-center">
                      <div className="text-6xl font-bold text-white" style={{ fontFamily: "'Audiowide', cursive" }}>CT</div>
                    </div>
                    <div className="p-6 md:w-2/3">
                      <h3 className="text-2xl font-semibold text-[#1F2937] mb-1" style={{ fontFamily: "'Audiowide', cursive" }}>
                        Cory T.
                      </h3>
                      <p className="text-[#06B6D4] mb-4 font-semibold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Founder & AI Specialist</p>
                      <p className="text-[#1F2937] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        As an <strong>AI specialist and coach</strong>, I decided to create Image Refresh after experiencing the joy of <strong>AI transformations with my family</strong>. We had so much fun transforming photos that we decided we needed to share this experience with the world.
                      </p>
                      <p className="text-[#1F2937]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                        My passion lies in making advanced AI technology accessible to everyone, creating magical moments that bring joy and spark creativity. I hope you enjoy using Image Refresh as much as we enjoy building it!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick facts sidebar */}
                <div className="space-y-6">
                  <div className="bg-[#FAFAFA] p-6 rounded-lg border border-[#E5E7EB]">
                    <h4 className="text-lg font-bold text-[#06B6D4] mb-4" style={{ fontFamily: "'Audiowide', cursive" }}>Quick Facts</h4>
                    <ul className="space-y-3 text-sm text-[#1F2937]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <li className="flex items-center">
                        <span className="text-[#06B6D4] mr-3 text-base">🎯</span>
                        <span className="text-[#1F2937] font-medium">Specialized in AI image transformation</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#06B6D4] mr-3 text-base">👨‍👧</span>
                        <span className="text-[#1F2937] font-medium">Started as a family project</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#06B6D4] mr-3 text-base">🏢</span>
                        <span className="text-[#1F2937] font-medium">Serves families & businesses</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#06B6D4] mr-3 text-base">🔒</span>
                        <span className="text-[#1F2937] font-medium">Privacy & security focused</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#06B6D4] mr-3 text-base">⚡</span>
                        <span className="text-[#1F2937] font-medium">30-second transformations</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#FEF3C7] p-6 rounded-lg border border-[#F97316]">
                    <h4 className="text-lg font-bold text-[#F97316] mb-3" style={{ fontFamily: "'Audiowide', cursive" }}>Our Specialties</h4>
                    <ul className="space-y-2 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      <li className="text-[#1F2937] font-medium">• Kids to superhero transformations</li>
                      <li className="text-[#1F2937] font-medium">• Professional product photography</li>
                      <li className="text-[#1F2937] font-medium">• Dental office entertainment</li>
                      <li className="text-[#1F2937] font-medium">• Custom AI image generation</li>
                      <li className="text-[#1F2937] font-medium">• Bulk processing for businesses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-[#06B6D4] py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Audiowide', cursive" }}>
              Ready to Experience the Magic?
            </h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto opacity-90" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Join thousands of families and businesses who've discovered the joy of <strong>AI image transformation</strong>. Start your free transformation today!
            </p>
            <div className="space-x-4">
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-[#F97316] text-white hover:bg-[#ea580c] font-semibold px-8 py-3"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Start Free Transformation
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#06B6D4] font-semibold px-8 py-3"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}