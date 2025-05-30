import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, Download, Loader2 } from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  url: string;
}

interface TransformationResult {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string;
  secondTransformedImageUrl?: string;
  prompt: string;
}

export default function SimpleProductImageLab() {
  const { user } = useAuth();
  const { data: userCredits } = useCredits();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransformationResult[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          const imageUrl = URL.createObjectURL(file);
          
          const newImage: UploadedImage = {
            id: imageId,
            file,
            url: imageUrl
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          if (!selectedImage) {
            setSelectedImage(newImage);
          }
        }
      });
    }
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', user?.id?.toString() || '');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imagePath;
  };

  const transformImage = async () => {
    if (!selectedImage || !prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an image and enter a transformation prompt.",
        variant: "destructive",
      });
      return;
    }

    if (!userCredits || (userCredits.paidCredits === 0 && userCredits.freeCreditsUsed)) {
      toast({
        title: "No Credits",
        description: "You need credits to transform images.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Upload the image first
      const imagePath = await uploadImageToServer(selectedImage.file);
      
      // Transform the image
      const transformResponse = await fetch('/api/transform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImagePath: imagePath,
          prompt: prompt,
          userId: user?.id,
          imageSize: '1024x1024',
          isEdit: false,
        }),
      });

      if (!transformResponse.ok) {
        throw new Error('Failed to transform image');
      }

      const transformData = await transformResponse.json();
      
      const result: TransformationResult = {
        id: transformData.id || Date.now().toString(),
        originalImageUrl: selectedImage.url,
        transformedImageUrl: transformData.transformedImageUrl,
        secondTransformedImageUrl: transformData.secondTransformedImageUrl,
        prompt: prompt,
      };

      setResults(prev => [...prev, result]);
      setPrompt('');
      
      toast({
        title: "Success!",
        description: "Your image has been transformed and saved to My Images.",
      });

    } catch (error) {
      console.error('Transformation error:', error);
      toast({
        title: "Transformation Failed",
        description: "There was an error transforming your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mb-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Images
            </Button>
            <p className="text-sm text-gray-500">
              Upload product images to enhance with AI
            </p>
          </div>

          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Uploaded Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                      selectedImage?.id === image.id ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt="Uploaded"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhancement Section */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Transform Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Transformation Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to transform your image (e.g., 'Remove background and add professional studio lighting')"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Credits available: {userCredits ? (
                  userCredits.freeCreditsUsed ? userCredits.paidCredits : userCredits.paidCredits + 1
                ) : 0}
              </div>
              <Button
                onClick={transformImage}
                disabled={isProcessing || !prompt.trim()}
                className="min-w-[120px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Transform Image'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transformation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium mb-2">Original</h4>
                      <img
                        src={result.originalImageUrl}
                        alt="Original"
                        className="w-full h-48 object-cover rounded"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Transformed</h4>
                      <img
                        src={result.transformedImageUrl}
                        alt="Transformed"
                        className="w-full h-48 object-cover rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Prompt: {result.prompt}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadImage(result.transformedImageUrl, `transformed-${result.id}.png`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {result.secondTransformedImageUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadImage(result.secondTransformedImageUrl!, `variant-${result.id}.png`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download Variant
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}