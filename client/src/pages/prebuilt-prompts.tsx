
import React from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrebuiltPrompts() {
  const [, setLocation] = useLocation();
  
  // Mock credits for development
  const freeCredits = 1;
  const paidCredits = 10;

  // 19 prebuilt prompts - placeholders for now
  const prebuiltPrompts = [
    {
      id: 'prompt-001',
      title: 'Prompt 1 - [Title Pending]',
      description: 'Description for prompt 1 will be added',
      category: 'Enhancement',
      difficulty: 'Easy',
      promptText: 'Prompt text will be added for prompt 1'
    },
    {
      id: 'prompt-002', 
      title: 'Prompt 2 - [Title Pending]',
      description: 'Description for prompt 2 will be added',
      category: 'Enhancement',
      difficulty: 'Easy',
      promptText: 'Prompt text will be added for prompt 2'
    },
    {
      id: 'prompt-003',
      title: 'Prompt 3 - [Title Pending]',
      description: 'Description for prompt 3 will be added',
      category: 'Enhancement', 
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 3'
    },
    {
      id: 'prompt-004',
      title: 'Prompt 4 - [Title Pending]',
      description: 'Description for prompt 4 will be added',
      category: 'Enhancement',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 4'
    },
    {
      id: 'prompt-005',
      title: 'Prompt 5 - [Title Pending]',
      description: 'Description for prompt 5 will be added',
      category: 'Style',
      difficulty: 'Easy',
      promptText: 'Prompt text will be added for prompt 5'
    },
    {
      id: 'prompt-006',
      title: 'Prompt 6 - [Title Pending]',
      description: 'Description for prompt 6 will be added',
      category: 'Style',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 6'
    },
    {
      id: 'prompt-007',
      title: 'Prompt 7 - [Title Pending]',
      description: 'Description for prompt 7 will be added',
      category: 'Background',
      difficulty: 'Easy',
      promptText: 'Prompt text will be added for prompt 7'
    },
    {
      id: 'prompt-008',
      title: 'Prompt 8 - [Title Pending]',
      description: 'Description for prompt 8 will be added',
      category: 'Background',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 8'
    },
    {
      id: 'prompt-009',
      title: 'Prompt 9 - [Title Pending]',
      description: 'Description for prompt 9 will be added',
      category: 'Lighting',
      difficulty: 'Easy',
      promptText: 'Prompt text will be added for prompt 9'
    },
    {
      id: 'prompt-010',
      title: 'Prompt 10 - [Title Pending]',
      description: 'Description for prompt 10 will be added',
      category: 'Lighting',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 10'
    },
    {
      id: 'prompt-011',
      title: 'Prompt 11 - [Title Pending]',
      description: 'Description for prompt 11 will be added',
      category: 'Professional',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 11'
    },
    {
      id: 'prompt-012',
      title: 'Prompt 12 - [Title Pending]',
      description: 'Description for prompt 12 will be added',
      category: 'Professional',
      difficulty: 'Advanced',
      promptText: 'Prompt text will be added for prompt 12'
    },
    {
      id: 'prompt-013',
      title: 'Prompt 13 - [Title Pending]',
      description: 'Description for prompt 13 will be added',
      category: 'Creative',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 13'
    },
    {
      id: 'prompt-014',
      title: 'Prompt 14 - [Title Pending]',
      description: 'Description for prompt 14 will be added',
      category: 'Creative',
      difficulty: 'Advanced',
      promptText: 'Prompt text will be added for prompt 14'
    },
    {
      id: 'prompt-015',
      title: 'Prompt 15 - [Title Pending]',
      description: 'Description for prompt 15 will be added',
      category: 'Artistic',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 15'
    },
    {
      id: 'prompt-016',
      title: 'Prompt 16 - [Title Pending]',
      description: 'Description for prompt 16 will be added',
      category: 'Artistic',
      difficulty: 'Advanced',
      promptText: 'Prompt text will be added for prompt 16'
    },
    {
      id: 'prompt-017',
      title: 'Prompt 17 - [Title Pending]',
      description: 'Description for prompt 17 will be added',
      category: 'Lifestyle',
      difficulty: 'Medium',
      promptText: 'Prompt text will be added for prompt 17'
    },
    {
      id: 'prompt-018',
      title: 'Prompt 18 - [Title Pending]',
      description: 'Description for prompt 18 will be added',
      category: 'Lifestyle',
      difficulty: 'Advanced',
      promptText: 'Prompt text will be added for prompt 18'
    },
    {
      id: 'prompt-019',
      title: 'Prompt 19 - [Title Pending]',
      description: 'Description for prompt 19 will be added',
      category: 'Special',
      difficulty: 'Advanced',
      promptText: 'Prompt text will be added for prompt 19'
    }
  ];

  const handleSelectPrompt = (prompt: any) => {
    // Store the selected prompt in sessionStorage
    sessionStorage.setItem('selectedPrebuiltPrompt', JSON.stringify(prompt));
    // Navigate to upload page
    setLocation('/prebuilt-upload');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Enhancement': 'bg-blue-100 text-blue-800',
      'Style': 'bg-purple-100 text-purple-800', 
      'Background': 'bg-indigo-100 text-indigo-800',
      'Lighting': 'bg-orange-100 text-orange-800',
      'Professional': 'bg-gray-100 text-gray-800',
      'Creative': 'bg-pink-100 text-pink-800',
      'Artistic': 'bg-teal-100 text-teal-800',
      'Lifestyle': 'bg-green-100 text-green-800',
      'Special': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1F2937] mb-4">
              Prebuilt Prompts
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Expert-designed prompts to quickly transform your product images
            </p>
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {prebuiltPrompts.length} Professional Prompts Available
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prebuiltPrompts.map((prompt, index) => (
              <div 
                key={prompt.id}
                onClick={() => handleSelectPrompt(prompt)}
                className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#06B6D4] hover:scale-[1.03] cursor-pointer rounded-lg"
              >
                <div className="relative">
                  {/* Background image placeholder with overlay */}
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {/* Placeholder for demo image */}
                    <div className="w-full h-full bg-cover bg-center flex items-center justify-center">
                      <div className="text-4xl font-bold text-gray-400">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80 flex flex-col items-center justify-end px-4 py-6 text-center">
                      {/* Category and Difficulty badges */}
                      <div className="flex gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(prompt.category)}`}>
                          {prompt.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                          {prompt.difficulty}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold mb-2 text-white">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-white/90 mb-4 line-clamp-2">
                        {prompt.description}
                      </p>
                      <button className="bg-[#F97316] hover:bg-[#F97316]/90 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm">
                        Use This Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => {
                console.log('Back button clicked - going to product-image-lab');
                window.location.href = '/product-image-lab';
              }}
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
