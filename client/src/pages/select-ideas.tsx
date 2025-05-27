import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Sparkles, Check } from 'lucide-react'

interface EnhancementIdea {
  id: string
  title: string
  description: string
}

interface ProductImage {
  id: string
  fileName: string
  url: string
  ideas: EnhancementIdea[]
}

export default function SelectIdeasPage() {
  const [, setLocation] = useLocation()
  const [selectedIdeas, setSelectedIdeas] = useState<{ [productId: string]: string[] }>({})
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [expandedIdeas, setExpandedIdeas] = useState<{ [ideaId: string]: boolean }>({})
  
  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load uploaded images and authentic Claude ideas from sessionStorage
  useEffect(() => {
    const storedIdeas = sessionStorage.getItem('enhancement_ideas');
    const storedData = sessionStorage.getItem('uploadEnhanceResults');
    
    if (storedIdeas && storedData) {
      try {
        const realIdeas = JSON.parse(storedIdeas);
        const sessionData = JSON.parse(storedData);
        
        console.log('Loading real ideas:', realIdeas);
        console.log('Session data structure:', sessionData);
        console.log('Available properties:', Object.keys(sessionData));
        console.log('Server URLs:', sessionData.urls);
        
        // Detailed debugging
        console.log('Full sessionData:', JSON.stringify(sessionData, null, 2));
        console.log('originalImages:', sessionData.originalImages);
        console.log('Do we have urls array?', sessionData.urls);
        console.log('Do we have uploadUrls?', sessionData.uploadUrls);
        console.log('Do we have originalImages.urls?', sessionData.originalImages?.urls);
        console.log('Do we have fileUrls?', sessionData.fileUrls);
        console.log('Do we have serverUrls?', sessionData.serverUrls);
        
        // Convert stored data to ProductImage format with authentic Claude-generated ideas
        const productData: ProductImage[] = sessionData.originalImages.files.map((img: any, index: number) => {
          // Try multiple possible locations for server URLs
          const serverUrl = sessionData.originalImages?.urls?.[index] || 
                           sessionData.urls?.[index] || 
                           sessionData.uploadUrls?.[index] || 
                           sessionData.serverUrls?.[index] || 
                           img.url;
          
          console.log(`Product ${index + 1} URL resolution:`, {
            originalImageUrls: sessionData.originalImages?.urls?.[index],
            sessionUrls: sessionData.urls?.[index],
            uploadUrls: sessionData.uploadUrls?.[index],
            serverUrls: sessionData.serverUrls?.[index],
            imgUrl: img.url,
            finalUrl: serverUrl
          });
          
          return {
            id: `product-${index + 1}`,
            fileName: img.name,
            url: serverUrl,
            ideas: realIdeas.ideas || realIdeas
          };
        });
        
        console.log(`Creating enhancement sections for ${productData.length} uploaded images`);
        setProductImages(productData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        setLocation('/upload-enhance');
      }
    } else {
      console.error('No authentic ideas found - redirecting to upload page');
      setLocation('/upload-enhance');
    }
  }, [])

  // Removed all mock data - using only authentic Claude-generated ideas

  const handleIdeaToggle = (productId: string, ideaId: string) => {
    setSelectedIdeas(prev => {
      const currentSelections = prev[productId] || []
      const isSelected = currentSelections.includes(ideaId)
      
      if (isSelected) {
        // Remove the idea
        return {
          ...prev,
          [productId]: currentSelections.filter(id => id !== ideaId)
        }
      } else {
        // Add the idea if under the limit
        if (currentSelections.length < 5) {
          return {
            ...prev,
            [productId]: [...currentSelections, ideaId]
          }
        }
      }
      return prev
    })
  }

  const handleSelectAll = (productId: string) => {
    const product = productImages.find(p => p.id === productId)
    if (!product) return

    const currentSelections = selectedIdeas[productId] || []
    const allSelected = currentSelections.length === Math.min(5, product.ideas.length)

    if (allSelected) {
      // Deselect all
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: []
      }))
    } else {
      // Select first 5 ideas
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: product.ideas.slice(0, 5).map(idea => idea.id)
      }))
    }
  }

  const handleSelectGroup = (productId: string, group: 'professional' | 'creative') => {
    const product = productImages.find(p => p.id === productId)
    if (!product) return

    const currentSelections = selectedIdeas[productId] || []
    const groupIdeas = group === 'professional' 
      ? product.ideas.slice(0, 3).map(idea => idea.id)
      : product.ideas.slice(3, 5).map(idea => idea.id)
    
    const allGroupSelected = groupIdeas.every(id => currentSelections.includes(id))

    if (allGroupSelected) {
      // Deselect group
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: currentSelections.filter(id => !groupIdeas.includes(id))
      }))
    } else {
      // Select group (respecting 5 idea limit)
      const otherSelections = currentSelections.filter(id => !groupIdeas.includes(id))
      const availableSlots = 5 - otherSelections.length
      const ideasToAdd = groupIdeas.slice(0, availableSlots)
      
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: [...otherSelections, ...ideasToAdd]
      }))
    }
  }

  const toggleIdeaExpansion = (ideaId: string) => {
    setExpandedIdeas(prev => ({
      ...prev,
      [ideaId]: !prev[ideaId]
    }))
  }

  const getSelectedCount = (productId: string) => {
    return selectedIdeas[productId]?.length || 0
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedIdeas).reduce((total, selections) => total + selections.length, 0)
  }

  const canProceed = getTotalSelectedCount() > 0

  const handleGenerateEnhancements = () => {
    // Build array of only selected enhancements for each product
    const selectedEnhancements = [];
    
    productImages.forEach((product) => {
      const productSelections = selectedIdeas[product.id] || [];
      
      if (productSelections.length > 0) {
        // Get only the selected ideas for this product
        const selectedIdeasForProduct = product.ideas.filter(idea => 
          productSelections.includes(idea.id)
        );
        
        // Get the server URL from session data instead of using potentially blob URL
        const storedData = JSON.parse(sessionStorage.getItem('uploadEnhanceResults') || '{}');
        const productIndex = parseInt(product.id.replace('product-', '')) - 1;
        const serverUrl = storedData.originalImages?.urls?.[productIndex] || 
                         storedData.urls?.[productIndex] || 
                         storedData.uploadUrls?.[productIndex] || 
                         storedData.serverUrls?.[productIndex] || 
                         product.url;
        
        console.log(`Product ${product.id}: Using ${serverUrl.startsWith('blob:') ? 'BLOB' : 'SERVER'} URL`);
        
        selectedEnhancements.push({
          image_url: serverUrl,  // Use server URL instead of blob URL
          image_id: product.id,
          fileName: product.fileName,
          selected_ideas: selectedIdeasForProduct // Only the checked ones!
        });
      }
    });
    
    console.log('Selected ideas to generate:', selectedEnhancements);
    sessionStorage.setItem('selected_enhancements', JSON.stringify(selectedEnhancements));
    setLocation('/generate-enhancements')
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
        
        .idea-row {
          transition: all 0.3s ease-in-out;
        }
        
        .idea-row:not(.opacity-50):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }
        
        .idea-row.selected {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .border-3 {
          border-width: 3px;
        }
        
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          border-top: 2px solid #e5e7eb;
          z-index: 10;
        }
      `}</style>
      
      <div className="min-h-screen brand-bg-light">
        <Navbar freeCredits={1} paidCredits={0} />
        
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
              
              {/* Step 2: Ideas Selection - ACTIVE */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-[#0D7877] brand-font-body">Ideas Selection</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-gray-300 rounded"></div>
              
              {/* Step 3: Enhance */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500 brand-font-body">Enhance</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-gray-300 rounded"></div>
              
              {/* Step 4: Download */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 text-sm font-semibold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500 brand-font-body">Download</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pb-32">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 brand-text-neutral brand-font-heading">
              Select Your Enhancement Ideas
            </h1>
            <p className="text-lg text-gray-600 brand-font-body max-w-3xl mx-auto">
              Choose which AI-generated enhancements you'd like to create for each product. 
              Select as many concepts as you'd like to bring to life!
            </p>
          </div>

          {/* Product Images Grid */}
          <div className="space-y-8">
            {productImages.map((product, index) => {
              const selectedCount = getSelectedCount(product.id)
              const maxReached = selectedCount >= 5

              return (
                <Card key={product.id} className="brand-card">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.url}
                          alt={product.fileName}
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                      
                      {/* Card Title and Controls */}
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl font-semibold brand-text-neutral brand-font-heading">
                            Enhancement Ideas for Product {index + 1}
                          </CardTitle>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 brand-font-body">
                              {selectedCount}/5 ideas selected
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectAll(product.id)}
                              className="text-xs brand-font-body"
                            >
                              {selectedCount === Math.min(5, product.ideas.length) ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 brand-font-body">
                          {product.fileName}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Group buttons */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectGroup(product.id, 'professional')}
                        className="text-xs brand-font-body border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        📸 Select All Professional (1-3)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectGroup(product.id, 'creative')}
                        className="text-xs brand-font-body border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        ✨ Select Creative (4-5)
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Professional Ideas (1-3) */}
                      <div className="space-y-3 p-4 rounded-lg bg-blue-25" style={{backgroundColor: '#f8fafc'}}>
                        <div className="text-xs font-medium text-blue-700 brand-font-body mb-3 pl-2 flex items-center gap-1">
                          📸 PROFESSIONAL
                        </div>
                        {product.ideas.slice(0, 3).map((idea, index) => {
                          const isSelected = selectedIdeas[product.id]?.includes(idea.id) || false
                          const isDisabled = !isSelected && maxReached
                          const ideaNumber = index + 1

                          return (
                            <div
                              key={idea.id}
                              className={`idea-row p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                                isSelected 
                                  ? 'selected border-3 border-blue-500 bg-blue-100 shadow-md transform scale-[1.02]' 
                                  : 'border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300'
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !isDisabled && handleIdeaToggle(product.id, idea.id)}
                            >
                              {/* Checkmark in corner when selected */}
                              {isSelected && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {ideaNumber}
                                  </div>
                                </div>
                                
                                <div className="flex-grow pr-8">
                                  <h3 className="font-semibold text-gray-900 brand-font-heading mb-2">
                                    {idea.title}
                                  </h3>
                                  
                                  {/* Description with Read more/less functionality */}
                                  <div className="text-sm text-gray-600 brand-font-body">
                                    <p className="mb-2">
                                      {expandedIdeas[idea.id] 
                                        ? idea.description 
                                        : `${idea.description.split(' ').slice(0, 10).join(' ')}${idea.description.split(' ').length > 10 ? '...' : ''}`
                                      }
                                    </p>
                                    
                                    {idea.description.split(' ').length > 10 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleIdeaExpansion(idea.id)
                                        }}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors"
                                      >
                                        {expandedIdeas[idea.id] ? 'Read less' : 'Read more'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Divider */}
                      <div className="border-t-2 border-gray-300 my-8"></div>

                      {/* Creative Ideas (4-5) */}
                      <div className="space-y-3 p-4 rounded-lg" style={{backgroundColor: '#fdf4ff'}}>
                        <div className="text-xs font-medium text-purple-700 brand-font-body mb-3 pl-2 flex items-center gap-1">
                          ✨ CREATIVE
                        </div>
                        {product.ideas.slice(3).map((idea, index) => {
                          const isSelected = selectedIdeas[product.id]?.includes(idea.id) || false
                          const isDisabled = !isSelected && maxReached
                          const ideaNumber = index + 4
                          const colorScheme = ideaNumber === 4 ? 'purple' : 'orange'

                          return (
                            <div
                              key={idea.id}
                              className={`idea-row p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                                isSelected 
                                  ? `selected border-3 shadow-md transform scale-[1.02] ${
                                      colorScheme === 'purple' 
                                        ? 'border-purple-500 bg-purple-100' 
                                        : 'border-orange-500 bg-orange-100'
                                    }` 
                                  : `border-2 bg-white hover:border-opacity-70 ${
                                      colorScheme === 'purple' 
                                        ? 'border-purple-200 hover:bg-purple-50 hover:border-purple-300' 
                                        : 'border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                                    }`
                              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => !isDisabled && handleIdeaToggle(product.id, idea.id)}
                            >
                              {/* Checkmark in corner when selected */}
                              {isSelected && (
                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${
                                  colorScheme === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                                }`}>
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                              
                              <div className="flex items-start gap-3">
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                    isSelected 
                                      ? colorScheme === 'purple' ? 'bg-purple-500 text-white' : 'bg-orange-500 text-white'
                                      : colorScheme === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                  }`}>
                                    {ideaNumber}
                                  </div>
                                </div>
                                
                                <div className="flex-grow pr-8">
                                  <h3 className="font-semibold text-gray-900 brand-font-heading mb-2">
                                    {idea.title}
                                  </h3>
                                  
                                  {/* Description with Read more/less functionality */}
                                  <div className="text-sm text-gray-600 brand-font-body">
                                    <p className="mb-2">
                                      {expandedIdeas[idea.id] 
                                        ? idea.description 
                                        : `${idea.description.split(' ').slice(0, 10).join(' ')}${idea.description.split(' ').length > 10 ? '...' : ''}`
                                      }
                                    </p>
                                    
                                    {idea.description.split(' ').length > 10 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleIdeaExpansion(idea.id)
                                        }}
                                        className={`font-medium text-xs transition-colors ${
                                          colorScheme === 'purple'
                                            ? 'text-purple-600 hover:text-purple-800'
                                            : 'text-orange-600 hover:text-orange-800'
                                        }`}
                                      >
                                        {expandedIdeas[idea.id] ? 'Read less' : 'Read more'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Selection count */}
                      <div className="mt-4 text-center">
                        <span className="text-sm text-gray-600 brand-font-body">
                          {selectedCount} of 5 ideas selected
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky-footer p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D7877]" />
                <span className="font-medium brand-text-neutral brand-font-body">
                  Total enhancements selected: {getTotalSelectedCount()}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Link href="/upload-enhance">
                  <Button variant="outline" className="brand-button-secondary brand-font-body">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Upload
                  </Button>
                </Link>
                
                <Button
                  onClick={handleGenerateEnhancements}
                  disabled={!canProceed}
                  className={`brand-font-body font-medium ${
                    canProceed ? 'brand-button-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Generate Selected Enhancements
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}