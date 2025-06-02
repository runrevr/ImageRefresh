
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Layout } from '../components/Layout'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Share2, Upload, ImageIcon, Check, Sparkles, Copy, RefreshCw, Edit, ZoomIn } from 'lucide-react'
import { downloadImage } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface TextToImageResult {
  jobId: string
  imageUrls: string[]
  metadata: {
    prompt: string
    variations?: any[]
    purpose?: string
    industry?: string
    aspectRatio?: string
    styleIntensity?: string
    addText?: boolean
    businessName?: string
  }
}

export default function TextToImageResults() {
  const [, setLocation] = useLocation()
  const [result, setResult] = useState<TextToImageResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [fullViewImage, setFullViewImage] = useState<string | null>(null)
  const { toast } = useToast()

  // Get jobId from URL params
  const urlParams = new URLSearchParams(window.location.search)
  const jobId = urlParams.get('jobId')

  useEffect(() => {
    const loadResult = () => {
      if (!jobId) {
        setError('No job ID provided')
        setLoading(false)
        return
      }

      // Get data from URL parameters or localStorage
      const urlParams = new URLSearchParams(window.location.search)
      const imageUrl1 = urlParams.get('imageUrl1')
      const imageUrl2 = urlParams.get('imageUrl2')
      const imageUrl = urlParams.get('imageUrl') // Fallback for single image
      const imageUrls = urlParams.get('imageUrls') // New parameter for multiple URLs
      const prompt = urlParams.get('prompt')
      const purpose = urlParams.get('purpose')
      const industry = urlParams.get('industry')
      const aspectRatio = urlParams.get('aspectRatio')

      // Handle multiple images with priority for new imageUrls parameter
      let finalImageUrls = []
      
      if (imageUrls) {
        // Parse the imageUrls if it's a JSON string
        try {
          finalImageUrls = JSON.parse(decodeURIComponent(imageUrls))
        } catch (e) {
          // If parsing fails, treat as single URL
          finalImageUrls = [decodeURIComponent(imageUrls)]
        }
      } else {
        // Fallback to individual URL parameters
        if (imageUrl1) finalImageUrls.push(decodeURIComponent(imageUrl1))
        if (imageUrl2) finalImageUrls.push(decodeURIComponent(imageUrl2))
        if (finalImageUrls.length === 0 && imageUrl) finalImageUrls.push(decodeURIComponent(imageUrl))
      }

      if (finalImageUrls.length > 0 && prompt) {
        const result: TextToImageResult = {
          jobId,
          imageUrls: finalImageUrls,
          metadata: {
            prompt: decodeURIComponent(prompt),
            purpose: purpose ? decodeURIComponent(purpose) : undefined,
            industry: industry ? decodeURIComponent(industry) : undefined,
            aspectRatio: aspectRatio ? decodeURIComponent(aspectRatio) : undefined,
            styleIntensity: urlParams.get('styleIntensity') || undefined,
            addText: urlParams.get('addText') === 'true',
            businessName: urlParams.get('businessName') || undefined
          }
        }
        setResult(result)
        setSelectedImage(finalImageUrls[0])
      } else {
        setError('Result data not found')
      }
      
      setLoading(false)
    }

    loadResult()
  }, [jobId])

  const handleDownload = (imageUrl: string, index: number = 0) => {
    if (result) {
      downloadImage(imageUrl, `generated-image-${result.jobId}-${index + 1}.png`)
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      })
    }
  }

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my generated image!',
          url: imageUrl
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: "Link Copied!",
          description: "Image link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share image. Please try again.",
        variant: "destructive"
      });
    }
  }

  const copyPrompt = () => {
    if (result?.metadata.prompt) {
      navigator.clipboard.writeText(result.metadata.prompt)
      toast({
        title: "Prompt Copied",
        description: "Prompt copied to clipboard.",
      })
    }
  }

  // Icon button component
  const IconButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    disabled = false,
    loading = false 
  }: { 
    icon: any, 
    label: string, 
    onClick: () => void, 
    disabled?: boolean,
    loading?: boolean 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="group flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={label}
    >
      <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
      <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors mt-1">
        {label}
      </span>
    </button>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your generated image...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Result not found'}</p>
            <Button onClick={() => setLocation('/text-to-image')}>
              Back to Text-to-Image
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Full view modal */}
      {fullViewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setFullViewImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setFullViewImage(null)}
            className="absolute top-4 right-4 z-60 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-2 transition-all"
            aria-label="Close full view"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="max-w-full max-h-full p-4">
            <img 
              src={fullViewImage} 
              alt="Full view" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-primary">
            Your Images are Ready!
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-green-600">
              Successfully generated your images
            </span>
            <Sparkles className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Image Grid */}
          <div className="mb-8">
            <div className={`grid gap-6 ${result.imageUrls.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
              {result.imageUrls.map((imageUrl, index) => (
                <div key={index} className="space-y-4">
                  <div 
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${selectedImage === imageUrl ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(imageUrl)}
                  >
                    <div className="aspect-square relative">
                      <img 
                        src={imageUrl} 
                        alt={`Generated image option ${index + 1}`} 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.error('Error loading generated image:', imageUrl);
                        }}
                      />
                      {selectedImage === imageUrl && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
                      <p className="text-sm font-medium">Variation {index + 1}</p>
                    </div>
                  </div>
                  
                  {/* Icon buttons for each image */}
                  <div className="flex justify-center space-x-1">
                    <IconButton 
                      icon={Download} 
                      label="Download" 
                      onClick={() => handleDownload(imageUrl, index)} 
                    />
                    <IconButton 
                      icon={Share2} 
                      label="Share" 
                      onClick={() => handleShare(imageUrl)} 
                    />
                    <IconButton 
                      icon={ZoomIn} 
                      label="View Full" 
                      onClick={() => setFullViewImage(imageUrl)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Generation Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-tertiary">Generation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="font-medium text-sm text-gray-700">Prompt:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-900">{result.metadata.prompt}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={copyPrompt}
                      className="mt-2 h-8 px-2 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy Prompt
                    </Button>
                  </div>
                </div>

                {result.metadata.purpose && (
                  <div>
                    <label className="font-medium text-sm text-gray-700">Purpose:</label>
                    <p className="text-sm text-gray-600 mt-1">{result.metadata.purpose}</p>
                  </div>
                )}

                {result.metadata.industry && (
                  <div>
                    <label className="font-medium text-sm text-gray-700">Industry:</label>
                    <p className="text-sm text-gray-600 mt-1">{result.metadata.industry}</p>
                  </div>
                )}

                {result.metadata.aspectRatio && (
                  <div>
                    <label className="font-medium text-sm text-gray-700">Aspect Ratio:</label>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{result.metadata.aspectRatio}</p>
                  </div>
                )}

                <div>
                  <label className="font-medium text-sm text-gray-700">Job ID:</label>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{result.jobId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-tertiary">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RainbowButton 
                  onClick={() => handleDownload(selectedImage)}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected Image
                </RainbowButton>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleShare(selectedImage)}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Selected Image
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/text-to-image')}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Create Another Image
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">
                Images generated successfully!
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
