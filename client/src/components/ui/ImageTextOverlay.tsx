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
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <img 
        src={imageUrl} 
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay to improve text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Text */}
        <div className="text-center p-8 max-w-3xl mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-12">
            {heading}
          </h1>
          
          {/* Button */}
          <Link 
            to={buttonLink}
            className="inline-block px-8 py-4 mt-8 bg-white text-black font-bold rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}

export { ImageTextOverlay };