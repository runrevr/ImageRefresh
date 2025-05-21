'use client'
import React, { useRef, useEffect } from 'react'
import useMeasure from 'react-use-measure'
import { motion } from 'framer-motion'

interface InfiniteSliderProps {
  children: React.ReactNode
  direction?: 'horizontal' | 'vertical'
  speed?: number
  className?: string
}

export const InfiniteSlider = ({
  children,
  direction = 'horizontal',
  speed = 20,
  className = '',
}: InfiniteSliderProps) => {
  const [ref, { width, height }] = useMeasure()
  const innerRef = useRef<HTMLDivElement>(null)
  const [innerWidth, setInnerWidth] = React.useState(0)
  const [innerHeight, setInnerHeight] = React.useState(0)

  useEffect(() => {
    if (innerRef.current) {
      setInnerWidth(innerRef.current.offsetWidth)
      setInnerHeight(innerRef.current.offsetHeight)
    }
  }, [children])

  const isHorizontal = direction === 'horizontal'
  const size = isHorizontal ? innerWidth : innerHeight
  const viewportSize = isHorizontal ? width : height
  const x = isHorizontal ? [-innerWidth, 0] : 0
  const y = isHorizontal ? 0 : [-innerHeight, 0]

  // If the container is smaller than the viewport, we don't need to animate
  if (size < viewportSize) {
    return (
      <div 
        ref={ref} 
        className={className}
      >
        <div 
          ref={innerRef}
          className="flex flex-nowrap"
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={ref} 
      className={`overflow-hidden ${className}`}
    >
      <motion.div
        animate={{
          x,
          y,
        }}
        transition={{
          duration: size / speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div 
          ref={innerRef} 
          className="flex flex-nowrap"
        >
          {children}
        </div>
      </motion.div>
    </div>
  )
}