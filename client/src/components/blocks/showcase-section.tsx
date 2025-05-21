'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'wouter'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

// Import showcase images
import shampooOriginal from '../../assets/shampoo-original.jpg'
import shampooBottle from '../../assets/shampoo-bottle.jpg'
import sunsetShampoo from '../../assets/sunset-shampoo.jpg'
import sweatshirtBasic from '../../assets/sweatshirt-basic.png'
import sweatshirtLifestyle from '../../assets/sweatshirt-lifestyle.png'

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
                                        src={shampooOriginal} 
                                        alt="Original product" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src={shampooBottle} 
                                        alt="Enhanced product" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src={sunsetShampoo} 
                                        alt="Product with background" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src={sweatshirtBasic} 
                                        alt="Basic apparel" 
                                        className="h-full w-full object-cover rounded-lg"
                                    />
                                </div>
                                <div 
                                    className="h-[300px] w-[200px] shrink-0 rounded-xl bg-white p-3 mx-2 shadow-md"
                                >
                                    <img 
                                        src={sweatshirtLifestyle} 
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