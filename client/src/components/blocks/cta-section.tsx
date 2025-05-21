'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'

export function CtaSection() {
    return (
        <section className="py-24 bg-[#2A7B9B]">
            <div className="mx-auto max-w-6xl px-6 text-center">
                <h2 className="text-3xl font-medium text-white mb-4">Ready to transform your product images?</h2>
                <p className="text-xl text-white/80 mb-8">Start enhancing your visuals today</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/upload">
                        <Button size="lg" className="rounded-full bg-white text-[#2A7B9B] hover:bg-white/90">
                            Start Free Trial
                        </Button>
                    </Link>
                    <Link href="/pricing">
                        <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10">
                            See pricing
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}