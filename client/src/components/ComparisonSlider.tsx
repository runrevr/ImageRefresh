import { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function ComparisonSlider({ beforeImage, afterImage }: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number, elementRef: React.RefObject<HTMLDivElement>) => {
    if (!isDragging || !elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
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

  // Toggle fullscreen mode
  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle image click to open fullscreen
  const handleImageClick = (e: React.MouseEvent) => {
    // Only open fullscreen on click if not dragging
    if (!isDragging) {
      setIsFullscreen(true);
    }
  };

  // Close fullscreen on escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, isFullscreen ? fullscreenRef : sliderRef);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, isFullscreen ? fullscreenRef : sliderRef);
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

    // Add escape key listener for fullscreen mode
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, isFullscreen]);

  // Render slider component
  const renderSlider = (ref: React.RefObject<HTMLDivElement>, isFullscreenView: boolean = false) => (
    <div 
      ref={ref}
      className={`relative w-full h-full cursor-ew-resize border border-gray-200 ${isFullscreenView ? 'rounded-lg overflow-hidden' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={!isFullscreenView ? handleImageClick : undefined}
    >
      {/* After Image (Transformed) */}
      <div className={`absolute inset-0 ${isFullscreenView ? 'bg-gray-900' : 'bg-gray-100'} flex flex-col items-center justify-center`}>
        <img 
          src={afterImage} 
          className="max-w-full max-h-full object-contain" 
          alt="Transformed image" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-3 text-white text-center">
          <p className={`font-medium ${isFullscreenView ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>Transformed Image</p>
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
          <p className={`font-medium ${isFullscreenView ? 'text-base md:text-lg' : 'text-sm md:text-base'}`}>Original Image</p>
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

      {/* Expand/Collapse Icon with hint */}
      {!isFullscreenView && (
        <div className="absolute top-2 right-2 z-10 flex items-center">
          <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-lg mr-2 hidden sm:block">
            Click image to view larger
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 bg-black bg-opacity-70 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all shadow-lg hover:scale-105 transform"
            aria-label="View fullscreen"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 15V18C3 19.1 3.9 20 5 20H8M21 9V6C21 4.9 20.1 4 19 4H16M3 9V6C3 4.9 3.9 4 5 4H8M21 15V18C21 19.1 20.1 20 19 20H16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Normal View */}
      {renderSlider(sliderRef)}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full h-[80vh]">
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute -top-12 right-0 w-12 h-12 bg-black bg-opacity-70 rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all shadow-lg z-10"
              aria-label="Close fullscreen"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Side-by-side view instead of slider in fullscreen */}
            <div className="grid grid-cols-2 h-full gap-4 bg-black bg-opacity-50 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={beforeImage} 
                    className="max-w-full max-h-full object-contain" 
                    alt="Original image" 
                  />
                </div>
                <div className="bg-black bg-opacity-80 p-3 text-white text-center rounded-b-lg">
                  <p className="font-medium text-base md:text-lg">Original Image</p>
                </div>
              </div>
              
              <div className="flex flex-col h-full">
                <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={afterImage} 
                    className="max-w-full max-h-full object-contain" 
                    alt="Transformed image" 
                  />
                </div>
                <div className="bg-black bg-opacity-80 p-3 text-white text-center rounded-b-lg">
                  <p className="font-medium text-base md:text-lg">Transformed Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
