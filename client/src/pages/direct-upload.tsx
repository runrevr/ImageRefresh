import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Link } from "wouter";

export default function DirectUploadPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);
  // Credits for navbar
  const [freeCredits, setFreeCredits] = useState(1);
  const [paidCredits, setPaidCredits] = useState(10);

  // Update credit display based on auth user if available
  useEffect(() => {
    if (user) {
      setFreeCredits(user.freeCreditsUsed ? 0 : 1);
      setPaidCredits(user.paidCredits || 0);
    }
  }, [user]);

  // Handle image upload
  const handleImageUploaded = (imagePath: string, imageUrl: string) => {
    setOriginalImage(imageUrl);
    setUploadedImagePath(imagePath);
    
    toast({
      title: "Image uploaded successfully",
      description: "Your image is ready for transformation",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Transform Your Photos with AI
            </h1>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-4 text-center">
                Upload your photo below and we'll transform it into something magical in seconds.
              </p>
              <p className="text-red-500 font-medium mb-4 text-center">
                Note: AI is very strict about editing images with children (for good reason).
              </p>
            </div>
            
            {!originalImage ? (
              <ImageUploader onImageUploaded={handleImageUploaded} />
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Uploaded Image</h3>
                  <div className="rounded-lg overflow-hidden border border-gray-200 max-h-64 flex items-center justify-center">
                    <img
                      src={originalImage}
                      alt="Uploaded"
                      className="object-contain max-h-full max-w-full"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <RainbowButton
                      variant="outline"
                      onClick={() => {
                        setOriginalImage(null);
                        setUploadedImagePath(null);
                      }}
                    >
                      Upload Different Image
                    </RainbowButton>
                    
                    <Link to={`/old-home?image=${encodeURIComponent(uploadedImagePath || '')}`}>
                      <RainbowButton>
                        Continue to Transformation
                      </RainbowButton>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}