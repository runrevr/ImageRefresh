import {
  useStripe,
  Elements,
  PaymentElement,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
// No longer using redirect approach
// import { createPaymentRedirectUrl } from "@/lib/paymentUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  throw new Error("Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY");
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  user: any; // Use proper type from your auth context
}

const CheckoutForm = ({ user }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    console.log("Starting subscription payment process...");

    if (!stripe || !elements) {
      console.log("Stripe or elements not loaded");
      setIsProcessing(false);
      return;
    }

    try {
      // Process the payment directly without redirect
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      // If there's a payment error
      if (result.error) {
        console.error("Payment error:", result.error);
        toast({
          title: "Subscription Failed",
          description: result.error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // No error means success
      console.log("Subscription payment successful:", result);

      // Create a unique subscription ID
      const timestamp = Date.now().toString();
      const subscriptionId = `sub_core_${timestamp}`;

      // Check if this subscription was already processed (using localStorage)
      if (localStorage.getItem(subscriptionId) === "processed") {
        console.log(
          `Subscription ${subscriptionId} was already processed - skipping API call`,
        );
        navigate("/account");
        return;
      }

      // Mark this subscription as processed
      localStorage.setItem(subscriptionId, "processed");

      // Update subscription status
      const response = await apiRequest("POST", "/api/update-user-subscription", {
        userId: user.id,
        subscriptionTier: "core",
        subscriptionStatus: "active",
        stripeCustomerId: user.stripeCustomerId || `cus_${user.id}_${timestamp}`,
        stripeSubscriptionId: subscriptionId,
        // Also include initial credits
        credits: 20,
        amount: 1000, // $10.00 in cents
        paymentIntentId: result.paymentIntent?.id || subscriptionId,
        description: "Core Subscription (Monthly)",
        timestamp,
      });

      if (response.ok) {
        // Show success toast
        toast({
          title: "Subscription Successful",
          description:
            "Thank you for subscribing to the Core plan! Your monthly credits have been added to your account.",
          duration: 5000,
        });

        // Invalidate relevant queries to refresh the data
        console.log("Invalidating query caches to refresh data");
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/payment-history"] });

        // Redirect to account page, subscription tab
        navigate("/account?tab=subscription");
      } else {
        console.error("Failed to update subscription:", await response.text());
        toast({
          title: "Subscription Update Failed",
          description:
            "Your payment was successful, but we couldn't update your subscription. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Subscription process error:", err);
      toast({
        title: "Subscription Processing Error",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <div className="flex justify-between items-center mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/account")}
        >
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
            "Subscribe - $10.00/month"
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
      planType: "core_subscription",
      credits: 20,
      amount: 1000, // $10.00
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
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
                <h2 className="font-semibold text-[#2A7B9B]">
                  Core Subscription
                </h2>
                <p className="text-sm text-gray-500">20 credits monthly</p>
              </div>
              <div className="text-lg font-bold">$10.00<span className="text-sm text-gray-500">/month</span></div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm user={user} />
            </Elements>
          </div>
          <div className="text-sm text-gray-500 text-center">
            By subscribing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            <p className="mt-2">You will be charged $10.00 monthly and receive 20 credits each month.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
