
import { Button } from "../ui/button";

export function ChildDrawingSection() {
  return (
    <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center gap-8 text-center overflow-hidden py-16">
      {/* Background container with before/after images */}
      <div className="w-4/5 max-w-4xl mx-auto relative">
        {/* Display the before/after images side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <img 
              src="/images/kids-drawing-converted.png"
              alt="Child's drawing"
              className="w-full h-auto object-contain mb-2" 
            />
            <p className="text-white text-sm">Original Drawing</p>
          </div>
          <div className="flex flex-col items-center">
            <img 
              src="/images/kids-drawing-converted.png"
              alt="Transformed drawing"
              className="w-full h-auto object-contain mb-2" 
            />
            <p className="text-white text-sm">Transformed Result</p>
          </div>
        </div>
      </div>
      
      <p className="text-white text-5xl md:text-6xl lg:text-7xl font-bungee w-4/5 md:w-3/4 lg:w-2/3 mx-auto mt-10">
        CONVERT YOUR CHILD'S DRAWINGS
      </p>
    </div>
  )
}
