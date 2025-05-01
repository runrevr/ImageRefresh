import React, { ReactNode, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [freeCredits, setFreeCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return;
      
      try {
        const res = await apiRequest("GET", `/api/credits/${user.id}`);
        const data = await res.json();
        
        setPaidCredits(data.paidCredits || 0);
        setFreeCredits(data.freeCreditsUsed ? 0 : 1);
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };

    fetchCredits();
  }, [user]);

  return (
    <div className="flex flex-col w-full h-full min-h-screen" style={{ minHeight: '100vh', height: '100%' }}>
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow flex flex-col" style={{ flex: '1 1 auto' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}