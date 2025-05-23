import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Link } from 'wouter'

export default function ProductImageFixedPage() {
  // Mock credits for development
  const freeCredits = 1;
  const paidCredits = 10;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow bg-white">
        {/* Hero Section */}
        <section className="pt-20 pb-12 bg-gradient-to-b from-blue-50 to-white">
          <div className="relative mx-auto max-w-6xl px-6 pt-24 lg:pb-16 lg:pt-20">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold mb-16 text-gray-800">
                Turn Any Product Photo Into a Sales Magnet
              </h1>
<p className="mx-auto max-w-2xl text-lg text-gray-600 mb-24">
  Upload your product image, get AI-powered enhancement ideas, download professional results. No design experience required.
</p>
             
              <Link href="/upload-enhance">
                <RainbowButton className="py-3 px-6">
                  Transform My Product Photos Now
                </RainbowButton>
              </Link>

              <p className="mt-4 text-sm text-gray-500 text-center">
                No credit card required • 1 free enhancement
              </p>
          
              {/* Before/After Gallery */}
              <div className="mt-12 mb-12">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-5 pb-4 px-4 animate-scroll">
                    {/* Card 1: Handmade Jewelry */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/seltzer.jpg"
                            alt="Original beverage design
                            " 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/seltzer2.png" 
                            alt="AI enhanced beverage design" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Product Design Enhancement</p>
                    </div>

                    {/* Card 2: Artisan Candles */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/camo.jpg"
                            alt="Original camo sweatshirt" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/camo2.png" 
                            alt="AI Camo sweatshirt" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Clothing</p>
                    </div>

                    {/* Card 3: Footwear */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/sandal.jpg"
                            alt="Original womens sandal" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/sandal2.png"
                            alt="AI enhanced womens sandal" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Handmade Pottery</p>
                    </div>

                    {/* Card 4: Skincare Products */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/nounou-shampoo copy.jpg"                            alt="Original skincare photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/shampoo space.png"
                            alt="AI enhanced skincare photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Beauty Products</p>
                    </div>

                    {/* Card 5: Furniture/Staging */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/chair.jpg"
                            alt="Original chair photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/chair2.png" 
                            alt="AI enhanced beer bottle photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Furniture/Staging</p>
                    </div>

                    {/* Card 6: Consumer Goods */}
                    <div className="bg-white rounded-lg p-4 shadow-md w-80 flex-shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <img 
                            src="/src/assets/world.jpg" 
                            alt="Original tech accessory photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Original</span>
                        </div>
                        <div className="relative">
                          <img 
                            src="/src/assets/world2.png"
                            alt="AI enhanced tech accessory photo" 
                            className="w-full h-32 object-cover rounded" 
                          />
                          <span className="absolute bottom-2 left-2 bg-[#2A7B9B] text-white text-xs px-2 py-1 rounded">AI Enhanced</span>
                        </div>
                      </div>
                      <p className="text-center text-sm font-medium mt-2 text-gray-700">Consumer Goods</p>
                    </div>
                  </div>
                </div>
              </div>

                </div>
              </div>

        </section>
        {/* Before/After Gallery Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center -mb-12">
              <h2 className="text-3xl font-semibold text-black mb-4">See the AI Magic in Action</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real examples from small business owners who've transformed their product photos with our AI enhancement tools
              </p>
            </div>

            {/* Your existing gallery code goes here */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-5 pb-4 px-4">
                {/* Your existing cards... */}
              </div>
            </div>
          </div>
        </section>
        {/* Three cards section */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Upload Enhancement */}
              <div className="bg-white rounded-[1.25rem] border-2 border-gray-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-96">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#2A7B9B]/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-black">AI Product Enhancement</h3>
                    <p className="text-center text-gray-600 mb-6">Upload your product image, our AI will analyze the image and make image enhancement suggestions based on popular trends. Get up to 5 ideas for each image.</p>
                  </div>

                  <Link href="/upload-enhance">
                    <RainbowButton className="w-full py-2 px-4 mt-auto">
                      Upload Photos
                    </RainbowButton>
                  </Link>
                </div>
              </div>

              {/* Card 2: Prebuilt Prompts */}
              <div className="bg-white rounded-[1.25rem] border-2 border-gray-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-96">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#FF7B54]/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF7B54]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-black">Prebuilt Prompts</h3>
                    <p className="text-center text-gray-600 mb-6">Use our expert-designed prompts to quickly transform your images. Choose from things like background removal, enhanced lighting, real world uses, etc</p>
                  </div>

                  <RainbowButton className="w-full py-2 px-4 mt-auto">
                    Explore Prompts
                  </RainbowButton>
                </div>
              </div>

              {/* Card 3: Text-to-Image */}
              <div className="bg-white rounded-[1.25rem] border-2 border-gray-200 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-96">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#A3E4D7]/20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#A3E4D7]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-center mb-3 text-black">Text-to-Image</h3>
                    <p className="text-center text-gray-600 mb-6">Explain what you want in detail and AI will produce the image for you. For example, " I need images of a serene massage room with a womans hands in image."</p>
                  </div>

                  <RainbowButton className="w-full py-2 px-4 mt-auto">
                    Create Variations
                  </RainbowButton>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-black ">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
                
                <h3 className="text-xl font-semibold mb-2 text-black">Upload</h3>
                <p className="text-gray-600">Upload your product images to our secure platform in seconds</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
                
                <h3 className="text-xl font-semibold mb-2 text-black">Transform</h3>
                <p className="text-gray-600">Choose from dozens of AI-powered transformations and enhancements</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-[#2A7B9B] rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2 text-black">Download</h3>
                <p className="text-gray-600">Download your enhanced images in high resolution for immediate use</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex text-yellow-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="italic mb-4 text-gray-600">"This tool saved me hours of photo editing time. The AI enhancements are remarkable and have helped my products stand out!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center text-blue-600 font-bold">S</div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">E-commerce Store Owner</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex text-yellow-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="italic mb-4 text-gray-600">"My product photos went from amateur to professional with just a few clicks. Amazing service that has significantly increased my conversion rates!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full mr-3 flex items-center justify-center text-blue-600 font-bold">M</div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-500">Etsy Shop Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
       
        {/* CTA Section */}
        <section className="py-16 bg-[#2A7B9B]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-medium text-white mb-4">Ready to transform your product images?</h2>
            <p className="text-xl text-white/80 mb-8">Start enhancing your visuals today</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <RainbowButton className="py-3 px-8">
                Start Free Trial
              </RainbowButton>
              <RainbowButton className="py-3 px-8">
                See pricing
              </RainbowButton>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}