export function ChildDrawingSection() {
  // Direct reference to the before/after child drawing transformation
  const childDrawingImage = "https://i.imgur.com/YwZB5qA.png";

  return (
    <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center gap-8 bg-black text-center overflow-hidden py-16">
      <div className="w-4/5 max-w-3xl mx-auto">
        <img 
          src={childDrawingImage}
          alt="Child's drawing transformed into 3D character"
          className="w-full h-auto rounded-lg shadow-2xl" 
        />
      </div>
      
      <p className="text-white text-5xl md:text-6xl lg:text-7xl font-bungee w-4/5 md:w-3/4 lg:w-2/3 mx-auto mt-10">
        Convert your child's drawings into real life characters
      </p>
    </div>
  )
}