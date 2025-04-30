import { useState } from "react";
import { Layout } from "../components/Layout";
import CheckoutFlow from "../components/CheckoutFlow";
import { type Style } from "../../../shared/data.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCheck } from "lucide-react";

export default function CheckoutFlowDemo() {
  const [completed, setCompleted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [selectedStyle, setSelectedStyle] = useState<Style | undefined>();
  
  const handleComplete = (imageUrl: string, style: Style) => {
    setSelectedImage(imageUrl);
    setSelectedStyle(style);
    setCompleted(true);
  };

  const resetFlow = () => {
    setCompleted(false);
    setSelectedImage(undefined);
    setSelectedStyle(undefined);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-[#2A7B9B] to-[#A3E4D7] inline-block text-transparent bg-clip-text mx-auto">
          Checkout Flow
        </h1>
        <p className="text-gray-500 text-center mb-8">Transform your image in a few simple steps</p>
        
        {completed ? (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCheck className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your image has been queued for transformation. You'll receive an email when it's ready.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle>Transformation Details</CardTitle>
                <CardDescription>Here's a summary of your transformation</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Original Image</h3>
                  {selectedImage && (
                    <img 
                      src={selectedImage} 
                      alt="Original" 
                      className="max-h-60 rounded-md border border-gray-200"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium mb-2">Selected Style: {selectedStyle?.name}</h3>
                  {selectedStyle && (
                    <div className="space-y-2">
                      <img 
                        src={selectedStyle.previewImage} 
                        alt={selectedStyle.name} 
                        className="max-h-60 rounded-md border border-gray-200"
                      />
                      <p className="text-sm text-gray-600">{selectedStyle.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetFlow}
                  className="bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white"
                >
                  Start a New Transformation
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <CheckoutFlow onComplete={handleComplete} />
        )}
      </div>
    </Layout>
  );
}