import { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function ComparisonSlider({ beforeImage, afterImage }: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    let newPosition = ((clientX - rect.left) / rect.width) * 100;
    
    // Clamp position between 0 and 100
    newPosition = Math.min(100, Math.max(0, newPosition));
    setPosition(newPosition);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Add event listeners
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
    }

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div 
      ref={sliderRef}
      className="relative w-full h-full cursor-ew-resize"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After Image (Transformed) */}
      <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
        <img 
          src={afterImage} 
          className="max-w-full max-h-full object-contain" 
          alt="Transformed image" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-3 text-white text-center">
          <p className="font-medium text-sm md:text-base">Transformed Image</p>
        </div>
      </div>
      
      {/* Before Image (Original) with clip path */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
      >
        <img 
          src={beforeImage} 
          className="max-w-full max-h-full object-contain" 
          alt="Original image" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-3 text-white text-center">
          <p className="font-medium text-sm md:text-base">Original Image</p>
        </div>
      </div>
      
      {/* Slider Control */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="flex items-center">
            {/* Left Arrow */}
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
              <path d="M7.41 10.59L2.83 6L7.41 1.41L6 0L0 6L6 12L7.41 10.59Z" fill="#666666"/>
            </svg>
            {/* Right Arrow */}
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
              <path d="M0.59 10.59L5.17 6L0.59 1.41L2 0L8 6L2 12L0.59 10.59Z" fill="#666666"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
