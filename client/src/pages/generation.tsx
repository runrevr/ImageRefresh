
import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Plus, Sparkles } from "lucide-react";

export default function Generation() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Creation Method
            </h1>
            <p className="text-xl text-gray-600">
              Transform existing images or create entirely new ones from your imagination
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Transform Image Card */}
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#06B6D4]">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Transform Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600 text-lg">
                    Upload a photo and choose from preset styles
                  </p>
                  <p className="text-sm text-gray-500">
                    Perfect for quick transformations with proven styles like cartoon, product photography, and more
                  </p>
                  <Link href="/">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 text-lg">
                      Start Transforming
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Custom Prompt Card */}
              <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-[#FF6B35]">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Custom Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600 text-lg">
                    Describe your own unique transformation
                  </p>
                  <p className="text-sm text-gray-500">
                    Have a specific vision? Describe exactly what you want and let AI bring it to life
                  </p>
                  <Link href="/custom-generation">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 text-lg">
                      Create Custom
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Text to Image Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Create From Your Imagination
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Describe what you want to create and let AI bring it to life
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-700 text-lg mb-4">
                    "A majestic dragon flying over a crystal city at sunset, photorealistic style, 8k quality..."
                  </p>
                  <p className="text-sm text-gray-500">
                    Be specific about subjects, actions, settings, and style for best results
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  🤖 Cyberpunk Cat
                </span>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  💡 Fantasy Scene
                </span>
                <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full text-sm font-medium">
                  🚀 Space Adventure
                </span>
              </div>

              <div className="text-center">
                <Link href="/text-to-image">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 text-lg">
                    Start Creating
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
