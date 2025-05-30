import React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
import dinoHorseImage from "@/assets/dino-horse.webp";
import shampooBottle1 from "@/assets/shampoo-1.jpg";
import shampooBottle2 from "@/assets/shampoo-2.png";
import shampooBottle3 from "@/assets/shampoo-3.png";
import shampooBottle4 from "@/assets/shampoo-4.png";
import shampooBottle5 from "@/assets/sunset-shampoo.jpg";
import minecraftImage from "@assets/Minecraft.png";
import mulletImage from "@assets/Trump Mullet.png";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Link } from "wouter";
// @ts-ignore - cobe doesn't have types
import createGlobe from "cobe";

export function FeaturesSectionWithBentoGrid() {
  const features = [
    {
      title: "Turn Ordinary Images Into Extraordinary Creations",
      description:
        "Upload any photo and watch our AI transform it into funny clips, superhero portraits, or professional product shots—all with just one click.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Sell More With Stunning Product Photos",
      description:
        "Small business owners save thousands on photography. Our AI analyzes your product and industry to create scroll-stopping images that convert browsers into buyers.",
      skeleton: <SkeletonTwo />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b dark:border-neutral-800",
    },
    {
      title: "Unleash Your Imagination",
      description:
        "Turn family photos into coloring books, transform selfies into animated clips, or redesign product images with unlimited creative possibilities—no design skills needed.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-r dark:border-neutral-800",
    },
    {
      title: "Turn Your Little Ones Into Superheroes",
      description:
        "Create magical memories by transforming your children's photos into Minecraft characters, LEGO figurines, Super Mario Bros adventures, superheroes, Pixar-style animations and more—making them the stars of their own favorite universes.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 md:col-span-3 lg:col-span-3 border-b md:border-none",
    },
  ];
  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-white">
          Transform Any Photo Into Something Magical
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-gray-300 text-center font-normal">
          From professional product shots to turning your kids into their favorite characters, our AI tools bring your images to life in ways you never thought possible.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 mt-12 xl:border border-neutral-800 rounded-md max-w-[80%] mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-2 sm:p-4 relative overflow-hidden w-full lg:w-[90%] xl:w-[85%] mx-auto`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-gray-300 text-center font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
  return (
    <div className="relative flex flex-col py-8 px-2 gap-10 h-full">
      <div className="w-full p-5 mx-auto bg-white shadow-2xl group">
        <img
          src={dinoHorseImage}
          alt="Dinosaur-Horse Hybrid"
          className="w-full aspect-square object-contain rounded-sm"
        />
      </div>
      
      <div className="flex justify-center mt-2 relative z-30">
        <Link to="/upload">
          <RainbowButton>Let's Make Magic</RainbowButton>
        </Link>
      </div>

      <div className="absolute bottom-0 z-20 inset-x-0 h-40 bg-gradient-to-t from-white dark:from-black via-white dark:via-black to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-20 inset-x-0 h-40 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex flex-col gap-10 h-full">
      <div className="w-full mx-auto bg-white shadow-xl rounded-sm">
        <img
          src={mulletImage}
          alt="Person with a mullet hairstyle"
          className="w-full aspect-square object-cover object-center rounded-sm"
        />
      </div>
      
      <div className="flex justify-center mt-2 relative z-30">
        <Link to="/upload">
          <RainbowButton>Create Something Epic</RainbowButton>
        </Link>
      </div>
    </div>
  );
};

export const SkeletonTwo = () => {
  // Use different shampoo bottle images for visual variety
  const shampooImages = [
    shampooBottle1,
    shampooBottle2, 
    shampooBottle3,
    shampooBottle4,
    shampooBottle5
  ];

  const imageVariants = {
    whileHover: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.1,
      rotate: 0,
      zIndex: 100,
    },
  };
  
  return (
    <div className="relative flex flex-col items-start p-8 gap-10 h-full overflow-hidden">
      <div className="flex flex-row -ml-20">
        {shampooImages.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt={`Shampoo bottle ${idx + 1}`}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {[...shampooImages].reverse().map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt={`Shampoo bottle ${idx + 1}`}
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover flex-shrink-0"
            />
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center w-full mt-2 relative z-30">
        <Link to="/product-image-lab">
          <RainbowButton>Product Image Lab</RainbowButton>
        </Link>
      </div>

      <div className="absolute left-0 z-20 inset-y-0 w-20 bg-gradient-to-r from-white dark:from-black to-transparent h-full pointer-events-none" />
      <div className="absolute right-0 z-20 inset-y-0 w-20 bg-gradient-to-l from-white dark:from-black to-transparent h-full pointer-events-none" />
    </div>
  );
};

export const SkeletonFour = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-6">
      <div className="w-full bg-white dark:bg-neutral-900 shadow-xl rounded-xl p-2">
        <img 
          src={minecraftImage}
          alt="Minecraft character named Bobby"
          className="w-full object-cover rounded-lg"
          style={{ maxHeight: "280px" }}
        />
      </div>
      <div className="relative z-30 mt-4">
        <Link to="/upload">
          <RainbowButton>Start Kids Fun</RainbowButton>
        </Link>
      </div>
    </div>
  );
};