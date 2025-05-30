import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FixedProductImageLab from '../components/FixedProductImageLab';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Upload, Wand2, Download, Star, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import ComparisonSlider from "@/components/ComparisonSlider";
import shampooOriginal from "@/assets/shampoo-original.jpg";
import shampooEnhanced from "@/assets/shampoo space.png";

export default function ProductImageLabPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "E-commerce Owner",
      content: "This tool saved me tons of time and money! The AI enhancements made my product photos look professional without hiring a photographer.",
      rating: 5
    },
    {
      name: "Michael Chen", 
      role: "Marketing Director",
      content: "The prebuilt prompts were exactly what we needed for our product campaign. The quality is outstanding and our conversion rates improved significantly.",
      rating: 5
    },
    {
      name: "Jessica Rodriguez",
      role: "Small Business Owner", 
      content: "I was amazed by how easy it was to transform my basic product shots into magazine-quality images. Highly recommend!",
      rating: 5
    }
  ];

  const features = [
    {
      icon: "🎯",
      title: "Original product design",
      description: "Upload your product image and we'll enhance it"
    },
    {
      icon: "✨", 
      title: "AI enhancement & prompt design",
      description: "Our AI analyzes and improves your image automatically"
    },
    {
      icon: "📱",
      title: "Digital core & AI Cubit integration",
      description: "Advanced AI processing for professional results"
    },
    {
      icon: "🔧",
      title: "AI Cubit component guide",
      description: "Guided enhancement process with smart suggestions"
    },
    {
      icon: "🎨",
      title: "Original context guide",
      description: "Maintains your product's authentic look and feel"
    },
    {
      icon: "🚀",
      title: "Architectural context builder",
      description: "Creates compelling backgrounds and settings"
    },
    {
      icon: "⚡",
      title: "Next-Generation processing",
      description: "Lightning-fast results with cutting-edge AI"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar freeCredits={1} paidCredits={0} />

      <main className="pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Turn Any Product Photo Into a Sales Magnet
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload your product image, AI-enhanced enhancement ideas, download professional results. No design experience required.
            </p>
            <Link to="/upload-enhance">
              <Button size="lg" className="bg-gradient-to-r from-[#06B6D4] via-[#84CC16] to-[#F97316] text-white hover:scale-105 transition-transform duration-200 border-0 px-8 py-4 text-lg">
                Transform Your Product Photos Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>

            {/* Before/After Slider */}
            <div className="mt-24 max-w-6xl mx-auto">
              <ComparisonSlider
                beforeImage={shampooOriginal}
                afterImage={shampooEnhanced}
              />
            </div>
          </div>
        </div>

        {/* Main Product Lab Component */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <FixedProductImageLab />
        </div>

        {/* See the AI Magic in Action */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                See the AI Magic in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                See examples from small business owners who've transformed their product photos with our AI enhancement tools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* AI Enhancement Card */}
              <Card className="text-center flex flex-col h-full p-8">
                <CardHeader className="flex-grow pb-8">
                  <div className="mx-auto w-20 h-20 bg-[#06B6D4] rounded-full flex items-center justify-center mb-6">
                    <Wand2 className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">AI Enhancement</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Upload your product image, our smart AI analyzes the image and suggest multiple enhancement ideas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Link to="/upload-enhance">
                    <Button className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white border-0 py-3 text-base">
                      Upload Photos
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Prebuilt Prompts Card */}
              <Card className="text-center flex flex-col h-full p-8">
                <CardHeader className="flex-grow pb-8">
                  <div className="mx-auto w-20 h-20 bg-[#84CC16] rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">Prebuilt Prompts</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Use our expert-designed prompts to quickly transform your product's history. Choose from lifestyle, minimalist, luxury and more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Link to="/prebuilt-prompts">
                    <Button className="w-full bg-[#84CC16] hover:bg-[#65A30D] text-white border-0 py-3 text-base">
                      Explore Prompts
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Text-to-Image Card */}
              <Card className="text-center flex flex-col h-full p-8">
                <CardHeader className="flex-grow pb-8">
                  <div className="mx-auto w-20 h-20 bg-[#F97316] rounded-full flex items-center justify-center mb-6">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-4">Text-to-Image</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Create what you want in detail, and our AI will bring it to life with you text descriptions. Perfect for concept designs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Link to="/upload">
                    <Button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white border-0 py-3 text-base">
                      Create Variations
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-[#06B6D4] text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4">Upload</h3>
                <p className="text-gray-600 leading-relaxed">
                  Upload your product image from your device or drag and drop directly into our tool.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-[#84CC16] text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4">Transform</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose from dozens of professional enhancement styles or let our AI suggest the best options.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-[#F97316] text-white rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4">Download</h3>
                <p className="text-gray-600 leading-relaxed">
                  Download your enhanced product images in high resolution, ready for your website or marketing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#1F2937] mb-6">
                What Our Customers Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-center border-[#E5E7EB] p-8">
                  <CardHeader className="pb-6">
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-6 w-6 text-[#F97316] fill-current mx-1" />
                      ))}
                    </div>
                    <CardDescription className="text-lg italic leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="font-semibold text-base mb-2">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-[#06B6D4] py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">
              Ready to Transform Your Product Photos?
            </h2>
            <p className="text-xl text-white/80 mb-12 leading-relaxed">
              Join thousands of businesses creating stunning product images with AI
            </p>
            <Link to="/product-image-lab">
              <Button size="lg" variant="secondary" className="bg-white text-[#06B6D4] hover:bg-[#E5E7EB] px-8 py-4 text-lg">
                Start Creating Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}