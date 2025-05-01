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
import { Loader2, Check } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
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
        return_url: window.location.origin,
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
        description: "You are now subscribed!",
      });
      navigate("/account");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-between items-center mt-6">
        <Button type="button" variant="outline" onClick={() => navigate("/account")}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe - $20/month"
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const { user } = useAuth();
  const [freeCredits, setFreeCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);
  
  useEffect(() => {
    if (user) {
      setFreeCredits(!user.freeCreditsUsed ? 1 : 0);
      setPaidCredits(user.paidCredits || 0);
    }
  }, [user]);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      planType: "pro",
      credits: 30,
      amount: 2000  // $20.00
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch(error => {
        console.error("Error creating payment intent:", error);
      });
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-gray-600">Preparing checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Complete Your Subscription</h1>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <div>
                <h2 className="font-semibold text-[#FF7B54]">Pro Subscription</h2>
                <p className="text-sm text-gray-500">30 credits monthly</p>
              </div>
              <div className="text-lg font-bold">$20/month</div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-[#FF7B54]">Subscription Benefits:</h3>
              <ul className="space-y-2 text-[#333333]">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#FF7B54] mt-0.5 mr-2 flex-shrink-0" />
                  <span>30 credits each month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#FF7B54] mt-0.5 mr-2 flex-shrink-0" />
                  <span>Credits reset monthly</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-[#FF7B54] mt-0.5 mr-2 flex-shrink-0" />
                  <span>Commercial usage rights</span>
                </li>
              </ul>
            </div>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </div>
          <div className="text-sm text-gray-500 text-center">
            By subscribing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};