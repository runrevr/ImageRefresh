import { useScreenSize } from "@/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { GooeyFilter } from "@/components/ui/gooey-filter"

function GooeyDemo() {
  const screenSize = useScreenSize()

  return (
    <div className="relative w-full min-h-[700px] flex flex-col items-center justify-center py-16 bg-black text-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-[#111] p-8 rounded-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bungee text-blue-400 mb-4">Kid's Drawing</h3>
              <div className="w-full aspect-square bg-[#222] rounded-xl overflow-hidden">
                <img 
                  src="https://i.ibb.co/SVQ4cK7/kid-drawing.jpg" 
                  alt="Child's drawing" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bungee text-orange-400 mb-4">AI Generated</h3>
              <div className="w-full aspect-square bg-[#222] rounded-xl overflow-hidden">
                <img 
                  src="https://i.ibb.co/hZDgf5F/kid-drawing-3d.jpg" 
                  alt="AI generated 3D character" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bungee text-white mt-12 leading-tight">
            Convert your child's drawings into real life characters
          </h2>
          
          <div className="mt-8 relative">
            <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />
            <div
              className="h-20 z-0"
              style={{ filter: "url(#gooey-filter-pixel-trail)" }}
            >
              <PixelTrail
                pixelSize={screenSize.lessThan(`md`) ? 16 : 24}
                fadeDuration={0}
                delay={300}
                pixelClassName="bg-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GooeyDemo }