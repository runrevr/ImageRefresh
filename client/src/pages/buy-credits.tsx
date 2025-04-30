import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  priceLabel: string;
  savings?: string;
  recommended?: boolean;
}

const creditPackages: CreditPackage[] = [
  { 
    id: 'single', 
    credits: 1, 
    price: 100, 
    priceLabel: '$1.00 each' 
  },
  { 
    id: 'bundle-small', 
    credits: 12, 
    price: 1000, 
    priceLabel: '$10.00', 
    savings: 'Save 16%', 
    recommended: true 
  },
  { 
    id: 'bundle-large', 
    credits: 30, 
    price: 2000, 
    priceLabel: '$20.00', 
    savings: 'Save 33%' 
  }
];

const CreditPurchaseForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/account?tab=credits",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      navigate("/account?tab=credits");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-between items-center mt-6">
        <Button type="button" variant="outline" onClick={() => navigate("/account?tab=credits")}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing} className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Complete Purchase"
          )}
        </Button>
      </div>
    </form>
  );
};

export default function BuyCredits() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();
  const [freeCredits, setFreeCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(creditPackages[1]); // Default to the recommended package
  
  useEffect(() => {
    if (user) {
      setFreeCredits(!user.freeCreditsUsed ? 1 : 0);
      setPaidCredits(user.paidCredits || 0);
    }
  }, [user]);

  const createPaymentIntent = async (packageId: string) => {
    const selectedPkg = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    setSelectedPackage(selectedPkg);

    // Create PaymentIntent for the selected package
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        planType: "credit_purchase",
        credits: selectedPkg.credits,
        amount: selectedPkg.price
      });
      
      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
    }
  };
  
  useEffect(() => {
    // Create initial PaymentIntent for the default package
    if (user?.id) {
      createPaymentIntent(selectedPackage.id);
    }
  }, [user?.id]);

  const handlePackageChange = (packageId: string) => {
    createPaymentIntent(packageId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-lg text-gray-600">Please log in to purchase credits.</p>
          <Button className="mt-4" onClick={() => window.location.href = "/auth"}>
            Log In or Sign Up
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Purchase Additional Credits</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Credit Package</CardTitle>
              <CardDescription>Choose the amount of credits you want to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={selectedPackage.id} 
                onValueChange={handlePackageChange}
                className="space-y-4"
              >
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className={`flex items-center p-4 border rounded-lg ${pkg.id === selectedPackage.id ? 'border-[#FF7B54] bg-orange-50' : 'border-gray-200'} ${pkg.recommended ? 'relative' : ''}`}>
                    {pkg.recommended && (
                      <div className="absolute -top-2 -right-2 bg-[#FF7B54] text-white text-xs px-2 py-1 rounded-full">
                        BEST VALUE
                      </div>
                    )}
                    <RadioGroupItem value={pkg.id} id={pkg.id} className="mr-4" />
                    <div className="flex flex-1 justify-between items-center">
                      <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{pkg.credits} Credit{pkg.credits > 1 ? 's' : ''}</div>
                        {pkg.savings && (
                          <div className="text-sm text-green-600">{pkg.savings}</div>
                        )}
                      </Label>
                      <div className="text-xl font-bold">{pkg.priceLabel}</div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {clientSecret ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your purchase securely</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center pb-4 border-b mb-4">
                  <div>
                    <h2 className="font-semibold">{selectedPackage.credits} Credit{selectedPackage.credits > 1 ? 's' : ''}</h2>
                    <p className="text-sm text-gray-500">One-time purchase</p>
                  </div>
                  <div className="text-lg font-bold">${(selectedPackage.price / 100).toFixed(2)}</div>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CreditPurchaseForm />
                </Elements>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-lg text-gray-600">Preparing checkout...</p>
            </div>
          )}
          
          <div className="text-sm text-gray-500 text-center mt-6">
            By purchasing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}