import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, ArrowLeft, ChevronRight, Image as ImageIcon, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

interface EnhancementIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  impact?: string;
  difficulty?: string;
  estimated_time?: string;
  tools_needed?: string[];
  industry_relevance?: number;
}

interface ImageData {
  imageIndex: number;
  image_url?: string;
  url?: string;
  ideas: EnhancementIdea[];
}

interface SessionData {
  originalImages: {
    files: Array<{ name: string; size: number; type: string; url?: string }>;
    urls: string[];
  };
  businessContext: {
    industries: string[];
    productType: string;
    brandDescription: string;
  };
  enhancementIdeas: EnhancementIdea[];
  processingMetadata: {
    imageCount: number;
    ideasGenerated: number;
  };
}

export default function SelectIdeasPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [imageIdeas, setImageIdeas] = useState<ImageData[]>([]);
  const [selectedIdeas, setSelectedIdeas] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    // Retrieve data from sessionStorage
    const storedData = sessionStorage.getItem('uploadEnhanceResults');
    
    if (!storedData) {
      // Redirect back to upload if no data found
      navigate('/upload-enhance');
      return;
    }

    try {
      const data: SessionData = JSON.parse(storedData);
      setSessionData(data);

      // Process enhancement ideas by image
      const ideasByImage: { [key: number]: EnhancementIdea[] } = {};
      
      data.enhancementIdeas.forEach(idea => {
        const imageIndex = (idea as any).imageIndex || 0;
        if (!ideasByImage[imageIndex]) {
          ideasByImage[imageIndex] = [];
        }
        ideasByImage[imageIndex].push(idea);
      });

      // Create image data array
      const processedImageData: ImageData[] = data.originalImages.files.map((file, index) => ({
        imageIndex: index,
        image_url: file.url || data.originalImages.urls[index],
        ideas: ideasByImage[index] || []
      }));

      setImageIdeas(processedImageData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing session data:', error);
      navigate('/upload-enhance');
    }
  }, [navigate]);

  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedIdeas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ideaId)) {
        newSet.delete(ideaId);
      } else {
        newSet.add(ideaId);
      }
      return newSet;
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateSelected = () => {
    if (selectedIdeas.size === 0) {
      alert('Please select at least one enhancement idea to generate.');
      return;
    }

    // Store selected ideas for the next page
    const selectedIdeasData = {
      selectedIdeas: Array.from(selectedIdeas),
      sessionData: sessionData,
      timestamp: new Date().toISOString()
    };

    sessionStorage.setItem('selectedEnhancements', JSON.stringify(selectedIdeasData));
    navigate('/generate-enhancements');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen brand-bg-light flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 brand-text-primary animate-spin mb-4" />
          <p className="brand-font-body brand-text-neutral">Loading your enhancement ideas...</p>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen brand-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="brand-font-body brand-text-neutral">No data found. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;800&family=Montserrat:wght@400;500&display=swap" 
        rel="stylesheet" 
      />
      
      <style>{`
        :root {
          --primary: #0D7877;
          --secondary: #3DA5D9;
          --accent: #C1F50A;
          --neutral: #333333;
          --light: #F2F4F6;
        }
        
        .brand-font-heading {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .brand-font-body {
          font-family: 'Montserrat', sans-serif;
        }
        
        .brand-bg-primary { background-color: var(--primary); }
        .brand-bg-secondary { background-color: var(--secondary); }
        .brand-bg-accent { background-color: var(--accent); }
        .brand-bg-light { background-color: var(--light); }
        
        .brand-text-primary { color: var(--primary); }
        .brand-text-secondary { color: var(--secondary); }
        .brand-text-accent { color: var(--accent); }
        .brand-text-neutral { color: var(--neutral); }
        
        .brand-border-primary { border-color: var(--primary); }
        .brand-border-secondary { border-color: var(--secondary); }
        .brand-border-accent { border-color: var(--accent); }
        
        .brand-button-primary {
          background: var(--primary);
          color: white;
          transition: all 0.3s ease;
        }
        
        .brand-button-primary:hover {
          background: var(--secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(13, 120, 119, 0.3);
        }
        
        .brand-button-accent {
          background: var(--accent);
          color: var(--neutral);
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .brand-button-accent:hover {
          background: #A8D209;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(193, 245, 10, 0.3);
        }
        
        .brand-card {
          background: white;
          border: 2px solid var(--light);
          transition: all 0.3s ease;
        }
        
        .brand-card:hover {
          border-color: var(--secondary);
          box-shadow: 0 8px 25px rgba(61, 165, 217, 0.15);
        }
        
        .idea-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .idea-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .idea-card.selected {
          border-color: var(--primary);
          background: rgba(13, 120, 119, 0.05);
        }
      `}</style>

      <div className="min-h-screen brand-bg-light">
        <Navbar freeCredits={0} paidCredits={0} />
        
        <main className="max-w-screen-xl mx-auto px-4 py-8 mt-16">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/upload-enhance')}
                className="mb-4 brand-border-primary brand-text-primary hover:brand-bg-primary hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Upload
              </Button>
              <h1 className="text-4xl brand-font-heading font-extrabold brand-text-neutral mb-4">
                Select Enhancement Ideas
              </h1>
              <p className="text-xl brand-font-body brand-text-neutral max-w-2xl">
                Choose which AI-generated enhancement ideas you'd like to apply to your product images.
              </p>
            </div>
            <div className="text-right">
              <div className="brand-bg-primary text-white px-4 py-2 rounded-lg">
                <p className="brand-font-body font-medium">
                  {sessionData.processingMetadata.imageCount} Images
                </p>
                <p className="text-sm opacity-90">
                  {sessionData.processingMetadata.ideasGenerated} Ideas Generated
                </p>
              </div>
            </div>
          </div>

          {/* Business Context Summary */}
          <Card className="mb-8 brand-card">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="brand-border-primary brand-text-primary">
                  <ImageIcon className="mr-1 h-3 w-3" />
                  {sessionData.businessContext.productType}
                </Badge>
                {sessionData.businessContext.industries.map(industry => (
                  <Badge key={industry} variant="outline" className="brand-border-secondary brand-text-secondary">
                    {industry}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Images with Enhancement Ideas */}
          <div className="space-y-12">
            {imageIdeas.map((imageData, imageIndex) => (
              <Card key={imageIndex} className="brand-card">
                <CardHeader>
                  <CardTitle className="brand-font-heading font-semibold brand-text-neutral">
                    Image {imageIndex + 1} - Enhancement Options
                  </CardTitle>
                  <CardDescription className="brand-font-body">
                    Select the enhancement ideas you'd like to apply to this image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Image Preview */}
                    <div className="lg:col-span-1">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 brand-border-secondary">
                        <img
                          src={imageData.image_url}
                          alt={`Product ${imageIndex + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm brand-font-body brand-text-neutral mt-2 text-center">
                        Original Image
                      </p>
                    </div>
                    
                    {/* Enhancement Ideas */}
                    <div className="lg:col-span-3">
                      <div className="grid md:grid-cols-1 gap-4">
                        {imageData.ideas.map((idea, ideaIndex) => (
                          <Card 
                            key={idea.id}
                            className={`idea-card ${selectedIdeas.has(idea.id) ? 'selected' : ''}`}
                            onClick={() => toggleIdeaSelection(idea.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Checkbox 
                                  checked={selectedIdeas.has(idea.id)}
                                  onChange={() => toggleIdeaSelection(idea.id)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="brand-font-heading font-semibold brand-text-neutral">
                                      {idea.title}
                                    </h4>
                                    {idea.impact && (
                                      <Badge className={`text-xs ${getImpactColor(idea.impact)}`}>
                                        {idea.impact} impact
                                      </Badge>
                                    )}
                                    {idea.difficulty && (
                                      <Badge className={`text-xs ${getDifficultyColor(idea.difficulty)}`}>
                                        {idea.difficulty}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="brand-font-body text-gray-600 mb-2">
                                    {idea.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {idea.category}
                                    </Badge>
                                    {idea.estimated_time && (
                                      <Badge variant="outline" className="text-xs">
                                        ⏱ {idea.estimated_time}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selection Summary & Generate Button */}
          <Card className="mt-12 brand-card">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="mb-6">
                <h3 className="text-2xl brand-font-heading font-bold brand-text-neutral mb-2">
                  Ready to Generate Enhancements?
                </h3>
                <p className="brand-font-body brand-text-neutral mb-4">
                  You've selected {selectedIdeas.size} enhancement ideas to apply to your images.
                </p>
                {selectedIdeas.size > 0 && (
                  <div className="flex justify-center">
                    <Badge className="brand-bg-accent brand-text-neutral px-4 py-2">
                      <Zap className="mr-1 h-4 w-4" />
                      {selectedIdeas.size} Ideas Selected
                    </Badge>
                  </div>
                )}
              </div>
              
              <Button 
                size="lg" 
                onClick={handleGenerateSelected}
                disabled={selectedIdeas.size === 0}
                className={`px-8 py-3 text-lg brand-font-body font-medium ${
                  selectedIdeas.size > 0 
                    ? 'brand-button-accent transform hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Selected Enhancements
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              
              {selectedIdeas.size === 0 && (
                <p className="text-sm text-gray-500 brand-font-body mt-4">
                  Select at least one enhancement idea to continue
                </p>
              )}
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    </>
  );
}