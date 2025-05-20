
export function ChildDrawingSection() {
  return (
    <div className="relative w-full min-h-[500px] flex flex-col items-center justify-center gap-8 bg-black text-center overflow-hidden py-16">
      {/* Simple single image display */}
      <div className="w-4/5 max-w-3xl mx-auto">
        <img 
          src="/images/kids-drawing-converted.png"
          alt="Child's drawing transformed into 3D character"
          className="w-full h-auto object-contain rounded-md" 
        />
      </div>
      
      <p className="text-white text-5xl md:text-6xl lg:text-7xl font-bungee w-4/5 md:w-3/4 lg:w-2/3 mx-auto mt-10">
        CONVERT YOUR CHILD'S DRAWINGS
      </p>
    </div>
  )
}
