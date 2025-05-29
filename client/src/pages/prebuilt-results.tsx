
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Download, RotateCcw, Share2, Sparkles, Home } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface PrebuiltPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  exampleImage: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

interface PrebuiltResults {
  originalImage: string;
  originalImageUrl: string;
  variations: string[];
  prompt: PrebuiltPrompt;
  processingTime: number;
}

export default function PrebuiltResults() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [results, setResults] = useState<PrebuiltResults | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    // Get results from sessionStorage
    const storedResults = sessionStorage.getItem('prebuiltResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      setResults(parsedResults);
      // Auto-select first variation for full view
      if (parsedResults.variations && parsedResults.variations.length > 0) {
        setSelectedVariation(parsedResults.variations[0]);
      }
    } else {
      // If no results, redirect back to prompts
      navigate('/prebuilt-prompts');
    }
  }, [navigate]);

  const handleDownload = async (imageUrl: string, index?: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prebuilt-variation-${index !== undefined ? index + 1 : 'original'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRegenerate = async () => {
    if (!results) return;

    setIsRegenerating(true);
    
    try {
      const response = await fetch('/api/prebuilt-transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImagePath: results.originalImage,
          promptId: results.prompt.id,
          prompt: results.prompt.prompt,
          variations: 2
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update results with new variations
        const updatedResults = {
          ...results,
          variations: data.variations,
          processingTime: data.processingTime
        };
        setResults(updatedResults);
        sessionStorage.setItem('prebuiltResults', JSON.stringify(updatedResults));
        setSelectedVariation(data.variations[0]);
        
        toast({
          title: "Regeneration Complete",
          description: "New variations have been generated successfully.",
        });
      } else {
        throw new Error(data.message || 'Failed to regenerate variations');
      }
    } catch (error) {
      console.error('Error regenerating variations:', error);
      toast({
        title: "Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate variations",
        variant: "destructive"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${results?.prompt.title} Variation`,
          url: imageUrl,
        });
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(imageUrl);
        toast({
          title: "URL Copied",
          description: "Image URL copied to clipboard.",
        });
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(imageUrl);
      toast({
        title: "URL Copied",
        description: "Image URL copied to clipboard.",
      });
    }
  };

  if (!results) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Results...</h2>
            <p className="text-gray-600">Preparing your generated variations</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/prebuilt-upload')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Generated in {results.processingTime}s
            </Badge>
          </div>

          {/* Prompt Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                {results.prompt.title} - Results
              </CardTitle>
              <CardDescription className="text-lg">
                {results.prompt.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Original Image */}
            <Card>
              <CardHeader>
                <CardTitle>Original Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative group">
                  <img 
                    src={results.originalImageUrl} 
                    alt="Original product" 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="secondary"
                      onClick={() => handleDownload(results.originalImageUrl)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Variation Full View */}
            {selectedVariation && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Variation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative group">
                    <img 
                      src={selectedVariation} 
                      alt="Selected variation" 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleDownload(selectedVariation, results.variations.indexOf(selectedVariation))}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleShare(selectedVariation)}
                          className="bg-white bg-opacity-90 hover:bg-opacity-100"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* All Variations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>All Variations ({results.variations.length})</CardTitle>
              <CardDescription>
                Click on any variation to view it in full size above
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.variations.map((variation, index) => (
                  <div 
                    key={index}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden ${
                      selectedVariation === variation ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedVariation(variation)}
                  >
                    <img 
                      src={variation} 
                      alt={`Variation ${index + 1}`} 
                      className="w-full h-auto aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Variation {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3"
            >
              {isRegenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Regenerating...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Generate New Variations
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/prebuilt-prompts')}
              className="px-6 py-3"
            >
              Try Another Prompt
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="px-6 py-3"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
