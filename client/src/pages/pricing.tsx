import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';
import Footer from '@/components/Footer';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

export default function PricingPage() {
  const { user } = useAuth();
  const [freeCredits, setFreeCredits] = useState<number>(0);
  const [paidCredits, setPaidCredits] = useState<number>(0);

  useEffect(() => {
    // Fetch user credits
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        const response = await apiRequest('GET', `/api/credits/${user.id}`);
        const data = await response.json();
        
        setFreeCredits(data.freeCreditsUsed ? 0 : 1);
        setPaidCredits(data.paidCredits || 0);
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    fetchCredits();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Custom styling for navbar on dark background */}
      <div className="sticky top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg">
        <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      </div>
      
      <main className="container mx-auto px-4 py-12 pt-16 sm:pt-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your image transformation needs.
          </p>
        </div>
        
        <PricingSection userId={user?.id || 0} />
      </main>
      
      <Footer />
    </div>
  );
}