import { useState } from "react";
import { Layout } from "../components/Layout";
import CompactStyleSelector from "../components/CompactStyleSelector";
import type { Style } from "../../../shared/data.utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ImageIcon, CreditCard, Clock, ArrowRight, Check } from "lucide-react";

// Demo checkout page to showcase the compact style selector
export default function CheckoutDemo() {
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  
  // Handle style selection
  const handleStyleSelect = (style: Style) => {
    setSelectedStyle(style);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-[#2A7B9B] to-[#A3E4D7] inline-block text-transparent bg-clip-text mx-auto">
          Checkout
        </h1>
        <p className="text-gray-500 text-center mb-8">Complete your image transformation</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Image preview and order summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
                <CardDescription>Your image will be transformed with the selected style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Your uploaded image will appear here</p>
                  </div>
                </div>
                
                {selectedStyle && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Style selected: <span className="font-medium">{selectedStyle.name}</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{selectedStyle.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-sm">Base transformation</span>
                    <span className="text-sm font-medium">1 credit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Style: {selectedStyle ? selectedStyle.name : 'Not selected'}</span>
                    <span className="text-sm font-medium">0 credits</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>1 credit</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button disabled={!selectedStyle} className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white">
                  Complete Purchase <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right column: Style selector and payment info */}
          <div className="space-y-6">
            {/* Compact Style Selector */}
            <CompactStyleSelector 
              onSelectStyle={handleStyleSelect}
              selectedStyleId={selectedStyle?.id}
              showThumbnails={true}
              maxHeight="360px"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Your credits will be used for this purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center p-2 border rounded-md bg-gray-50">
                  <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Account Credits</p>
                    <p className="text-xs text-gray-500">Available: 10 credits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Estimated Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Processing Time</p>
                    <p className="text-xs text-gray-500">Approximately 30 seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}