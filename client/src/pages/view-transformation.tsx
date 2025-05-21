import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, Download } from "lucide-react";
import { downloadImage, getFilenameFromPath } from '@/lib/utils';
import ComparisonSlider from "@/components/ComparisonSlider";

export default function ViewTransformation() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("Transformation of a shampoo bottle into a forest scene with green leaves after rainfall");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransformation = async () => {
    try {
      // For now, we're just retrieving the latest transformation from uploads
      const transformedImageUrl = "/uploads/transformed-1745447804156-shampoo_bottle.jpg";
      const originalImageUrl = "/uploads/shampoo_bottle.jpg";
      
      setOriginalImage(originalImageUrl);
      setTransformedImage(transformedImageUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transformation:", error);
      toast({
        title: "Error",
        description: "Failed to load the transformation. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransformation();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    fetchTransformation();
  };

  const handleDownload = () => {
    if (transformedImage) {
      downloadImage(transformedImage, getFilenameFromPath(transformedImage));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Image Transformation Result</h1>
      
      {loading ? (
        <div className="w-full">
          <Skeleton className="w-full h-80 rounded-lg mb-6" />
          <Skeleton className="w-full h-20 rounded-lg mb-6" />
        </div>
      ) : (
        <>
          {/* Comparison Slider */}
          {originalImage && transformedImage && (
            <div className="w-full h-80 rounded-lg overflow-hidden mb-6">
              <ComparisonSlider 
                beforeImage={originalImage} 
                afterImage={transformedImage} 
              />
            </div>
          )}
          
          {/* Transformation Description - White text on black background */}
          <div className="bg-black p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <ImageIcon className="text-white h-5 w-5 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-white font-medium mb-1">Transformation Description</h3>
                <p className="text-white text-sm md:text-base leading-relaxed">
                  {prompt}
                </p>
              </div>
            </div>
          </div>
          
          {/* Individual Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold mb-2">Original Image</h2>
              {originalImage ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center">
                  <img
                    src={originalImage}
                    alt="Original"
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-gray-500">No original image available</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold mb-2">Transformed Image</h2>
              {transformedImage ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center">
                  <img
                    src={transformedImage}
                    alt="Transformed"
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-gray-500">Transformation not available</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <div className="flex justify-center space-x-4">
        <RainbowButton onClick={handleRetry} disabled={loading} variant="outline">
          {loading ? "Loading..." : "Refresh"}
        </RainbowButton>
        
        {transformedImage && (
          <RainbowButton onClick={handleDownload} disabled={loading}>
            <Download className="h-4 w-4 mr-2" /> Download Image
          </RainbowButton>
        )}
      </div>
    </div>
  );
}