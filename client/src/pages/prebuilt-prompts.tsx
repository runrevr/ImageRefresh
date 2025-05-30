import React from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrebuiltPrompts() {
  const [, setLocation] = useLocation();
  
  // Mock credits for development
  const freeCredits = 1;
  const paidCredits = 10;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow pt-16">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Prebuilt Prompts
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert-designed prompts to quickly transform your product images
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Background Removal */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer bg-white rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <span className="text-6xl">🖼️</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#2A7B9B]">Background Removal</h3>
                <p className="text-gray-600 mb-4 text-sm">Remove backgrounds for clean, professional product photos</p>
                <button className="w-full bg-[#FF7B54] hover:bg-[#ff6a3c] text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>

            {/* Enhanced Lighting */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer bg-white rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center">
                  <span className="text-6xl">💡</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#2A7B9B]">Enhanced Lighting</h3>
                <p className="text-gray-600 mb-4 text-sm">Improve lighting and shadows for better product visibility</p>
                <button className="w-full bg-[#FF7B54] hover:bg-[#ff6a3c] text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>

            {/* Add Shadows */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 hover:border-[#2A7B9B] hover:scale-[1.03] cursor-pointer bg-white rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <span className="text-6xl">🌟</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#2A7B9B]">Add Natural Shadows</h3>
                <p className="text-gray-600 mb-4 text-sm">Add realistic shadows to make products look more natural</p>
                <button className="w-full bg-[#FF7B54] hover:bg-[#ff6a3c] text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => setLocation('/product-image-lab')}
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Product Lab
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}