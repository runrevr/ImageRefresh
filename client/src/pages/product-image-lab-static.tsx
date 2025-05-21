import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// Simple Product Image Lab page with all components inline
export default function ProductImageLabStaticPage() {
  const freeCredits = 1;
  const paidCredits = 10;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow pt-16">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl font-bold text-center mb-8">Product Image Lab</h1>
          <p className="text-xl text-center mb-12">Transform your product photos with AI</p>
          
          {/* Three cards section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Card 1 */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Upload Enhancement</h3>
              <p className="text-center mb-4">Upload your product images and our AI will enhance them automatically</p>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg">
                Upload Photos
              </button>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Prebuilt Prompts</h3>
              <p className="text-center mb-4">Use our expert-designed prompts to quickly transform your images</p>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg">
                Explore Prompts
              </button>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gray-100 rounded-xl p-6 shadow-md">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Text-to-Image</h3>
              <p className="text-center mb-4">Generate product variations with simple text descriptions</p>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg">
                Create Variations
              </button>
            </div>
          </div>
          
          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Upload</h3>
                <p>Upload your product images to our secure platform</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Transform</h3>
                <p>Choose from dozens of AI-powered transformations</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Download</h3>
                <p>Download your enhanced images in high resolution</p>
              </div>
            </div>
          </div>
          
          {/* Testimonials Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="italic mb-4">"This tool saved me hours of photo editing time. The AI enhancements are remarkable!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">E-commerce Store Owner</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="italic mb-4">"My product photos went from amateur to professional with just a few clicks. Amazing service!"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-600">Etsy Shop Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center py-12 px-6 bg-blue-500 text-white rounded-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to transform your product images?</h2>
            <p className="text-xl mb-6">Start your free trial today - no credit card required</p>
            <button className="py-3 px-8 bg-white text-blue-500 font-bold rounded-lg text-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}