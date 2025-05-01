import { useState, useEffect } from 'react';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of component render
// This ensures the Stripe instance is only created once
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Checkout form that appears inside the Elements provider
const CheckoutForm = ({ 
  amount, 
  userId, 
  creditAmount, 
  onSuccess,
  onCancel
}: {
  amount: number;
  userId: number;
  creditAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Confirm the payment with Stripe.js
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/purchase-success',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'An error occurred with your payment');
      toast({
        title: "Payment Failed",
        description: error.message || 'An error occurred with your payment',
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      // Payment successful - add credits to user account
      try {
        const response = await apiRequest('POST', '/api/purchase-credits', {
          userId,
          credits: creditAmount
        });
        
        if (!response.ok) {
          throw new Error('Failed to add credits to your account');
        }
        
        const data = await response.json();
        
        toast({
          title: "Payment Successful!",
          description: `You now have ${data.paidCredits} credits available for use.`,
        });
        
        onSuccess();
      } catch (error) {
        console.error('Error adding credits:', error);
        toast({
          title: "Error Adding Credits",
          description: "Your payment was successful, but we couldn't add credits to your account. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white"
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

// Main checkout component that initializes Stripe and renders the form
interface StripeCheckoutProps {
  amount: number;
  userId: number;
  creditAmount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ 
  amount, 
  userId, 
  creditAmount,
  onSuccess,
  onCancel 
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a payment intent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          amount: amount,
        });
        
        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Setup Failed",
          description: "We couldn't set up the payment form. Please try again later.",
          variant: "destructive"
        });
      }
    };

    createPaymentIntent();
  }, [amount, toast]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3">Preparing payment form...</span>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#FF7B54',
        colorBackground: '#ffffff',
        colorText: '#333333',
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-[#FF7B54]">Purchase {creditAmount} Credits</h3>
      <p className="text-[#333333] mb-6">
        Each credit includes 1 image transformation and 1 edit. Your credits will be available immediately after purchase.
      </p>
      
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm 
          amount={amount} 
          userId={userId} 
          creditAmount={creditAmount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}
