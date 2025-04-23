import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewTransformation() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransformation = async () => {
    try {
      // For now, we're just retrieving the latest transformation from uploads
      const transformedImageUrl = "/uploads/transformed-1745447091110-shampoo_bottle.jpg";
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Image Transformation Result</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-2">Original Image</h2>
          {loading ? (
            <Skeleton className="w-full h-64 rounded-lg" />
          ) : originalImage ? (
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
          {loading ? (
            <Skeleton className="w-full h-64 rounded-lg" />
          ) : transformedImage ? (
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
      
      <div className="flex justify-center mt-6">
        <Button onClick={handleRetry} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}