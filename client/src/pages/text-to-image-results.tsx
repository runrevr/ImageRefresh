
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Share2, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextToImageResultsState {
  imageUrls?: string[];
  prompt?: string;
  metadata?: {
    variations?: number;
    purpose?: string;
    industry?: string;
    aspectRatio?: string;
    styleIntensity?: number;
    addText?: boolean;
    businessName?: string;
  };
}

export default function TextToImageResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get state from navigation
  const state = location.state as TextToImageResultsState;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!state?.imageUrls || state.imageUrls.length === 0) {
      toast({
        title: "No Results Found",
        description: "No generated images found. Please try again.",
        variant: "destructive",
      });
      navigate("/text-to-image");
    }
  }, [state, navigate, toast]);

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `text-to-image-result-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Downloaded",
        description: `Image ${index + 1} downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (imageUrl: string, index: number) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Text-to-Image Result',
          text: `Check out this AI-generated image: ${state?.prompt}`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Result link copied to clipboard",
        });
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Result link copied to clipboard",
      });
    }
  };

  const handleGenerateMore = () => {
    navigate("/text-to-image", { 
      state: { 
        previousPrompt: state?.prompt,
        previousMetadata: state?.metadata 
      } 
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!state?.imageUrls || state.imageUrls.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
            <p className="text-gray-600 mb-6">No generated images found. Please try again.</p>
            <Button onClick={() => navigate("/text-to-image")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate New Images
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Images Generated Successfully!
            </h1>
            <p className="text-gray-600 mb-2">
              Click on an image to view it full size, then use the action buttons below.
            </p>
          </div>

          {/* Results Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {state.imageUrls.map((imageUrl, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => handleImageClick(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                        style={{ maxHeight: '400px' }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-700 shadow-md">
                        Option {index + 1}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(imageUrl, index)}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(imageUrl, index)}
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                      
                      {/* Generation Details - Only show prompt */}
                      {state.prompt && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-left">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Generation Details</h4>
                            <div className="text-sm text-gray-600">
                              <p><strong>Prompt:</strong></p>
                              <p className="mt-1">{state.prompt}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate More Button */}
            <div className="text-center mt-8">
              <Button 
                onClick={handleGenerateMore}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Generate More Images
              </Button>
            </div>
          </div>
        </div>

        {/* Full Screen Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
