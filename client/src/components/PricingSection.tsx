import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { PricingTier } from '@shared/schema';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface PricingSectionProps {
  userId?: number;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    features: [
      { available: true, text: "1 free credit monthly" },
      { available: true, text: "Each credit = 1 image + 1 edit" },
      { available: true, text: "Standard resolution output" },
      { available: false, text: "Limited image history" }
    ],
    buttonText: "Get Started",
    buttonClass: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    borderClass: "border-t-4 border-gray-200"
  },
  {
    name: "Core",
    price: "$10/month",
    features: [
      { available: true, text: "12 credits per month" },
      { available: true, text: "Credits reset monthly" },
      { available: true, text: "HD resolution output" },
      { available: true, text: "All images stored in your account" }
    ],
    popular: false,
    buttonText: "Choose Core",
    buttonClass: "bg-[#2A7B9B] text-white hover:bg-[#1e6988]",
    borderClass: "border-t-4 border-[#2A7B9B]"
  },
  {
    name: "Premium",
    price: "$20/month",
    features: [
      { available: true, text: "30 credits per month" },
      { available: true, text: "Credits reset monthly" },
      { available: true, text: "Highest resolution output" },
      { available: true, text: "Commercial usage rights" }
    ],
    popular: true,
    buttonText: "Choose Premium",
    buttonClass: "bg-[#FF7B54] text-white hover:bg-[#e56c49]",
    borderClass: "border-t-4 border-[#FF7B54]"
  }
];

export default function PricingSection({ userId }: PricingSectionProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handlePurchase = async (tier: PricingTier) => {
    if (tier.name === "Free") {
      toast({
        title: "Free Plan",
        description: "You already have access to the free plan!",
      });
      return;
    }

    // For paid plans, navigate to the appropriate checkout page
    if (tier.name === "Core") {
      navigate("/checkout");
    } else if (tier.name === "Premium") {
      navigate("/subscribe");
    }
  };

  return (
    <section id="pricing" className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600">Choose a plan that works for you</p>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-5xl mx-auto">
        {pricingTiers.map((tier, index) => (
          <Card 
            key={index}
            className={`overflow-hidden shadow-md bg-white ${tier.borderClass} relative flex-1 md:max-w-xs ${tier.popular ? 'transform scale-105 shadow-lg z-10' : ''} flex flex-col text-[#333333]`}
          >
            {tier.popular && (
              <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden z-10">
                <div className="absolute top-0 right-0 text-center py-1 w-40 bg-[#FF7B54] text-white font-bold uppercase tracking-wider text-xs transform rotate-45 origin-top-right translate-y-[18px] shadow-md">
                  Popular
                </div>
              </div>
            )}
            <CardContent className="p-6 flex-grow flex flex-col">
              <div>
                <h3 className="text-xl font-bold mb-4 text-[#333333]">{tier.name}</h3>
                <div className="text-4xl font-bold mb-6 text-[#333333]">{tier.price}</div>
                <ul className="space-y-3">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      {feature.available ? (
                        <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.available ? 'text-[#333333]' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Button 
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 px-4 py-2 w-full text-white hover:bg-[#e56c49] bg-[#84CC16]"
                  onClick={() => handlePurchase(tier)}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : tier.buttonText}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="bg-gray-50 rounded-xl p-6 max-w-5xl mx-auto mt-8">
        <h3 className="text-lg font-bold mb-3">Need additional credits?</h3>
        <p className="text-gray-600 mb-4">You can purchase additional credits anytime at $1 each, with volume discounts available.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            className="bg-[#FF7B54] text-white hover:bg-[#e56c49]"
            onClick={() => navigate("/buy-credits")}
          >
            Buy Credits
          </Button>
          <Button 
            variant="outline" 
            className="border-[#FF7B54] text-[#FF7B54] hover:bg-[#FF7B54] hover:text-white"
            onClick={() => navigate("/pricing")}
          >
            Need more credits?
          </Button>
        </div>
      </div>
    </section>
  );
}
