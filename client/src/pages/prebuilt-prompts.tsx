
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Demo prebuilt prompts data structure
interface PrebuiltPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  exampleImage: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

const PREBUILT_PROMPTS: PrebuiltPrompt[] = [
  {
    id: 'background-removal',
    title: 'Background Removal',
    description: 'Remove the background and replace with a clean white backdrop for professional product photos.',
    prompt: 'Remove the background completely and replace it with a pure white background. Keep the product exactly as it is, maintaining all details, shadows, and lighting. Create a clean, professional e-commerce style product photo with the item centered on a seamless white backdrop.',
    category: 'Product Enhancement',
    exampleImage: '/examples/background-removal-example.jpg',
    difficulty: 'Easy'
  },
  {
    id: 'black-white',
    title: 'Black & White Classic',
    description: 'Convert your product image to an elegant black and white with enhanced contrast and detail.',
    prompt: 'Transform this image into a striking black and white photograph with enhanced contrast and detail. Maintain all product features while creating dramatic lighting and shadow effects. Use professional black and white photography techniques to emphasize texture, form, and visual impact.',
    category: 'Artistic',
    exampleImage: '/examples/black-white-example.jpg',
    difficulty: 'Easy'
  },
  {
    id: 'lifestyle-natural',
    title: 'Natural Lifestyle',
    description: 'Place your product in a natural, everyday setting that shows real-world use.',
    prompt: 'Place this product in a natural, authentic lifestyle setting that demonstrates real-world usage. Create a warm, inviting environment with natural lighting, complementary props, and a setting that appeals to your target audience. The scene should feel genuine and aspirational.',
    category: 'Lifestyle',
    exampleImage: '/examples/lifestyle-natural-example.jpg',
    difficulty: 'Medium'
  },
  {
    id: 'premium-luxury',
    title: 'Premium Luxury',
    description: 'Elevate your product with luxury styling, premium materials, and sophisticated lighting.',
    prompt: 'Transform this product into a luxury, premium presentation with sophisticated lighting, elegant materials, and high-end styling. Use dramatic shadows, rich textures, and premium backdrop elements that convey exclusivity and quality. Create an aspirational, high-value aesthetic.',
    category: 'Premium',
    exampleImage: '/examples/premium-luxury-example.jpg',
    difficulty: 'Advanced'
  }
];

export default function PrebuiltPrompts() {
  const navigate = useNavigate();
  const [selectedPrompt, setSelectedPrompt] = useState<PrebuiltPrompt | null>(null);

  const handleUsePrompt = (prompt: PrebuiltPrompt) => {
    // Store the selected prompt in sessionStorage to pass to the next step
    sessionStorage.setItem('selectedPrebuiltPrompt', JSON.stringify(prompt));
    navigate('/prebuilt-upload');
  };

  const groupedPrompts = PREBUILT_PROMPTS.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = [];
    }
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, PrebuiltPrompt[]>);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Prebuilt Prompts
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Use our expert-designed prompts to quickly transform your images. Choose from popular effects like background removal, enhanced lighting, and lifestyle integration.
            </p>
          </div>

          {/* Prompts Grid */}
          {Object.entries(groupedPrompts).map(([category, prompts]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prompts.map((prompt) => (
                  <Card key={prompt.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-2">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {/* Placeholder for example image */}
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <span className="text-4xl">📸</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {prompt.title}
                        </CardTitle>
                        <Badge 
                          variant={prompt.difficulty === 'Easy' ? 'default' : prompt.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {prompt.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {prompt.description}
                      </CardDescription>
                      <Button 
                        onClick={() => handleUsePrompt(prompt)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
                      >
                        Use This Prompt
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Back to Home */}
          <div className="text-center mt-16">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="px-8 py-3"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
