'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

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
                                        src="/src/assets/shampoo-original.jpg" 
                                        alt="Original product" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/src/assets/shampoo-bottle.jpg" 
                                        alt="Enhanced product" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/src/assets/sunset-shampoo.jpg" 
                                        alt="Product with background" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/src/assets/sweatshirt-basic.png" 
                                        alt="Basic apparel" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src="/src/assets/sweatshirt-lifestyle.png" 
                                        alt="Lifestyle apparel" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                            </InfiniteSlider>
                        </div>
                    </ProgressiveBlur>
                </div>
                
                <div className="mt-12 text-center">
                    <Link href="/gallery">
                        <Button variant="outline" className="rounded-full border-[#2A7B9B] text-[#2A7B9B] hover:bg-[#2A7B9B]/10">
                            View our gallery
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}