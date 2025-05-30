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
            <h1 className="text-4xl font-bold text-[#1F2937] mb-4">
              Prebuilt Prompts
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Expert-designed prompts to quickly transform your product images
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Background Removal */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#06B6D4] hover:scale-[1.03] cursor-pointer bg-[#FFFFFF] rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-[#FAFAFA] flex items-center justify-center">
                  {/* Demo image will go here */}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#1F2937]">Background Removal</h3>
                <p className="text-[#6B7280] mb-4 text-sm">Remove backgrounds for clean, professional product photos</p>
                <button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>

            {/* Enhanced Lighting */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#06B6D4] hover:scale-[1.03] cursor-pointer bg-[#FFFFFF] rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-[#FAFAFA] flex items-center justify-center">
                  {/* Demo image will go here */}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#1F2937]">Enhanced Lighting</h3>
                <p className="text-[#6B7280] mb-4 text-sm">Improve lighting and shadows for better product visibility</p>
                <button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>

            {/* Add Shadows */}
            <div className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#06B6D4] hover:scale-[1.03] cursor-pointer bg-[#FFFFFF] rounded-lg">
              <div className="relative">
                <div className="h-64 overflow-hidden bg-[#FAFAFA] flex items-center justify-center">
                  {/* Demo image will go here */}
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5"></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-[#1F2937]">Add Natural Shadows</h3>
                <p className="text-[#6B7280] mb-4 text-sm">Add realistic shadows to make products look more natural</p>
                <button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                  Use This Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => setLocation('/product-image-lab')}
              className="px-8 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#FAFAFA] hover:border-[#06B6D4] transition-colors"
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