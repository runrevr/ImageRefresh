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
  pricePerCredit?: number; // Price per individual credit for quantity calculations
}

const creditPackages: CreditPackage[] = [
  { 
    id: 'single', 
    credits: 1, 
    price: 100, 
    priceLabel: '$1.00 each',
    pricePerCredit: 100 // $1.00 per credit
  },
  { 
    id: 'bundle-small', 
    credits: 5, 
    price: 500, 
    priceLabel: '$5.00', 
    savings: 'No discount',
    pricePerCredit: 100 // $1.00 per credit
  },
  { 
    id: 'bundle-medium', 
    credits: 20, 
    price: 1000, 
    priceLabel: '$10.00', 
    savings: 'Save 50%', 
    recommended: true,
    pricePerCredit: 50 // $0.50 per credit
  },
  { 
    id: 'bundle-large', 
    credits: 50, 
    price: 2000, 
    priceLabel: '$20.00', 
    savings: 'Save 60%',
    pricePerCredit: 40 // $0.40 per credit
  },
  { 
    id: 'bundle-xl', 
    credits: 100, 
    price: 5000, 
    priceLabel: '$50.00', 
    savings: 'Save 50%',
    pricePerCredit: 50 // $0.50 per credit
  }
];

type CreditPurchaseFormProps = {
  selectedPackage: CreditPackage;
  quantity: number;
  customCredits: number | null;
  customPrice: number | null;
};

const CreditPurchaseForm = ({ selectedPackage, quantity, customCredits, customPrice }: CreditPurchaseFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  
  // Use the calculated values when available, otherwise use the package defaults
  const finalCredits = customCredits !== null ? customCredits : (selectedPackage.credits * quantity);
  const finalPrice = customPrice !== null ? customPrice : (selectedPackage.price * quantity);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements || !user) {
      setIsProcessing(false);
      return;
    }

    try {
      // Step 1: Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      
      // Step 2: If payment was successful, manually update the credits
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          // Get timestamp to prevent duplicate processing
          const timestamp = Date.now();
          
          // Call the purchase-credits endpoint to update the user's credits
          // Include payment information for proper record keeping
          const response = await apiRequest('POST', '/api/purchase-credits', {
            userId: user.id,
            credits: finalCredits,
            amount: finalPrice, // Price in cents
            paymentIntentId: paymentIntent.id,
            description: `${finalCredits} Credit Purchase`,
            timestamp: timestamp
          });
          
          if (!response.ok) {
            throw new Error('Failed to add credits to your account');
          }
          
          const data = await response.json();
          
          // If credits were already processed (by webhook), just show confirmation
          if (data.alreadyProcessed) {
            toast({
              title: "Payment Already Processed",
              description: data.message || `Your credits have already been added to your account.`,
            });
          } else {
            // Invalidate queries to force a refetch of data
            queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            queryClient.invalidateQueries({ queryKey: ["/api/user/payment-history"] });
            
            toast({
              title: "Payment Successful!",
              description: `You now have ${data.paidCredits} credits available for use.`,
            });
          }
          
          // Redirect to account page with credits tab selected
          setTimeout(() => {
            navigate("/account?tab=credits");
          }, 500);
        } catch (creditError: any) {
          console.error('Error adding credits:', creditError);
          toast({
            title: "Error Adding Credits",
            description: "Your payment was successful, but we couldn't add credits to your account. Please contact support.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      } else {
        // Payment requires additional actions or is still processing
        toast({
          title: "Payment Processing",
          description: "Your payment is still processing. Credits will be added once the payment is completed.",
        });
        
        // Redirect to account page
        setTimeout(() => {
          navigate("/account?tab=credits");
        }, 500);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
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
  const [, navigate] = useLocation();
  const [freeCredits, setFreeCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(creditPackages[1]); // Default to the recommended package
  const [quantity, setQuantity] = useState<number>(1); // Default quantity
  const [customPrice, setCustomPrice] = useState<number | null>(null); // Price based on quantity
  const [customCredits, setCustomCredits] = useState<number | null>(null); // Credits based on quantity
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

  // Calculate custom price and credits based on quantity and selected package
  const calculateCustomPriceAndCredits = (pkg: CreditPackage, qty: number) => {
    if (qty <= 1) {
      // Reset to default package values if quantity is 1 or less
      setCustomCredits(null);
      setCustomPrice(null);
      return;
    }
    
    // Use the package's price per credit for the calculation
    const totalCredits = pkg.credits * qty;
    const totalPrice = pkg.price * qty;
    
    setCustomCredits(totalCredits);
    setCustomPrice(totalPrice);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseInt(e.target.value) || 1;
    // Ensure minimum quantity of 1 and maximum of 100
    const validQty = Math.max(1, Math.min(100, qty));
    setQuantity(validQty);
    
    // Update price calculations based on new quantity
    calculateCustomPriceAndCredits(selectedPackage, validQty);
    
    // Create a new payment intent with the updated quantity
    if (validQty > 0 && selectedPackage) {
      updatePaymentIntentWithQuantity(selectedPackage, validQty);
    }
  };
  
  // Update payment intent when quantity changes
  const updatePaymentIntentWithQuantity = async (pkg: CreditPackage, qty: number) => {
    // Calculate the new credit and price amounts
    const newCreditAmount = pkg.credits * qty;
    const newPriceAmount = pkg.price * qty;
    
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        planType: "credit_purchase",
        credits: newCreditAmount,
        amount: newPriceAmount
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to update payment");
      }
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      console.error("Error updating payment intent with quantity:", error);
      toast({
        title: "Error Updating Quantity",
        description: "There was a problem updating your quantity. Please try again or select a different package.",
        variant: "destructive",
      });
    }
  };

  const createPaymentIntent = async (packageId: string) => {
    const selectedPkg = creditPackages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    setSelectedPackage(selectedPkg);
    
    // Reset quantity to 1 when changing packages
    setQuantity(1);
    setCustomCredits(null);
    setCustomPrice(null);

    // Create PaymentIntent for the selected package
    try {
      // Use custom values if available
      const creditAmount = customCredits !== null ? customCredits : selectedPkg.credits;
      const priceAmount = customPrice !== null ? customPrice : selectedPkg.price;
      
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        planType: "credit_purchase", // This will ensure webhook marks it as a credit purchase
        credits: creditAmount,
        amount: priceAmount
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
      <div className="min-h-screen bg-gray-50 page-container">
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
      <div className="min-h-screen bg-gray-50 page-container">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="container mx-auto py-10 px-4 pt-20">
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-gray-600">Checking your subscription status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Check if user has an active subscription
  const hasActiveSubscription = subscriptionData?.subscriptionStatus === "active";
  
  // If user doesn't have an active subscription, show subscription required message
  
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 page-container">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
        <div className="container mx-auto py-10 px-4 pt-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="rounded-full bg-amber-100 p-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Subscription Required</h3>
                  <p className="text-amber-700 mb-4">You need an active subscription to purchase additional credits.</p>
                  <Button 
                    onClick={() => navigate("/pricing")}
                    className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white"
                  >
                    View Subscription Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 page-container">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <div className="container mx-auto py-10 px-4 pt-20">
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
              <CardTitle className="text-[#FF7B54]">Select Credit Package</CardTitle>
              <CardDescription className="text-[#333333]">Choose the amount of credits you want to purchase</CardDescription>
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
                <CardTitle className="text-[#FF7B54]">Payment Details</CardTitle>
                <CardDescription className="text-[#333333]">Complete your purchase securely</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 pb-4 border-b mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="font-semibold text-[#FF7B54]">{selectedPackage.credits} Credit{selectedPackage.credits > 1 ? 's' : ''}</h2>
                      <p className="text-sm text-gray-500">Base package</p>
                    </div>
                    <div className="text-lg font-bold">${(selectedPackage.price / 100).toFixed(2)}</div>
                  </div>
                  
                  {/* Quantity selector */}
                  <div className="mt-4">
                    <Label htmlFor="quantity" className="block mb-2 font-medium">
                      Quantity
                    </Label>
                    <div className="flex items-center">
                      <div className="flex items-center w-24 border rounded-md mr-4 overflow-hidden">
                        <button 
                          type="button"
                          className="px-2 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none text-gray-700"
                          onClick={() => {
                            const newQty = Math.max(1, quantity - 1);
                            setQuantity(newQty);
                            calculateCustomPriceAndCredits(selectedPackage, newQty);
                            if (newQty > 0) {
                              updatePaymentIntentWithQuantity(selectedPackage, newQty);
                            }
                          }}
                        >
                          -
                        </button>
                        <input
                          id="quantity"
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="1"
                          max="100"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-full px-1 py-2 text-center focus:outline-none"
                        />
                        <button 
                          type="button"
                          className="px-2 py-2 bg-gray-100 hover:bg-gray-200 focus:outline-none text-gray-700"
                          onClick={() => {
                            const newQty = Math.min(100, quantity + 1);
                            setQuantity(newQty);
                            calculateCustomPriceAndCredits(selectedPackage, newQty);
                            updatePaymentIntentWithQuantity(selectedPackage, newQty);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {customCredits !== null ? customCredits : selectedPackage.credits} Credits Total
                        </div>
                        <div className="text-sm text-gray-500">
                          {quantity > 1 ? `${quantity} packages × ${selectedPackage.credits} credits` : 'Single package'}
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        ${customPrice !== null ? (customPrice / 100).toFixed(2) : (selectedPackage.price / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CreditPurchaseForm 
                    selectedPackage={selectedPackage} 
                    quantity={quantity} 
                    customCredits={customCredits} 
                    customPrice={customPrice} 
                  />
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