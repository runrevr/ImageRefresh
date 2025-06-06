
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutSummer() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setCustomerName(user.name || '');
    }
  }, [user]);

  const handlePurchase = async () => {
    if (!email || !customerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create summer package order
      const response = await apiRequest('POST', '/api/create-summer-subscription', {
        email,
        customerName,
        packageType: 'summer-unlimited',
        amount: 1900, // $19.00 in cents
        duration: 3, // 3 months
      });

      const data = await response.json();

      if (data.paymentUrl) {
        // Redirect to payment processor
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Failed to create payment session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-orange-600 mb-4">
              🌞 Summer Unlimited Package
            </h1>
            <p className="text-xl text-gray-700">
              3 months of unlimited transformations for just $19!
            </p>
          </div>

          {/* Package Details Card */}
          <Card className="mb-8 border-2 border-orange-300 bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <CardTitle className="text-2xl text-center">
                🔥 Summer Special Package
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-orange-600 mb-2">$19</div>
                <p className="text-gray-600 text-lg">3 months unlimited access</p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-lg text-gray-800">What's Included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span><strong>Unlimited transformations</strong> for 3 full months</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span>All kids' cartoon styles (Mario, Minecraft, Pixar, Lego, etc.)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span>Transform drawings into realistic photos</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span>Create custom coloring book pages</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span>HD downloads of all creations</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3 text-xl">✓</span>
                    <span>Save unlimited images to your account</span>
                  </li>
                </ul>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <p className="text-gray-700">
                  <strong>Perfect for summer break!</strong> Keep kids entertained and creative all season long.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Package expires August 31st, 2025 • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Complete Your Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">$19.00</span>
                </div>
                
                <Button
                  onClick={handlePurchase}
                  disabled={isLoading || !email || !customerName}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
                >
                  {isLoading ? 'Processing...' : 'Complete Purchase 🌞'}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Secure payment processing • 30-day money-back guarantee</p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">How does unlimited access work?</h4>
                <p className="text-gray-600 text-sm">You can transform as many images as you want during your 3-month period. No daily or monthly limits!</p>
              </div>
              <div>
                <h4 className="font-semibold">When does my 3-month period start?</h4>
                <p className="text-gray-600 text-sm">Your access begins immediately after purchase and lasts for exactly 3 months (90 days).</p>
              </div>
              <div>
                <h4 className="font-semibold">Can I cancel anytime?</h4>
                <p className="text-gray-600 text-sm">Yes! While this is a one-time 3-month package, you can request a refund within 30 days if you're not satisfied.</p>
              </div>
              <div>
                <h4 className="font-semibold">What happens after 3 months?</h4>
                <p className="text-gray-600 text-sm">Your access will expire, but you can continue with our regular monthly plans or purchase credits as needed.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
