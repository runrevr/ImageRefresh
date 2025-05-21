import React from "react";
// Using wouter for routing in this project
import { Link } from "wouter";

interface ImageTextOverlayProps {
  imageUrl?: string;
  heading?: string;
  buttonText?: string;
  buttonLink?: string;
}

function ImageTextOverlay({
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
  heading = "Speaking things into existence",
  buttonText = "Get Started",
  buttonLink = "/get-started"
}: ImageTextOverlayProps) {
  return (
    <div className="relative w-full py-32 overflow-hidden bg-gradient-to-b from-purple-900 to-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Image Container */}
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <img 
                src={imageUrl} 
                alt="Kids Drawing Transformation"
                className="w-full"
                onError={(e) => {
                  console.error("Error loading image:", imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Content Container */}
          <div className="md:w-1/2 md:pl-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heading}
            </h1>
            <p className="text-xl text-purple-200 mb-10">
              Our AI transforms your child's imagination into stunning visual creations they'll love!
            </p>
            <Link 
              to={buttonLink}
              className="inline-block px-8 py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ImageTextOverlay };