import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, AlertCircle, RefreshCw, ChevronLeft, Sparkles, Zap } from 'lucide-react'

interface EnhancementJob {
  id: string
  productId: string
  originalImageUrl: string
  enhancementTitle: string
  enhancementPrompt: string
  status: 'queued' | 'processing' | 'complete' | 'failed'
  progress: number
  resultImageUrl?: string
  errorMessage?: string
  retryCount: number
  estimatedTime?: number
  startTime?: number
}

export default function GenerateEnhancementsPage() {
  const [, setLocation] = useLocation()
  const [jobs, setJobs] = useState<EnhancementJob[]>([])
  const [overallProgress, setOverallProgress] = useState(0)
  
  // Ensure page loads at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [completedCount, setCompletedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)

  // Mock data for development - in production this would come from the previous page
  useEffect(() => {
    const mockJobs: EnhancementJob[] = [
      {
        id: 'job-1',
        productId: 'product-1',
        originalImageUrl: '/api/placeholder/100/100',
        enhancementTitle: 'Professional Studio Lighting',
        enhancementPrompt: 'Add dramatic studio lighting with soft shadows to create a premium, professional look',
        status: 'queued',
        progress: 0,
        retryCount: 0,
        estimatedTime: 45
      },
      {
        id: 'job-2',
        productId: 'product-1',
        originalImageUrl: '/api/placeholder/100/100',
        enhancementTitle: 'Lifestyle Background Scene',
        enhancementPrompt: 'Place product in a realistic lifestyle setting showing daily use',
        status: 'queued',
        progress: 0,
        retryCount: 0,
        estimatedTime: 60
      },
      {
        id: 'job-3',
        productId: 'product-2',
        originalImageUrl: '/api/placeholder/100/100',
        enhancementTitle: 'Premium Packaging Display',
        enhancementPrompt: 'Create an unboxing scene with premium packaging presentation',
        status: 'queued',
        progress: 0,
        retryCount: 0,
        estimatedTime: 50
      },
      {
        id: 'job-4',
        productId: 'product-2',
        originalImageUrl: '/api/placeholder/100/100',
        enhancementTitle: 'Clean White Background',
        enhancementPrompt: 'Remove background and replace with pure white for e-commerce',
        status: 'queued',
        progress: 0,
        retryCount: 0,
        estimatedTime: 30
      },
      {
        id: 'job-5',
        productId: 'product-2',
        originalImageUrl: '/api/placeholder/100/100',
        enhancementTitle: 'Detail & Feature Callouts',
        enhancementPrompt: 'Highlight key features with elegant callout annotations',
        status: 'queued',
        progress: 0,
        retryCount: 0,
        estimatedTime: 55
      }
    ]
    setJobs(mockJobs)
    
    // Start processing simulation
    setTimeout(() => {
      startProcessing(mockJobs)
    }, 1000)
  }, [])

  const startProcessing = async (initialJobs: EnhancementJob[]) => {
    let currentJobs = [...initialJobs]
    
    for (let i = 0; i < currentJobs.length; i++) {
      // Start processing current job
      currentJobs[i] = { ...currentJobs[i], status: 'processing', startTime: Date.now() }
      setJobs([...currentJobs])
      
      // Simulate progress updates
      const success = await simulateJobProgress(currentJobs[i])
      
      // Update job status
      if (success) {
        currentJobs[i] = {
          ...currentJobs[i],
          status: 'complete',
          progress: 100,
          resultImageUrl: '/api/placeholder/400/400'
        }
        setCompletedCount(prev => prev + 1)
      } else {
        currentJobs[i] = {
          ...currentJobs[i],
          status: 'failed',
          errorMessage: 'Generation failed due to content complexity. Please try again.'
        }
        setFailedCount(prev => prev + 1)
      }
      
      setJobs([...currentJobs])
      setOverallProgress(((i + 1) / currentJobs.length) * 100)
      
      // Update estimated time remaining
      const remaining = currentJobs.length - (i + 1)
      const avgTime = 45 // seconds
      setEstimatedTimeRemaining(remaining * avgTime)
    }
    
    // All jobs complete
    setIsProcessing(false)
    
    // Auto-redirect after 2 seconds if all successful
    if (currentJobs.every(job => job.status === 'complete')) {
      setTimeout(() => {
        setLocation('/results')
      }, 2000)
    }
  }

  const simulateJobProgress = (job: EnhancementJob): Promise<boolean> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5 // Random progress increments
        
        if (progress >= 100) {
          clearInterval(interval)
          // 90% success rate for demo
          resolve(Math.random() > 0.1)
        } else {
          setJobs(prevJobs => 
            prevJobs.map(j => 
              j.id === job.id ? { ...j, progress } : j
            )
          )
        }
      }, 500)
    })
  }

  const retryJob = async (jobId: string) => {
    const jobIndex = jobs.findIndex(j => j.id === jobId)
    if (jobIndex === -1 || jobs[jobIndex].retryCount >= 3) return

    const updatedJobs = [...jobs]
    updatedJobs[jobIndex] = {
      ...updatedJobs[jobIndex],
      status: 'processing',
      progress: 0,
      retryCount: updatedJobs[jobIndex].retryCount + 1,
      errorMessage: undefined
    }
    setJobs(updatedJobs)

    // Simulate retry
    const success = await simulateJobProgress(updatedJobs[jobIndex])
    
    if (success) {
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        status: 'complete',
        progress: 100,
        resultImageUrl: '/api/placeholder/400/400'
      }
      setCompletedCount(prev => prev + 1)
      setFailedCount(prev => prev - 1)
    } else {
      updatedJobs[jobIndex] = {
        ...updatedJobs[jobIndex],
        status: 'failed',
        errorMessage: 'Generation failed again. This image may be too complex.'
      }
    }
    
    setJobs(updatedJobs)
  }

  const skipJob = (jobId: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: 'complete', progress: 100, resultImageUrl: undefined }
          : job
      )
    )
    setCompletedCount(prev => prev + 1)
    setFailedCount(prev => prev - 1)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
      case 'complete':
        return <Check className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-gray-100 text-gray-600'
      case 'processing': return 'bg-blue-100 text-blue-600'
      case 'complete': return 'bg-green-100 text-green-600'
      case 'failed': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const successfulJobs = jobs.filter(job => job.status === 'complete' && job.resultImageUrl)

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
        
        .processing-gradient {
          background: linear-gradient(90deg, #3DA5D9 0%, #0D7877 50%, #3DA5D9 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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
              
              {/* Step 2: Ideas Selection */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  <Check className="w-4 h-4" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 brand-font-body">Ideas Selection</span>
              </div>
              
              <div className="flex-1 mx-4 h-1 bg-[#0D7877] rounded"></div>
              
              {/* Step 3: Generate - ACTIVE */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0D7877] text-white text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-[#0D7877] brand-font-body">Generate</span>
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
              Creating Your Enhanced Images
            </h1>
            <p className="text-lg text-gray-600 brand-font-body max-w-3xl mx-auto">
              Our AI is working on your selected enhancements. This process typically takes 30-60 seconds per image.
            </p>
          </div>

          {/* Overall Progress */}
          <Card className="brand-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-[#0D7877]" />
                  <span className="font-semibold brand-text-neutral brand-font-heading">
                    Generation Progress
                  </span>
                </div>
                <div className="text-right brand-font-body">
                  <div className="text-sm text-gray-600">
                    {completedCount + failedCount} of {jobs.length} enhancements
                  </div>
                  {isProcessing && estimatedTimeRemaining > 0 && (
                    <div className="text-xs text-gray-500">
                      Est. {formatTime(estimatedTimeRemaining)} remaining
                    </div>
                  )}
                </div>
              </div>
              
              <Progress 
                value={overallProgress} 
                className="h-3 mb-2"
              />
              
              <div className="flex justify-between text-sm text-gray-600 brand-font-body">
                <span>{completedCount} completed</span>
                {failedCount > 0 && <span className="text-red-600">{failedCount} failed</span>}
                <span>{Math.round(overallProgress)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Individual Job Cards */}
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="brand-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Original Image Thumbnail */}
                    <div className="flex-shrink-0">
                      <img
                        src={job.originalImageUrl}
                        alt="Original product"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    
                    {/* Job Details */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(job.status)}
                        <h3 className="font-semibold brand-text-neutral brand-font-heading">
                          {job.enhancementTitle}
                        </h3>
                        <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                          {job.status === 'queued' && 'Waiting...'}
                          {job.status === 'processing' && 'Generating...'}
                          {job.status === 'complete' && 'Complete!'}
                          {job.status === 'failed' && 'Failed'}
                        </Badge>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <Progress 
                          value={job.progress} 
                          className={`h-2 ${job.status === 'processing' ? 'processing-gradient' : ''}`}
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 brand-font-body">
                        {job.enhancementPrompt}
                      </p>
                      
                      {/* Error Message */}
                      {job.status === 'failed' && job.errorMessage && (
                        <p className="text-sm text-red-600 mt-2 brand-font-body">
                          {job.errorMessage}
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex-shrink-0">
                      {job.status === 'failed' && (
                        <div className="flex gap-2">
                          {job.retryCount < 3 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => retryJob(job.id)}
                              className="text-xs brand-font-body"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => skipJob(job.id)}
                            className="text-xs brand-font-body text-gray-600"
                          >
                            Skip
                          </Button>
                        </div>
                      )}
                      
                      {job.status === 'complete' && job.resultImageUrl && (
                        <div className="flex items-center gap-2">
                          <img
                            src={job.resultImageUrl}
                            alt="Enhanced result"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-green-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky-footer p-4 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0D7877]" />
                <span className="font-medium brand-text-neutral brand-font-body">
                  {isProcessing ? 'Generation in progress...' : 'Generation complete!'}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Link href="/select-ideas">
                  <Button variant="outline" className="brand-button-secondary brand-font-body">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Ideas
                  </Button>
                </Link>
                
                {!isProcessing && (
                  <Button
                    onClick={() => setLocation('/results')}
                    disabled={successfulJobs.length === 0}
                    className={`brand-font-body font-medium ${
                      successfulJobs.length > 0 ? 'brand-button-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {successfulJobs.length === jobs.length 
                      ? 'View All Results' 
                      : `Continue with ${successfulJobs.length} Successful Enhancements`}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}