
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Download, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCredits } from '@/hooks/useCredits';

const PHOTO_STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', description: 'Ultra-realistic photography style' },
  { id: 'portrait', label: 'Portrait', description: 'Professional portrait photography' },
  { id: 'landscape', label: 'Landscape', description: 'Scenic landscape photography' },
  { id: 'macro', label: 'Macro', description: 'Close-up detailed photography' },
  { id: 'street', label: 'Street Photography', description: 'Urban candid photography' },
  { id: 'vintage', label: 'Vintage Film', description: 'Classic film photography look' }
];

const IMAGE_SIZES = [
  { id: 'square', label: 'Square (1:1)', dimensions: '1024x1024', description: 'Perfect for social media' },
  { id: 'portrait', label: 'Portrait (3:4)', dimensions: '768x1024', description: 'Great for portraits' },
  { id: 'landscape', label: 'Landscape (4:3)', dimensions: '1024x768', description: 'Ideal for landscapes' }
];

const SAMPLE_IDEAS = [
  { emoji: '🐱', text: 'Cyberpunk Cat', description: 'A futuristic cat in a neon-lit cityscape' },
  { emoji: '🏰', text: 'Fantasy Scene', description: 'A majestic castle floating in the clouds' },
  { emoji: '🚀', text: 'Space Adventure', description: 'An astronaut exploring an alien planet' },
  { emoji: '☕', text: 'Steampunk Cafe', description: 'A Victorian-era coffee shop with steam-powered machines' }
];

export default function CustomGeneration() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(PHOTO_STYLES[0]);
  const [selectedSize, setSelectedSize] = useState(IMAGE_SIZES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const { data: userCredits } = useCredits();
  const freeCredits = userCredits?.hasMonthlyFreeCredit ? 1 : 0;
  const paidCredits = userCredits?.paidCredits || 0;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      setGeneratedImage('/src/assets/bear-after.png'); // Placeholder
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (generatedImage) {
    return (
      <>
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Generated Image</h1>
              <p className="text-xl text-gray-600">Perfect! Your custom image has been created.</p>
            </div>

            <Card className="p-8">
              <div className="text-center mb-6">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    // TODO: Implement download
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedImage(null);
                    setPrompt('');
                  }}
                  className="px-8 py-3"
                >
                  Create Another
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-6">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Custom Image Generation</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Describe your vision and we'll create a unique image for you using advanced AI.
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="space-y-8">
              {/* Prompt Input */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Describe your image
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A majestic dragon flying over a crystal city at sunset, photorealistic style, 8k quality..."
                  className="w-full min-h-[120px] text-base"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be as detailed as possible for the best results
                </p>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Choose a style
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PHOTO_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedStyle.id === style.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{style.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{style.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-lg font-medium text-gray-900 mb-4">
                  Image size
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {IMAGE_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedSize.id === size.id
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{size.label}</div>
                      <div className="text-sm text-gray-600">{size.dimensions}</div>
                      <div className="text-xs text-gray-500 mt-1">{size.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-4">
                <RainbowButton
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-12 py-4 text-lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </div>
                  )}
                </RainbowButton>
              </div>
            </div>
          </Card>

          {/* Sample Ideas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Try these ideas:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SAMPLE_IDEAS.map((idea, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(idea.description)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="text-lg mb-1">{idea.emoji}</div>
                  <div className="font-medium text-sm text-gray-900">{idea.text}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                💡 <strong>Tip:</strong> You can also upload an image to use as reference for your custom prompt
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
