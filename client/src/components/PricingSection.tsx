import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { PricingTier } from '@shared/schema';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PricingSectionProps {
  userId: number;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free Trial",
    price: "$0",
    features: [
      { available: true, text: "1 Free image transformation" },
      { available: true, text: "Standard resolution output" },
      { available: true, text: "Basic editing capabilities" },
      { available: false, text: "No watermark removal" }
    ],
    buttonText: "Start Free",
    buttonClass: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    borderClass: "border-t-4 border-gray-200"
  },
  {
    name: "Basic",
    price: "$9.99",
    features: [
      { available: true, text: "10 Image transformations" },
      { available: true, text: "HD resolution output" },
      { available: true, text: "Advanced editing options" },
      { available: true, text: "No watermarks" }
    ],
    popular: true,
    buttonText: "Choose Basic",
    buttonClass: "bg-primary-500 text-white hover:bg-primary-600",
    borderClass: "border-t-4 border-primary-500"
  },
  {
    name: "Pro",
    price: "$24.99",
    features: [
      { available: true, text: "30 Image transformations" },
      { available: true, text: "4K resolution output" },
      { available: true, text: "Priority processing" },
      { available: true, text: "Commercial usage rights" }
    ],
    buttonText: "Choose Pro",
    buttonClass: "border border-secondary-500 text-secondary-500 hover:bg-secondary-50",
    borderClass: "border-t-4 border-secondary-500"
  }
];

export default function PricingSection({ userId }: PricingSectionProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (tier: PricingTier) => {
    // In a real app, this would take you to a checkout page
    // For this demo, we'll simulate a purchase for the Basic and Pro plans
    if (tier.name === "Free Trial") {
      toast({
        title: "Free Trial",
        description: "You already have access to the free trial!",
      });
      return;
    }

    setIsPurchasing(true);
    
    try {
      // Simulate purchasing credits
      const credits = tier.name === "Basic" ? 10 : 30;
      
      const response = await apiRequest('POST', '/api/purchase-credits', {
        userId,
        credits
      });
      
      const data = await response.json();
      
      toast({
        title: "Purchase Successful",
        description: `You now have ${data.paidCredits} credits available.`,
      });
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <section id="pricing" className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600">Choose a plan that works for you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <Card 
            key={index}
            className={`overflow-hidden shadow-md ${tier.borderClass} relative ${tier.popular ? 'transform scale-105 shadow-lg z-10' : ''}`}
          >
            {tier.popular && (
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-medium">
                Popular
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">{tier.name}</h3>
              <div className="text-4xl font-bold mb-6">{tier.price}</div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    {feature.available ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.available ? '' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${tier.buttonClass}`}
                onClick={() => handlePurchase(tier)}
                disabled={isPurchasing}
              >
                {isPurchasing ? 'Processing...' : tier.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6 max-w-5xl mx-auto mt-8">
        <h3 className="text-lg font-bold mb-3">Need more transformations?</h3>
        <p className="text-gray-600 mb-4">Contact us for custom enterprise plans or bulk pricing.</p>
        <Button variant="outline">
          Contact Sales
        </Button>
      </div>
    </section>
  );
}
