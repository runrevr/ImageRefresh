import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FaqSection';
import { useAuth } from '@/hooks/useAuth';

export default function HelpPage() {
  const { user } = useAuth();
  const [freeCredits, setFreeCredits] = useState<number>(0);
  const [paidCredits, setPaidCredits] = useState<number>(0);

  useEffect(() => {
    if (user) {
      setFreeCredits(!user.freeCreditsUsed ? 1 : 0);
      setPaidCredits(user.paidCredits || 0);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      <main className="container mx-auto px-4 py-12 pt-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about using our platform.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <FaqSection />
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg text-gray-600 mb-6">
              If you can't find the answer you're looking for, please reach out to our support team.
            </p>
            <a 
              href="mailto:support@imagerefresh.ai" 
              className="px-6 py-3 bg-[#FF7B54] hover:bg-[#FF7B54]/90 text-white rounded-md font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
