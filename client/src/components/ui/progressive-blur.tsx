'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressiveBlurProps {
  opacity?: number
  blur?: number
  className?: string
  children: React.ReactNode
}

export function ProgressiveBlur({
  opacity = 0.75,
  blur = 4,
  className,
  children,
}: ProgressiveBlurProps) {
  return (
    <div className={cn('relative', className)}>
      <div 
        className="absolute inset-0 z-10 overflow-hidden" 
        style={{
          background: `linear-gradient(to bottom, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, ${opacity}) 100%
          )`,
          backdropFilter: `blur(${blur}px)`,
        }}
      />
      {children}
    </div>
  )
}