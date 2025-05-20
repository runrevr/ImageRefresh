import { useEffect, useRef } from "react"
import { LayoutGroup, motion } from "framer-motion"
import { TextRotate, TextRotateRef } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

// Import some example images from the assets folder
import bearReal from "@/assets/bear-real.png"
import bearAfter from "@/assets/bear-after.png"
import giraffeReal from "@/assets/giraffe-real.png"
import giraffeDrawing from "@/assets/giraffe-drawing.png"
import dogCatReal from "@/assets/dog-and-cat-real.png"
import dogCatDrawing from "@/assets/dog-and-cat-drawing.png"
import logo from "@/assets/logo.png"

const exampleImages = [
  {
    url: bearReal,
    title: "Original Bear Photo",
  },
  {
    url: bearAfter,
    title: "Transformed Bear Image",
  },
  {
    url: giraffeReal,
    title: "Original Giraffe Photo",
  },
  {
    url: giraffeDrawing,
    title: "Transformed Giraffe Drawing",
  },
  {
    url: dogCatReal,
    title: "Original Dog and Cat Photo",
  },
  {
    url: dogCatDrawing,
    title: "Transformed Dog and Cat Drawing",
  },
];

function DemoPage() {
  const textRotateRef = useRef<TextRotateRef>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section with Parallax Effect */}
      <section className="w-full h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background with Floating Images */}
        <div className="absolute inset-0 w-full h-full">
          <Floating sensitivity={0.5} className="h-full w-full">
            <FloatingElement
              depth={0.5}
              className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]"
            >
              <motion.img
                src={exampleImages[0].url}
                alt={exampleImages[0].title}
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[8%] right-[10%] md:top-[10%] md:right-[15%]"
            >
              <motion.img
                src={exampleImages[1].url}
                alt={exampleImages[1].title}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-3 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1.5}
              className="bottom-[15%] left-[10%] md:bottom-[25%] md:left-[15%]"
            >
              <motion.img
                src={exampleImages[2].url}
                alt={exampleImages[2].title}
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-6 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={2}
              className="bottom-[10%] right-[5%] md:bottom-[15%] md:right-[10%]"
            >
              <motion.img
                src={exampleImages[3].url}
                alt={exampleImages[3].title}
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-6 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              />
            </FloatingElement>
          </Floating>
        </div>

        {/* Center Content - Now fully centered and with proper z-index */}
        <motion.div 
          className="z-20 w-full max-w-4xl mx-auto px-6 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <img src={logo} alt="Logo" className="h-12 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Transform Images with{" "}
            <TextRotate
              texts={[
                "AI",
                "Creativity",
                "Magic",
                "Intelligence",
                "Precision",
              ]}
              rotationInterval={2000}
              staggerDuration={0.03}
              initial={{ y: "50%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              mainClassName="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 font-bold"
            />
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Our AI-powered platform transforms your images into stunning works of art with just a few clicks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/home">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Try it Now
              </Button>
            </Link>
            <Link href="/transformations">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10">
                View Examples
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Demo Text Rotation Section */}
      <section className="py-20 px-4 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Animation Showcase</h2>
          
          <div className="mb-12 p-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md shadow-xl">
            <h3 className="text-xl mb-6">Text Rotation Component</h3>
            <div className="text-2xl md:text-3xl font-bold mb-6 h-12">
              <TextRotate
                ref={textRotateRef}
                texts={[
                  "Staggered character animations",
                  "Simple text rotation",
                  "Customizable transitions",
                  "Multiple animation modes",
                  "Interactive controls",
                ]}
                rotationInterval={3000}
                staggerDuration={0.05}
                staggerFrom="center"
                mainClassName="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
              />
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => textRotateRef.current?.previous()}
              >
                Previous
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => textRotateRef.current?.next()}
              >
                Next
              </Button>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => textRotateRef.current?.reset()}
              >
                Reset
              </Button>
            </div>
          </div>
          
          <div className="p-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md shadow-xl">
            <h3 className="text-xl mb-6">Parallax Floating Images</h3>
            <p className="text-gray-300 mb-6">
              Move your mouse around to see the parallax effect in action.
              Each image floats at a different depth, creating a sense of dimension.
            </p>
            
            <div className="relative h-60 w-full max-w-lg mx-auto">
              <Floating sensitivity={1} className="h-full w-full rounded-lg bg-gray-950/30">
                <FloatingElement depth={0.5} className="top-[20%] left-[20%]">
                  <img 
                    src={exampleImages[4].url} 
                    alt={exampleImages[4].title}
                    className="w-20 h-20 object-cover rounded-lg shadow-lg"
                  />
                </FloatingElement>
                <FloatingElement depth={1.2} className="top-[50%] left-[50%]">
                  <img 
                    src={exampleImages[5].url} 
                    alt={exampleImages[5].title}
                    className="w-24 h-24 object-cover rounded-lg shadow-lg"
                  />
                </FloatingElement>
                <FloatingElement depth={2} className="bottom-[20%] right-[20%]">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg shadow-lg">
                    <span className="text-sm font-medium">Depth: 2.0</span>
                  </div>
                </FloatingElement>
              </Floating>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DemoPage;