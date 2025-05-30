'use client'
import React from 'react'
import { useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HeroSection } from '@/components/blocks/hero-section'
import { ShowcaseSection } from '@/components/blocks/showcase-section'
import { SocialProofSection } from '@/components/blocks/social-proof-section'
import { CtaSection } from '@/components/blocks/cta-section'

export default function ProductImageLabPage() {
  // Mock credits for development - in production this would come from your auth context
  const freeCredits = 1;
  const paidCredits = 10;
  const [, setLocation] = useLocation();

  const handleExplorePrompts = () => {
    window.location.href = '/prebuilt-prompts';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      
      {/* Emergency Test Button */}
      <div style={{ position: 'fixed', top: '100px', right: '20px', zIndex: 99999 }}>
        <button 
          onClick={() => {
            alert('Button clicked! Navigating...');
            window.location.href = '/prebuilt-prompts';
          }}
          style={{
            backgroundColor: '#FF0000',
            color: 'white',
            padding: '15px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          EMERGENCY TEST BUTTON
        </button>
      </div>
      
      <main className="flex-grow overflow-hidden pt-16"> {/* Add padding-top for fixed header */}
        <HeroSection onExplorePrompts={handleExplorePrompts} />
        <SocialProofSection />
        <ShowcaseSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}