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
import { Loader2 } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
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
        description: "Thank you for your purchase!",
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
            "Subscribe - $10/month"
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
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
      planType: "basic",
      credits: 10,
      amount: 1000  // $10.00
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
          <h1 className="text-2xl font-bold mb-6">Complete Your Purchase</h1>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center pb-4 border-b mb-4">
              <div>
                <h2 className="font-semibold">Basic Subscription</h2>
                <p className="text-sm text-gray-500">10 credits monthly</p>
              </div>
              <div className="text-lg font-bold">$10/month</div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
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