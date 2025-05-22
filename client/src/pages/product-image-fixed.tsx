import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-medium mb-6 text-gray-800">
                Stop Losing Sales to Bad Product Photos
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-8">
                Professional-quality product images in minutes, no design skills needed. Perfect for small business owners and entrepreneurs.
              </p>
              
              {/* Email Signup Form */}
              <div className="mx-auto max-w-md mb-16">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="py-3 pl-10 pr-4 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button className="py-3 px-6 text-white font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 sm:whitespace-nowrap">
                    Try Now For Free
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three cards section */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Upload Enhancement */}
              <div className="bg-white rounded-[1.25rem] border-l-4 border-l-[#2A7B9B] border-t border-r border-b border-gray-200 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#2A7B9B]/10 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3 text-black">AI Product Enhancement</h3>
                <p className="text-center text-gray-600 mb-6">Upload your product image, our AI will analyze the image and make image enhancement suggestions based on popular trends. Get up to 5 ideas for each image.</p>
                
                
                <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700">
                  Upload Photos
                </button>
              </div>
              
              {/* Card 2: Prebuilt Prompts */}
              <div className="bg-white rounded-[1.25rem] border-l-4 border-l-[#2A7B9B] border-t border-r border-b border-gray-200 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#FF7B54]/10 rounded-full flex items-center justify-center">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FF7B54]" viewBox="0 0 20 20" fill="currentColor">
    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
  </svg>
</div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3 text-black">Prebuilt Prompts</h3>
                <p className="text-center text-gray-600 mb-6">Use our expert-designed prompts to quickly transform your images. Choose from things like background removal, enhanced lighting, real world uses, etc</p>
                
               
                <button className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-teal-600">
                  Explore Prompts
                </button>
              </div>
              
              {/* Card 3: Text-to-Image */}
              <div className="bg-white rounded-[1.25rem] border-l-4 border-l-[#2A7B9B] border-t border-r border-b border-gray-200 p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#A3E4D7]/20 rounded-full flex items-center justify-center">
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#2A7B9B]" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
</div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-3 text-black">Text-to-Image</h3>
                <p className="text-center text-gray-600 mb-6">Explain what you want in detail and AI will produce the image for you. For example, " I need images of a serene massage room with a womans hands in image."</p>
                
                
                
                <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600">
                  Create Variations
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-200"></div>
                <h3 className="text-xl font-semibold mb-2">Upload</h3>
                <p className="text-gray-600">Upload your product images to our secure platform in seconds</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gray-200"></div>
                <h3 className="text-xl font-semibold mb-2">Transform</h3>
                <p className="text-gray-600">Choose from dozens of AI-powered transformations and enhancements</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Download</h3>
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
        
        {/* Trust Section */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold">Trusted by businesses worldwide</h2>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="w-24 h-12 flex items-center justify-center">
                <div className="text-lg text-gray-400 font-bold">COMPANY</div>
              </div>
              <div className="w-24 h-12 flex items-center justify-center">
                <div className="text-lg text-gray-400 font-bold">LOGO</div>
              </div>
              <div className="w-24 h-12 flex items-center justify-center">
                <div className="text-lg text-gray-400 font-bold">BRAND</div>
              </div>
              <div className="w-24 h-12 flex items-center justify-center">
                <div className="text-lg text-gray-400 font-bold">CORP</div>
              </div>
              <div className="w-24 h-12 flex items-center justify-center">
                <div className="text-lg text-gray-400 font-bold">FIRM</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-600">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-medium text-white mb-4">Ready to transform your product images?</h2>
            <p className="text-xl text-white/80 mb-8">Start enhancing your visuals today</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="py-3 px-8 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100">
                Start Free Trial
              </button>
              <button className="py-3 px-8 bg-transparent text-white font-medium rounded-lg border border-white hover:bg-white/10">
                See pricing
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}