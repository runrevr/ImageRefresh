"use client"

import { ScrollVelocity } from "@/components/ui/scroll-velocity"

// Feature showcases for the scrolling demo with images from our assets
// Import images using the @ notation for proper Vite handling
import agingImage from "@assets/aging.png"
import bearAfterImage from "@assets/bear after.png"
import pixarImage from "@assets/pixar us.png"
import mexicanFoodImage from "@assets/Mexican Food.png"
import ghibliStyleImage from "@assets/Ghibli Style.png"
import headphonesImage from "@assets/headphones.png"
import renaissanceImage from "@assets/Renaissance.png"
import eightiesImage from "@assets/80s.png"
import marioImage from "@assets/mario.png"
import dogCatDrawingImage from "@assets/dog and cat.png"
import westernImage from "@assets/Western.png"

const features = [
  { 
    title: "Aging Transformations", 
    image: agingImage
  },
  { 
    title: "Character Art", 
    image: bearAfterImage
  },
  { 
    title: "Cartoon Effects", 
    image: pixarImage
  },
  { 
    title: "Restaurant", 
    image: mexicanFoodImage
  },
  { 
    title: "Ghibli Style", 
    image: ghibliStyleImage
  },
  { 
    title: "Scroll Stopping", 
    image: headphonesImage
  },
  { 
    title: "Renaissance Art", 
    image: renaissanceImage
  },
  { 
    title: "1980's", 
    image: eightiesImage
  },
  { 
    title: "Game Characters", 
    image: marioImage
  },
  { 
    title: "Pet Transformations", 
    image: dogCatDrawingImage
  },
  { 
    title: "Old Western", 
    image: westernImage
  },
  { 
    title: "Lego", 
    image: new URL('@assets/Lego.png', import.meta.url).href
  },
  // 5 additional categories
  { 
    title: "Anime Style", 
    image: new URL('@assets/Trump Mullet.png', import.meta.url).href
  },
  { 
    title: "Cyberpunk", 
    image: new URL('@assets/TK TS baby.jpg', import.meta.url).href 
  },
  { 
    title: "Watercolor", 
    image: new URL('@assets/shampoo-bottle5.jpg', import.meta.url).href
  },
  { 
    title: "Pop Art", 
    image: new URL('@assets/20250428_1834_Oil Painting Transformation_remix_01jszjstc3efatce04n29h4gv4.png', import.meta.url).href
  },
  { 
    title: "Fantasy Characters", 
    image: new URL('@assets/Alicorn.jpg', import.meta.url).href
  }
]

const velocity = [3, -3]

function ScrollVelocityDemo() {
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-12 py-20">
        {velocity.map((v, index) => (
          <ScrollVelocity key={index} velocity={v} className="my-6">
            {features.map(({ title, image }) => (
              <div
                key={title}
                className="relative h-[6rem] w-[9rem] md:h-[8rem] md:w-[12rem] xl:h-[12rem] xl:w-[18rem] rounded-lg overflow-hidden shadow-lg m-2"
              >
                <img 
                  src={image} 
                  alt={title}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="text-white font-bold text-center p-3 w-full text-sm md:text-base">
                    {title}
                  </div>
                </div>
              </div>
            ))}
          </ScrollVelocity>
        ))}
        <ScrollVelocity velocity={2} className="text-[#FF7B54] mt-8">
          TRANSFORM YOUR IMAGES • CREATE MAGIC • UNLIMITED POSSIBILITIES • EASY TO USE •
        </ScrollVelocity>
      </div>
    </div>
  )
}

export { ScrollVelocityDemo }