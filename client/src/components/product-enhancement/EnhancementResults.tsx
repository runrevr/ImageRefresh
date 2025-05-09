import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Share2, ArrowLeft } from 'lucide-react';

interface EnhancementImage {
  id: number;
  originalImagePath: string;
  imageUrl: string;
  selectedOptions: string[];
  resultImageUrls: string[];
}

interface EnhancementData {
  id: number;
  status: string;
  industry: string;
  creditsUsed: number;
  images: EnhancementImage[];
}

interface EnhancementResultsProps {
  enhancementData: EnhancementData;
  onStartOver: () => void;
}

export default function EnhancementResults({
  enhancementData,
  onStartOver
}: EnhancementResultsProps) {
  // Track the current view tab for each image
  const [currentImageViews, setCurrentImageViews] = useState<Record<number, string>>({});

  // Calculate total result count
  const totalResultCount = enhancementData.images.reduce(
    (total, image) => total + (image.resultImageUrls?.length || 0), 
    0
  );

  // Handle image view tab change
  const handleTabChange = (imageId: number, value: string) => {
    setCurrentImageViews(prev => ({
      ...prev,
      [imageId]: value
    }));
  };

  // Get current tab value for an image
  const getCurrentView = (imageId: number, defaultValue: string) => {
    return currentImageViews[imageId] || defaultValue;
  };

  // Download an enhanced image
  const downloadImage = async (imageUrl: string, optionName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `enhanced-${optionName.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Process is still in progress
  if (enhancementData.status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium text-center mb-2">Processing Your Enhancements</h3>
        <p className="text-center text-muted-foreground">
          We're creating your enhanced images. This may take a minute or two.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">Enhancement Results</h3>
            <p className="text-sm text-muted-foreground">
              {totalResultCount} enhanced image{totalResultCount !== 1 ? 's' : ''} created
            </p>
          </div>
          <div className="text-right">
            <h3 className="font-medium">Credits Used</h3>
            <p className="text-sm text-muted-foreground">
              {enhancementData.creditsUsed} credit{enhancementData.creditsUsed !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {enhancementData.images.map((image) => {
          // Skip images with no results
          if (!image.resultImageUrls || image.resultImageUrls.length === 0) {
            return null;
          }
          
          // Group result images by option
          const resultsByOption: Record<string, string[]> = {};
          
          // Assuming each pair of results corresponds to an option in the same order
          // For each option, we should have 2 result images
          if (image.selectedOptions && image.selectedOptions.length > 0) {
            for (let i = 0; i < image.selectedOptions.length; i++) {
              const option = image.selectedOptions[i];
              const startIdx = i * 2;
              const results = image.resultImageUrls.slice(startIdx, startIdx + 2);
              
              if (results.length > 0) {
                resultsByOption[option] = results;
              }
            }
          }
          
          const options = Object.keys(resultsByOption);
          
          return (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-1/3 flex flex-col">
                    <h3 className="font-medium mb-3">Original Image</h3>
                    <div className="relative h-64 sm:h-auto rounded-md overflow-hidden border">
                      <img 
                        src={image.imageUrl} 
                        alt="Original product" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">
                        Selected options: {image.selectedOptions.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="sm:w-2/3">
                    <h3 className="font-medium mb-3">Enhanced Results</h3>
                    
                    {options.length > 0 ? (
                      <Tabs 
                        defaultValue={options[0]} 
                        value={getCurrentView(image.id, options[0])}
                        onValueChange={(value) => handleTabChange(image.id, value)}
                        className="w-full"
                      >
                        <TabsList className="mb-4 flex-wrap h-auto py-1">
                          {options.map((option) => (
                            <TabsTrigger key={option} value={option} className="text-xs">
                              {option}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        
                        {options.map((option) => (
                          <TabsContent key={option} value={option}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {resultsByOption[option].map((resultUrl, idx) => (
                                <div key={idx} className="relative group">
                                  <div className="border rounded-md overflow-hidden h-64">
                                    <img 
                                      src={resultUrl} 
                                      alt={`Enhanced result ${idx + 1} for ${option}`} 
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button 
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => downloadImage(resultUrl, `${option}-${idx+1}`)}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                  <p className="text-sm text-center mt-2">Variation {idx + 1}</p>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="border rounded-md p-8 text-center">
                        <p className="text-muted-foreground">No enhanced results available</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onStartOver}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Enhancement
        </Button>
      </div>
    </div>
  );
}