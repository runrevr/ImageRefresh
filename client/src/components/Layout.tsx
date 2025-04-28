import React, { ReactNode, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiRequest } from "@/lib/queryClient";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [freeCredits, setFreeCredits] = useState(0);
  const [paidCredits, setPaidCredits] = useState(0);

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      try {
        // Using 1 as default user ID for now, this should be updated in a real app
        const res = await apiRequest("GET", "/api/credits/1");
        const data = await res.json();
        
        setPaidCredits(data.paidCredits || 0);
        setFreeCredits(data.freeCreditsUsed ? 0 : 1);
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      }
    };

    fetchCredits();
  }, []);

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