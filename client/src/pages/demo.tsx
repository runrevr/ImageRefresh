import { useRef } from "react"
import { motion } from "framer-motion"
import { TextRotate, TextRotateRef } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { FeaturesSectionWithBentoGrid } from "@/components/ui/feature-section-with-bento-grid"
import { ScrollVelocityDemo } from "@/components/ui/scroll-velocity-demo"
import { CreativePricingDemo } from "@/components/ui/creative-pricing-demo"
import { GooeyDemo } from "@/components/ui/gooey-demo"
import { Button } from "@/components/ui/button"
import { Link } from "wouter"

// Import some example images from the assets folder
import bearReal from "@/assets/bear-real.png"
import bearAfter from "@/assets/bear-after.png"
import giraffeReal from "@/assets/giraffe-real.png"
import giraffeDrawing from "@/assets/giraffe-drawing.png"
import dogCatReal from "@/assets/dog-and-cat-real.png"
import dogCatDrawing from "@/assets/dog-and-cat-drawing.png"

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
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Parallax Effect */}
      <section className="w-full h-screen relative flex items-center justify-center overflow-hidden">
        {/* Background with Floating Images */}
        <div className="absolute inset-0 w-full h-full">
          <Floating sensitivity={0.5} className="h-full w-full">
            <FloatingElement
              depth={0.8}
              className="top-[5%] left-[5%] md:top-[8%] md:left-[8%]"
            >
              <motion.img
                src={exampleImages[0].url}
                alt={exampleImages[0].title}
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-56 lg:h-56 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-3 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[5%] right-[5%] md:top-[8%] md:right-[8%]"
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
              className="bottom-[5%] left-[5%] md:bottom-[8%] md:left-[8%]"
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
              className="bottom-[5%] right-[5%] md:bottom-[8%] md:right-[8%]"
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

        {/* Center Content */}
        <motion.div 
          className="z-20 w-full max-w-4xl mx-auto px-6 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight text-[#333333]">
            Make your{" "}
            <br className="hidden sm:block" />
            pictures{" "}
            <TextRotate
              texts={[
                "amazing",
                "funny",
                "sell better",
                "exceptional",
                "magical",
              ]}
              rotationInterval={2000}
              staggerDuration={0.03}
              initial={{ y: "50%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              mainClassName="text-[#FF7B54] font-bold inline-block"
            />
          </h1>
          <p className="text-xl md:text-2xl text-[#333333] mb-12 max-w-3xl mx-auto leading-relaxed">
            Take your old photos and transform them into something magical in seconds with zero technical ability needed. First one's on us 🍻
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/home">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Try it Now
              </Button>
            </Link>
            <Link href="/transformations">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-[#333333] text-[#333333] hover:bg-[#333333]/5">
                View Examples
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
      
      {/* Features Bento Grid Section */}
      <section className="bg-black text-white py-10">
        <FeaturesSectionWithBentoGrid />
      </section>
      
      {/* Scroll Velocity Demo Section */}
      <section className="bg-white text-black">
        <ScrollVelocityDemo />
      </section>
      
      {/* Gooey Demo Section - Child Drawing Transformation */}
      <section className="bg-black">
        <GooeyDemo />
      </section>
      
      {/* Creative Pricing Section */}
      <section className="bg-white text-black py-20">
        <CreativePricingDemo />
      </section>
    </div>
  );
}

export default DemoPage;