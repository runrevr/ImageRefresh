import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import Navbar from "@/components/Navbar";
import GlobalFooter from "@/components/Footer"; // Import with a different name to avoid conflicts
import shampooOriginal from "@assets/shampoo 3.png"; // Keep original import for fallback
import shampooEnhanced from "@assets/shampoo 4.png";
import sweatshirtOriginal from "@assets/sweatshirt.png";
import sweatshirtEnhanced from "@assets/sweatshirt 2.png";
import nounouShampooImage from "@assets/51CItn4oOGL._SL1500_.jpg";

// Type definitions
type EnhancementOption = {
  key: string;
  name: string;
  description: string;
};

type ImageWithOptions = {
  id: number;
  originalPath: string;
  options: Record<string, EnhancementOption>;
  selectedOptions: Set<string>;
};

type EnhancementResult = {
  imageId: number;
  optionKey: string;
  optionName: string;
  resultImage1Path: string;
  resultImage2Path: string;
  description?: string;
};

// Top announcement banner
const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-secondary-500 text-white p-4 text-center font-medium">
      New: Transform your product photos with AI in seconds!
      <button className="underline ml-2">Try it now</button>
      <button 
        className="ml-4 font-bold focus:outline-none" 
        aria-label="Dismiss"
        onClick={() => setIsVisible(false)}
      >
        ✕
      </button>
    </div>
  );
};

// Header component with logo and navigation
const Header = () => {
  return (
    <header className="bg-white">
      <div className="container mx-auto p-6 flex items-center justify-between">
        <div className="text-2xl font-heading text-primary-600">ImageRefresh</div>
        <nav className="hidden md:flex space-x-6 font-medium">
          <a href="#features" className="hover:text-primary-600">Features</a>
          <a href="#showcase" className="hover:text-primary-600">Showcase</a>
          <a href="#demo" className="hover:text-primary-600">Demo</a>
          <a href="#faq" className="hover:text-primary-600">FAQ</a>
        </nav>
        <a href="#demo" className="bg-secondary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-secondary-600">Try It Free</a>
      </div>
    </header>
  );
};

// Hero section with main value proposition
const HeroSection = () => {
  return (
    <section className="container mx-auto text-center py-20">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-primary-600">
        Studio-quality product photos—no studio needed
      </h1>
      <p className="text-lg text-dark mb-8 max-w-2xl mx-auto">
        Use AI as your virtual photo studio: generate amazing visuals from simple snaps—perfect for your store, ads, and socials.
      </p>
      <a 
        href="#demo" 
        className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium hover:bg-primary-700 transition"
      >
        Upload Your Photo
      </a>
    </section>
  );
};

// Features section
const FeaturesSection = () => {
  return (
    <section id="features" className="bg-white py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-10">Your All-in-One AI Photo Studio</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Background Generation</h3>
            <p className="text-body">Create brand-aligned backgrounds instantly—no green screen required.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Lighting & Retouching</h3>
            <p className="text-body">Auto-enhance color, contrast, and clarity for a polished, professional look.</p>
          </div>
          <div className="text-center p-6 rounded-lg shadow-sm hover:shadow-md transition">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="font-bold text-xl mb-2 text-primary-700">Creative Prompts</h3>
            <p className="text-body">Get multiple scene ideas tailored to your product—pick your favorite and go!</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Showcase Before/After section
const ShowcaseSection = () => {
  return (
    <section id="showcase" className="py-16 bg-[#f8fafa]">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-8">See the Transformation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img 
              src={nounouShampooImage}
              alt="NOUNOU Shampoo Bottle" 
              className="w-full h-[400px] object-contain bg-white rounded-lg group-hover:scale-105 transition-transform duration-500" 
            />
            <span className="absolute top-2 left-2 bg-secondary-500 text-white px-2 py-1 text-sm rounded">Before</span>
          </div>
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={shampooEnhanced} alt="Enhanced NOUNOU Shampoo" className="w-full h-[400px] object-contain bg-white rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 text-sm rounded">After</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={sweatshirtOriginal} alt="Before" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-secondary-500 text-white px-2 py-1 text-sm rounded">Before</span>
          </div>
          <div className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
            <img src={sweatshirtEnhanced} alt="After" className="w-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" />
            <span className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 text-sm rounded">After</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// Demo 3-step section - This is where the actual upload functionality lives
const DemoSection = ({ 
  onImagesSelected, 
  isUploading, 
  onStartEnhancement, 
  onIndustryChange 
}: { 
  onImagesSelected: (files: File[]) => void, 
  isUploading: boolean,
  onStartEnhancement?: () => void,
  onIndustryChange?: (industry: string) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith("image/")
      );
      
      if (fileArray.length > 5) {
        alert("You can upload a maximum of 5 images at a time");
        return;
      }
      
      setUploadedFiles(fileArray);
      onImagesSelected(fileArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files).filter(
        file => file.type.startsWith("image/")
      );
      
      if (fileArray.length > 5) {
        alert("You can upload a maximum of 5 images at a time");
        return;
      }
      
      setUploadedFiles(fileArray);
      onImagesSelected(fileArray);
    }
  };

  const borderClass = dragging ? "border-primary-500" : "border-primary-200 hover:border-primary-400";

  return (
    <section id="demo" className="bg-white py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">Try It Now In 3 Steps</h2>
        
        <div className="flex flex-col md:flex-row items-stretch md:space-x-8 space-y-8 md:space-y-0">
          {/* Step 1 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-primary-600 text-white text-xl font-semibold rounded-full mx-auto mb-6">1</div>
            <h3 className="text-xl font-bold mb-3 text-primary-700">Upload Your Photos</h3>
            <p className="mb-6 text-gray-600">Drag & drop or click to select up to 5 product images.</p>
            <div 
              className={`border-2 border-dashed ${borderClass} rounded-lg p-6 text-center transition-all duration-200 mb-4`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="py-4">
                  <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-primary-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-primary-600">Uploading...</p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-gray-500">Drag & Drop Images Here</p>
                  <button 
                    className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Choose Files
                  </button>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={isUploading}
              />
            </div>
            {uploadedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg shadow-sm">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-0 right-0 bg-primary-600 text-white text-xs px-2 py-1 rounded-tl">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Step 2 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold rounded-full mx-auto mb-6">2</div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">Enter Your Industry</h3>
            <p className="mb-6 text-gray-600">Tell us your product category to get tailored enhancement options.</p>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm text-[#333333]"
                placeholder="e.g., Fashion, Food, Electronics..."
                onChange={(e) => onIndustryChange && onIndustryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onStartEnhancement && onStartEnhancement()}
              />
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="flex-1 p-8 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-semibold rounded-full mx-auto mb-6">3</div>
            <h3 className="text-xl font-bold mb-3 text-gray-700">Get Amazing Results</h3>
            <p className="mb-6 text-gray-600">Choose from AI-suggested enhancements tailored to your products.</p>
            <button 
              onClick={() => {
                console.log("Start Enhancement button clicked");
                if (uploadedFiles.length === 0) {
                  console.log("No files selected");
                }
                if (isUploading) {
                  console.log("Upload already in progress");
                }
                onStartEnhancement && onStartEnhancement();
              }}
              disabled={uploadedFiles.length === 0 || isUploading}
              className="bg-secondary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Start Enhancement</>
                )}
              </span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full hover:translate-y-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials section
const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"I saved $2,000 on a single shoot — and the results look even better than a professional studio!"</p>
            <footer className="font-medium text-primary-700">— Alex, Boutique Owner</footer>
          </blockquote>
          
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"As a one-person team, this tool is a game-changer. I can create professional product photos in minutes."</p>
            <footer className="font-medium text-primary-700">— Priya, E‑shop Manager</footer>
          </blockquote>
          
          <blockquote className="p-6 bg-primary-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 border-l-4 border-primary-500">
            <div className="text-primary-500 text-3xl mb-4">"</div>
            <p className="italic mb-6 text-gray-700">"Our conversion rate jumped 24% after we started using these AI-enhanced product images. Worth every penny!"</p>
            <footer className="font-medium text-primary-700">— Marco, Marketing Director</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

// Final CTA section
const FinalCTASection = () => {
  return (
    <section className="bg-primary-600 py-16 text-center text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Images?</h2>
        <p className="mb-6 text-lg max-w-xl mx-auto">Try it for free—no credit card required. Start enhancing your product photos today!</p>
        <a href="#demo" className="bg-secondary-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-secondary-600 transition-colors shadow-lg hover:shadow-xl">Get Started Now</a>
      </div>
    </section>
  );
};

// FAQ section
const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  
  const faqs = [
    {
      question: "Do I need professional equipment?",
      answer: "No—any clear photo from a smartphone works perfectly."
    },
    {
      question: "Can I use images commercially?",
      answer: "Yes—all generated images are yours to sell, advertise, and share."
    },
    {
      question: "Which products does it support?",
      answer: "Most physical products—fashion, electronics, decor, beauty, and more."
    },
    {
      question: "How much does it cost?",
      answer: "Plans start under $20/month. Start with a free trial—no card needed."
    }
  ];
  
  return (
    <section id="faq" className="py-16 bg-[#f8fafa]">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">Frequently Asked Questions</h2>
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button 
                className={`w-full p-4 text-left font-medium flex justify-between items-center ${openFAQ === index ? 'text-primary-600' : 'text-gray-700'}`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg">{faq.question}</span>
                <span className="text-xl h-7 w-7 flex items-center justify-center rounded-full bg-gray-100">
                  {openFAQ === index ? '−' : '+'}
                </span>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4 text-gray-600 animate-accordion-down border-t border-gray-100">
                  <p className="pt-2">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="font-bold text-2xl text-primary-300 mb-2">ImageRefresh</div>
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ImageRefresh. All rights reserved.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 text-center md:text-left">
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#demo" className="text-gray-400 hover:text-white transition">Demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2 text-gray-300">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Industry selector component
const IndustrySelector = ({ onIndustryChange, disabled }: { onIndustryChange: (industry: string) => void, disabled: boolean }) => {
  const industries = [
    "Fashion & Apparel",
    "Beauty & Cosmetics",
    "Home & Furniture",
    "Electronics",
    "Food & Beverage",
    "Jewelry & Accessories",
    "Sports & Outdoor",
    "Health & Wellness",
    "Toys & Children",
    "Pets",
    "Other"
  ];

  const [inputValue, setInputValue] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    if (inputValue.trim()) {
      onIndustryChange(inputValue.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onIndustryChange(inputValue.trim());
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <input
        type="text"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm bg-white text-[#333333]"
        placeholder="e.g., Fashion, Electronics, Food & Beverage..."
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <p className="text-center text-gray-500 mt-2 text-sm">Your industry helps us optimize enhancement suggestions for your products</p>
    </div>
  );
};

// Style selection component
const StyleSelectionSection = ({ 
  images, 
  onSelectOption, 
  onSubmitSelections,
  isLoading,
  maxSelectionsPerImage = 5
}: { 
  images: ImageWithOptions[]; 
  onSelectOption: (imageId: number, optionKey: string, selected: boolean) => void;
  onSubmitSelections: () => void;
  isLoading: boolean;
  maxSelectionsPerImage?: number;
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const currentImage = images[selectedImageIndex];
  
  const totalOptionsSelected = images.reduce((total, img) => total + img.selectedOptions.size, 0);
  const currentImageSelectionsCount = currentImage ? currentImage.selectedOptions.size : 0;
  
  const handleOptionClick = (optionKey: string) => {
    if (!currentImage) return;
    
    const isCurrentlySelected = currentImage.selectedOptions.has(optionKey);
    
    // If not selected and would exceed max, prevent
    if (!isCurrentlySelected && currentImageSelectionsCount >= maxSelectionsPerImage) {
      alert(`You can only select up to ${maxSelectionsPerImage} options per image`);
      return;
    }
    
    onSelectOption(currentImage.id, optionKey, !isCurrentlySelected);
  };
  
  const selectAllOptionsForCurrentImage = () => {
    if (!currentImage || !currentImage.options) return;
    
    // Get up to max options
    const optionKeys = Object.keys(currentImage.options).slice(0, maxSelectionsPerImage);
    
    // Select each option
    optionKeys.forEach(key => {
      if (!currentImage.selectedOptions.has(key)) {
        onSelectOption(currentImage.id, key, true);
      }
    });
  };
  
  console.log("StyleSelectionSection rendered with images:", images);
  
  if (images.length === 0) {
    console.log("No images available to display options");
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-primary-300 border-t-primary-600 rounded-full mx-auto mb-6"></div>
        <p className="text-gray-600">Loading enhancement options...</p>
      </div>
    );
  }
  
  return (
    <section className="container mx-auto mb-12 py-8">
      <h2 className="text-3xl font-bold text-center text-primary-600 mb-10">Choose Your Enhancement Styles</h2>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
        Select up to {maxSelectionsPerImage} AI-suggested enhancements for each of your images. 
        Each selection costs 1 credit.
      </p>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 text-gray-800 text-lg">Your Uploads</h3>
          <ul className="space-y-4">
            {images.map((image, index) => (
              <li 
                key={image.id} 
                className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                  selectedImageIndex === index 
                    ? 'bg-primary-50 border-l-4 border-primary-500 shadow-sm' 
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative group overflow-hidden rounded-lg w-16 h-16">
                    <img 
                      src={image.originalPath} 
                      alt={`Image ${index + 1}`} 
                      className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <p className="font-medium">Image {index + 1}</p>
                    <div className="flex items-center text-sm mt-1">
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            image.selectedOptions.size === 0 
                              ? 'bg-gray-300' 
                              : image.selectedOptions.size < maxSelectionsPerImage/2 
                                ? 'bg-primary-300' 
                                : 'bg-primary-500'
                          }`}
                          style={{ width: `${(image.selectedOptions.size / maxSelectionsPerImage) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-gray-500">
                        {image.selectedOptions.size}/{maxSelectionsPerImage}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
        
        <div className="lg:w-3/4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 text-lg">AI Style Suggestions</h3>
            <div className="flex items-center space-x-4">
              <button 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition"
                onClick={selectAllOptionsForCurrentImage}
              >
                Select All Styles
              </button>
              <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {currentImageSelectionsCount} of {maxSelectionsPerImage} selected
              </span>
            </div>
          </div>
          
          {currentImage && (
            <>
              <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0 text-primary-500 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-primary-700">
                      Each selection costs 1 credit. You can select up to {maxSelectionsPerImage} options per image.
                    </p>
                    <p className="text-sm mt-1 font-medium text-primary-800">
                      Total selected: {totalOptionsSelected} option{totalOptionsSelected !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {currentImage.options && Object.entries(currentImage.options).map(([key, option]) => {
                  const isSelected = currentImage.selectedOptions.has(key);
                  return (
                    <div 
                      key={key}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' 
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                      onClick={() => handleOptionClick(key)}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                            {option.name}
                          </h4>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary-500 text-white' 
                              : 'border-2 border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          <div className="mt-8 flex justify-center">
            <button
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm ${
                totalOptionsSelected === 0 || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow'
              }`}
              disabled={totalOptionsSelected === 0 || isLoading}
              onClick={onSubmitSelections}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Enhance My Images"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Results component
const ResultsSection = ({ results }: { results: EnhancementResult[] }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const qClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [processingImage, setProcessingImage] = useState<string | null>(null);

  if (results.length === 0) {
    return null;
  }

  const toggleImageSelection = (imagePath: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imagePath)) {
      newSelected.delete(imagePath);
    } else {
      newSelected.add(imagePath);
    }
    setSelectedImages(newSelected);
  };
  
  // Handle coloring book transformation
  const handleColoringBookTransform = async (imagePath: string) => {
    // Check if user has credits - default value of userCredits already handled by destructuring
    if (!user || (userCredits && userCredits.paidCredits <= 0 && userCredits.freeCreditsUsed)) {
      toast({
        title: "Not enough credits",
        description: "You need 1 credit to apply a coloring book transformation.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessingImage(imagePath);
      
      // Call the coloring book transformation API
      const response = await apiRequest("POST", "/api/product-enhancement/coloring-book", {
        imagePath: imagePath,
        userId: user?.id
      });
      
      // The apiRequest function will handle error responses
      
      const data = await response.json();
      
      if (data.transformedImagePath) {
        // Add the new image to selected images
        setSelectedImages(prev => {
          const newSelection = new Set(prev);
          newSelection.add(data.transformedImagePath);
          return newSelection;
        });
        
        // Show success notification
        toast({
          title: "Transformation Complete",
          description: "Coloring book transformation applied successfully!",
        });
        
        // Refresh user credits
        qClient.invalidateQueries({ queryKey: ['/api/user/credits'] });
      } else {
        throw new Error("No transformed image path returned");
      }
    } catch (error) {
      console.error("Coloring book transformation error:", error);
      toast({
        title: "Transformation Failed",
        description: error instanceof Error ? error.message : "Failed to apply coloring book transformation.",
        variant: "destructive",
      });
    } finally {
      setProcessingImage(null);
    }
  };

  const selectAllImages = () => {
    const allImagePaths = new Set<string>();
    results.forEach((result) => {
      allImagePaths.add(result.resultImage1Path);
      allImagePaths.add(result.resultImage2Path);
    });
    setSelectedImages(allImagePaths);
  };

  const downloadSelected = () => {
    // In a real application, we would implement proper downloading here
    // For now, we'll just show an alert
    alert(`Downloading ${selectedImages.size} selected images`);
    
    // Mock implementation: create a download for each selected image
    selectedImages.forEach((imagePath) => {
      const link = document.createElement('a');
      link.href = imagePath;
      link.download = imagePath.split('/').pop() || 'enhanced-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <section className="container mx-auto bg-white p-8 rounded-lg shadow-md mb-16">
      <h2 className="text-3xl font-bold mb-4 text-primary">Review & Select Your Favorites</h2>
      <div className="flex justify-end mb-4">
        <button 
          className="text-sm underline font-medium hover:text-primary transition"
          onClick={selectAllImages}
        >
          Select All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {results.flatMap((result, index) => [
          // First image
          <div key={`${index}-1`} className="relative border rounded-lg overflow-hidden p-2">
            <input 
              type="checkbox" 
              className="absolute top-2 left-2 w-5 h-5 accent-primary" 
              checked={selectedImages.has(result.resultImage1Path)}
              onChange={() => toggleImageSelection(result.resultImage1Path)}
            />
            <img
              src={result.resultImage1Path}
              alt={`Result ${index + 1} - Variation 1`}
              className="w-full h-48 object-cover rounded mt-2"
            />
            <div className="mt-2">
              <p className="font-medium text-sm">{result.optionName} - Variation 1</p>
              {result.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.description}
                </p>
              )}
              <button
                className="mt-3 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleColoringBookTransform(result.resultImage1Path)}
                disabled={processingImage === result.resultImage1Path}
              >
                {processingImage === result.resultImage1Path ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Coloring Book Style (1 credit)
                  </>
                )}
              </button>
            </div>
          </div>,
          // Second image
          <div key={`${index}-2`} className="relative border rounded-lg overflow-hidden p-2">
            <input 
              type="checkbox" 
              className="absolute top-2 left-2 w-5 h-5 accent-primary" 
              checked={selectedImages.has(result.resultImage2Path)}
              onChange={() => toggleImageSelection(result.resultImage2Path)}
            />
            <img
              src={result.resultImage2Path}
              alt={`Result ${index + 1} - Variation 2`}
              className="w-full h-48 object-cover rounded mt-2"
            />
            <div className="mt-2">
              <p className="font-medium text-sm">{result.optionName} - Variation 2</p>
              {result.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {result.description}
                </p>
              )}
              <button
                className="mt-3 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleColoringBookTransform(result.resultImage2Path)}
                disabled={processingImage === result.resultImage2Path}
              >
                {processingImage === result.resultImage2Path ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Coloring Book Style (1 credit)
                  </>
                )}
              </button>
            </div>
          </div>
        ])}
      </div>
      <button 
        className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={selectedImages.size === 0}
        onClick={downloadSelected}
      >
        Download Selected Images ({selectedImages.size})
      </button>
    </section>
  );
};

// Processing section (while waiting for enhancement results)
const ProcessingSection = ({ errorMessage }: { errorMessage?: string | null }) => {
  // Status steps for the multi-step progress indicator
  const steps = [
    "Analyzing your uploaded images...",
    "Connecting to enhancement service...",
    "Processing enhancement options...",
    "Generating AI-powered suggestions..."
  ];
  
  // If there's an error, show error state instead
  if (errorMessage) {
    return (
      <section className="fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center">
        <div className="container mx-auto text-center p-8 max-w-2xl">
          <div className="mx-auto max-w-lg bg-white border rounded-lg shadow-md p-8">
            <div className="text-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Enhancement Error</h2>
            <p className="mb-6 text-gray-700">{errorMessage}</p>
            <p className="text-gray-600 mb-6">
              The webhook service encountered an issue. Please try again with different images or check back later.
            </p>
            <button 
              className="bg-primary-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-700 transition" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }
  
  // Using useState to keep track of which step is active
  const [currentStep, setCurrentStep] = useState(0);
  
  // UseEffect for auto-advancing steps
  useEffect(() => {
    // If we reached the end, don't set another timer
    if (currentStep >= steps.length) return;
    
    // Set a timer to advance to the next step
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 5000);
    
    // Cleanup on unmount
    return () => clearTimeout(timer);
  }, [currentStep, steps.length]);
  
  return (
    <section className="fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center justify-center">
      <div className="container mx-auto text-center p-8 max-w-2xl">
        <h2 className="text-2xl font-bold mb-8 text-primary-600">Processing Your Images</h2>
        
        <div className="mx-auto w-72 md:w-96 h-auto bg-white border rounded-lg shadow-md p-6">
          <ul className="list-none w-full">
            {steps.map((step, index) => (
              <li 
                key={index}
                className={`flex items-center p-2 my-1 rounded transition-colors duration-300 
                  ${index === currentStep 
                    ? 'text-gray-900' 
                    : index < currentStep 
                      ? 'text-gray-500' 
                      : 'text-gray-300'}`}
              >
                <span className="mr-2 w-6 h-6 flex items-center justify-center">
                  {index < currentStep && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span style={{ fontFamily: "'Bungee', cursive" }}>{step}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <p className="text-gray-600 mt-6">
          We're applying the selected enhancements to your images. This may take a few moments...
        </p>
        
        {/* Add a loading spinner */}
        <div className="mt-8">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

// Main component
export default function ProductEnhancementWebhook() {
  const { data: userCredits = { credits: 0, paidCredits: 0, freeCreditsUsed: true } } = useCredits();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'selectStyles' | 'processing' | 'results'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [industry, setIndustry] = useState<string>("");
  const [enhancementId, setEnhancementId] = useState<number | null>(null);
  const [enhancementImages, setEnhancementImages] = useState<ImageWithOptions[]>([]);
  const [results, setResults] = useState<EnhancementResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Mutations for uploading images and submitting selections
  const uploadMutation = useMutation({
    mutationFn: async ({ files, industry }: { files: File[], industry: string }) => {
      console.log("Starting upload mutation", { fileCount: files.length, industry });
      
      const formData = new FormData();
      files.forEach((file) => {
        console.log(`Adding file: ${file.name} (${file.size} bytes)`);
        formData.append("images", file);
      });
      formData.append("industry", industry);
      
      try {
        console.log("Making API request to /api/product-enhancement/start");
        
        // Use raw fetch instead of apiRequest for more direct control
        // This helps avoid issues with unexpected HTML responses in some browsers
        const response = await fetch("/api/product-enhancement/start", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        console.log("API response received", response.status);
        
        // Check if the response is OK (status in the range 200-299)
        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          
          // Special handling for HTML responses (common in error cases)
          if (contentType && contentType.includes("text/html")) {
            throw new Error("The server returned an HTML response. This may happen in incognito mode or with certain browser settings.");
          }
          
          // Try to get a meaningful error message
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error: ${response.status}`);
          } catch (jsonError) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        return data;
      } catch (error) {
        console.error("Error in uploadMutation:", error);
        
        // Add more context to the error
        if (error instanceof Error) {
          console.error("Original error:", {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        } else {
          console.error("Non-Error object thrown:", error);
        }
        
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Upload mutation success", data);
      if (data.id) {
        setEnhancementId(data.id);
        
        // Extract status from response
        const status = data.status || 'pending';
        console.log(`Enhancement status from response: ${status}`);
        
        toast({
          title: "Upload successful",
          description: "Your images have been uploaded successfully. Generating enhancement options...",
        });
        
        // Handle different status values from the server
        if (status === 'options_ready') {
          console.log("Options are ready immediately, moving to select styles");
          setStep('selectStyles');
          
          // Force refetch to get the options
          queryClient.invalidateQueries({ queryKey: ['/api/product-enhancement', data.id] });
        } else if (status === 'error') {
          console.error("Server reported error:", data.message);
          const errorMsg = data.message || "The enhancement service reported an error. Please try again later.";
          
          // Set error message to display in ProcessingSection
          setErrorMessage(errorMsg);
          
          toast({
            title: "Enhancement Error",
            description: errorMsg,
            variant: "destructive",
          });
          
          // Set to processing step to show the error view
          setStep('processing');
        } else {
          console.log("Options not ready yet, staying in processing state");
          // We're already in processing state
        }
      } else {
        console.error("Missing ID in response data:", data);
        toast({
          title: "Upload error",
          description: "Received unexpected response. Please try again.",
          variant: "destructive",
        });
        setStep('upload'); // Go back to upload on error
      }
    },
    onError: (error: any) => {
      console.error("Upload mutation error:", error);
      
      let errorMessage = "Failed to upload images. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Handle HTML responses or unexpected token errors (common when receiving HTML instead of JSON)
        if (
          error.message.includes("<") && error.message.includes(">") ||
          error.message.includes("<!DOCTYPE") ||
          error.message.includes("Unexpected token") ||
          error.message.includes("HTML response")
        ) {
          errorMessage = "The server encountered an error. This can happen in incognito mode or when browser security settings block uploads. Please try using a regular browser window.";
        }
      }
      
      // Try to extract more detailed error from response
      if (error.response) {
        try {
          const responseData = error.response.data;
          if (responseData && responseData.message) {
            errorMessage = responseData.message;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Log additional debug info
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response,
        status: error.status,
      });
    }
  });
  
  const selectionsMutation = useMutation({
    mutationFn: async (selections: { imageId: number, optionKey: string }[]) => {
      if (!enhancementId) throw new Error("Enhancement ID is missing");
      
      const response = await apiRequest(
        "POST", 
        `/api/product-enhancement/${enhancementId}/select`,
        { selections }
      );
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.results) {
        setResults(data.results);
        toast({
          title: "Enhancement complete",
          description: "Your images have been enhanced successfully.",
        });
        setStep('results');
      }
    },
    onError: (error) => {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Failed to enhance images. Please try again.",
        variant: "destructive",
      });
      setStep('selectStyles');
    }
  });
  
  // Query to fetch enhancement data (images and options)
  const { data: enhancementData, isLoading: isLoadingEnhancement, refetch } = useQuery({
    queryKey: ['/api/product-enhancement', enhancementId],
    enabled: !!enhancementId && (step === 'processing' || step === 'selectStyles') && !errorMessage,
    refetchInterval: step === 'processing' ? 3000 : false, // Poll every 3 seconds only when processing
    queryFn: async () => {
      if (!enhancementId) return null;
      console.log(`Fetching data for enhancement ID ${enhancementId}`);
      
      // If we already encountered an error, don't keep fetching
      if (errorMessage) {
        console.log("Skipping fetch due to existing error");
        throw new Error("Manually stopping polling due to existing error");
      }
      
      // Try to get options specifically first
      try {
        console.log(`Trying options endpoint first...`);
        const optionsResponse = await apiRequest("GET", `/api/product-enhancement/${enhancementId}/options`);
        const optionsData = await optionsResponse.json();
        console.log("Options data:", optionsData);
        
        // Check for empty options with "options_ready" status here too
        if (optionsData.status === 'options_ready' && 
            optionsData.images && 
            optionsData.images.length > 0 &&
            (!optionsData.images[0].options || Object.keys(optionsData.images[0].options || {}).length === 0)) {
          console.error("Server returned options_ready but with empty options");
          // Transform to error response
          return {
            ...optionsData,
            status: 'error',
            message: "The webhook service did not return any enhancement options. Please try again with a different image or industry."
          };
        }
        
        return optionsData;
      } catch (optionsError) {
        console.error("Error fetching options:", optionsError);
        
        // Fall back to the regular endpoint
        console.log("Falling back to regular endpoint");
        const response = await apiRequest("GET", `/api/product-enhancement/${enhancementId}`);
        return await response.json();
      }
    },
    // Options have already been configured at the top of this query
  });
  
  // Custom polling logic to stop when completed or errored
  useEffect(() => {
    if (enhancementData && 'status' in enhancementData) {
      // Stop polling once completed or if there's an error
      if (enhancementData.status === 'completed' || enhancementData.status === 'error') {
        console.log(`Stopping polling due to status: ${enhancementData.status}`);
        queryClient.cancelQueries({ queryKey: ['/api/product-enhancement', enhancementId] });
        
        // If we have an error status but no explicit message set yet, set it
        if (enhancementData.status === 'error' && !errorMessage) {
          setErrorMessage(enhancementData.message || "The webhook service encountered an error. Please try again with a different image or industry.");
        }
      }
    }
  }, [enhancementData, enhancementId, errorMessage]);
  
  // Update enhancement images when data changes
  useEffect(() => {
    console.log("Enhancement data updated:", enhancementData);
    
    if (enhancementData && 'images' in enhancementData && Array.isArray(enhancementData.images)) {
      // Check if any image has options ready
      const hasOptions = enhancementData.images.some((img: any) => {
        console.log("Image data:", img);
        return img.options && Object.keys(img.options || {}).length > 0;
      });
      
      // If server says options are ready, but we don't have any options, treat it as an error
      if (!hasOptions && enhancementData.status === 'options_ready') {
        console.error("Server reported options ready but no options were provided");
        setErrorMessage("The webhook service did not return any enhancement options. Please try again with a different image or industry.");
        
        // Force stop polling to prevent infinite requests
        queryClient.cancelQueries({ queryKey: ['/api/product-enhancement', enhancementId] });
        return;
      }
      
      console.log("Has options:", hasOptions);
      
      if (hasOptions) {
        // Create proper image objects with options
        const imagesWithOptions = enhancementData.images.map((img: any) => {
          // Process the options to extract key and proper structure
          const processedOptions: Record<string, EnhancementOption> = {};
          
          // Check if options exist and are an object
          if (img.options && typeof img.options === 'object') {
            Object.entries(img.options).forEach(([key, value]) => {
              const option = value as any;
              processedOptions[key] = {
                key,
                name: option.name || key,
                description: option.description || ""
              };
            });
          }
          
          console.log(`Processed options for image ${img.id}:`, processedOptions);
          
          return {
            id: img.id,
            // Handle both property naming conventions
            originalPath: img.originalImagePath || img.originalUrl,
            options: processedOptions,
            selectedOptions: new Set<string>()
          };
        });
        
        console.log("Setting enhancement images:", imagesWithOptions);
        setEnhancementImages(imagesWithOptions);
        
        // If we're in processing step, move to select styles step once options are ready
        if (step === 'processing' && enhancementData.status === 'options_ready') {
          console.log("Moving to selectStyles step");
          setStep('selectStyles');
        }
      } else if (enhancementData.status === 'error') {
        // Handle server error state
        console.error("Server reported webhook error:", enhancementData.message);
        const errorMsg = enhancementData.message || "The webhook service reported an error. Please try again.";
        
        // Set error message to display in the ProcessingSection
        setErrorMessage(errorMsg);
        
        toast({
          title: "Enhancement Error",
          description: errorMsg,
          variant: "destructive",
        });
        
        // Stay in processing step to show the error message display
      } else if (step === 'selectStyles' && enhancementData.status === 'pending') {
        // If we don't have options yet, go to processing step
        console.log("No options yet, moving to processing step");
        setStep('processing');
      }
    } else if (enhancementData && enhancementId) {
      // If we have data but no images array, try to fetch options directly
      console.log("No images array found in response, trying options endpoint directly");
      
      // This will trigger the query to refresh with the options endpoint
      queryClient.invalidateQueries({ queryKey: ['/api/product-enhancement', enhancementId] });
    }
  }, [enhancementData, step, enhancementId]);
  
  // Handle file selection
  const handleImagesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  // Handle industry selection
  const handleIndustryChange = (selectedIndustry: string) => {
    setIndustry(selectedIndustry);
  };
  
  // Handle form submission
  const handleUpload = () => {
    console.log("handleUpload called", { selectedFiles, industry });
    
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (!industry) {
      toast({
        title: "Industry required",
        description: "Please select your industry before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    // Clear any previous error message
    setErrorMessage(null);
    
    // Reset enhancement images
    setEnhancementImages([]);
    
    // Immediately go to processing state
    console.log("Setting step to 'processing'");
    setStep('processing');
    
    // Direct upload implementation to avoid issues with incognito mode
    const uploadDirectly = async () => {
      try {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          console.log(`Adding file: ${file.name} (${file.size} bytes)`);
          formData.append("images", file);
        });
        formData.append("industry", industry);
        
        // Use the browser's native fetch API for the most compatible upload
        console.log("Making direct fetch request to /api/product-enhancement/start");
        const response = await fetch("/api/product-enhancement/start", {
          method: "POST",
          body: formData,
          credentials: "include"
        });
        
        console.log("Fetch response status:", response.status);
        console.log("Content-Type:", response.headers.get("content-type"));
        
        if (!response.ok) {
          // Check for HTML response
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error("Browser security settings may be blocking the upload. Please try in a regular browser window.");
          }
          
          const errorText = await response.text();
          throw new Error(errorText || `Server error: ${response.status}`);
        }
        
        // Try to parse JSON response
        let data;
        try {
          data = await response.json();
        } catch (e) {
          console.error("JSON parse error:", e);
          throw new Error("Invalid JSON response from server");
        }
        
        // Handle successful upload
        console.log("Upload successful:", data);
        if (data.id) {
          setEnhancementId(data.id);
          
          // Manually start polling for options
          refetch();
          
          toast({
            title: "Upload successful",
            description: "Your images have been uploaded successfully. Generating enhancement options...",
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Direct upload error:", error);
        
        // Reset to upload step
        setStep('upload');
        
        // Show error toast
        toast({
          title: "Upload Error",
          description: error instanceof Error 
            ? error.message 
            : "An error occurred during upload. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    // Execute the upload
    uploadDirectly();
  };
  
  // Handle option selection
  const handleSelectOption = (imageId: number, optionKey: string, selected: boolean) => {
    setEnhancementImages(prev => {
      return prev.map(img => {
        if (img.id === imageId) {
          const newSelectedOptions = new Set(img.selectedOptions);
          if (selected) {
            newSelectedOptions.add(optionKey);
          } else {
            newSelectedOptions.delete(optionKey);
          }
          
          return {
            ...img,
            selectedOptions: newSelectedOptions
          };
        }
        return img;
      });
    });
  };
  
  // Handle selections submission
  const handleSubmitSelections = () => {
    const selections: { imageId: number, optionKey: string }[] = [];
    
    enhancementImages.forEach(img => {
      img.selectedOptions.forEach(optionKey => {
        selections.push({
          imageId: img.id,
          optionKey
        });
      });
    });
    
    if (selections.length === 0) {
      toast({
        title: "No options selected",
        description: "Please select at least one enhancement option.",
        variant: "destructive",
      });
      return;
    }
    
    setStep('processing');
    selectionsMutation.mutate(selections);
  };
  
  // Render landing page layout in all cases
  return (
    <div className="min-h-screen bg-[#f8fafa]">
      <AnnouncementBanner />
      <Navbar 
        freeCredits={(userCredits && userCredits.freeCreditsUsed) ? 0 : 1} 
        paidCredits={(userCredits && userCredits.paidCredits) || 0} 
      />
      <div className="mt-20"></div> {/* Add spacing for fixed navbar */}
      <div className="min-h-[calc(100vh-140px)] flex flex-col"> {/* Force content area to take up at least full viewport height minus navbar */}
      
      {/* Only show marketing sections on upload step */}
      {step === 'upload' && (
        <>
          <HeroSection />
          <FeaturesSection />
          <ShowcaseSection />
          <DemoSection 
            onImagesSelected={handleImagesSelected} 
            isUploading={uploadMutation.isPending}
            onStartEnhancement={handleUpload}
            onIndustryChange={handleIndustryChange}
          />
          <div className="container mx-auto p-4 mb-8">
            <IndustrySelector 
              onIndustryChange={handleIndustryChange}
              disabled={uploadMutation.isPending}
            />
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || !industry || uploadMutation.isPending}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? "Uploading..." : "Continue"}
              </button>
            </div>
          </div>
          <TestimonialsSection />
          <FAQSection />
        </>
      )}
      
      {/* Style selection section takes full page */}
      {step === 'selectStyles' && (
        <div className="container mx-auto py-12 px-4 min-h-[600px]">
          <h2 className="text-3xl font-bold text-center mb-8">Select Enhancement Options</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose up to 5 enhancement options per image. Each selection costs 1 credit.
          </p>
          <StyleSelectionSection
            images={enhancementImages}
            onSelectOption={handleSelectOption}
            onSubmitSelections={handleSubmitSelections}
            isLoading={selectionsMutation.isPending || isLoadingEnhancement}
          />
        </div>
      )}
      
      {/* Processing section takes full page */}
      {step === 'processing' && (
        <div className="container mx-auto py-16 px-4" style={{ minHeight: "80vh" }}>
          <ProcessingSection errorMessage={errorMessage} />
        </div>
      )}
      
      {/* Results section takes full page */}
      {step === 'results' && (
        <div className="container mx-auto py-12 px-4 min-h-[600px]">
          <h2 className="text-3xl font-bold text-center mb-6">Your Enhanced Images</h2>
          <p className="text-center text-gray-600 mb-8">
            Select the images you want to download and click "Download Selected".
          </p>
          <ResultsSection results={results} />
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setStep('upload')}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Start New Project
            </button>
          </div>
        </div>
      )}
      </div> {/* End of min-height content area */}
      
      {/* Always show footer */}
      <FinalCTASection />
      <GlobalFooter />
    </div>
  );
}