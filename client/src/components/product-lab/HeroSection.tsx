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

                                {/* See What's Possible section */}
                                <div className="mt-32">
                                    <div className="text-center mb-12">
                                        <h2 className="text-2xl md:text-3xl font-semibold text-[#333333] mb-4">See What's Possible</h2>
                                        <p className="text-lg text-[#333333]/70 max-w-2xl mx-auto">Discover how our AI transforms ordinary product photos into stunning, professional-quality images</p>
                                    </div>
                                    
                                    <div 
                                        aria-hidden
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                        
                                        {/* Card 1: Upload for Enhancement */}
                                        <div className="group bg-white rounded-xl border border-gray-200 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-102 cursor-pointer overflow-hidden">
                                            <div className="flex flex-col space-y-5 h-full">
                                                {/* Category Label */}
                                                <div className="inline-flex items-center justify-center">
                                                    <span className="px-3 py-1 text-xs font-medium bg-[#2A7B9B]/10 text-[#2A7B9B] rounded-full">
                                                        PRODUCT ENHANCEMENT
                                                    </span>
                                                </div>
                                                
                                                {/* Card Header with Icon */}
                                                <div className="flex items-center justify-center">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10 group-hover:bg-[#2A7B9B]/20 transition-colors duration-300">
                                                        <div className="relative">
                                                            <Upload className="size-8 text-[#2A7B9B] group-hover:scale-110 transition-transform duration-300" />
                                                            <Sparkles className="absolute -right-2 -top-2 size-4 text-[#FF7B54] group-hover:animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Heading and Description */}
                                                <div className="text-center flex-grow">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Enhancement</h3>
                                                    <p className="text-[#333333]/70 text-sm leading-relaxed">Transform basic product shots into professional commercial photography with ideal lighting and composition</p>
                                                </div>
                                                
                                                {/* Interactive Before/After Example */}
                                                <div className="relative mt-6 rounded-xl bg-gray-50 p-4 shadow-inner">
                                                    <div className="relative h-32 rounded-lg overflow-hidden bg-white shadow-sm">
                                                        {/* Before Image */}
                                                        <img 
                                                            src="/src/assets/mexican-food-original.png" 
                                                            alt="Before enhancement" 
                                                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                                                        />
                                                        {/* After Image */}
                                                        <img 
                                                            src="/src/assets/mexican-food-enhanced.png" 
                                                            alt="After enhancement" 
                                                            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                        />
                                                        
                                                        {/* Hover Instructions */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                            <div className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                                                <span className="hidden md:block">Hover to see magic ✨</span>
                                                                <span className="md:hidden">Tap to see magic ✨</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Before/After Labels */}
                                                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <span className="text-xs font-medium bg-white/90 text-gray-800 px-2 py-1 rounded">After</span>
                                                        </div>
                                                        <div className="absolute top-2 left-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                                            <span className="text-xs font-medium bg-white/90 text-gray-800 px-2 py-1 rounded">Before</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Enhanced CTA Button */}
                                                <div className="mt-auto pt-4">
                                                    <Button className="w-full bg-white border-2 border-[#2A7B9B] text-[#2A7B9B] hover:bg-[#2A7B9B] hover:text-white transition-all duration-300 group-hover:shadow-lg font-medium">
                                                        <span>Try This Style</span>
                                                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 2: Prebuilt Prompts */}
                                        <div className="group bg-white rounded-xl border border-gray-200 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-102 cursor-pointer overflow-hidden">
                                            <div className="flex flex-col space-y-5 h-full">
                                                {/* Category Label */}
                                                <div className="inline-flex items-center justify-center">
                                                    <span className="px-3 py-1 text-xs font-medium bg-[#FF7B54]/10 text-[#FF7B54] rounded-full">
                                                        QUICK TOOLS
                                                    </span>
                                                </div>
                                                
                                                {/* Card Header with Icon */}
                                                <div className="flex items-center justify-center">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10 group-hover:bg-[#2A7B9B]/20 transition-colors duration-300">
                                                        <PanelTop className="size-8 text-[#2A7B9B] group-hover:scale-110 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                                
                                                {/* Heading and Description */}
                                                <div className="text-center flex-grow">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">One-Click Fixes</h3>
                                                    <p className="text-[#333333]/70 text-sm leading-relaxed">Apply professional edits instantly with our curated collection of enhancement presets</p>
                                                </div>
                                                
                                                {/* Interactive Tools Preview */}
                                                <div className="relative mt-6 rounded-xl bg-gray-50 p-4 shadow-inner">
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <div className="group/tool rounded-lg bg-white p-3 text-center shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                                            <div className="h-10 rounded bg-[#FF7B54]/10 flex items-center justify-center mb-2 group-hover/tool:bg-[#FF7B54]/20 transition-colors">
                                                                <span className="text-xs font-medium text-[#FF7B54]">Remove BG</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/tool rounded-lg bg-white p-3 text-center shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                                            <div className="h-10 rounded bg-[#2A7B9B]/10 flex items-center justify-center mb-2 group-hover/tool:bg-[#2A7B9B]/20 transition-colors">
                                                                <span className="text-xs font-medium text-[#2A7B9B]">Lighting</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/tool rounded-lg bg-white p-3 text-center shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                                                            <div className="h-10 rounded bg-[#A3E4D7]/20 flex items-center justify-center mb-2 group-hover/tool:bg-[#A3E4D7]/30 transition-colors">
                                                                <span className="text-xs font-medium text-[#2A7B9B]">Shadows</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Hover instruction */}
                                                    <div className="text-center mt-3 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                                        <span className="text-xs text-gray-600">
                                                            <span className="hidden md:inline">Hover tools above</span>
                                                            <span className="md:hidden">Tap tools above</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Enhanced CTA Button */}
                                                <div className="mt-auto pt-4">
                                                    <Button className="w-full bg-white border-2 border-[#FF7B54] text-[#FF7B54] hover:bg-[#FF7B54] hover:text-white transition-all duration-300 group-hover:shadow-lg font-medium">
                                                        <span>Explore Tools</span>
                                                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card 3: Creative Variations */}
                                        <div className="group bg-white rounded-xl border border-gray-200 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-102 cursor-pointer overflow-hidden">
                                            <div className="flex flex-col space-y-5 h-full">
                                                {/* Category Label */}
                                                <div className="inline-flex items-center justify-center">
                                                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                        CREATIVE VARIATIONS
                                                    </span>
                                                </div>
                                                
                                                {/* Card Header with Icon */}
                                                <div className="flex items-center justify-center">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#2A7B9B]/10 group-hover:bg-[#2A7B9B]/20 transition-colors duration-300">
                                                        <div className="relative">
                                                            <Image className="size-8 text-[#2A7B9B] group-hover:scale-110 transition-transform duration-300" />
                                                            <Wand2 className="absolute -right-3 -top-2 size-4 text-[#FF7B54] group-hover:animate-pulse" />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Heading and Description */}
                                                <div className="text-center flex-grow">
                                                    <h3 className="text-xl font-semibold text-[#333333] mb-3">Style Variations</h3>
                                                    <p className="text-[#333333]/70 text-sm leading-relaxed">Generate multiple creative versions of your product in different colors, styles, and contexts</p>
                                                </div>
                                                
                                                {/* Interactive Color Variations */}
                                                <div className="relative mt-6 rounded-xl bg-gray-50 p-4 shadow-inner">
                                                    <div className="flex flex-wrap justify-center gap-3">
                                                        <div className="group/color relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-md transition-all duration-200 group-hover/color:scale-110 group-hover/color:shadow-lg cursor-pointer"></div>
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">Crimson</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/color relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md transition-all duration-200 group-hover/color:scale-110 group-hover/color:shadow-lg cursor-pointer"></div>
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">Ocean</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/color relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-md transition-all duration-200 group-hover/color:scale-110 group-hover/color:shadow-lg cursor-pointer"></div>
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">Forest</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/color relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md transition-all duration-200 group-hover/color:scale-110 group-hover/color:shadow-lg cursor-pointer"></div>
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">Sunset</span>
                                                            </div>
                                                        </div>
                                                        <div className="group/color relative">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-md transition-all duration-200 group-hover/color:scale-110 group-hover/color:shadow-lg cursor-pointer"></div>
                                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/color:opacity-100 transition-opacity">
                                                                <span className="text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">Royal</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Hover instruction */}
                                                    <div className="text-center mt-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                                                        <span className="text-xs text-gray-600">
                                                            <span className="hidden md:inline">Hover colors to see names</span>
                                                            <span className="md:hidden">Tap colors to see names</span>
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Enhanced CTA Button */}
                                                <div className="mt-auto pt-4">
                                                    <Button className="w-full bg-white border-2 border-purple-500 text-purple-700 hover:bg-purple-500 hover:text-white transition-all duration-300 group-hover:shadow-lg font-medium">
                                                        <span>Create Variations</span>
                                                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                                    </Button>
                                                </div>
                                            </div>
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