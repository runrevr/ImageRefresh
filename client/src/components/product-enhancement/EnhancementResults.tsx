import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnhancementImage {
  id: number;
  originalImagePath: string;
  imageUrl: string;
  options: string[];
  selectedOptions: string[];
  resultImagePaths?: string[];
  resultImageUrls?: string[];
}

interface EnhancementResultsProps {
  enhancementData: {
    id: number;
    status: string;
    industry: string;
    creditsUsed: number;
    images: EnhancementImage[];
    webhookRequestId?: string;
    createdAt?: string;
  };
  isLoading: boolean;
  onStartOver: () => void;
}

export default function EnhancementResults({
  enhancementData,
  isLoading,
  onStartOver
}: EnhancementResultsProps) {
  const { toast } = useToast();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create temporary link to download the image
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Download started",
        description: "Your enhanced image is downloading"
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading your image",
        variant: "destructive"
      });
    }
  };
  
  // Navigate between images
  const nextImage = () => {
    if (activeImageIndex < enhancementData.images.length - 1) {
      setActiveImageIndex(activeImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (activeImageIndex > 0) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };
  
  // Check if results are still processing
  const isProcessing = enhancementData.status === "processing";
  
  // Get current image
  const currentImage = enhancementData.images[activeImageIndex];
  const hasResults = currentImage && currentImage.resultImageUrls && currentImage.resultImageUrls.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading results...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Enhancement Results</h2>
          <p className="text-muted-foreground mt-1">
            {isProcessing 
              ? "Your enhancements are being processed..." 
              : `${enhancementData.creditsUsed} credits used for these enhancements`
            }
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button variant="outline" onClick={onStartOver}>
            Start New Enhancement
          </Button>
        </div>
      </div>
      
      {isProcessing ? (
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h3 className="text-lg font-medium mt-4">Processing Your Enhancements</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              We're working on your image enhancements. This process typically takes 1-2 minutes per image.
              Please check back soon.
            </p>
          </CardContent>
        </Card>
      ) : enhancementData.images.length === 0 ? (
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium">No Results Available</h3>
            <p className="text-muted-foreground mt-2">
              There are no enhancement results to display. Please start a new enhancement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Image navigation controls */}
          {enhancementData.images.length > 1 && (
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={prevImage}
                disabled={activeImageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              
              <span className="text-sm">
                Image {activeImageIndex + 1} of {enhancementData.images.length}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={nextImage}
                disabled={activeImageIndex === enhancementData.images.length - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
          
          {/* Current image results */}
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                  <h3 className="font-medium mb-2">Original Image</h3>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={currentImage.imageUrl} 
                      alt="Original product" 
                      className="w-full object-cover" 
                    />
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Applied Enhancements</h4>
                    {currentImage.selectedOptions.length > 0 ? (
                      <ul className="text-sm space-y-1">
                        {currentImage.selectedOptions.map(option => (
                          <li key={option} className="flex items-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No enhancements selected
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="md:col-span-9">
                  {hasResults ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Enhanced Results ({currentImage.resultImageUrls?.length})</h3>
                      
                      <Tabs defaultValue="0" className="w-full">
                        <TabsList className="mb-2">
                          {currentImage.resultImageUrls?.map((_, index) => (
                            <TabsTrigger key={index} value={index.toString()}>
                              Result {index + 1}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {currentImage.resultImageUrls?.map((url, index) => (
                          <TabsContent key={index} value={index.toString()}>
                            <div className="border rounded-md overflow-hidden">
                              <img 
                                src={url} 
                                alt={`Enhanced result ${index + 1}`} 
                                className="w-full object-contain"
                              />
                              
                              <div className="flex justify-end p-2 bg-muted/20 border-t">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(
                                    url, 
                                    `enhanced-${activeImageIndex + 1}-${index + 1}.jpg`
                                  )}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted/20 rounded-md p-8">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">No Results Yet</h3>
                        <p className="text-muted-foreground mt-2">
                          The enhanced results for this image are not available yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}