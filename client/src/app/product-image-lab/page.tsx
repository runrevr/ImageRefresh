'use client'
import React from 'react'
import { Header } from '@/components/blocks/header'
import { Footer } from '@/components/blocks/footer'
import { HeroSection } from '@/components/blocks/hero-section'
import { ShowcaseSection } from '@/components/blocks/showcase-section'
import { SocialProofSection } from '@/components/blocks/social-proof-section'
import { CtaSection } from '@/components/blocks/cta-section'

export default function ProductImageLabPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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