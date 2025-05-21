'use client'
import React from 'react'
import { Header } from '@/components/blocks/header'
import { HeroSection } from '@/components/blocks/hero-section'
import { ShowcaseSection } from '@/components/blocks/showcase-section'
import { SocialProofSection } from '@/components/blocks/social-proof-section'
import { CtaSection } from '@/components/blocks/cta-section'

export default function ProductImageLabPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <HeroSection />
        <SocialProofSection />
        <ShowcaseSection />
        <CtaSection />
      </main>
    </>
  )
}