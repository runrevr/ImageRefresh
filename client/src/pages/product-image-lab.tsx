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
    setLocation('/prebuilt-prompts');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow overflow-hidden pt-16">
        <HeroSection onExplorePrompts={handleExplorePrompts} />
        <SocialProofSection />
        <ShowcaseSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}