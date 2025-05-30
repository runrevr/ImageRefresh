import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  className = ""
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className={`bg-white rounded-2xl p-8 shadow-lg ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">See the Transformation</h3>
      </div>

      <div className="flex items-center gap-8">
        {/* Before/After Comparison */}
        <div className="flex-1">
          <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize bg-gray-100"
            onMouseDown={handleMouseDown}
          >
            {/* Before Image */}
            <div className="absolute inset-0">
              <img
                src={beforeImage}
                alt="Before"
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Before Label */}
              <div className="absolute top-4 left-4">
                <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  BEFORE
                </span>
              </div>
            </div>

            {/* After Image */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={afterImage}
                alt="After"
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* After Label */}
              <div className="absolute top-4 right-4">
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  AFTER
                </span>
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%` }}
            />

            {/* Slider Handle */}
            <div
              className="absolute top-1/2 w-12 h-12 bg-white rounded-full shadow-lg border-4 border-gray-200 cursor-ew-resize transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center hover:border-blue-400 transition-colors"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="flex gap-0.5">
                <div className="w-0.5 h-4 bg-gray-400"></div>
                <div className="w-0.5 h-4 bg-gray-400"></div>
              </div>
            </div>

            {/* VS Indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-gray-200 pointer-events-none">
              <span className="text-gray-600 font-bold text-sm">VS</span>
            </div>
          </div>
        </div>

        {/* Feature Callouts */}
        <div className="w-64 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="text-orange-500 text-lg">✨</div>
            <span className="text-gray-700 font-medium">Enhanced Lighting</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
            <div className="text-pink-500 text-lg">🎨</div>
            <span className="text-gray-700 font-medium">Vibrant Colors</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-blue-500 text-lg">🔍</div>
            <span className="text-gray-700 font-medium">Sharper Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;