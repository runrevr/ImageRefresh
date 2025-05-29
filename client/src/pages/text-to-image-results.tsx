
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { RainbowButton } from '@/components/ui/rainbow-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Share2, Upload, ImageIcon, Check, Sparkles, Copy } from 'lucide-react'
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/text-to-image-results?jobId=${result?.jobId}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard.",
    })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={1} paidCredits={0} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your generated image...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar freeCredits={1} paidCredits={0} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Result not found'}</p>
            <Button onClick={() => setLocation('/text-to-image')}>
              Back to Text-to-Image
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar freeCredits={1} paidCredits={0} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Your Image is Ready!
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            <span className="font-semibold text-green-600">
              Successfully generated your image
            </span>
            <Sparkles className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Generated Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Generated Images ({result.imageUrls.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={imageUrl} 
                          alt={`Generated image ${index + 1}`} 
                          className="w-full h-auto object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                          Variation {index + 1}
                        </div>
                      </div>
                      
                      <RainbowButton 
                        onClick={() => handleDownload(imageUrl, index)}
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Variation {index + 1}
                      </RainbowButton>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/text-to-image')}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Details</CardTitle>
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
          </div>

          {/* Action Bar */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Check className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">
                Image generated successfully!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
