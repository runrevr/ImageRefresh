'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Link } from 'wouter'

export function CtaSection() {
    return (
        <section className="py-24 bg-[#2A7B9B]">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <h2 className="text-3xl font-medium text-white mb-4">Ready to transform your product images?</h2>
                <p className="text-xl text-white/80 mb-8">Start enhancing your visuals today</p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/upload">
                        <RainbowButton size="lg" className="rounded-full">
                            Start Free Trial
                        </RainbowButton>
                    </Link>
                    <Link href="/pricing">
                        <RainbowButton size="lg" className="rounded-full" variant="outline">
                            See pricing
                        </RainbowButton>
                    </Link>
                </div>
            </div>
        </section>
    )
}