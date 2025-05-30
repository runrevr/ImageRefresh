import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Link } from 'wouter'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { useCredits } from '@/hooks/useCredits'

// Enhanced Product Image Lab page with all the requested elements
export default function ProductImageLabPage() {
  const { data: userCredits } = useCredits();
  const freeCredits = userCredits?.freeCreditsUsed ? 0 : 1;
  const paidCredits = userCredits?.paidCredits || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-[#A3E4D7]/20 to-transparent"></div>
            <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#FF7B54]/10 to-transparent"></div>
          </div>
          
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="text-center mx-auto max-w-3xl">
              <h1 className="text-balance text-4xl font-medium mb-6 sm:text-5xl md:text-6xl text-[#333333]">
                Transform your product photos
              </h1>
              
              <p className="mx-auto text-pretty text-lg text-[#333333]/80 mb-10">
                Professional-quality product images in minutes, no design skills needed. Perfect for small business owners and entrepreneurs.
              </p>

              <form className="mt-12 mx-auto max-w-sm mb-20">
                <div className="relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-[1rem] border shadow-md bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-y-0 left-4 my-auto size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 18l-8-7.56v-2L2 2 1 3l7.51 7.52" />
                    <path d="M10.02 12.28L14 16l7.45-5.96" />
                    <path d="M21.5 6v10c0 .14-.02.28-.06.42l-7.79 7.79-.42.06h-8.46c-.8 0-1.17 0-1.47-.06a3 3 0 0 1-2.2-2.2C1 21.72 1 21.35 1 20.54v-9.08c0-.8 0-1.17.06-1.47a3 3 0 0 1 2.2-2.2c.3-.06.67-.06 1.47-.06H8" />
                  </svg>

                  <input
                    placeholder="Your email address"
                    className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                    type="email"
                  />

                  <div className="md:pr-1.5">
                    <RainbowButton>
                      <span className="hidden md:block">Get Started</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="relative mx-auto size-5 md:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </RainbowButton>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Three horizontal cards section - Bento Grid */}
        <section className="py-10">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Upload for Enhancement */}
              <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col space-y-4">
                  {/* Card Header with Icon */}
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute -right-2 -top-2 size-4 text-[#FF7B54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Heading and Description */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#333333]">Enhance your product photos</h3>
                    <p className="mt-2 text-[#333333]/80">Upload up to 5 images and our AI will suggest professional improvements</p>
                  </div>
                  
                  {/* Example Before/After */}
                  <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="overflow-hidden rounded-md">
                        <div className="h-24 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          Before
                        </div>
                      </div>
                      <div className="overflow-hidden rounded-md">
                        <div className="h-24 w-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                          After
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link href="/upload">
                    <RainbowButton className="mt-4 w-full">
                      Upload Photos
                    </RainbowButton>
                  </Link>
                </div>
              </div>

              {/* Card 2: Prebuilt Prompts */}
              <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col space-y-4">
                  {/* Card Header with Icon */}
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Heading and Description */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#333333]">Quick fixes with prebuilt tools</h3>
                    <p className="mt-2 text-[#333333]/80">Choose from expert-designed enhancements for your product images</p>
                  </div>
                  
                  {/* Example Templates */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-white p-2 text-center shadow-sm">
                      <div className="mb-1 h-12 rounded bg-[#FF7B54]/10 flex items-center justify-center">
                        <span className="text-xs text-[#FF7B54]">Remove BG</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-white p-2 text-center shadow-sm">
                      <div className="mb-1 h-12 rounded bg-[#2A7B9B]/10 flex items-center justify-center">
                        <span className="text-xs text-[#2A7B9B]">Lighting</span>
                      </div>
                    </div>
                    <div className="rounded-md bg-white p-2 text-center shadow-sm">
                      <div className="mb-1 h-12 rounded bg-[#A3E4D7]/20 flex items-center justify-center">
                        <span className="text-xs text-[#2A7B9B]">Shadows</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link href="/prebuilt-prompts">
                    <RainbowButton className="mt-4 w-full">
                      Explore Prebuilt Tools
                    </RainbowButton>
                  </Link>
                </div>
              </div>

              {/* Card 3: Text-to-Image */}
              <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col space-y-4">
                  {/* Card Header with Icon */}
                  <div className="flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-8 text-[#2A7B9B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="absolute -right-3 -top-2 size-4 text-[#FF7B54]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 4V2" />
                          <path d="M15 16v-2" />
                          <path d="M8 9h2" />
                          <path d="M20 9h2" />
                          <path d="M17.8 11.8 19 13" />
                          <path d="M15 9h0" />
                          <path d="M17.8 6.2 19 5" />
                          <path d="M3 21l9-9" />
                          <path d="M12.2 6.2 11 5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Heading and Description */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#333333]">Generate product variations</h3>
                    <p className="mt-2 text-[#333333]/80">Create different colors, styles, and contexts for your product</p>
                  </div>
                  
                  {/* Example Color Variations */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-red-500 shadow-sm"></div>
                    <div className="h-12 w-12 rounded-full bg-blue-500 shadow-sm"></div>
                    <div className="h-12 w-12 rounded-full bg-green-500 shadow-sm"></div>
                    <div className="h-12 w-12 rounded-full bg-yellow-500 shadow-sm"></div>
                    <div className="h-12 w-12 rounded-full bg-purple-500 shadow-sm"></div>
                  </div>
                  
                  {/* CTA Button */}
                  <RainbowButton 
                    className="mt-4 w-full"
                    onClick={() => window.location.href = '/text-to-image.html'}
                  >
                    Create Variations
                  </RainbowButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-[#F9F9F9]">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 z-10 relative">1</div>
                <div className="absolute top-12 left-1/2 h-0.5 w-full bg-[#2A7B9B]/20 hidden md:block"></div>
                <h3 className="text-xl font-semibold mb-2 text-[#333333]">Upload</h3>
                <p className="text-[#333333]/80">Upload your product images to our secure platform in seconds</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 z-10 relative">2</div>
                <div className="absolute top-12 left-1/2 h-0.5 w-full bg-[#2A7B9B]/20 hidden md:block"></div>
                <h3 className="text-xl font-semibold mb-2 text-[#333333]">Transform</h3>
                <p className="text-[#333333]/80">Choose from dozens of AI-powered transformations and enhancements</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2 text-[#333333]">Download</h3>
                <p className="text-[#333333]/80">Download your enhanced images in high resolution for immediate use</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="italic mb-4 text-[#333333]/80">"This tool saved me hours of photo editing time. The AI enhancements are remarkable and have helped my products stand out!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#2A7B9B]/20 rounded-full mr-3 flex items-center justify-center text-[#2A7B9B] font-bold">S</div>
                  <div>
                    <div className="font-semibold text-[#333333]">Sarah Chen</div>
                    <div className="text-sm text-[#333333]/60">E-commerce Store Owner</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="italic mb-4 text-[#333333]/80">"The variety of transformation options is incredible. I can create professional product shots without hiring a photographer!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#2A7B9B]/20 rounded-full mr-3 flex items-center justify-center text-[#2A7B9B] font-bold">M</div>
                  <div>
                    <div className="font-semibold text-[#333333]">Marcus Rivera</div>
                    <div className="text-sm text-[#333333]/60">Small Business Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-br from-[#2A7B9B] to-[#A3E4D7] text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your product photos?</h2>
            <p className="text-xl mb-8 text-white/90">Join thousands of business owners who trust our AI-powered image enhancement tools.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/upload">
                <RainbowButton className="px-8 py-3 text-lg">
                  Start Free Trial
                </RainbowButton>
              </Link>
              <button className="px-8 py-3 text-lg border-2 border-white text-white hover:bg-white hover:text-[#2A7B9B] transition-colors rounded-lg">
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}