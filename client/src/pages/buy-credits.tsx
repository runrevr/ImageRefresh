import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { useQuery } from "@tanstack/react-query";

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
      // Invalidate queries to force a refetch of data
      queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your credits will be added to your account shortly.",
      });
      
      // Redirect to account page with credits tab selected
      setTimeout(() => {
        navigate("/account?tab=credits");
      }, 500);
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
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch subscription status
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["/api/user/subscription"],
    queryFn: async () => {
      if (!user) return null;
      const res = await apiRequest("GET", "/api/user/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription data");
      return res.json();
    },
    enabled: !!user
  });
  
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
        planType: "credit_purchase", // This will ensure webhook marks it as a credit purchase
        credits: selectedPkg.credits,
        amount: selectedPkg.price
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to create payment intent");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
      // Clear any previous errors
      setPaymentError(null);
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      setPaymentError(error.message || "There was a problem setting up your payment. Please try again.");
      toast({
        title: "Payment Setup Failed",
        description: error.message || "There was a problem setting up your payment. Please try again.",
        variant: "destructive",
      });
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

  // Handler for retry after error
  const handleRetry = () => {
    setPaymentError(null);
    createPaymentIntent(selectedPackage.id);
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
  
  // Show loading spinner while subscription status is being checked
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="container mx-auto py-10 px-4">
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-gray-600">Checking your subscription status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // If user doesn't have active subscription, redirect to pricing page
  if (
    subscriptionData && 
    !subscriptionData.hasActiveSubscription && 
    subscriptionData.subscriptionStatus !== 'active'
  ) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="container mx-auto py-10 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6 text-center">
              <h2 className="text-xl font-bold mb-2 text-amber-800">Subscription Required</h2>
              <p className="text-amber-700 mb-4">
                You need an active subscription to purchase additional credits. 
                Please subscribe to one of our plans to unlock this feature.
              </p>
              <Button 
                className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white" 
                onClick={() => window.location.href = "/pricing"}
              >
                View Subscription Plans
              </Button>
            </div>
          </div>
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
          
          {/* Show error message if payment setup failed */}
          {paymentError && (
            <div className="mb-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="rounded-full bg-red-100 p-3 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M10 16l2-2m2-2l-2 2m-2-2l2 2M4 8l2.1 2.8A3 3 0 0 1 9 14.1l5.5-5.5a3 3 0 0 1 4.2 0L20 10"></path><path d="M21 15v4a1 1 0 0 1-1 1h-4"></path><path d="M19 10V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v4"></path></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Setup Failed</h3>
                    <p className="text-red-700 mb-4">{paymentError}</p>
                    <Button 
                      variant="outline" 
                      onClick={handleRetry}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
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