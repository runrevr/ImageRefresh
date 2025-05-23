import React, { useState, useRef } from 'react'
import { Link, useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Image, Info, X, Sparkles, CheckCircle } from 'lucide-react'

export default function UploadEnhanceV2Page() {
  const [, setLocation] = useLocation()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [productType, setProductType] = useState('')
  const [brandDescription, setBrandDescription] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const industryPills = [
    'Fashion & Apparel', 'Beauty & Cosmetics', 'Electronics', 'Home & Garden',
    'Food & Beverage', 'Sports & Fitness', 'Jewelry & Accessories', 'Automotive',
    'Health & Wellness', 'Arts & Crafts', 'Pet Supplies', 'Books & Media'
  ]

  const maxFiles = 5
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

  const toggleIndustryPill = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => acceptedTypes.includes(file.type))
    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles)
    setSelectedFiles(newFiles)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const canSubmit = selectedFiles.length > 0 && selectedIndustries.length > 0 && brandDescription.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    console.log('Submitting:', { selectedFiles, selectedIndustries, productType, brandDescription })
    setLocation('/select-ideas')
  }

  return (
    <>
      <style>{`
        :root {
          --primary: #0D7877;
          --secondary: #3DA5D9;
          --accent: #C1F50A;
          --neutral: #333333;
          --light: #F2F4F6;
        }
        
        .brand-bg-primary { background-color: var(--primary); }
        .brand-bg-secondary { background-color: var(--secondary); }
        .brand-bg-accent { background-color: var(--accent); }
        .brand-bg-light { background-color: var(--light); }
        
        .brand-text-primary { color: var(--primary); }
        .brand-text-secondary { color: var(--secondary); }
        .brand-text-neutral { color: var(--neutral); }
        
        .brand-border-primary { border-color: var(--primary); }
        .brand-border-secondary { border-color: var(--secondary); }
        
        .brand-button-primary {
          background-color: var(--primary);
          color: white;
        }
        .brand-button-primary:hover {
          background-color: #0a5d5f;
        }
        
        .brand-font-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .brand-font-body {
          font-family: 'Montserrat', sans-serif;
        }
        
        .upload-zone {
          transition: all 0.3s ease;
          border: 2px dashed #d1d5db;
        }
        
        .upload-zone:hover,
        .upload-zone.drag-over {
          border-color: var(--primary);
          background-color: rgba(13, 120, 119, 0.05);
        }
        
        .panel-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="min-h-screen bg-white">
        <Navbar freeCredits={1} paidCredits={0} />
        
        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Step 1: Upload (Select Images) */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full brand-bg-primary text-white text-sm font-semibold">
                  1
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium brand-text-primary brand-font-body">Upload</span>
                  <span className="ml-1 text-xs text-gray-500 brand-font-body hidden sm:inline">(Select Images)</span>
                </div>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              
              {/* Step 2: Details (Product Info) */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
                  2
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-500 brand-font-body">Details</span>
                  <span className="ml-1 text-xs text-gray-500 brand-font-body hidden sm:inline">(Product Info)</span>
                </div>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              
              {/* Step 3: Enhance (AI Processing) */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
                  3
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-500 brand-font-body">Enhance</span>
                  <span className="ml-1 text-xs text-gray-500 brand-font-body hidden sm:inline">(AI Processing)</span>
                </div>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              
              {/* Step 4: Download (Get Results) */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-semibold">
                  4
                </div>
                <div className="ml-2">
                  <span className="text-sm font-medium text-gray-500 brand-font-body">Download</span>
                  <span className="ml-1 text-xs text-gray-500 brand-font-body hidden sm:inline">(Get Results)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Split-Screen Layout */}
        <div className="flex min-h-screen">
          {/* Left Panel - Product Information (40%) */}
          <div className="w-2/5 bg-gray-50 panel-shadow">
            <div className="p-8 h-full overflow-y-auto">
              <div className="max-w-md mx-auto">
                {/* Left Panel Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg brand-bg-primary flex items-center justify-center">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold brand-text-neutral brand-font-heading">
                      Product Information
                    </h2>
                  </div>
                  <p className="text-gray-600 brand-font-body">
                    Help us understand your brand and products for better AI enhancement
                  </p>
                </div>

                {/* Select Your Industries */}
                <div className="mb-6">
                  <Label className="text-base font-semibold brand-text-neutral brand-font-heading mb-3 block">
                    Select Your Industries
                  </Label>
                  <p className="text-sm text-gray-600 brand-font-body mb-4">
                    Choose one or more industries that best describe your business
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {industryPills.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleIndustryPill(industry)}
                        className={`px-3 py-2 rounded-full text-sm font-medium brand-font-body transition-all duration-200 ${
                          selectedIndustries.includes(industry)
                            ? 'brand-bg-primary text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Type */}
                <div className="mb-6">
                  <Label htmlFor="productType" className="text-base font-semibold brand-text-neutral brand-font-heading mb-3 block">
                    Product Type
                  </Label>
                  <Input
                    id="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="e.g., Handmade jewelry, Organic skincare, Tech accessories..."
                    className="brand-font-body"
                  />
                </div>

                {/* Business Description */}
                <div className="mb-8">
                  <Label htmlFor="brandDescription" className="text-base font-semibold brand-text-neutral brand-font-heading mb-3 block">
                    Business Description
                  </Label>
                  <Textarea
                    id="brandDescription"
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    placeholder="Tell us about your brand, target audience, and style preferences..."
                    rows={4}
                    className="brand-font-body resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`w-full py-3 brand-font-body font-semibold transition-all duration-200 ${
                    canSubmit 
                      ? 'brand-button-primary' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canSubmit ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start AI Enhancement
                    </>
                  ) : (
                    'Complete all fields to continue'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Upload Area (60%) */}
          <div className="w-3/5 bg-white">
            <div className="p-8 h-full">
              {/* Right Panel Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg brand-bg-secondary flex items-center justify-center">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold brand-text-neutral brand-font-heading">
                    Upload Images
                  </h2>
                </div>
                <p className="text-gray-600 brand-font-body">
                  Select up to {maxFiles} high-quality product images (JPEG, PNG, WebP)
                </p>
              </div>

              {/* Upload Area */}
              <div
                className={`upload-zone rounded-lg p-8 text-center mb-6 cursor-pointer ${
                  isDragOver ? 'drag-over' : ''
                } ${selectedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => selectedFiles.length < maxFiles && fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold brand-text-neutral brand-font-heading mb-2">
                    Drop images here or click to browse
                  </h3>
                  <p className="text-gray-500 brand-font-body mb-4">
                    {selectedFiles.length}/{maxFiles} images selected
                  </p>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="brand-button-primary border-none brand-font-body"
                    disabled={selectedFiles.length >= maxFiles}
                  >
                    Choose Files
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInput}
                className="hidden"
              />

              {/* Image Previews */}
              {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <Card key={index} className="relative group">
                      <CardContent className="p-2">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate brand-font-body">
                          {file.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Progress Indicators */}
              <div className="mt-8">
                <div className="flex items-center gap-4 text-sm brand-font-body">
                  <div className="flex items-center gap-2">
                    {selectedFiles.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={selectedFiles.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                      Images uploaded
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedIndustries.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={selectedIndustries.length > 0 ? 'text-green-600' : 'text-gray-500'}>
                      Industry selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {brandDescription.trim() ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={brandDescription.trim() ? 'text-green-600' : 'text-gray-500'}>
                      Description added
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}