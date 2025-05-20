import React from "react"

export function KidsDrawingImage() {
  return (
    <div className="relative w-full h-full min-h-[600px] bg-black flex items-center justify-center p-4">
      <div 
        className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundImage: "url('/kids-drawing.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          height: "100%",
          minHeight: "500px"
        }}
      />
    </div>
  )
}