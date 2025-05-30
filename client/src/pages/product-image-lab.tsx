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

      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Turn Any Product Photo Into a Sales Magnet
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Upload your product image, AI-enhanced enhancement ideas, download professional results. No design experience required.
            </p>
            <Link to="/upload-enhance">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                Transform Your Product Photos Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {feature.icon} {feature.title}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Product Lab Component */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <FixedProductImageLab />
        </div>

        {/* See the AI Magic in Action */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                See the AI Magic in Action
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                See examples from small business owners who've transformed their product photos with our AI enhancement tools.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* AI Enhancement Card */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-[#06B6D4] rounded-full flex items-center justify-center mb-4">
                    <Wand2 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>AI Enhancement</CardTitle>
                  <CardDescription>
                    Upload your product image, our smart AI analyzes the image and suggest multiple enhancement ideas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/upload-enhance">
                    <Button className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white border-0">
                      Upload Photos
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Prebuilt Prompts Card */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-[#84CC16] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>Prebuilt Prompts</CardTitle>
                  <CardDescription>
                    Use our expert-designed prompts to quickly transform your product's history. Choose from lifestyle, minimalist, luxury and more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/prebuilt-prompts">
                    <Button className="w-full bg-[#84CC16] hover:bg-[#65A30D] text-white border-0">
                      Explore Prompts
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Text-to-Image Card */}
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-[#F97316] rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle>Text-to-Image</CardTitle>
                  <CardDescription>
                    Create what you want in detail, and our AI will bring it to life with you text descriptions. Perfect for concept designs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/upload">
                    <Button className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white border-0">
                      Create Variations
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#06B6D4] text-white rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload</h3>
                <p className="text-gray-600">
                  Upload your product image from your device or drag and drop directly into our tool.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#84CC16] text-white rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Transform</h3>
                <p className="text-gray-600">
                  Choose from dozens of professional enhancement styles or let our AI suggest the best options.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-[#F97316] text-white rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Download</h3>
                <p className="text-gray-600">
                  Download your enhanced product images in high resolution, ready for your website or marketing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-16 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#1F2937] mb-4">
                What Our Customers Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="text-center border-[#E5E7EB]">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-[#F97316] fill-current" />
                      ))}
                    </div>
                    <CardDescription className="text-lg italic">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-[#06B6D4] py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Product Photos?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of businesses creating stunning product images with AI
            </p>
            <Link to="/product-image-lab">
              <Button size="lg" variant="secondary" className="bg-white text-[#06B6D4] hover:bg-[#E5E7EB]">
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}