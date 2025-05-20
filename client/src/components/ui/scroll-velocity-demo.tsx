"use client"

import { ScrollVelocity } from "@/components/ui/scroll-velocity"

// Define relative paths to assets
const mulletImage = '../../assets/Trump Mullet.png'
const minecraftImage = '../../assets/Minecraft.png'
const imageRefreshLogo = '../../assets/image_1747768935300.png'
const ghibliImage = '../../assets/image_1747770172166.png'
const cartoonsImage = '../../assets/image_1747772845891.png'
const bearImage = '../../assets/image_1747772928802.png'
const catsImage = '../../assets/image_1747773056439.png'
const robotImage = '../../assets/image_1747773067533.png'

const images = [
  {
    title: "Mullet Transformation",
    thumbnail: mulletImage,
  },
  {
    title: "Minecraft Character",
    thumbnail: minecraftImage,
  },
  {
    title: "Image Refresh",
    thumbnail: imageRefreshLogo,
  },
  {
    title: "Ghibli Style",
    thumbnail: ghibliImage,
  },
  {
    title: "Cartoon Effects",
    thumbnail: cartoonsImage,
  },
  {
    title: "Bear Transformation",
    thumbnail: bearImage,
  },
  {
    title: "Cat Friends",
    thumbnail: catsImage,
  },
  {
    title: "Robot Style",
    thumbnail: robotImage,
  },
]

const velocity = [3, -3]

function ScrollVelocityDemo() {
  return (
    <div className="w-full">
      <div className="flex flex-col space-y-12 py-20">
        {velocity.map((v, index) => (
          <ScrollVelocity key={index} velocity={v} className="my-6">
            {images.map(({ title, thumbnail }) => (
              <div
                key={title}
                className="relative h-[6rem] w-[9rem] md:h-[8rem] md:w-[12rem] xl:h-[12rem] xl:w-[18rem] rounded-lg overflow-hidden"
              >
                <img
                  src={thumbnail}
                  alt={title}
                  className="h-full w-full object-cover object-center"
                />
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