"use client"

import { ScrollVelocity } from "@/components/ui/scroll-velocity"

// Feature showcases for the scrolling demo with images from our assets
const features = [
  { 
    title: "Aging Transformations", 
    image: "/src/assets/aging.png"
  },
  { 
    title: "Character Art", 
    image: "/src/assets/bear-after.png"
  },
  { 
    title: "Cartoon Effects", 
    image: "/src/assets/ghibli.png"
  },
  { 
    title: "Ghibli Style", 
    image: "/src/assets/lego-character.png"
  },
  { 
    title: "Renaissance Art", 
    image: "/src/assets/Renaissance.png"
  },
  { 
    title: "Game Characters", 
    image: "/src/assets/trump-mullet.png"
  },
  { 
    title: "Pet Transformations", 
    image: "/src/assets/dog-and-cat-drawing.png"
  },
  { 
    title: "Sci-Fi Style", 
    image: "/src/assets/Western.png"
  },
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
        <ScrollVelocity velocity={5} className="text-[#FF7B54] mt-8">
          TRANSFORM YOUR IMAGES • CREATE MAGIC • UNLIMITED POSSIBILITIES • EASY TO USE •
        </ScrollVelocity>
      </div>
    </div>
  )
}

export { ScrollVelocityDemo }