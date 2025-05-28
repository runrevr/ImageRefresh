'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Link } from 'wouter'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

// Use public directory paths for images

export function ShowcaseSection() {
    return (
        <section className="py-24 relative overflow-hidden bg-white">
            <div className="mx-auto max-w-6xl px-6">
                <h2 className="text-center text-3xl font-medium text-[#333333] mb-3">See what our AI can do</h2>
                <p className="text-center text-lg text-[#333333]/70 mb-12">From basic enhancements to complete transformations</p>

                <div className="relative h-[320px] w-full overflow-hidden rounded-xl">
                    <ProgressiveBlur className="h-full w-full">
                        <div className="flex gap-4 h-full -rotate-3">
                            <InfiniteSlider 
                                speed={25} 
                                className="flex"
                            >
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/images/shampoo-original.jpg" 
                                        alt="Original product" 
                                        className="h-full w-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.svg";
                                        }}
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/images/nounou-shampoo.jpg" 
                                        alt="Enhanced product" 
                                        className="h-full w-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.svg";
                                        }}
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/80s.png" 
                                        alt="Product with background" 
                                        className="h-full w-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.svg";
                                        }}
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/Western.png" 
                                        alt="Basic apparel" 
                                        className="h-full w-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.svg";
                                        }}
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/Disco.png" 
                                        alt="Lifestyle apparel" 
                                        className="h-full w-full object-cover rounded-lg"
                                        onError={(e) => {
                                            e.currentTarget.src = "/images/placeholder.svg";
                                        }}
                                    />
                                </div>
                            </InfiniteSlider>
                        </div>
                    </ProgressiveBlur>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/gallery">
                        <RainbowButton className="rounded-full">
                            View our gallery
                        </RainbowButton>
                    </Link>
                </div>
            </div>
        </section>
    )
}