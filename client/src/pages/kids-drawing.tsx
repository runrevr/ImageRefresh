import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import ComparisonSlider from "@/components/ComparisonSlider";
import { Skeleton } from "@/components/ui/skeleton";
import { WandSparkles, Paintbrush, Upload, Download } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SEO from '@/components/SEO';

// Import images
import alicornDrawing from "../assets/alicorn-drawing.jpg";
import alicornReal from "../assets/alicorn-real.png";
import dogCatDrawing from "../assets/dog-and-cat-drawing.png";
import dogCatReal from "../assets/dog-and-cat-real.png";
import giraffeDrawing from "../assets/giraffe-drawing.png";
import giraffeReal from "../assets/giraffe-real.png";
import bearDrawing from "../assets/bear-drawing.png";
import bearReal from "../assets/bear-after.png";

export default function KidsDrawingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);

  // Example demo images for before/after showcase
  const demoBeforeImage = dogCatDrawing;
  const demoAfterImage = dogCatReal;

  // For carousel auto-scrolling
  const [carouselApi, setCarouselApi] = useState<any>(null);

  // Check if we should automatically scroll to the uploader
  useEffect(() => {
    const directUpload = sessionStorage.getItem('showUploaderDirectly');
    if (directUpload === 'true') {
      // Clear the flag so it doesn't trigger again on page refresh
      sessionStorage.removeItem('showUploaderDirectly');

      // Scroll to the uploader section
      setTimeout(() => {
        const uploaderElement = document.getElementById('uploader');
        if (uploaderElement) {
          uploaderElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (carouselApi) {
      // Set up a timer to auto-advance the carousel
      const autoplayInterval = setInterval(() => {
        carouselApi.scrollNext();
      }, 5000); // Change slide every 5 seconds

      // Clean up interval when component unmounts
      return () => clearInterval(autoplayInterval);
    }
  }, [carouselApi]);

  // Special prompt for kids drawing transformation
  const kidsDrawingPrompt = `Transform this child's drawing into a hyper-realistic photograph or professional 3D render. Maintain absolute fidelity to the original artwork - preserve all proportions, line placements, and deliberate "imperfections" that make this creation unique. Do not correct, straighten, symmetrize, or "improve" any aspect of the original design.

The final image should appear as if this creation exists in our physical world, with:
- Realistic textures appropriate to what the subject might be (skin, scales, fur, metal, fabric, etc.)
- Natural lighting with proper shadows and highlights
- Environmental context that complements the subject without distracting from it
- Physical properties suggesting weight, material, and dimension

Important: This must look like a high-quality photograph or CGI render - NOT a stylized, illustrated, or hand-drawn interpretation. The goal is to bring my child's imagination to life exactly as they conceived it, just with photorealistic rendering.

For the background/environment: Keep it simple and complementary. If the drawing appears to be a creature, place it in a fitting natural habitat. If it's an object, place it in a contextually appropriate setting with soft focus.

Feel free to interpret what this might be, but do not add any elements not present in the original drawing. Maintain the exact personality and character of the original creation.`;

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
    <>
      <SEO 
        title="Kids Drawing to Reality | AI Image Transformation for Children"
        description="Transform your child's drawings into realistic images with AI. Turn imagination into reality with our specialized kids drawing transformation tool."
        keywords="kids drawing transformation, children's art to reality, AI drawing enhancement, kids photo editing"
        canonicalUrl="https://imagerefresh.com/kids-drawing"
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Refresh",
          "description": "AI-powered image transformation platform for personal and commercial use",
          "url": "https://imagerefresh.com",
          "applicationCategory": "PhotographyApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "10.00",
            "priceCurrency": "USD",
            "priceValidUntil": "2025-12-31"
          },
          "provider": {
            "@type": "Organization",
            "name": "Image Refresh",
            "url": "https://imagerefresh.com"
          }
        })}
      </script>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <SEO 
        title="Turn Kids Drawings into Reality | AI Children's Art Transformation"
        description="Transform your child's drawings into magical realistic images. Turn sketches of pets, animals, and characters into stunning artwork that kids will treasure forever."
        keywords="kids drawings to reality, children's art transformation, drawing to photo, kids art AI, transform children drawings, realistic pet drawings"
        canonical="https://imagerefresh.com/kids-drawing"
      />
      <div className="sticky top-0 z-50 bg-white bg-opacity-90 backdrop-blur-md shadow-sm">
        <Navbar freeCredits={user?.freeCreditsUsed === false ? 1 : 0} paidCredits={user?.paidCredits || 0} />
      </div>

      <main className="container mx-auto px-4 py-12 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Bring Your Child's Drawings to Life
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Our AI transforms children's artwork into hyper-realistic 3D renders and photographs while preserving every detail that makes their creation unique!
          </p>

          {/* Image Carousel */}
          <div className="w-full max-w-4xl mx-auto mb-10 overflow-hidden">
            <Carousel className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
              setApi={setCarouselApi}
              >
              <CarouselContent>
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center justify-between rounded-xl overflow-hidden shadow-lg">
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={alicornDrawing} alt="Child's Alicorn Drawing" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">Original Drawing</p>
                      </div>
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={alicornReal} alt="Realistic Alicorn" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">AI Transformation</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center justify-between rounded-xl overflow-hidden shadow-lg">
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={dogCatDrawing} alt="Child's Dog and Cat Drawing" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">Original Drawing</p>
                      </div>
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={dogCatReal} alt="Realistic Dog and Cat" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">AI Transformation</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center justify-between rounded-xl overflow-hidden shadow-lg">
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={giraffeDrawing} alt="Child's Giraffe Drawing" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">Original Drawing</p>
                      </div>
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={giraffeReal} alt="Realistic Giraffe" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">AI Transformation</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className="p-1">
                    <div className="flex items-center justify-between rounded-xl overflow-hidden shadow-lg">
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={bearDrawing} alt="Child's Monster and Bear Drawing" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">Original Drawing</p>
                      </div>
                      <div className="flex-1 p-1 bg-white rounded-lg">
                        <img src={bearReal} alt="Realistic Monster and Bear" className="w-full h-64 object-contain" />
                        <p className="text-center text-sm font-medium mt-2">AI Transformation</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-4">
                <CarouselPrevious className="static transform-none mx-2" />
                <CarouselNext className="static transform-none mx-2" />
              </div>
            </Carousel>
          </div>

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
              beforeImage={demoBeforeImage}
              afterImage={demoAfterImage}
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
                    <div className="rounded-lg overflow-hidden border border-gray-200 h-64 flex items-center justify-center relative">
                      <img
                        src={transformedImage}
                        alt="Transformed"
                        className="object-contain max-h-full max-w-full"
                      />
                      <a 
                        href={transformedImage} 
                        download="transformed-drawing.png"
                        className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
                        title="Download Image"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-4 h-64 flex flex-col items-center justify-center border border-gray-200">
                      {isTransforming ? (
                        <>
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-500">Transforming your drawing...</p>
                          <p className="text-xs text-gray-400 mt-2">This may take up to 30 seconds</p>
                        </>
                      ) : (
                        <>
                          <WandSparkles className="h-12 w-12 text-gray-400 mb-4" />
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
              <p className="text-gray-700">All children's drawings work great! The AI preserves every detail, proportion, and characteristic that makes their art unique. Both colorful drawings and simple sketches transform beautifully.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">How does the transformation work?</h3>
              <p className="text-gray-700">Our AI analyzes your child's drawing and creates a hyper-realistic 3D render or photograph of exactly what they drew - maintaining all proportions and details. The image will appear as if their creation exists in real life, with appropriate textures, lighting, and environmental context.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">How long does the transformation take?</h3>
              <p className="text-gray-700">Most transformations complete within 30-45 seconds, depending on the complexity of the drawing and current system load. The AI puts in extra effort to ensure all details are preserved exactly as your child intended.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Can I save the transformed images?</h3>
              <p className="text-gray-700">Yes! Simply click the download button that appears in the corner of your transformed image. Many parents love to print these transformations as keepsakes or gifts.</p>
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
    </>
  );
}