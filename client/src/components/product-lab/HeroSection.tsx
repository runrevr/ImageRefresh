'use client'
import React from 'react'
import { Mail, SendHorizonal, Upload, Sparkles, PanelTop, Image, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { Link } from 'wouter'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import { HeroHeader } from './HeroHeader'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />

            <main className="overflow-hidden">
                <section>
                    <div className="relative mx-auto max-w-6xl px-6 pt-32 lg:pb-16 lg:pt-48">
                        <div className="relative z-10 mx-auto max-w-4xl text-center">
                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                            >
                                <h1
                                    className="text-balance text-4xl font-medium sm:text-5xl md:text-6xl text-[#333333]">
                                    Transform your product photos
                                </h1>

                                <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-[#333333]/80">
                                    Professional-quality product images in minutes, no design skills needed. Perfect for small business owners and entrepreneurs.
                                </p>

                                <form
                                    action=""
                                    className="mt-12 mx-auto max-w-sm">
                                    <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-[1rem] border shadow shadow-zinc-950/5 has-[input:focus]:ring-2 lg:pr-0">
                                        <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                                        <input
                                            placeholder="Your mail address"
                                            className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                                            type="email"
                                        />

                                        <div className="md:pr-1.5 lg:pr-0">
                                            <Button
                                                aria-label="submit"
                                                size="sm"
                                                className="rounded-[0.5rem] bg-[#2A7B9B] hover:bg-[#2A7B9B]/90">
                                                <span className="hidden md:block">Get Started</span>
                                                <SendHorizonal
                                                    className="relative mx-auto size-5 md:hidden"
                                                    strokeWidth={2}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </form>

                                {/* Three horizontal cards section */}
                                <div 
                                    aria-hidden
                                    className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    
                                    {/* Card 1: Upload for Enhancement */}
                                    <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                                        <div className="flex flex-col space-y-4">
                                            {/* Card Header with Icon */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                                                    <div className="relative">
                                                        <Upload className="size-8 text-[#2A7B9B]" />
                                                        <Sparkles className="absolute -right-2 -top-2 size-4 text-[#FF7B54]" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Heading and Description */}
                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold text-[#333333]">Enhance your product photos</h3>
                                                <p className="mt-2 text-[#333333]/80">Upload up to 5 images and our AI will suggest professional improvements</p>
                                            </div>
                                            
                                            {/* Example Before/After */}
                                            <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="overflow-hidden rounded-md">
                                                        <img 
                                                            src="/src/assets/mexican-food-original.png" 
                                                            alt="Before enhancement" 
                                                            className="h-24 w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="overflow-hidden rounded-md">
                                                        <img 
                                                            src="/src/assets/mexican-food-enhanced.png" 
                                                            alt="After enhancement" 
                                                            className="h-24 w-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* CTA Button */}
                                            <Button className="mt-4 w-full bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white">
                                                Upload Photos
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Card 2: Prebuilt Prompts */}
                                    <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                                        <div className="flex flex-col space-y-4">
                                            {/* Card Header with Icon */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                                                    <PanelTop className="size-8 text-[#2A7B9B]" />
                                                </div>
                                            </div>
                                            
                                            {/* Heading and Description */}
                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold text-[#333333]">Quick fixes with prebuilt tools</h3>
                                                <p className="mt-2 text-[#333333]/80">Choose from expert-designed enhancements for your product images</p>
                                            </div>
                                            
                                            {/* Example Templates */}
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                <div className="rounded-md bg-white p-2 text-center shadow-sm">
                                                    <div className="mb-1 h-12 rounded bg-[#FF7B54]/10 flex items-center justify-center">
                                                        <span className="text-xs text-[#FF7B54]">Remove BG</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-white p-2 text-center shadow-sm">
                                                    <div className="mb-1 h-12 rounded bg-[#2A7B9B]/10 flex items-center justify-center">
                                                        <span className="text-xs text-[#2A7B9B]">Lighting</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-md bg-white p-2 text-center shadow-sm">
                                                    <div className="mb-1 h-12 rounded bg-[#A3E4D7]/20 flex items-center justify-center">
                                                        <span className="text-xs text-[#2A7B9B]">Shadows</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* CTA Button */}
                                            <Button className="mt-4 w-full bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white">
                                                Explore Prebuilt Tools
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Card 3: Text-to-Image */}
                                    <div className="bg-[#F2F2F2] rounded-[1.25rem] border border-gray-200 p-5 shadow-lg transition-all duration-300 hover:shadow-xl">
                                        <div className="flex flex-col space-y-4">
                                            {/* Card Header with Icon */}
                                            <div className="flex items-center justify-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10">
                                                    <div className="relative">
                                                        <Image className="size-8 text-[#2A7B9B]" />
                                                        <Wand2 className="absolute -right-3 -top-2 size-4 text-[#FF7B54]" />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Heading and Description */}
                                            <div className="text-center">
                                                <h3 className="text-xl font-semibold text-[#333333]">Generate product variations</h3>
                                                <p className="mt-2 text-[#333333]/80">Create different colors, styles, and contexts for your product</p>
                                            </div>
                                            
                                            {/* Example Color Variations */}
                                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-red-500 shadow-sm"></div>
                                                <div className="h-12 w-12 rounded-full bg-blue-500 shadow-sm"></div>
                                                <div className="h-12 w-12 rounded-full bg-green-500 shadow-sm"></div>
                                                <div className="h-12 w-12 rounded-full bg-yellow-500 shadow-sm"></div>
                                                <div className="h-12 w-12 rounded-full bg-purple-500 shadow-sm"></div>
                                            </div>
                                            
                                            {/* CTA Button */}
                                            <Button className="mt-4 w-full bg-[#2A7B9B] hover:bg-[#2A7B9B]/90 text-white">
                                                Create Variations
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedGroup>
                        </div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section className="relative overflow-hidden py-16 bg-[#F9F9F9]">
                    <div className="absolute inset-0 pointer-events-none opacity-50">
                        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-[#A3E4D7]/20 to-transparent"></div>
                        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-[#FF7B54]/10 to-transparent"></div>
                    </div>
                    
                    <div className="relative mx-auto max-w-6xl px-6">
                        <h2 className="text-center text-3xl font-medium text-[#333333] mb-10">Trusted by businesses worldwide</h2>
                        
                        <div className="flex justify-center items-center flex-wrap gap-8 md:gap-16">
                            <div className="w-24 h-12 flex items-center justify-center">
                                <div className="text-lg text-gray-400 font-bold">COMPANY</div>
                            </div>
                            <div className="w-24 h-12 flex items-center justify-center">
                                <div className="text-lg text-gray-400 font-bold">LOGO</div>
                            </div>
                            <div className="w-24 h-12 flex items-center justify-center">
                                <div className="text-lg text-gray-400 font-bold">BRAND</div>
                            </div>
                            <div className="w-24 h-12 flex items-center justify-center">
                                <div className="text-lg text-gray-400 font-bold">CORP</div>
                            </div>
                            <div className="w-24 h-12 flex items-center justify-center">
                                <div className="text-lg text-gray-400 font-bold">FIRM</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Image Showcase Section */}
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
                
                {/* CTA Section */}
                <section className="py-24 bg-[#2A7B9B]">
                    <div className="mx-auto max-w-6xl px-6 text-center">
                        <h2 className="text-3xl font-medium text-white mb-4">Ready to transform your product images?</h2>
                        <p className="text-xl text-white/80 mb-8">Start enhancing your visuals today</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="rounded-full bg-white text-[#2A7B9B] hover:bg-white/90">
                                Start Free Trial
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10">
                                See pricing
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}