"use client"

import { ScrollVelocity } from "@/components/ui/scroll-velocity"

// Feature showcases for the scrolling demo with images from our assets
// Import images directly from assets folder
import agingImage from "../../assets/aging.png"
import bearAfterImage from "../../assets/bear-after.png"
import pixarImage from "../../assets/pixar us.png"
import mexicanFoodImage from "../../assets/Mexican Food.png"
import ghibliStyleImage from "../../assets/Ghibli Style.png"
import headphonesImage from "../../assets/headphones.png"
import renaissanceImage from "../../assets/Renaissance.png"
import eightiesImage from "../../assets/80s.png"
import marioImage from "../../assets/mario.png"
import dogCatDrawingImage from "../../assets/dog-and-cat-drawing.png"
import westernImage from "../../assets/Western.png"
import legoImage from "../../assets/Lego.png"
import animeImage from "../../assets/trump-mullet.png"
import cyberpunkImage from "../../assets/tk-ts-baby.jpg"
import watercolorImage from "../../assets/sunset-shampoo.jpg"
import popArtImage from "../../assets/Disco.png"
import fantasyImage from "../../assets/alicorn-drawing.jpg"

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
    image: legoImage
  },
  // 5 additional categories
  { 
    title: "Anime Style", 
    image: animeImage
  },
  { 
    title: "Cyberpunk", 
    image: cyberpunkImage
  },
  { 
    title: "Watercolor", 
    image: watercolorImage
  },
  { 
    title: "Pop Art", 
    image: popArtImage
  },
  { 
    title: "Fantasy Characters", 
    image: fantasyImage
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