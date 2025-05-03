import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import ComparisonSlider from "@/components/ComparisonSlider";
import { Skeleton } from "@/components/ui/skeleton";
import { MagicWandIcon, Paintbrush, Upload } from "lucide-react";

export default function KidsDrawingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);

  // Example demo images for before/after showcase
  const demoBeforeImage = "/assets/kids-drawing-before.jpg";
  const demoAfterImage = "/assets/kids-drawing-after.jpg";

  // Special prompt for kids drawing transformation
  const kidsDrawingPrompt = "Transform this child's drawing into a photorealistic image. Preserve the child's artistic style while making it look like a real photo of what they were trying to draw. Keep it family-friendly and maintain all the important details from the original drawing.";

  const handleImageUploaded = (imagePath: string, imageUrl: string) => {
    setOriginalImage(imageUrl);
    setUploadedImagePath(imagePath);
    setTransformedImage(null);
  };

  const handleTransform = async () => {
    if (!uploadedImagePath) {
      toast({
        title: "No image selected",
        description: "Please upload a drawing first",
        variant: "destructive",
      });
      return;
    }

    setIsTransforming(true);

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalImagePath: uploadedImagePath,
          prompt: kidsDrawingPrompt,
          userId: user?.id || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to transform image");
      }

      const data = await response.json();
      setTransformedImage(data.transformedImageUrl);
      
      toast({
        title: "Transformation complete!",
        description: "Your drawing has been transformed into a realistic image",
      });
    } catch (error) {
      console.error("Error transforming image:", error);
      toast({
        title: "Transformation failed",
        description: "We couldn't transform your drawing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTransforming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm">
        <Navbar freeCredits={user?.freeCreditsUsed === false ? 1 : 0} paidCredits={user?.paidCredits || 0} />
      </div>

      <main className="container mx-auto px-4 py-12 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Turn Your Child's Drawings Into Reality
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Watch as our AI magically transforms your child's creative artwork into stunning photorealistic images they'll love!
          </p>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={() => {
                const uploaderElement = document.getElementById('uploader');
                if (uploaderElement) {
                  uploaderElement.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Upload className="mr-2 h-5 w-5" /> Upload a Drawing
            </Button>
          </div>
        </div>

        {/* Before/After Showcase */}
        <div className="max-w-4xl mx-auto mb-16 rounded-xl overflow-hidden shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center">See the Magic in Action</h2>
          <div className="bg-white p-6 rounded-xl">
            <ComparisonSlider
              originalImage={demoBeforeImage}
              transformedImage={demoAfterImage}
              originalLabel="Child's Drawing"
              transformedLabel="AI-Transformed"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div id="uploader" className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Child's Drawing</h2>
          
          {!originalImage ? (
            <ImageUploader onImageUploaded={handleImageUploaded} />
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Original Drawing</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center">
                    <img
                      src={originalImage}
                      alt="Original Drawing"
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-2">Transformed Image</h3>
                  {transformedImage ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center">
                      <img
                        src={transformedImage}
                        alt="Transformed"
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 h-64 flex flex-col items-center justify-center">
                      {isTransforming ? (
                        <>
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-500">Transforming your drawing...</p>
                          <p className="text-xs text-gray-400 mt-2">This may take up to 30 seconds</p>
                        </>
                      ) : (
                        <>
                          <MagicWandIcon className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500">Click the button below to transform</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setOriginalImage(null);
                    setTransformedImage(null);
                    setUploadedImagePath(null);
                  }}
                >
                  Upload New Drawing
                </Button>
                
                <Button
                  onClick={handleTransform}
                  disabled={isTransforming || !originalImage}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Paintbrush className="mr-2 h-5 w-5" />
                  {isTransforming ? "Transforming..." : "Transform Drawing"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">What types of drawings work best?</h3>
              <p className="text-gray-700">Simple, clear drawings with distinct elements work best. Colorful drawings are ideal, but black and white sketches work too!</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">How long does the transformation take?</h3>
              <p className="text-gray-700">Most transformations complete within 30 seconds, depending on the complexity of the drawing and current system load.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Can I save the transformed images?</h3>
              <p className="text-gray-700">Yes! Right-click on the transformed image and select "Save image as" to download it to your device.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Is there a limit to how many drawings I can transform?</h3>
              <p className="text-gray-700">Free users can transform 1 drawing per month. Premium users get additional transformations based on their subscription plan.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}