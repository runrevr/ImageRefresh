'use client'
import React from 'react'
import { Mail, SendHorizonal, Upload, Sparkles, PanelTop, Image, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { Link } from 'wouter'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

// Import images
import mexicanFoodOriginal from '../../assets/mexican-food-original.png'
import mexicanFoodEnhanced from '../../assets/mexican-food-enhanced.png'

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

interface HeroSectionProps {
  onExplorePrompts?: () => void;
}

export function HeroSection({ onExplorePrompts }: HeroSectionProps = {}) {
    return (
        <>
            <section>
                <div className="relative mx-auto max-w-6xl px-6 pt-16 lg:pb-16 lg:pt-24">
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
                            <h1 className="text-balance text-4xl font-medium sm:text-5xl md:text-6xl text-[#333333]">
                                Transform your product photos
                            </h1>

                            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-[#333333]/80">
                                Professional-quality product images in minutes, no design skills needed. Perfect for small business owners and entrepreneurs.
                            </p>

                            <form action="" className="mt-12 mx-auto max-w-sm">
                                <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-[1rem] border shadow shadow-zinc-950/5 has-[input:focus]:ring-2 lg:pr-0">
                                    <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                                    <input
                                        placeholder="Your mail address"
                                        className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                                        type="email"
                                    />

                                    <div className="md:pr-1.5 lg:pr-0">
                                        <RainbowButton aria-label="submit">
                                            <span className="hidden md:block">Get Started</span>
                                            <SendHorizonal
                                                className="relative mx-auto size-5 md:hidden"
                                                strokeWidth={2}
                                            />
                                        </RainbowButton>
                                    </div>
                                </div>
                            </form>

                            {/* Three horizontal cards section */}
                            <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">

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
                                            <h3 className="text-xl font-semibold text-black">Enhance your product photos</h3>
                                            <p className="mt-2 text-[#333333]/80">Upload up to 5 images and our AI will suggest professional improvements</p>
                                        </div>

                                        {/* Example Before/After */}
                                        <div className="mt-4 rounded-lg bg-white p-3 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="overflow-hidden rounded-md">
                                                    <img 
                                                        src={mexicanFoodOriginal} 
                                                        alt="Before enhancement" 
                                                        className="h-24 w-full object-cover"
                                                    />
                                                </div>
                                                <div className="overflow-hidden rounded-md">
                                                    <img 
                                                        src={mexicanFoodEnhanced} 
                                                        alt="After enhancement" 
                                                        className="h-24 w-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA Button */}
                                        <Link href="/upload">
                                            <RainbowButton className="mt-4 w-full">
                                                Upload Photos
                                            </RainbowButton>
                                        </Link>
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
                                            <p className="mt-2 text-[#333333]/80">Use our expert-designed prompts to quickly transform your images. Choose from things like background removal, enhanced lighting, real world uses, etc</p>
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
                                        <Link href="/prebuilt-prompts">
                                            <RainbowButton className="mt-4 w-full">
                                                Explore Prebuilt Tools
                                            </RainbowButton>
                                        </Link>
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
                                        <RainbowButton 
                                            className="mt-4 w-full"
                                            onClick={() => window.location.href = '/text-to-image.html'}
                                        >
                                            Create Variations
                                        </RainbowButton>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-[#F2F2F2] py-16">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-semibold text-[#333333]">How It Works</h2>
                        <p className="mt-3 text-[#333333]/80 max-w-2xl mx-auto">
                            A simple three-step process to transform your product photos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="bg-white rounded-xl p-6 text-center relative z-10 h-full shadow-md">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#2A7B9B] text-white flex items-center justify-center font-bold text-lg">1</div>
                                <div className="mt-6 mb-4">
                                    <Upload className="size-10 mx-auto text-[#2A7B9B]" />
                                </div>
                                <h3 className="text-xl font-medium text-[#333333] mb-2">Upload</h3>
                                <p className="text-[#333333]/80">Upload your product photos or describe what you want to create</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="bg-white rounded-xl p-6 text-center relative z-10 h-full shadow-md">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#2A7B9B] text-white flex items-center justify-center font-bold text-lg">2</div>
                                <div className="mt-6 mb-4">
                                    <Wand2 className="size-10 mx-auto text-[#2A7B9B]" />
                                </div>
                                <h3 className="text-xl font-medium text-[#333333] mb-2">Enhance</h3>
                                <p className="text-[#333333]/80">Our AI analyzes and enhances your images with professional quality</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                            <div className="bg-white rounded-xl p-6 text-center relative z-10 h-full shadow-md">
                                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#2A7B9B] text-white flex items-center justify-center font-bold text-lg">3</div>
                                <div className="mt-6 mb-4">
                                    <svg 
                                        className="size-10 mx-auto text-[#2A7B9B]"
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-[#333333] mb-2">Download</h3>
                                <p className="text-[#333333]/80">Get your improved product images ready for your website or marketing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}