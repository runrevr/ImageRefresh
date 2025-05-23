import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  Star, 
  StarOff, 
  Share2, 
  Grid3X3, 
  ScanLine, 
  List, 
  ZoomIn, 
  RefreshCw,
  Mail,
  Check,
  Sparkles,
  Upload,
  Save,
  Eye,
  Copy,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react'

interface EnhancedResult {
  id: string
  originalImageUrl: string
  enhancedImageUrl: string
  enhancementTitle: string
  enhancementDescription: string
  fileSize: string
  dimensions: string
  generatedAt: string
  isFavorite: boolean
}

export default function ResultsPage() {
  const [, setLocation] = useLocation()
  const [results, setResults] = useState<EnhancedResult[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'compare' | 'list'>('grid')
  const [selectedFormat, setSelectedFormat] = useState<'PNG' | 'JPG'>('PNG')
  const [selectedResolution, setSelectedResolution] = useState<'original' | 'hd' | '4k'>('original')
  const [emailAddress, setEmailAddress] = useState('')
  const [showCelebration, setShowCelebration] = useState(true)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [isBeforeView, setIsBeforeView] = useState<{ [key: string]: boolean }>({})

  // Mock data for development
  useEffect(() => {
    const mockResults: EnhancedResult[] = [
      {
        id: 'result-1',
        originalImageUrl: '/api/placeholder/400/400',
        enhancedImageUrl: '/api/placeholder/400/400',
        enhancementTitle: 'Professional Studio Lighting',
        enhancementDescription: 'Added dramatic studio lighting with soft shadows for a premium look',
        fileSize: '2.3 MB',
        dimensions: '1024×1024',
        generatedAt: new Date().toLocaleString(),
        isFavorite: false
      },
      {
        id: 'result-2',
        originalImageUrl: '/api/placeholder/400/400',
        enhancedImageUrl: '/api/placeholder/400/400',
        enhancementTitle: 'Lifestyle Background Scene',
        enhancementDescription: 'Placed product in realistic lifestyle setting showing daily use',
        fileSize: '2.7 MB',
        dimensions: '1024×1024',
        generatedAt: new Date().toLocaleString(),
        isFavorite: true
      },
      {
        id: 'result-3',
        originalImageUrl: '/api/placeholder/400/400',
        enhancedImageUrl: '/api/placeholder/400/400',
        enhancementTitle: 'Premium Packaging Display',
        enhancementDescription: 'Created unboxing scene with premium packaging presentation',
        fileSize: '2.1 MB',
        dimensions: '1024×1024',
        generatedAt: new Date().toLocaleString(),
        isFavorite: false
      },
      {
        id: 'result-4',
        originalImageUrl: '/api/placeholder/400/400',
        enhancedImageUrl: '/api/placeholder/400/400',
        enhancementTitle: 'Clean White Background',
        enhancementDescription: 'Removed background and replaced with pure white for e-commerce',
        fileSize: '1.9 MB',
        dimensions: '1024×1024',
        generatedAt: new Date().toLocaleString(),
        isFavorite: true
      },
      {
        id: 'result-5',
        originalImageUrl: '/api/placeholder/400/400',
        enhancedImageUrl: '/api/placeholder/400/400',
        enhancementTitle: 'Detail & Feature Callouts',
        enhancementDescription: 'Highlighted key features with elegant callout annotations',
        fileSize: '2.5 MB',
        dimensions: '1024×1024',
        generatedAt: new Date().toLocaleString(),
        isFavorite: false
      }
    ]
    setResults(mockResults)
    
    // Hide celebration after 3 seconds
    setTimeout(() => setShowCelebration(false), 3000)
  }, [])

  const toggleFavorite = (id: string) => {
    setResults(prev => 
      prev.map(result => 
        result.id === id ? { ...result, isFavorite: !result.isFavorite } : result
      )
    )
  }

  const toggleBeforeAfter = (id: string) => {
    setIsBeforeView(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const downloadImage = (imageUrl: string, filename: string) => {
    // In production, this would handle actual download
    console.log(`Downloading ${filename} from ${imageUrl}`)
    // Create download link
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    link.click()
  }

  const downloadAll = () => {
    console.log(`Downloading all ${results.length} images as ${selectedFormat} in ${selectedResolution} resolution`)
    // In production, would call API to create zip file
  }

  const downloadFavorites = () => {
    const favorites = results.filter(r => r.isFavorite)
    console.log(`Downloading ${favorites.length} favorite images`)
  }

  const emailResults = () => {
    if (!emailAddress) return
    console.log(`Emailing results to ${emailAddress}`)
    // In production, would call API to send email
  }

  const shareResult = (id: string) => {
    const shareUrl = `${window.location.origin}/shared/${id}`
    navigator.clipboard.writeText(shareUrl)
    console.log('Share link copied to clipboard')
  }

  const regenerateImage = (id: string) => {
    console.log(`Regenerating image ${id}`)
    // In production, would restart generation for this specific image
  }

  const favoriteCount = results.filter(r => r.isFavorite).length

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
        
        .brand-button-secondary {
          background-color: transparent;
          color: var(--primary);
          border: 2px solid var(--primary);
        }
        .brand-button-secondary:hover {
          background-color: var(--primary);
          color: white;
        }
        
        .brand-font-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .brand-font-body {
          font-family: 'Montserrat', sans-serif;
        }
        
        .brand-card {
          background: white;
          border: 2px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .celebration-pulse {
          animation: celebration-pulse 2s ease-in-out infinite;
        }
        
        @keyframes celebration-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .masonry-grid {
          columns: 3;
          column-gap: 1.5rem;
          break-inside: avoid;
        }
        
        @media (max-width: 1024px) {
          .masonry-grid { columns: 2; }
        }
        
        @media (max-width: 640px) {
          .masonry-grid { columns: 1; }
        }
        
        .result-card {
          break-inside: avoid;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .result-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        
        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 0.5rem;
        }
        
        .image-container:hover .zoom-overlay {
          opacity: 1;
        }
        
        .zoom-overlay {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          items-center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }
        
        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          items-center;
          justify-content: center;
          z-index: 50;
        }
        
        .lightbox img {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
        }
        
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          border-top: 2px solid #e5e7eb;
          z-index: 10;
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: var(--accent);
          animation: confetti-fall 3s linear infinite;
        }
        
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
      
      <div className="min-h-screen brand-bg-light">
        <Navbar freeCredits={1} paidCredits={0} />
        
        {/* Celebration Confetti */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-30">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: i % 3 === 0 ? '#C1F50A' : i % 3 === 1 ? '#3DA5D9' : '#0D7877'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Step 1: Upload */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 brand-font-body">Upload</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-[#0D7877] rounded"></div>
              
              {/* Step 2: Ideas Selection */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 brand-font-body">Ideas Selection</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-[#0D7877] rounded"></div>
              
              {/* Step 3: Generate */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 brand-font-body">Generate</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-[#0D7877] rounded"></div>
              
              {/* Step 4: Download - ACTIVE */}
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold ${showCelebration ? 'celebration-pulse' : ''}`}>
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-[#0D7877] brand-font-body">Download</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pb-32">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-bold mb-4 brand-text-neutral brand-font-heading ${showCelebration ? 'celebration-pulse' : ''}`}>
              Your Enhanced Images Are Ready!
            </h1>
            <p className="text-lg text-gray-600 brand-font-body max-w-3xl mx-auto mb-4">
              Download your AI-enhanced product images and start using them in your marketing campaigns
            </p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C1F50A]" />
              <span className="font-semibold text-[#0D7877] brand-font-body">
                Successfully generated {results.length} enhancements
              </span>
              <Sparkles className="w-5 h-5 text-[#C1F50A]" />
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="brand-font-body"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'compare' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compare')}
                className="brand-font-body"
              >
                <ScanLine className="w-4 h-4 mr-2" />
                Compare
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="brand-font-body"
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 brand-font-body">
              <Star className="w-4 h-4 text-yellow-500" />
              {favoriteCount} favorites
            </div>
          </div>

          {/* Results Grid */}
          <div className={`${viewMode === 'grid' ? 'masonry-grid' : viewMode === 'compare' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
            {results.map((result) => (
              <Card key={result.id} className="result-card brand-card">
                <CardContent className="p-4">
                  {/* Image Display */}
                  <div className="image-container mb-4">
                    <img
                      src={isBeforeView[result.id] ? result.originalImageUrl : result.enhancedImageUrl}
                      alt={result.enhancementTitle}
                      className="w-full h-auto rounded-lg"
                    />
                    <div 
                      className="zoom-overlay"
                      onClick={() => setLightboxImage(isBeforeView[result.id] ? result.originalImageUrl : result.enhancedImageUrl)}
                    >
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Before/After Toggle */}
                    <div className="absolute bottom-2 left-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleBeforeAfter(result.id)}
                        className="text-xs brand-font-body"
                      >
                        {isBeforeView[result.id] ? 'Show After' : 'Show Before'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Title and Actions */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold brand-text-neutral brand-font-heading flex-grow">
                      {result.enhancementTitle}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(result.id)}
                      className="flex-shrink-0 ml-2"
                    >
                      {result.isFavorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600 brand-font-body mb-3">
                    {result.enhancementDescription}
                  </p>
                  
                  {/* Image Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 brand-font-body mb-3">
                    <span>{result.fileSize}</span>
                    <span>{result.dimensions}</span>
                    <span>{result.generatedAt}</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => downloadImage(result.enhancedImageUrl, `${result.enhancementTitle}.${selectedFormat.toLowerCase()}`)}
                      className="brand-button-primary brand-font-body flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareResult(result.id)}
                      className="brand-font-body"
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateImage(result.id)}
                      className="brand-font-body"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Download Options */}
          <Card className="brand-card mt-8">
            <CardHeader>
              <CardTitle className="brand-font-heading brand-text-neutral">
                Download Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium brand-font-body mb-2 block">Format</label>
                  <Select value={selectedFormat} onValueChange={(value: 'PNG' | 'JPG') => setSelectedFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PNG">PNG (High Quality)</SelectItem>
                      <SelectItem value="JPG">JPG (Smaller Size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium brand-font-body mb-2 block">Resolution</label>
                  <Select value={selectedResolution} onValueChange={(value: 'original' | 'hd' | '4k') => setSelectedResolution(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">Original (1024×1024)</SelectItem>
                      <SelectItem value="hd">HD (1920×1920)</SelectItem>
                      <SelectItem value="4k">4K (3840×3840)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium brand-font-body mb-2 block">Email Results</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    onClick={emailResults}
                    disabled={!emailAddress}
                    variant="outline"
                    className="w-full brand-font-body"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={downloadAll} className="brand-button-primary brand-font-body">
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({results.length})
                </Button>
                {favoriteCount > 0 && (
                  <Button onClick={downloadFavorites} variant="outline" className="brand-font-body">
                    <Star className="w-4 h-4 mr-2" />
                    Download Favorites ({favoriteCount})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="lightbox" onClick={() => setLightboxImage(null)}>
            <img src={lightboxImage} alt="Preview" />
          </div>
        )}

        {/* Sticky Footer */}
        <div className="sticky-footer p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium brand-text-neutral brand-font-body">
                  Enhancement complete! {results.length} images ready
                </span>
              </div>
              
              <div className="flex gap-3">
                <Link href="/upload-enhance">
                  <Button variant="outline" className="brand-button-secondary brand-font-body">
                    <Upload className="w-4 h-4 mr-2" />
                    Enhance More Products
                  </Button>
                </Link>
                
                <Button className="brand-button-primary brand-font-body">
                  <Save className="w-4 h-4 mr-2" />
                  Save Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}