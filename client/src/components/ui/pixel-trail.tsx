import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"

interface PixelTrailProps {
  pixelSize?: number
  maxPixels?: number
  fadeDuration?: number
  delay?: number
  pixelClassName?: string
}

export function PixelTrail({
  pixelSize = 20,
  maxPixels = 30,
  fadeDuration = 500,
  delay = 50,
  pixelClassName = "bg-blue-500"
}: PixelTrailProps) {
  const [pixels, setPixels] = useState<Array<{ id: number; x: number; y: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const pixelCounter = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set a new timeout
        timeoutRef.current = setTimeout(() => {
          pixelCounter.current += 1
          setPixels((prev) => {
            const newPixels = [...prev, { id: pixelCounter.current, x, y }]
            // Only keep the most recent pixels up to maxPixels
            return newPixels.slice(-maxPixels)
          })
        }, delay)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [delay, maxPixels])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {pixels.map((pixel) => (
        <motion.div
          key={pixel.id}
          className={`absolute rounded-full ${pixelClassName}`}
          style={{
            width: pixelSize,
            height: pixelSize,
            top: pixel.y - pixelSize / 2,
            left: pixel.x - pixelSize / 2,
          }}
          initial={{ opacity: 1, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: fadeDuration / 1000 }}
          onAnimationComplete={() => {
            setPixels((prev) => prev.filter((p) => p.id !== pixel.id))
          }}
        />
      ))}
    </div>
  )
}