import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import FixedProductImageLab from '@/components/FixedProductImageLab';

export default function ProductImageLabPage() {
  const { user } = useAuth();
  const { data: userCredits } = useCredits();
  const { toast } = useToast();
  const [credits, setCredits] = useState(userCredits?.paidCredits || 0);

  const handleCreditChange = (newCredits: number) => {
    setCredits(newCredits);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={userCredits?.freeCreditsUsed ? 0 : 1} paidCredits={userCredits?.paidCredits || 0} />
      <main className="flex-grow pt-16">
        <div className="container mx-auto p-4">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">Product Image Lab</h1>
            <p className="text-gray-600 mb-6">
              Upload your product images and apply professional enhancements with AI-powered tools.
            </p>
            
            <FixedProductImageLab 
              initialCredits={userCredits?.paidCredits || 0}
              onCreditChange={handleCreditChange}
              testMode={false}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}