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
  difficulty: 'Easy' | 'Medium' | 'Hard'
  impact: 'High' | 'Medium' | 'Low'
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

  // Mock data for development - in production this would come from API/sessionStorage
  useEffect(() => {
    const mockData: ProductImage[] = [
      {
        id: 'product-1',
        fileName: 'product-photo-1.jpg',
        url: '/api/placeholder/200/200',
        ideas: [
          {
            id: 'idea-1-1',
            title: 'Professional Studio Lighting',
            description: 'Add dramatic studio lighting with soft shadows to create a premium, professional look that highlights product details.',
            difficulty: 'Easy',
            impact: 'High'
          },
          {
            id: 'idea-1-2',
            title: 'Lifestyle Background Scene',
            description: 'Place your product in a realistic lifestyle setting that shows how customers would use it in their daily lives.',
            difficulty: 'Medium',
            impact: 'High'
          },
          {
            id: 'idea-1-3',
            title: 'Clean White Background',
            description: 'Remove current background and replace with a clean, pure white background perfect for e-commerce listings.',
            difficulty: 'Easy',
            impact: 'Medium'
          },
          {
            id: 'idea-1-4',
            title: 'Color Variations Display',
            description: 'Show multiple color options of your product in an elegant arrangement to highlight available choices.',
            difficulty: 'Hard',
            impact: 'High'
          },
          {
            id: 'idea-1-5',
            title: 'Scale & Size Reference',
            description: 'Add common objects or hands to show the true size and scale of your product for better customer understanding.',
            difficulty: 'Medium',
            impact: 'Medium'
          }
        ]
      },
      {
        id: 'product-2',
        fileName: 'product-photo-2.jpg',
        url: '/api/placeholder/200/200',
        ideas: [
          {
            id: 'idea-2-1',
            title: 'Premium Packaging Display',
            description: 'Create an unboxing scene that showcases your product alongside its premium packaging and presentation.',
            difficulty: 'Medium',
            impact: 'High'
          },
          {
            id: 'idea-2-2',
            title: 'Action Shot in Use',
            description: 'Show your product being actively used in its intended environment to demonstrate functionality.',
            difficulty: 'Hard',
            impact: 'High'
          },
          {
            id: 'idea-2-3',
            title: 'Minimalist Aesthetic',
            description: 'Apply a clean, minimalist style with negative space and subtle textures for a modern, premium feel.',
            difficulty: 'Easy',
            impact: 'Medium'
          },
          {
            id: 'idea-2-4',
            title: 'Detail & Feature Callouts',
            description: 'Highlight key features and details with elegant callout annotations and close-up detail shots.',
            difficulty: 'Medium',
            impact: 'High'
          },
          {
            id: 'idea-2-5',
            title: 'Seasonal Theme Integration',
            description: 'Integrate seasonal elements and themes that align with current trends and shopping seasons.',
            difficulty: 'Easy',
            impact: 'Low'
          }
        ]
      }
    ]
    setProductImages(mockData)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-[#C1F50A] text-black'
      case 'Medium': return 'bg-yellow-400 text-black'
      case 'Hard': return 'bg-red-500 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-[#0D7877] text-white'
      case 'Medium': return 'bg-[#3DA5D9] text-white'
      case 'Low': return 'bg-gray-400 text-white'
      default: return 'bg-gray-400 text-white'
    }
  }

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
        if (currentSelections.length < 3) {
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
    const allSelected = currentSelections.length === Math.min(3, product.ideas.length)

    if (allSelected) {
      // Deselect all
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: []
      }))
    } else {
      // Select first 3 ideas
      setSelectedIdeas(prev => ({
        ...prev,
        [productId]: product.ideas.slice(0, 3).map(idea => idea.id)
      }))
    }
  }

  const getSelectedCount = (productId: string) => {
    return selectedIdeas[productId]?.length || 0
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedIdeas).reduce((total, selections) => total + selections.length, 0)
  }

  const canProceed = getTotalSelectedCount() > 0

  const handleGenerateEnhancements = () => {
    // Pass selected ideas to generation page (in production would save to sessionStorage or API)
    console.log('Generating enhancements for:', selectedIdeas)
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
          transition: all 0.2s ease-in-out;
        }
        
        .idea-row:hover {
          background-color: rgba(61, 165, 217, 0.05);
        }
        
        .idea-row.selected {
          background-color: rgba(61, 165, 217, 0.1);
          border-left: 4px solid var(--secondary);
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
              Select up to 3 ideas per image to get the best results.
            </p>
          </div>

          {/* Product Images Grid */}
          <div className="space-y-8">
            {productImages.map((product, index) => {
              const selectedCount = getSelectedCount(product.id)
              const maxReached = selectedCount >= 3

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
                              {selectedCount}/3 ideas selected
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSelectAll(product.id)}
                              className="text-xs brand-font-body"
                            >
                              {selectedCount === Math.min(3, product.ideas.length) ? 'Deselect All' : 'Select All'}
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
                    <div className="space-y-3">
                      {product.ideas.map((idea) => {
                        const isSelected = selectedIdeas[product.id]?.includes(idea.id) || false
                        const isDisabled = !isSelected && maxReached

                        return (
                          <div
                            key={idea.id}
                            className={`idea-row p-4 rounded-lg border cursor-pointer ${
                              isSelected ? 'selected border-[#3DA5D9]' : 'border-gray-200'
                            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => !isDisabled && handleIdeaToggle(product.id, idea.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                disabled={isDisabled}
                                className="mt-1"
                              />
                              
                              <div className="flex-grow">
                                <h3 className="font-semibold text-gray-900 brand-font-heading mb-1">
                                  {idea.title}
                                </h3>
                                <p className="text-sm text-gray-600 brand-font-body">
                                  {idea.description}
                                </p>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <Badge className={`text-xs ${getDifficultyColor(idea.difficulty)}`}>
                                  {idea.difficulty}
                                </Badge>
                                <Badge className={`text-xs ${getImpactColor(idea.impact)}`}>
                                  {idea.impact} Impact
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )
                      })}
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