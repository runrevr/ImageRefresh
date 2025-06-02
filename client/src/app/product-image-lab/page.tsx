'use client'
import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { HeroSection } from '@/components/blocks/hero-section'
import { ShowcaseSection } from '@/components/blocks/showcase-section'
import { SocialProofSection } from '@/components/blocks/social-proof-section'
import { CtaSection } from '@/components/blocks/cta-section'
import { useAuth } from "@/hooks/useAuth";
import SignUpModal from '@/components/SignUpModal';

function ProductImageLabPage() {
  const { user, isLoading } = useAuth();
  // Mock credits for development - in production this would come from your auth context
  const freeCredits = 1;
  const paidCredits = 10;

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show signup modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignUpModal 
          isOpen={true} 
          onClose={() => window.location.href = '/'} 
          onSignUpWithGoogle={() => window.location.href = '/auth?provider=google'}
          onSignUpWithEmail={() => window.location.href = '/auth?mode=signup'}
          onLogin={() => window.location.href = '/auth?mode=login'}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow overflow-hidden pt-16"> {/* Add padding-top for fixed header */}
        <HeroSection />
        <SocialProofSection />
        <ShowcaseSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

export default ProductImageLabPage