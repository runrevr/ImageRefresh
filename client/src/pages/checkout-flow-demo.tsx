import { useState } from "react";
import { Layout } from "@/components/Layout";
import CheckoutFlow from "@/components/CheckoutFlow";
import { type Style } from "@shared/data.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CheckoutFlowDemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; style: Style } | null>(null);
  
  const handleComplete = (imageUrl: string, style: Style) => {
    setLoading(true);
    
    // Simulate API call/processing
    setTimeout(() => {
      setResult({ imageUrl, style });
      setLoading(false);
    }, 2000);
  };
  
  const handleReset = () => {
    setResult(null);
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Style Transformation Checkout Flow
        </h1>
        
        {loading && (
          <div className="flex flex-col items-center justify-center my-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Simulating Image Transformation...</p>
          </div>
        )}
        
        {result ? (
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Original Image</h3>
                    <div className="border rounded-md overflow-hidden">
                      <img 
                        src={result.imageUrl} 
                        alt="Original" 
                        className="w-full h-64 object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Transformed with {result.style.name}</h3>
                    <div className="border rounded-md overflow-hidden bg-gray-50">
                      <img 
                        src={result.style.previewImage} 
                        alt={`${result.style.name} Preview`} 
                        className="w-full h-64 object-contain" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleReset}
                    className="px-8"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <CheckoutFlow onComplete={handleComplete} />
        )}
      </div>
    </Layout>
  );
}