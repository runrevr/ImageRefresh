import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useToast } from '@/hooks/use-toast';
import ProductImageLab from '@/components/ProductImageLab';

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
        <ProductImageLab 
          isVisible={true}
          onClose={() => {}}
          initialCredits={userCredits?.paidCredits || 0}
          onCreditChange={handleCreditChange}
          webhookUrl="/api/transform"
          maxUploads={5}
        />
      </main>
      <Footer />
    </div>
  )
}