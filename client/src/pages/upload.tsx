import React, { useState, useRef, useCallback } from 'react'
import { useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/hooks/useCredits'
import { useToast } from '@/hooks/use-toast'

export default function UploadPage() {
  const { user } = useAuth()
  const { data: userCredits } = useCredits()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  
  const [selectedTransformation, setSelectedTransformation] = useState('animation')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      setUploadedImage(data.imageUrl)
      
      toast({
        title: "Image uploaded successfully",
        description: "Ready to transform your image"
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }, [toast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar 
        freeCredits={userCredits?.freeCreditsUsed ? 0 : 1} 
        paidCredits={userCredits?.paidCredits || 0} 
      />
      
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Your Images
            </h1>
            <p className="text-xl text-gray-600">
              Upload an image and choose how you want to transform it
            </p>
          </div>

          {/* Transformation Type Selection */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white border border-gray-200 rounded-2xl p-2 shadow-lg max-w-2xl mx-auto">
              <button
                className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ${
                  selectedTransformation !== 'custom' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTransformation('animation')}
              >
                <div className={`text-2xl mb-1 ${selectedTransformation !== 'custom' ? 'animate-pulse' : ''}`}>
                  🖼️
                </div>
                <div className="text-sm font-semibold">Transform Image</div>
                <div className="text-xs opacity-80 text-center leading-tight">
                  Upload a photo and choose from preset styles
                </div>
              </button>
              <button
                className={`flex-1 px-8 py-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 min-w-0 ${
                  selectedTransformation === 'custom' 
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTransformation('custom')}
              >
                <div className={`text-2xl mb-1 ${selectedTransformation === 'custom' ? 'animate-pulse' : ''}`}>
                  ✨
                </div>
                <div className="text-sm font-semibold">Custom Prompt</div>
                <div className="text-xs opacity-80 text-center leading-tight">
                  Describe your own unique transformation
                </div>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <p className="text-green-600 font-medium">Image uploaded successfully!</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setUploadedImage(null)
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Upload a different image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl text-gray-400 mb-4">📁</div>
                  <div>
                    <p className="text-lg text-gray-600 mb-2">
                      {isUploading ? 'Uploading...' : 'Drag and drop your image here, or click to select'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG • Max 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Custom Prompt Section */}
          {selectedTransformation === 'custom' && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200 mb-8">
              <h3 className="text-xl font-semibold mb-4">Describe Your Transformation</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe how you want to transform your image..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32"
              />
            </div>
          )}

          {/* Action Buttons */}
          {uploadedImage && (
            <div className="text-center">
              <button
                onClick={() => {
                  if (selectedTransformation === 'custom' && !customPrompt.trim()) {
                    toast({
                      title: "Custom prompt required",
                      description: "Please describe your transformation",
                      variant: "destructive"
                    })
                    return
                  }
                  // Navigate to ideas page with the uploaded image
                  setLocation('/ideas')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {selectedTransformation === 'custom' ? 'Generate Custom Transformation' : 'Generate Ideas'}
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}