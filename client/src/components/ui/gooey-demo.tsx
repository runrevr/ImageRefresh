import { useScreenSize } from "@/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { GooeyFilter } from "@/components/ui/gooey-filter"

function GooeyDemo() {
  const screenSize = useScreenSize()

  return (
    <div 
      className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center gap-8 bg-black text-center text-pretty overflow-hidden"
      style={{
        backgroundImage: "url('https://i.ibb.co/LdvHQVD/kids-drawing-converted.png')",
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
      }}
    >

      <GooeyFilter id="gooey-filter-pixel-trail" strength={5} />

      <div
        className="absolute inset-0 z-0"
        style={{ filter: "url(#gooey-filter-pixel-trail)" }}
      >
        <PixelTrail
          pixelSize={screenSize.lessThan(`md`) ? 24 : 32}
          fadeDuration={0}
          delay={500}
          pixelClassName="bg-white"
        />
      </div>

      <p className="text-white text-6xl md:text-7xl z-10 font-bungee w-4/5 md:w-3/4 lg:w-2/3 mx-auto mt-20">
        Convert your child's drawings into real life characters
      </p>
    </div>
  )
}

export { GooeyDemo }