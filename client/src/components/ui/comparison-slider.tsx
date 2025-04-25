import * as React from "react";
import { cn } from "@/lib/utils";

interface ComparisonSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  before: React.ReactNode;
  after: React.ReactNode;
}

export const ComparisonSlider = React.forwardRef<
  HTMLDivElement,
  ComparisonSliderProps
>(({ before, after, className, ...props }, ref) => {
  const [position, setPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    },
    [isDragging]
  );

  const handleTouchMove = React.useCallback(
    (event: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const touch = event.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
      setPosition((x / rect.width) * 100);
    },
    [isDragging]
  );

  const handleDragStart = React.useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="absolute inset-0 z-10">{before}</div>
      <div
        className="absolute inset-0 z-20"
        style={{
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        {after}
      </div>
      <div
        className="absolute inset-y-0 z-30 w-1 bg-white cursor-ew-resize"
        style={{
          left: `calc(${position}% - 0.5px)`,
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      />
      <div
        className="absolute z-40 flex items-center justify-center w-8 h-8 -ml-4 -mt-4 bg-white rounded-full cursor-ew-resize shadow-lg"
        style={{
          left: `${position}%`,
          top: '50%',
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <path d="m9 18 6-6-6-6" />
          <path d="m15 18-6-6 6-6" />
        </svg>
      </div>
    </div>
  );
});