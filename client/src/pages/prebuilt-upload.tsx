
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '../components/Layout';
import ImageUploader from '../components/ImageUploader';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Sparkles, Image } from 'lucide-react';
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

export default function PrebuiltUpload() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPrompt, setSelectedPrompt] = useState<PrebuiltPrompt | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get the selected prompt from sessionStorage
    const storedPrompt = sessionStorage.getItem('selectedPrebuiltPrompt');
    if (storedPrompt) {
      setSelectedPrompt(JSON.parse(storedPrompt));
    } else {
      // If no prompt selected, redirect back to prompts page
      setLocation('/prebuilt-prompts');
    }
  }, [setLocation]);

  const handleImageUploaded = (imagePath: string, imageUrl: string) => {
    console.log('Image uploaded for prebuilt prompt:', imagePath, imageUrl);
    setUploadedImage(imagePath);
    setImageUrl(imageUrl);
  };

  const handleGenerateVariations = async () => {
    if (!uploadedImage || !selectedPrompt) {
      toast({
        title: "Missing Requirements",
        description: "Please upload an image first.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/prebuilt-transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImagePath: uploadedImage,
          promptId: selectedPrompt.id,
          prompt: selectedPrompt.prompt,
          variations: 2 // Generate 2 variations
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store results and navigate to results page
        sessionStorage.setItem('prebuiltResults', JSON.stringify({
          originalImage: uploadedImage,
          originalImageUrl: imageUrl,
          variations: data.variations,
          prompt: selectedPrompt,
          processingTime: data.processingTime
        }));
        
        setLocation('/prebuilt-results');
      } else {
        throw new Error(data.message || 'Failed to generate variations');
      }
    } catch (error) {
      console.error('Error generating variations:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate image variations",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPrompt) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-gray-600">Preparing your selected prompt</p>
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
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation('/prebuilt-prompts')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prompts
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Selected Prompt Display */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-800 flex items-center">
                      <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                      {selectedPrompt.title}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {selectedPrompt.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge 
                      variant={selectedPrompt.difficulty === 'Easy' ? 'default' : selectedPrompt.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                    >
                      {selectedPrompt.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {selectedPrompt.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Upload Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Image className="h-5 w-5 mr-2" />
                  Upload Your Product Image
                </CardTitle>
                <CardDescription>
                  Upload a high-quality image of your product. We'll generate 2 variations using your selected prompt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader 
                  onImageUploaded={handleImageUploaded}
                  acceptedFileTypes={['image/*']}
                  maxFileSize={10}
                  className="w-full"
                />
                
                {imageUrl && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Uploaded Image:</h3>
                    <div className="relative max-w-md mx-auto">
                      <img 
                        src={imageUrl} 
                        alt="Uploaded product" 
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            {uploadedImage && (
              <div className="text-center">
                <Button
                  onClick={handleGenerateVariations}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Variations...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate 2 Variations
                    </>
                  )}
                </Button>
                
                {isProcessing && (
                  <p className="text-sm text-gray-600 mt-3">
                    This may take 30-60 seconds to complete
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
