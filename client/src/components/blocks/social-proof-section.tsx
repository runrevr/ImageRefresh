'use client'
import React from 'react'

export function SocialProofSection() {
    return (
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
    )
}