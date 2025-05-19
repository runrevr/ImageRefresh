/**
 * Fixed Product Image Lab Page
 * A simplified page that uses the fixed version of the Product Image Lab component
 */
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import GlobalFooter from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import FixedProductImageLab from '@/components/FixedProductImageLab';

export default function FixedProductLabPage() {
  // Auth and credits
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock credits for development - in production this would come from your auth context
  const [credits, setCredits] = useState({ free: 5, paid: 5 });
  
  // Calculate total credits
  const totalCredits = credits.free + credits.paid;
  
  // Check URL for test mode parameter
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  });
  
  // Initialize test mode from URL parameter
  const initialTestMode = searchParams.get('testMode') === 'true';
  
  // Handle credit changes
  const handleCreditChange = (newCredits: number) => {
    console.log(`Credits updated: ${newCredits}`);
    
    // In a real app, you would update the user's credits in your backend
    // For now, we'll just update our local state
    const change = newCredits - totalCredits;
    
    if (change < 0) {
      // Deduct from free credits first
      const freeToDeduct = Math.min(Math.abs(change), credits.free);
      const paidToDeduct = Math.abs(change) - freeToDeduct;
      
      setCredits({
        free: credits.free - freeToDeduct,
        paid: credits.paid - paidToDeduct
      });
    } else if (change > 0) {
      // Add to free credits
      setCredits({
        ...credits,
        free: credits.free + change
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar freeCredits={credits.free} paidCredits={credits.paid} />
      
      <main className="flex-grow pt-20">
        <FixedProductImageLab 
          initialCredits={totalCredits}
          onCreditChange={handleCreditChange}
          testMode={initialTestMode}
        />
      </main>
      
      <GlobalFooter />
    </div>
  );
}