"use client"

import React, { useEffect, useState, useRef, ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

interface FloatingElementProps {
  depth?: number
  className?: string
  children: ReactNode
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  depth = 1,
  className,
  children,
}) => {
  return (
    <div
      className={`absolute ${className}`}
      style={{ zIndex: Math.round(10 - depth) }}
      data-depth={depth}
    >
      {children}
    </div>
  )
}

interface FloatingProps {
  sensitivity?: number
  className?: string
  children: ReactNode
}

// Main component that handles the mouse parallax effect
const Floating: React.FC<FloatingProps> = ({
  sensitivity = 1,
  className = "",
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)

  const springConfig = { mass: 1, stiffness: 50, damping: 30 }
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Set up dimensions on mount
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      })
      setMounted(true)
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        
        setMousePosition({ x, y })
        
        mouseX.set(x - 0.5)
        mouseY.set(y - 0.5)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white text-[#333333] ${className}`}
    >
      {mounted &&
        React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === FloatingElement) {
            const depth = child.props.depth || 1
            const translateX = springX.get() * 35 * depth * sensitivity
            const translateY = springY.get() * 35 * depth * sensitivity

            return (
              <motion.div
                style={{
                  position: "absolute",
                  x: translateX,
                  y: translateY,
                  zIndex: child.props.style?.zIndex || "auto",
                  transform: `translate(-50%, -50%)`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 150,
                  mass: 1
                }}
                className={child.props.className}
              >
                {child.props.children}
              </motion.div>
            )
          }
          return child
        })}
    </div>
  )
}

export default Floating